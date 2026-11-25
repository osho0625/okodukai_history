# 🔌 micro:bit 学習リンク集

micro:bit ベーシックキット V2.2 と、シャミ多機能拡張ボード V2（DFRobot Xia mi / 型番 MBT0042）で使うオンライン教材のまとめ。
教材はオンラインだけで始められる。拡張ボードのWikiは英語（ブラウザの翻訳機能で読める）。

---

## ① micro:bit 本体（ベーシックキット V2.2）

| 内容 | リンク | 言語 |
|---|---|---|
| iftiny 公式ドキュメント：micro:bit の概要 | https://docs.iftiny.com/jp/education/microbit/stand-alone/info/overview/ | 日本語 |
| iftiny ストア：micro:bit V2.2 | https://store.iftiny.com/products/microbit | 日本語 |
| iftiny ストア：基本キット製品の選び方 | https://store.iftiny.com/pages/micro-bit-how-to-choose | 日本語 |
| MakeCode（ブロックでプログラミングする場所） | https://makecode.microbit.org/ | 日本語切替可 |
| micro:bit 公式サイト（日本語） | https://microbit.org/ja/ | 日本語 |

---

## ② シャミ多機能拡張ボード V2（MBT0042）

### まず読む

| 内容 | リンク | 言語 |
|---|---|---|
| **シャミ多機能拡張ボードV2 利用マニュアル（iftiny）** | https://docs.iftiny.com/jp/education/microbit/expansion-boards/dfrobot/xia-mi-multi-functional-expansion-board/ | **日本語** |
| DFRobot Wiki トップ（MBT0042） | https://wiki.dfrobot.com/mbt0042/ | 英語 |
| DFRobot Wiki：リファレンス（ライブラリ導入・電源） | https://wiki.dfrobot.com/mbt0042/docs/20052 | 英語 |
| DFRobot 商品ページ | https://www.dfrobot.com/product-2371.html | 英語 |
| iftiny ストア商品ページ | https://store.iftiny.com/products/dfrobot-xia-mi-multi-functional-expansion-board-for-microbit | 日本語 |

### MakeCode 用ライブラリ（拡張機能）

MakeCode で新規プロジェクトを作り、「設定（歯車）」→「拡張機能」を開いて、下のURLを検索欄に貼る。

```
https://github.com/DFRobot/pxt-DFRobot_xia_mi_Board
```

GitHub：https://github.com/DFRobot/pxt-DFRobot_xia_mi_Board

### サンプルプログラム（DFRobot Wiki、英語）

| サンプル | リンク |
|---|---|
| 信号機 | https://wiki.dfrobot.com/mbt0042/docs/20059 |
| モーター駆動 | https://wiki.dfrobot.com/mbt0042/docs/20053 |
| 火災警報器（ライターの火を使う。大人と一緒に安全に注意） | https://wiki.dfrobot.com/mbt0042/docs/20055 |

### iftiny 日本語マニュアルのサンプル（上記マニュアル内、8章）

ブロック、JavaScript、Python の3形式で載っている。

| 章 | 内容 | 別途必要なもの |
|---|---|---|
| 8.2 | RGB LED ライト | なし |
| 8.3 | 信号機（3秒ごとに赤・黄・緑） | なし |
| 8.4 | 温度・湿度計（OLEDに表示） | なし |
| 8.5 | ポテンションメーターでサーボ制御 | サーボ（180度） |
| 8.6 | 赤外線リモコンでリレー制御 | 赤外線リモコン |
| 8.7 | 火災警報器 | ライター（安全に注意） |
| 8.8 | 超音波距離センサーで距離測定 | SR04超音波センサー |
| 8.9 | モーター駆動 | モーター1個 |

---

## 📝 メモ

- 拡張ボードは micro:bit **V2 専用**（V1は使えない）。キットはV2.2なのでOK。
- 超音波センサー、サーボ、モーターは**ボードに付属しない**。必要になったら別途購入する。
- 電源は、USB（5V）で授業・実験程度なら動く。モーターやサーボを複数動かすときは外部電源（5〜12V、DC2.1プラグ）を使う。
- 外部電源を使うときは、プラスとマイナスの向きに注意（ボードが壊れる）。
- iftiny のマニュアルは MakeCode ライブラリ v0.7.0 時点の内容。最新版では手順が変わることがある。
- 超音波センサー（SR04）を使うときは、追加で https://github.com/microsoft/pxt-sonar を拡張機能に入れる。
- 学習の順番のおすすめ：①micro:bit 単体で LED・ボタン・センサー → ②拡張ボードで信号機 → 温度湿度計 → モーターへ。
