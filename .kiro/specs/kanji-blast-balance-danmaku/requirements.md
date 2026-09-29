# Requirements Document

## Introduction

本ドキュメントは、既存ゲーム「漢字合体 -カンジニオン-」（内部ID: kanji-blast）に対する、ゲームバランスと演出改良の要件を定義します。既存スペック `.kiro/specs/kanji-blast/`（現行挙動を「正」として文書化）に対し、本スペックは **現行挙動を意図的に変更する** 次の3機能を扱います。

1. 手持ち系画面の分割（合体専用／分解専用／装備・手持ち）
2. 強さ計算の再設計（画数を主軸に、漢検級と Plus_Value をそれぞれ最大1.5倍のブーストへ）
3. ボス弾幕の強化（複数弾種・複数攻撃パターン・通常弾幕→特殊弾幕の東方風構成）

設計の詳細は `.kiro/specs/kanji-blast-balance-danmaku/design.md` を参照。既存スペックの用語（Player / Hand / Plus_Value / Plus_Cap / Kentei_Factor / Floor_Boss / Final_Power / STG_Engine / Merge_System 等）を継承する。

## Glossary（本スペックの追加・更新）

- **Kentei_Boost**: 漢検級を 1.0〜1.5 に正規化したブースト係数。`Kentei_Boost(level) = 1 + 0.5 × (Kentei_Factor(level) - Fmin) / (Fmax - Fmin)`。Fmin/Fmax は Kentei_Factor 表の最小・最大値（現行 1.0 と 5.0）。Fmax=Fmin のときは 1.0 を返す。
- **Plus_Boost**: Plus_Value を Plus_Cap 基準で 1.0〜1.5 に線形マップしたブースト係数。`Plus_Boost(plus, plus_cap) = 1 + 0.5 × clamp(plus, 0, plus_cap) / max(plus_cap, 1)`。負数・cap超過・cap=0/未取得でも常に 1.0〜1.5 に収まる。
- **Bullet_Type**: 敵弾の種別。`small`（小玉）/ `big`（大玉）/ `slow`（遅い弾）/ `oval`（細長い弾）/ `laser`（予告線→レーザー）。
- **Attack_Pattern**: ボスの通常弾幕パターン。`aimed`（自機狙い）/ `spread`（自機外し）/ `fixed`（固定弾）/ `ring`（全方位）/ `bigLob`（大玉散布）等。
- **Spell_Card**: 特殊弾幕。ボスHPが規定しきい値を下回ると移行する、通常より密度・複雑さの高い弾幕。
- **Merge_Screen / Split_Screen / Equip_Screen**: 手持ち系の3画面（合体専用 / 分解専用 / 装備・手持ち）。

## Requirements

### Requirement 1: 手持ち系画面の3分割

**User Story:** 子供として、合体と分解と装備を、それぞれ分かりやすい別の画面で操作したい。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL 手持ち系の操作を Merge_Screen（合体専用）・Split_Screen（分解専用）・Equip_Screen（装備・手持ち）の3画面に分ける。
2. THE Kanji_Blast SHALL メニュー画面に「合体」「分解」「装備・手持ち」「図鑑」を開くボタンを表示する。
3. WHEN ユーザーが各画面を開く, THE Kanji_Blast SHALL 選択状態を初期化（`selected = []`）してから対象画面を表示し、手持ちを再描画する。
4. THE Kanji_Blast SHALL Merge_Screen / Split_Screen / Equip_Screen で同一の Hand と選択状態を共有する。
5. THE Kanji_Blast SHALL 各画面から他の手持ち系画面へ相互に遷移でき、いずれからもメニューへ戻れるようにする。
5a. WHEN 手持ち系画面から別の手持ち系画面へ遷移する, THE Kanji_Blast SHALL 遷移先で `selected = []` とし、遷移元の選択状態を引き継がない。
6. WHERE Merge_Screen が表示されている, THE Merge_System SHALL 2〜3個の選択かつ一致 Recipe がある場合に合体を実行可能にする。
7. WHERE Split_Screen が表示されている, THE Merge_System SHALL 1個の選択かつ分解先 Recipe がある場合に分解を実行可能にする。
8. THE Kanji_Blast SHALL 現在アクティブな画面に対応するグリッド（`mergeGrid` / `splitGrid` / `equipGrid`）に手持ちを描画する。
9. THE Kanji_Blast SHALL 合体プレビューやボタン活性の更新処理を、対象要素が存在しない画面では何もしない（null 安全）よう実装する。
10. THE Kanji_Blast SHALL 合体・分解・装備・にがすの各機能そのもの（+値ロジック・レシピ判定・装備解除条件）を既存スペックの挙動どおり維持する（画面分割は UI 変更でありデータ構造・計算は変えない）。

