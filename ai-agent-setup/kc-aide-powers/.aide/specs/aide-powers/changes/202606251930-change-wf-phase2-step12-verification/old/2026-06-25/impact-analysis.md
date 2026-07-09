# 影響範囲分析（差分設計ベース — 更新版）

## 変更種別
変更

## アクター視点の影響

### 影響を受けるユースケース
- UC-001（ワークフロー実行）: 実装WF / 変更WF / bugfix WF の動作確認ステップの実行方式が「ユーザー依頼のみ」から「サブエージェント委譲による試験実行＋verification-report.md出力＋ユーザー承認」に変更される
- UC-005（多段コードレビュー後の品質確認）: レビュー完了後の動作確認がサブエージェント委譲方式に変わり、build通過だけでは不可という制約が明文化される
- UC-007（進捗管理・フェーズレポート記載）: 動作確認ステップのレポート記載項目が「動作確認方法」「動作確認手順」「動作確認結果」「動作確認サブエージェントの出力」「ユーザー承認結果」「ユーザー承認の詳細」に拡張される

### 影響を受けるアクター
| アクター | 影響内容 |
|---|---|
| AIエージェント（オーケストレータ: FS） | 動作確認ステップでプロンプトテンプレート準備（プレースホルダー埋込）→ サブエージェント起動 → 結果受領 → verification-report.md 存在確認の手順に変わる。FS自身が直接試験を実行してはならない |
| AIエージェント（サブエージェント: general-task-execution） | 新たに動作確認試験実行の責務を負い、verification-report.md を出力する。試験内容はWF種別ごとのプロンプトテンプレートで指示される |
| ソフトウェア開発者（ユーザー） | 動作確認結果の承認フローが追加される。AI による動作確認結果を確認してから承認する手順が必要になる（承認/追加確認要求/NG の3択） |

### 説明対象アクター
| アクター | 説明の必要性 | 説明内容 |
|---|---|---|
| ソフトウェア開発者（ユーザー） | 低 | 動作確認ステップでAIが自動試験を行い承認を求めるフローに変わる旨。ただし操作自体は「承認/追加確認/NG」の選択のみで負担増はわずか |


## プログラム構成視点の影響

### 直接変更対象ファイル（実装対象）
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `skills/fs-change-phase2-impl/SKILL.md` | 変更 | Step 12「ユーザー動作検証依頼」→「動作検証・ユーザー確認」に全面書き換え。成果物テーブルにverification-report.md追加。Integrationにプロンプトテンプレート追加 |
| `skills/fs-impl-phase4-execution/SKILL.md` | 変更 | Step 2「ユーザー動作検証依頼」→「動作検証・ユーザー確認」に全面書き換え。成果物テーブルにverification-report.md追加。Integrationにプロンプトテンプレート追加。レポート運用ルールの例示更新 |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | 変更 | Step 10 にサブエージェント委譲手順・verification-report.md出力指示を追記。成果物テーブルにverification-report.md追加。Integrationにプロンプトテンプレート追加 |

### 新規作成ファイル
| ファイル | 種別 | 概要 |
|---|---|---|
| `skills/fs-change-phase2-impl/change-verification-prompt.md` | プロンプトテンプレート | 変更WF用の動作確認サブエージェント委譲プロンプト |
| `skills/fs-impl-phase4-execution/impl-verification-prompt.md` | プロンプトテンプレート | 実装WF用の動作確認サブエージェント委譲プロンプト |
| `skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md` | プロンプトテンプレート | bugfix WF用の動作確認サブエージェント委譲プロンプト |

### 依存関係（変更対象を参照しているファイル）
| ファイル | 依存内容 | 影響の可能性 | 対応要否 |
|---|---|---|---|
| `skills/fs-change-phase3-final-check/SKILL.md` | fs-change-phase2-impl を前フェーズとして参照 | なし | 不要（Step12の内部変更であり、フェーズ遷移のインターフェースは変わらない） |
| `skills/fs-impl-phase3-gui-mockup/SKILL.md` | fs-impl-phase4-execution を次フェーズとして参照 | なし | 不要（Step2の内部変更であり、フェーズ遷移のインターフェースは変わらない） |
| `skills/fs-impl-phase5-final-check/SKILL.md` | fs-impl-phase4-execution を前フェーズとして参照 | なし | 不要（フェーズ遷移のインターフェースは変わらない。verification-report.mdとmanual-test-plan.mdは別の成果物） |
| `skills/fs-bugfix-phase3-final-check/SKILL.md` | fs-bugfix-phase2-impl を前フェーズとして参照 | なし | 不要（Step10の内部変更であり、フェーズ遷移のインターフェースは変わらない） |
| `skills/session-handover/SKILL.md` | fs-change-phase2-impl / fs-impl-phase4-execution を粒度例として参照 | なし | 不要（例示のみで機能依存なし。例示内容はStep名を直接参照していない） |
| `skills/coding-test-2review/SKILL.md` | 実装ループの委譲先として呼ばれる | なし | 不要（動作確認ステップは実装ループ完了後のため、coding-test-2review の動作に影響なし） |
| `skills/impl-task-planning/SKILL.md` | fs-change-phase2-impl / fs-impl-phase4-execution を呼び出し元として参照 | なし | 不要（タスク計画スキルの動作に影響なし） |
| `skills/multi-stage-code-review/SKILL.md` | fs-impl-phase4-execution を参照 | なし | 不要（非プログラム成果物判定の参照であり、動作確認ステップとは無関係） |
| `skills/using-aide-powers/references/progress-file-format.md` | フェーズ番号マッピングとして参照 | なし | 不要（フェーズ構成自体は変更しない） |

