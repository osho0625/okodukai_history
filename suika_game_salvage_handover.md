# 「すいかが食べたい」ブラウザ移植・サルベージ 引継ぎ資料

## 目的
古い Java Applet ゲーム「すいかが食べたい」を可能な限り原作そのままの挙動でブラウザ上で動作させる。

優先順位は以下。

1. **まずは原作をそのまま動かす（CheerpJ）**
2. 動作確認後、**HTML5/JavaScript へ移植**
3. 最終的に **GitHub Pages で公開**

---

# 現状確認

## 元ゲーム情報
- タイトル: すいかが食べたい
- 実装: Java Applet
- 公式配布元あり（現存）

必要ファイルは以下。

### 本体
- `arpg.jar`

### 画像
- `image00.gif` ～ `image31.gif`

### データ
- `data/mdl000._k3` ～ `data/mdl203._k3`
- `data/stage._su`
- `data/event.sui`
- `data/param._da`

---

# フェーズ1: アセット回収

作業ディレクトリ:

```bash
mkdir suika
cd suika
mkdir data
```

取得対象:

```text
/arpg.jar
/image00.gif ... image31.gif
/data/mdl000._k3 ... mdl203._k3
/data/stage._su
/data/event.sui
/data/param._da
```

確認項目:
- 全ファイル取得できているか
- サイズ0バイトが無いか
- md5一覧作成

推奨:

```bash
find . -type f -exec md5sum {} \; > checksums.txt
```

---

# フェーズ2: 原作そのまま起動（最優先）

目的:
「ゲームが動く」ことを最速で確認。

方法:
CheerpJ を利用して Java Applet をブラウザ実行。

最小 HTML:

```html
<applet archive="arpg.jar"
        code="ARpg.class"
        width="400"
        height="320">
  <param name="Mode" value="0">
  <param name="Safe" value="0">
</applet>
```

確認項目:
- タイトル表示
- キー入力
- ステージ遷移
- BGM/SE有無
- セーブ/ロード挙動

ここで動けば一旦成功。

---

# フェーズ3: jar解析

目的:
Java → JS移植準備。

使用ツール:
- CFR
- JD-GUI

実行:

```bash
java -jar cfr.jar arpg.jar --outputdir src
```

取得したいもの:
- `ARpg.java`
- 描画クラス
- 入力処理
- メインループ
- データ読込処理
- 当たり判定処理

保存先:

```text
/decompiled/
```

---

# フェーズ4: コード解析ポイント

重点確認:

## 1. 描画
Java:

```java
Graphics g
```

移植先:

```javascript
canvas.getContext('2d')
```

---

## 2. キー入力
Java:

```java
keyPressed()
```

移植先:

```javascript
window.addEventListener('keydown')
```

---

## 3. メインループ
Java:

```java
Thread.sleep()
```

移植先:

```javascript
requestAnimationFrame()
```

---

## 4. 画像読込
Java:

```java
getImage()
```

移植先:

```javascript
new Image()
```

---

## 5. データ形式解析
確認対象:
- `. _k3`
- `. _su`
- `.sui`
- `. _da`

やること:
- バイナリ確認
- 文字列抽出
- ヘッダ確認
- 構造体推定

推奨:

```bash
xxd file
strings file
```

---

# フェーズ5: HTML5移植

推奨構成:

```text
/src
  index.html
  main.js
  engine/
    renderer.js
    input.js
    loop.js
    loader.js
    collision.js
  assets/
```

設計方針:
- 元コードの変数名は可能な限り維持
- ロジック改変しない
- 見た目を合わせる
- FPS固定（可能なら）

---

# フェーズ6: GitHub Pages公開

配置:

```text
/docs
  index.html
  main.js
  assets/
```

設定:
- branch: main
- root: /docs

確認:
- PC Chrome
- Android Chrome
- iPhone Safari

---

# 推奨タスク順

1. 全アセットDL
2. checksums生成
3. CheerpJで起動確認
4. スクショ保存
5. jar逆コンパイル
6. main loop特定
7. renderer移植
8. input移植
9. asset loader移植
10. gameplay確認
11. GitHub Pages公開

---

# 完了条件

以下を満たしたら完了。

- タイトル表示
- ゲーム開始可能
- 移動可能
- ステージ移動可能
- クリア可能
- 原作と挙動差分ほぼなし
- GitHub Pages公開済み

---

# 注意事項

- 著作権は原作者に帰属
- 公開時は非営利のみ
- ソース公開時は original asset を分離すること
- assets は別DL方式でも可