### Requirement 2: 強さ計算の再設計（画数主軸）

**User Story:** 子供・保護者として、画数が多いだけで急に強くなりすぎるのをやめ、漢検の難易度と強化値が穏やかに効くようにしたい。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL 漢字の Final_Power を `round( strokes × Kentei_Boost(kentei_level) × Plus_Boost(plus, plus_cap) × (1 + 解放読み数 × 0.1) × (1 + 図鑑登録種類数 × 0.02) )` で算出する。
1a. THE Kanji_Blast SHALL 強さの主軸を画数（strokes）とし、Kentei_Boost と Plus_Boost はそれぞれ最大1.5倍の補正に留める一方、読みボーナス・図鑑ボーナスは現行どおり別途乗算されるため、総倍率は各補正の積となる（例: 画数10・級1.5倍・+1.5倍・読み3個・図鑑10種で 10×1.5×1.5×1.3×1.2 ≈ 35。これは意図した設計であり、画数を主軸に級/＋を穏やかにする目的と両立する）。
2. THE Kanji_Blast SHALL Kentei_Boost を `1 + 0.5 × (Kentei_Factor(level) - Fmin) / (Fmax - Fmin)` で算出し、Fmin/Fmax は Kentei_Factor 表の最小・最大値から求める。
2a. WHERE Fmax = Fmin（係数表が一律で分母が0になる）, THE Kentei_Boost SHALL 1.0 を返す（0除算を避ける）。
3. THE Kentei_Boost SHALL 任意の級に対して 1.0 以上 1.5 以下の値を返す。
4. WHERE 級が Kentei_Factor 表に未定義である, THE Kentei_Boost SHALL Kentei_Factor のフォールバック（1.0）に基づき 1.0 を返す。
5. THE Kanji_Blast SHALL Plus_Boost を `1 + 0.5 × clamp(plus, 0, plus_cap) / max(plus_cap, 1)` で算出する。ここで `clamp(plus, 0, plus_cap)` は plus を 0 以上 plus_cap 以下に丸める（負数は 0、plus_cap 超過は plus_cap）。
6. THE Plus_Boost SHALL 任意の入力（負数・plus_cap 超過・plus_cap が 0 または未取得を含む）に対して 1.0 以上 1.5 以下の値を返し、0 除算を起こさない。
6a. WHERE plus が負数である, THE Kanji_Blast SHALL plus を 0 として扱う（Plus_Boost = 1.0）。
7. WHEN plus が省略される（枚を特定しない図鑑表示等）, THE Kanji_Blast SHALL plus を 0 として Plus_Boost を 1.0 とする。
8. WHEN 対象 char が kanji_master に存在しない, THE Kanji_Blast SHALL Final_Power を 0 とする。
9. WHERE 他の項が固定されている, THE Final_Power SHALL plus の増加に対して単調非減少である（`plus1 ≤ plus2` ならば `Final_Power(plus1) ≤ Final_Power(plus2)`）。
10. THE 強さ計算の純粋コア SHALL `js/kanji-blast.pure.js` を唯一の実体とし、本番（`js/kanji-blast.js`）とテストが同一実体を参照する（ミラー実装を作らない）。
11. THE STG_Engine SHALL ショット威力を装備ありなら Final_Power、未装備なら 5 とし、必殺威力を装備ありなら Final_Power × 6、未装備なら 30 とする（係数は据え置き）。
12. THE STG_Engine SHALL 新式で自機火力の絶対値が変化することを踏まえ、ボスHP係数をプレイテストで調整可能な項目として扱う（式の形は維持し係数のみ調整対象）。
13. THE Kanji_Blast SHALL Plus_Value および Plus_Cap の生成・増減ロジック（合体/分解の+値、Floor_Boss 撃破での cap 増加）を変更せず、Final_Power における Plus_Value の反映方法のみ Plus_Boost に変更する。

### Requirement 3: 敵弾の弾種

**User Story:** 子供として、いろいろな種類の弾がある歯ごたえのあるボス戦を楽しみたい。

#### Acceptance Criteria