### スコープ外で類似変更が将来必要になる可能性のあるファイル
| ファイル | 理由 |
|---|---|
| `skills/fs-refactoring-phase5-impl/SKILL.md` | Step 3「ユーザー動作検証依頼」が同様の旧パターンで存在。本変更のスコープ外だが、将来同パターン横展開の候補 |

## 実装後に更新が必要な設計資料

| 設計書 | 更新内容 | 更新タイミング |
|---|---|---|
| program-structure.md | 3つのスキルディレクトリ配下にプロンプトテンプレート追加を反映、成果物欄にverification-report.md追加 | 実装後（変更WF Step 13 設計書反映時） |

※ doc-index.md の更新は不要（新規設計書ではなくスキル内部のプロンプトテンプレートのため）

## 既存要件との整合性確認

### user-requirements.md との整合性
| 要件ID | 整合性 | 備考 |
|---|---|---|
| UR-001 | ✅ 矛盾なし | 3WFの動作確認品質向上。WF構成（フェーズ数）自体は変更しない |
| UR-004 | ✅ 矛盾なし | サブエージェント委譲は既存のサブエージェント活用パターンの延長 |
| UR-005 | ✅ 矛盾なし | 多段レビュー後の動作確認品質を強化する位置づけ |
| UR-007 | ✅ 矛盾なし | フェーズレポート記載項目の拡充。進捗管理機構の品質向上 |
| UR-012 | ✅ 矛盾なし | NG時の差し戻しフローはエラーハンドリング体系（BLOCKED/NEEDS_FIX等）と整合 |

### system-requirements.md との整合性
| 項目 | 整合性 | 備考 |
|---|---|---|
| §1.3 7つのWF | ✅ 矛盾なし | WFの追加・削除はなし。既存WFの内部Step改善 |
| §4.1 エラー分類 | ✅ 矛盾なし | NG時の差し戻しは既存の BLOCKED/NEEDS_FIX 伝播ルールに準拠 |
| §4.2 エラー伝播ルール | ✅ 矛盾なし | サブエージェント→FS→ユーザーの伝播パターンに準拠 |
| §5.1 フェーズレポート | ✅ 矛盾なし | レポート記載項目の拡充。即時記載ルールに準拠 |
| §7.6 ファイル書き込み制約 | ✅ 矛盾なし | verification-report.mdの書き込みはサブエージェント側の責務（50行超ルール適用対象） |

## テスト対象機能の特定

### 新規テスト対象（直接変更する機能）
| # | テスト対象 | テスト観点 | テスト方法 |
|---|---|---|---|
| T-1 | 変更WF fs-change-phase2-impl Step 12 | サブエージェント委譲手順が正しく実行されるか。verification-report.md が出力されるか。NG時の差し戻しフローが機能するか | 変更WFの手動実行による動作確認 |
| T-2 | 実装WF fs-impl-phase4-execution Step 2 | サブエージェント委譲手順が正しく実行されるか。verification-report.md が出力されるか。NG時の差し戻しフローが機能するか | 実装WFの手動実行による動作確認 |
| T-3 | bugfix WF fs-bugfix-phase2-impl Step 10 | サブエージェント委譲手順の追記が正しく反映されているか。verification-report.md が出力されるか | bugfix WFの手動実行による動作確認 |
| T-4 | change-verification-prompt.md | プレースホルダーの埋め込みが正しく行われるか。サブエージェントが試験を実行できるか | 変更WF実行時の動作確認で兼ねる |
| T-5 | impl-verification-prompt.md | プレースホルダーの埋め込みが正しく行われるか。サブエージェントが試験を実行できるか | 実装WF実行時の動作確認で兼ねる |
| T-6 | bugfix-verification-prompt.md | プレースホルダーの埋め込みが正しく行われるか。サブエージェントが試験を実行できるか | bugfix WF実行時の動作確認で兼ねる |

### リグレッションテスト対象（変更の影響を受ける可能性がある機能）
| # | テスト対象 | リグレッション観点 | テスト方法 |
|---|---|---|---|
| R-1 | 変更WF全体フロー | Step 12 前後のStep遷移（Step 11→12→13）が正常に機能するか | 変更WF通し実行 |
| R-2 | 実装WF全体フロー | Step 1→2→後処理 の遷移が正常に機能するか | 実装WF通し実行 |
| R-3 | bugfix WF全体フロー | Step 9→10→11 の遷移が正常に機能するか | bugfix WF通し実行 |
| R-4 | フェーズレポートの記載 | 新しいレポート記載項目が正しくフォーマットされるか | 各WF実行時のレポート確認 |

## 起因元ドキュメントフォルダ
- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし
