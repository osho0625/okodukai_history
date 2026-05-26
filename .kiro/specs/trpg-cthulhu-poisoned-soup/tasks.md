# Implementation Plan: TRPG Cthulhu Scenario Reader

## Overview

KP向けTRPGシナリオリーダーの実装。管理者限定アクセス、シナリオ選択、シーン自由遷移、マップ/NPC/目次オーバーレイ、進行状態保存を備えたSPA風ページを構築する。ユーザー指定の実装順序に従い、メインHTML → シナリオデータ → テスト → arcade統合 → バージョン更新の順で進める。

## Implementation Notes (事故防止)

- **localStorage key**: `trpg_cthulhu_progress_{scenarioId}`, `trpg_cthulhu_completed_{scenarioId}`, `trpg_cthulhu_font_size`（Design側に統一済み）
- **NPC location field**: `defaultLocation`（SceneNodeの`location`とは別名。将来の動的移動対応のため）
- **pendingLoads Map**: ScenarioLoader内で `const pendingLoads = new Map()` を定義。連打時に同じPromiseを返す
- **script重複挿入防止**: `document.querySelector('script[data-scenario="${id}"]')` で既存scriptチェック。script要素に `data-scenario` 属性を付与
- **visitedNodeIds重複防止**: navigateTo時に `state.visitedNodeIds = [...new Set([...state.visitedNodeIds, targetId])]`
- **goBack時のphase更新**: `state.phase = scenario.nodes[state.currentNodeId].phase` を必ず実行
- **ending phase判定**: セッション終了ボタン表示条件 = `currentNode.phase === "ending"`（phases配列のid）
- **map複数シーン判定**: `Object.values(nodes).filter(n => n.location === locationId)` で該当シーン取得
- **overlay閉じ方**: 背景タップ / ×ボタン / Escキー の3方式対応
- **Reset後の表示**: 即座にstartNodeを表示（ScenarioSelectには戻らない）
- **最低ノード数**: poisoned_soup は最低9ノード（intro, kitchen, living_room, bathroom, garden, confrontation, ritual, ending_good, ending_bad）
- **オフライン**: 初回ロードにネットワーク必要。以降はsw.jsキャッシュで動作

## Tasks