1. THE STG_Engine SHALL 敵弾に Bullet_Type（`small` / `big` / `slow` / `oval` / `laser`）を持たせ、種別に応じた当たり判定・速度・描画で処理する。
1a. THE STG_Engine SHALL 各 Bullet_Type のデフォルトパラメータ（当たり半径・速度倍率・oval の幅/長さ・laser の telegraph/持続フレーム等）を1か所の定数定義（例: `BULLET_DEFS`）として持ち、値はプレイテストで調整可能とする。Requirements には具体値を規定せず、定義場所のみを定める。
2. WHERE 敵弾の type が未指定である, THE STG_Engine SHALL 従来互換として `small` 相当（小円）で処理する。
3. THE STG_Engine SHALL `big`（大玉）を `small` より大きい当たり半径・大きい描画で表現する。
4. THE STG_Engine SHALL `slow`（遅い弾）を低速で移動させ、視認しやすく描画する。
5. THE STG_Engine SHALL `oval`（細長い弾）を進行方向を軸とする線分＋半径によるカプセル形状として当たり判定し、見た目は進行方向に沿った細長い楕円で描画する。
6. WHEN `laser` 弾が生成される, THE STG_Engine SHALL 予告フェーズ（telegraph）中は無害な予告線として描画し、予告時間経過後にレーザー本体へ切り替える。
6a. WHEN `laser` の telegraph が開始される, THE STG_Engine SHALL 発射方向を確定し、telegraph 中および laser 本体中はその方向を維持する（telegraph 中に自機を追尾しない）。
7. WHILE `laser` 本体が持続している, THE STG_Engine SHALL レーザーの線分と自機の距離に基づく被弾判定を行う。
8. WHEN `laser` 本体の持続時間が尽きる, THE STG_Engine SHALL その弾を消滅させる。
9. WHEN 必殺技が発動する, THE STG_Engine SHALL 予告線・レーザーを含む全ての敵弾を消去する。

### Requirement 4: ボスの攻撃パターン（通常弾幕）

**User Story:** 子供として、ボスが自機を狙ったり、わざと外したり、決まった方向に撃ったりして、単調でない攻撃をしてほしい。

#### Acceptance Criteria

1. THE STG_Engine SHALL ボスに複数の Attack_Pattern を持たせ、現在パターンと残り時間を管理する。
2. WHEN 現在パターンの持続時間が尽きる, THE STG_Engine SHALL 現在のパターンとは異なる候補からランダムに次の Attack_Pattern を選択して切り替える（直前と同じパターンを連続選択しない）。
3. THE STG_Engine SHALL `aimed`（自機狙い）で自機の現在位置方向へ弾を発射する。
4. THE STG_Engine SHALL `spread`（自機外し）で自機方向を避けた扇状に弾を発射する。
5. THE STG_Engine SHALL `fixed`（固定弾）で自機位置に依存しない固定方向の弾幕を発射する。
6. THE STG_Engine SHALL Attack_Pattern に全方位（`ring`）や大玉散布（`bigLob`）を含み、弾種（Bullet_Type）を組み合わせて発射する。
7. THE STG_Engine SHALL Floor_Boss に、通常ボスより「多い Attack_Pattern の種類」または「高い発射頻度・多い同時弾数」を与える（密度＝発射頻度・同時弾数を指す）。
8. THE STG_Engine SHALL ボスの移動を単調な左右等速往復から、サイン揺動・8の字・瞬間移動などの特徴的な動きへ変更し、パターン切替時に動きも切り替え可能とする。
9. WHERE ボスが瞬間移動（ワープ）を行う, THE STG_Engine SHALL 移動によってボスが自機と重なる位置に瞬間出現して不当な被弾を発生させないよう、移動先を自機から一定距離離す等の安全条件を満たす。

### Requirement 5: 特殊弾幕（スペルカード）

**User Story:** 子供として、ボスの体力が減ると激しい必殺の弾幕が来る、緊張感のある戦いを楽しみたい。

#### Acceptance Criteria

