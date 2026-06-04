---
inclusion: fileMatch
fileMatchPattern: "*suika*"
---

# すいかが食べたい（3D RPG HTML5移植）

## ファイル構成

- `pages/suika.html` — すいかが食べたい（3D RPG HTML5移植）
- `pages/suika-original.html` — すいかが食べたい（原作Java版 CheerpJ）
- `suika/` — 原作アセット + HTML5移植
  - `suika/web/` — HTML5版エンジン（main.js + engine/21モジュール）
  - `suika/data/` — ゲームデータ（モデル204個、ステージ/イベント/パラメータ）
  - `suika/image00-31.gif` — スプライト/UI画像
  - `suika/efc_00-29.au` — 効果音
  - `suika/decompiled/` — 逆コンパイル済みJavaソース（参考用）
  - `suika/ANALYSIS.md` — 解析ドキュメント

## 概要

Java Applet RPG「すいかが食べたい」(2002-2008 くろすけ)のHTML5/Canvas完全移植。
ソフトウェア3Dレンダラ（Canvas 2D）、400×320px、約11FPS。

- game_settings.game_publish.game_suika で公開制御
- 原作Java版: pages/suika-original.html（CheerpJ 4.3、PC専用）
  - game_settings.game_publish.game_suika_java で公開制御

## 機能詳細

- セーブ: localStorage `suika_save`（オートセーブ+手動セーブ）
- スマホ: タッチUI自動表示（アナログスティック+A/B/◀▶/≡ボタン）
- 原作アセット: suika/ 配下（モデル204個、画像32枚、SE30個、ステージ/イベント/パラメータ）
- エンジン構成: suika/web/engine/ に21モジュール
- イベントスクリプト75コマンド完全対応（再帰深度制限50）
- 戦闘: ターン制、スキル5種、状態異常5種、敵AI20プロファイル、クリティカル、剣技コンボ
- 戦闘コマンド: こうげき/まほう/アイテム/ぼうぎょ/にげる/盗む/ぶん取る
- 14種スキルアニメーション（炎/氷/雷/風/聖/闇/回復/バフ/デバフ/毒/ドレイン/斬撃/爆発/連撃）
- ショップ: 道具屋/武器屋/勾玉屋/土産屋/合成屋（14レシピ）、購入確認ダイアログ付き
- 勾玉: 17種、AP管理、7スキル習得、砕散、キャラ専用制限
- パスワード: 生成+読込（原作CPassCode完全準拠318文字）
- 名前入力: ひらがな/カタカナ切替、デフォルト「西瓜太郎」
- キャラ名: 主人公=西瓜太郎、仲間1=うな、仲間2=かるび（原作準拠）
- システムメニュー: アイテム/特技/装備/勾玉/ステータス/コマンド/設定/マップ/セーブ/じゅもん
- 設定: SE音量(デフォルトOFF)/戦闘速度(4段階)/エンカウント率(4段階)
- 宇宙背景（CCosmo）: フラグ330/331でフィールド+戦闘に星空表示
- 船移動: ワールドマップ上で方向キー移動+着陸
- 忍び足/猫目: スキル/アイテムで発動
- 壁越しNPC会話防止（ライン上の壁チェック）
- EXP: 累積方式、原作公式 lv*lv*(lv+1)*10
- レベルアップ: 乗算方式（prmUpsテーブル準拠）
- 逃走: AGI+DEX比較方式（原作準拠）
- 初期状態: area 0, pos(16,35), 主人公1人, 1000G, 回復草×3（原作CInitGame準拠）
- 唯一の未実装: CEfcWork（3Dエフェクト120パターン）→ 2Dスキルアニメーションで代替

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| suika_save | すいかが食べたいセーブデータ（JSON） | 永続 |
| suika_se_volume | すいかSE音量（0〜1） | 永続 |
| suika_battle_speed | すいか戦闘速度（0〜3） | 永続 |
| suika_encounter_rate | すいかエンカウント率（0〜3） | 永続 |