- [x] 1. メインHTML作成（pages/trpg-cthulhu.html）
  - [x] 1.1 HTMLスケルトンとCSSスタイル定義
    - ダークテーマ（クトゥルフ風: deep green/purple系）のCSS定義
    - CSS custom property: `--scene-font-size` (default 0.95em)
    - ビュー構造: access-denied, scenario-select, scene-view, toc-overlay, map-overlay, npc-overlay
    - オーバーレイ: role="dialog", 背景タップ/×ボタン/Escキーで閉じる
    - モバイルファースト（max-width: 420px）
    - ヘッダー（戻るボタン、シナリオタイトル、ホームリンク）とツールバー（📖目次, 🗺️マップ, 👤NPC, 🔄リセット, フォントサイズ）
    - ボタンにaria-label付与
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 14.1_

  - [x] 1.2 AccessGuard と ScenarioSelect 実装
    - checkAccess(): deviceRole='admin' チェック、非管理者はaccess-denied表示
    - Access denied時はシナリオスクリプトのロードを一切行わない
    - SCENARIO_REGISTRY 配列定義（poisoned_soup エントリ）
    - カード描画: icon, title, description, estimatedTime, playerCount, status（続きから/クリア済み）
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.5, 2.6, 2.7_

  - [x] 1.3 ScenarioLoader 実装
    - `const pendingLoads = new Map()` で連打防止（同一IDのPromise共有）
    - loadScenario(): script要素注入（data-scenario属性付与）、5000msタイムアウト
    - 既存データ再利用チェック（window.TRPG_SCENARIOS[id]）
    - script重複挿入防止: `document.querySelector('script[data-scenario="${id}"]')` チェック
    - エラーハンドリング（timeout, network error, scenario not registered）
    - _Requirements: 2.3, 2.4, 2.9, 7.4, 8.6_

  - [x] 1.4 ScenarioValidator 実装
    - validateScenario(): startNode存在、relatedScenes参照、phase存在、location存在、phases[].nodes存在、全ノードphase所属チェック
    - バリデーションエラー時のUI表示とScenarioSelectへの復帰
    - localStorage Progress_State parse失敗時のフォールバック（startNodeから開始）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7_

  - [x] 1.5 SceneRenderer と ProgressManager 実装
    - ProgressManager: load/save/reset/markCompleted/isCompleted/hasProgress
    - hasProgress(): `this.load(id) !== null`（壊れたJSONでもfalse）
    - SceneRenderer: text[]段落表示、KP_Note折りたたみ（\n→改行）、relatedScenesボタン（推奨読み順）、ノードID表示、フェーズ名表示
    - navigateTo: history push + visitedNodeIds追加（Set重複防止）+ phase更新 + state保存
    - goBack: history pop + currentNodeId更新 + **phase更新** + state保存
    - Back無効化（history空時）
    - Reset: Progress_Stateクリア → 即座にstartNode表示（Completion_State維持）
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 1.6 TOCRenderer 実装
    - フェーズ別グループ化表示（phases[].nodes定義順）
    - 訪問済みノードの視覚的区別
    - キーワードフィルタ（node.title対象のみ、case-insensitive substring match）
    - TOCからのナビゲーション（history push + phase更新）
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 1.7 MapRenderer 実装
    - SVG viewBox 0 0 100 100 でlocation描画（circle + text）
    - connections描画（line、双方向デフォルト）
    - 現在地ハイライト
    - 訪問済み場所の色分け（location is visited ⟺ any node at that location in visitedNodeIds）
    - タップ時: 単一ノード→直接遷移（history push）、複数ノード→ピッカー表示（優先順: 未訪問current-phase → current-phase → 全ノード）
    - map未定義時はボタン非表示
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 1.8 NPCRenderer 実装
    - NPC一覧表示（name, age, description, defaultLocation）
    - タップで展開（secret表示）
    - npcs未定義時はボタン非表示
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 1.9 FontSizeManager とセッション終了 実装
    - FontSizeManager: CSS custom property方式（`--scene-font-size`）、small/medium/large、localStorage(`trpg_cthulhu_font_size`)保存・復元
    - セッション終了ボタン: `currentNode.phase === "ending"` の時のみ表示
    - タップでCompletion_State保存（`{ completed: true, completedAt: Date.now() }`）
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 14.2, 14.3_

- [x] 2. シナリオデータ作成（js/trpg-poisoned-soup-scenario.js）
  - [x] 2.1 「毒入りスープ」シナリオデータ定義
    - window.TRPG_SCENARIOS["poisoned_soup"] に登録
    - phases: 導入(1ノード), 調査パート(4ノード以上), クライマックス(2ノード), エンディング(2ノード) = 最低9ノード
    - 必須ノード: intro, kitchen, living_room, bathroom, garden, confrontation, ritual, ending_good, ending_bad
    - 2人以上のNPC（name, age, description, defaultLocation, secret）
    - map定義（locations + connections、双方向）
    - 各シーンのKP_Note（技能名と目標値: 【目星】50, 【図書館】60等）
    - relatedScenes（推奨読み順で配列）
    - オリジナルテキスト（著作権配慮、既存シナリオのコピー禁止）
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 3. Checkpoint - メインHTML + シナリオデータ動作確認
  - ブラウザで pages/trpg-cthulhu.html を開き、全ビュー遷移を確認
  - シナリオ選択→シーン表示→TOC→マップ→NPC→Back→Reset の一連フロー確認
  - Reset後もScenarioSelectで「クリア済み」badge表示確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. validateScenario 単体テスト
  - [ ]* 4.1 Property 1: シナリオ検証が全参照エラーを検出する
    - **Property 1: Scenario validation catches all reference errors**
    - fast-checkで任意のシナリオデータを生成し、(a)startNode不在 (b)relatedScenes不正参照 (c)phase不在 (d)location不在 (e)phases[].nodes不正参照 (f)phase未所属ノード の各ケースでエラー検出、正常データでエラー0件を検証
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 7.2, 7.3**

  - [ ]* 4.2 Property 8: TOC順序がphases定義順と一致する
    - **Property 8: TOC ordering matches phases definition**
    - fast-checkで任意のphases/nodes構造を生成し、TOC出力順がphases[].nodes定義順と一致することを検証
    - **Validates: Requirements 10.2**

  - [ ]* 4.3 Property 9: TOCキーワードフィルタリング
    - **Property 9: TOC keyword filtering**
    - fast-checkで任意のキーワードとノード集合を生成し、フィルタ結果がtitleのcase-insensitive substring matchと一致することを検証
    - **Validates: Requirements 10.5**