1. THE STG_Engine SHALL ボスに Spell_Card しきい値の集合（例: 最大HPの60%・30%）を持たせ、各しきい値の状態を `inactive` / `active` / `completed` で管理する。
2. WHEN ボスHP が、まだ `completed` になっていないしきい値を下回る（初めて通過する）, THE STG_Engine SHALL 当該しきい値を `active` にして通常弾幕から Spell_Card（特殊弾幕）へ移行する。
3. THE STG_Engine SHALL 各しきい値に対応する Spell_Card を、ボス1体につき1回だけ発動する（`completed` 済みのしきい値では再発動しない。毎フレームの条件成立による再開始を防ぐ）。
4. WHEN Spell_Card へ移行する, THE STG_Engine SHALL 演出（名称表示や画面効果）とともに、通常より高密度・複雑な弾幕を一定時間展開する。
5. WHEN Spell_Card の展開時間が終了する, THE STG_Engine SHALL 当該しきい値を `completed` にし、通常弾幕へ戻る。
6. WHILE ある Spell_Card が `active` である間にHPがさらに下位のしきい値を下回った, THE STG_Engine SHALL 現在の Spell_Card 終了後に、未 `completed` の下位しきい値の Spell_Card を発動する（同時に複数の Spell_Card を重ねて発動しない）。
7. THE STG_Engine SHALL Floor_Boss の Spell_Card を通常ボスより多く／激しくする（しきい値の追加や同時弾数の増加）。
8. WHILE Spell_Card 展開中である, THE STG_Engine SHALL ボスの移動を通常時と異なる軌道（中央停止・特徴的な移動）に変更してよい。
9. WHEN Spell_Card 発動時, THE STG_Engine SHALL Spell_Card にも予告演出を伴わせ、理不尽な即死弾（予告なしの回避不能弾）を発生させない。
10. WHEN ボスHP が 0 以下になる, THE STG_Engine SHALL 弾幕状態（通常/特殊）に関わらずボスを撃破処理する（既存のドロップ・ステージ進行に従う）。

### Requirement 6: 弾幕計算の純粋関数化とテスト

**User Story:** 開発者として、弾幕やレーザーの計算部分をテスト可能にして、破綻なく調整したい。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL 弾幕計算のうち副作用を必要としない計算ロジック（全方位角度生成・自機狙い角度・線分/カプセルと点の距離など）を可能な限り `js/kanji-blast.pure.js` の純粋関数として集約する。ただし純粋関数を過度に細分化せず、中核（角度生成・狙い角度・距離判定）を中心とする。
2. THE 全方位角度生成関数 SHALL 指定個数 n の等間隔（2π/n）角度配列を、オフセットを反映して返す。
3. THE 自機狙い角度関数 SHALL 発射元と自機の座標から進行角度を返す。
4. THE 線分と点の距離関数 SHALL 常に非負の値を返し、点が線分上にある場合 0 を返す。
5. THE Kanji_Blast SHALL これらの純粋関数を vitest（必要に応じ fast-check のプロパティテスト）で検証し、pure.js を唯一の実体としてテストと本番が同一実体を参照する。

### Requirement 7: パフォーマンスと安全性

**User Story:** 保護者・開発者として、弾が増えても動作が重くなりすぎたり壊れたりしないようにしたい。

#### Acceptance Criteria

1. THE STG_Engine SHALL 同時に存在する敵弾数の上限を設定値（例: `MAX_ACTIVE_BULLETS`）として持ち、値はプレイテストで調整可能とする。
2. WHEN 敵弾数が上限に達している, THE STG_Engine SHALL 新規弾の生成を抑制することを基本動作とし、既存弾（特にレーザー等の演出弾）を強制破棄しない。
3. THE STG_Engine SHALL 画面外へ出た弾および寿命切れの弾（レーザーの予告・本体を含む）を破棄してメモリと描画負荷を抑える。
4. THE STG_Engine SHALL 弾種の追加・パターンの追加によっても、既存のステージ進行・ドロップ・スコア・残機・必殺の挙動を壊さない。

### Requirement 8: 既存挙動の維持と整合

**User Story:** 開発者として、今回の変更が既存の遊びを壊さず、ドキュメントの整合が取れている状態にしたい。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL 既存のデータモデル（5テーブル）・読み判定・合体/分解の+値ロジック・レシピ索引・図鑑登録の挙動を変更しない（Final_Power における Plus_Value の反映方法の変更は Requirement 2-13 のとおり許容し、+値そのものの生成・増減は変えない）。
2. THE Kanji_Blast SHALL 既存のセーブデータ（plus / plus_cap / 装備 / max_stage / best_score）をそのまま利用可能とする（データ構造の変更なし）。
3. WHERE 本スペックと既存スペック `.kiro/specs/kanji-blast/` の記載が矛盾する, THE Kanji_Blast SHALL 本スペックを変更後仕様として優先する（既存スペックの Requirement 9 強さ計算・Requirement 5 画面・STG 弾幕は本スペックにより上書きされる）。
4. WHEN 本スペックの実装が完了する, THE Kanji_Blast SHALL 既存スペックの該当箇所を更新し、最終的に両スペック間に矛盾を残さない（相互参照または追従更新）。
5. THE STG_Engine SHALL 自機と敵弾を視認しやすい状態に保ち、telegraph 中の予告線と実レーザーを視覚的に区別可能とし、予告なしの回避不能な即死弾を出さない（子供向けの理不尽さ回避）。
6. THE Kanji_Blast SHALL リリース時に Service Worker のキャッシュ名・アプリ表示バージョン・リリースノートを更新する。