- [ ] 5. ProgressManager 単体テスト
  - [ ]* 5.1 Property 2: Progress state save/load round-trip
    - **Property 2: Round trip consistency**
    - fast-checkで任意のProgressStateを生成し、save→loadで等価なオブジェクトが復元されることを検証
    - **Validates: Requirements 9.1, 9.2, 9.6**

  - [ ]* 5.2 Property 3: ナビゲーションでcurrent nodeがhistoryにpushされる
    - **Property 3: Navigation pushes current node to history**
    - fast-checkで任意のstate + targetを生成し、navigateTo後にhistory末尾が元のcurrentNodeId、新currentNodeIdがtargetであることを検証
    - **Validates: Requirements 3.4**

  - [ ]* 5.3 Property 4: Backでhistoryからpopされる
    - **Property 4: Back pops from history stack**
    - fast-checkで非空historyのstateを生成し、goBack後にcurrentNodeIdがhistory末尾、historyから末尾が除去されることを検証
    - **Validates: Requirements 3.5**

  - [ ]* 5.4 Property 5: シナリオ進行の独立性
    - **Property 5: Scenario progress independence**
    - fast-checkで2つの異なるscenarioIdとstateを生成し、一方のsaveが他方のloadに影響しないことを検証
    - **Validates: Requirements 9.5**

  - [ ]* 5.5 Property 6: ResetがCompletion_Stateを保持する
    - **Property 6: Reset preserves completion state**
    - fast-checkでprogress + completionの両方が存在する状態を生成し、reset後にprogressがnull、completionが不変であることを検証
    - **Validates: Requirements 9.7, 13.5**

  - [ ]* 5.6 Property 7: 不正JSON時のフォールバック
    - **Property 7: Invalid JSON fallback**
    - fast-checkで任意の非JSONストリングを生成し、loadがnullを返す（例外を投げない）ことを検証
    - **Validates: Requirements 8.7**

  - [ ]* 5.7 Property 11: フォントサイズ永続化round-trip
    - **Property 11: Font size persistence round-trip**
    - fast-checkでsmall/medium/largeを生成し、set→getで同じ値が返ることを検証
    - **Validates: Requirements 14.2, 14.3**

- [ ] 6. Checkpoint - テスト実行確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. arcade.html 統合
  - [x] 7.1 arcade.html にTRPGゲームカード追加
    - data-game="game_trpg_cthulhu" のカードを追加（🦑アイコン、タイトル「クトゥルフTRPG」）
    - href="trpg-cthulhu.html"
    - _Requirements: 12.1, 12.2_

  - [x] 7.2 非管理者向け非表示ロジック追加
    - game_publish.game_trpg_cthulhu チェック追加
    - deviceRole != 'admin' 時はカード非表示（既存ロジックで対応済みか確認）
    - _Requirements: 1.3, 12.2, 12.3_

- [x] 8. バージョン更新
  - [x] 8.1 sw.js の CACHE_NAME 更新と新ファイル追加
    - CACHE_NAME のバージョン番号をインクリメント
    - ASSETS配列に pages/trpg-cthulhu.html と js/trpg-poisoned-soup-scenario.js を追加
    - _Requirements: (開発ルール)_

  - [x] 8.2 release-notes.html 更新
    - TRPGシナリオリーダー機能のリリースノート追加
    - _Requirements: (開発ルール)_

  - [x] 8.3 index.html バージョン表示更新
    - バージョン番号の更新
    - _Requirements: (開発ルール)_

- [ ] 9. Final checkpoint - 全体動作確認
  - arcade.htmlからのアクセス確認
  - 非admin端末でカード非表示確認
  - Reset後もクリア済みbadge維持確認
  - オフライン動作確認（シナリオロード後）
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 実装言語: JavaScript（Vanilla JS、外部ライブラリなし）
- テストライブラリ: fast-check（property-based tests）
- 実装順序はユーザー指定に従う: HTML → シナリオデータ → テスト → arcade統合 → バージョン更新
- シナリオデータは著作権に配慮したオリジナルテキストで作成すること
- localStorage key は全て `trpg_cthulhu_` prefix で統一（他ゲームとの衝突防止）
