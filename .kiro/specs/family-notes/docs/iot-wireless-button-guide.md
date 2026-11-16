# 📡 無線IoTボタン（電池式ESP32）製作ガイド

ボタンを押すと Wi-Fi 経由でお小遣い手帳に「お手伝いポイント申請」が入り、
ラズパイのスピーカーが「○○が、△△を もうしこみました」と読み上げる。
ボタンは電池式の無線タイプなので、家のどこに置いてもOK。

> 有線版（ラズパイのGPIOに直結）は「🔘 おうちIoTボタン 作り方ガイド」を参照。
> このガイドは **ボタン本体を無線化した版**。部品が届いたらこの順に進めればよい。

---

## 0. 全体像

```
[電池式ESP32ボタン] ──Wi-Fi/HTTPS POST {token}──> [Supabase button-action]
                                                    ├─ chore_points に pending 申請（承認制）
                                                    └─ button_action_logs に applied を記録
                                                              │ Realtime 配信
                                                              ▼
                                         [ラズパイ button-voice-listener.py]
                                                              ▼
                                                    スピーカーで読み上げ
```

- ボタンが持つのは `token` だけ。誰の・何の家事・何ptかは管理画面（admin.html）で決める
- 読み上げるのは申請成功（`applied`）のときだけ。連打（cooldown）や無効ボタンは喋らない
- 読み上げは「ボタンの種類」ではなく「ログに applied が入ったか」で決まるので、
  管理画面の「🧪 テスト発火」でも同じように喋る（部品が届く前の動作確認に使える）

---

## 1. 買うもの（4ボタン構成 / 約800円）

| 部品 | 数 | 用途 | 目安 |
|------|----|------|------|
| ESP32-C3 Super Mini | 1 | Wi-Fi内蔵マイコン | 約400円 |
| タクトスイッチ | 4 | ボタン | 約100円 |
| 抵抗 100kΩ | 4 | プルダウン（待機中に誤作動させない） | 約20円 |
| 単3電池 | 3 | 電源（約4.5V） | 手持ち可 |
| 単3×3用 電池ボックス | 1 | 電池ホルダ | 約100円 |
| 配線（ジャンパ線 or 単線） | 適量 | 配線 | 約100円 |
| 蓋つきケース等 | 1 | 筐体（100均のケースで可） | 約100円 |

価格はいずれも目安（未確認）。

### 前に検討した構成からの変更点

- **ダイオード(1N4148)は不要になった**。4ボタンなら各ボタンを別々のGPIOにつなぎ、
  全部をディープスリープの「起床ピン」に指定すれば足りる
- **電池は単3×2 → ×3 に変更**。ボードの 5V ピンに入れて内蔵レギュレータで3.3Vを作る。
  2本(約3V)をそのまま3V3ピンに入れると、Wi-Fi送信の瞬間に電圧が落ちてリセットしやすい
- **100kΩ抵抗を追加**。ディープスリープ中のプルダウンを、確実に効かせるため外付けにした

---

## 2. 事前加工：電源LEDを外す（重要）

ボード上で常時点灯しているLEDは待機中も電流を食うので、電池持ちに直結する。

1. ボード上で常時点灯するチップLED（電源LED）を特定する（通電して光るもの）
2. こて先で両端を交互に温め、ピンセットで外す（隣の部品を巻き込まない）
3. 通信時に点滅するLEDは残してよい

**確認方法**：組み上げ後、ディープスリープ中の電流をテスターで測る。
数十〜数百μAなら成功。mA単位で流れているなら、他に常時通電している部品が残っている。

---

## 3. 配線図

### 使うGPIO

| ボタン | GPIO | 備考 |
|--------|------|------|
| ボタン1 | GPIO0 | |
| ボタン2 | GPIO1 | |
| ボタン3 | GPIO3 | |
| ボタン4 | GPIO4 | |
| 予備（5個目） | GPIO5 | 追加するならここ |

- ESP32-C3 でディープスリープから起こせるのは **GPIO0〜5** のみ
- **GPIO2 は使わない**（起動時の設定に使われる特殊ピン＝ストラッピングピン）
- ボード上の印字（0,1,3,4,5,3V3,5V,GND）を見て差す。ピンの並び順は個体差があるので必ず印字で確認

### 回路（1ボタンぶん。これを4回繰り返す）

```
   3V3 ──────┐
             │
          [ボタン]        押すと 3V3 が GPIO に届く（HIGH）
             │
   GPIOn ────┼───────┐
             │       │
             │     [100kΩ]   離している間は GND に引っ張る（LOW）
             │       │
   GND ──────┴───────┘
```

### 全体配線

```
 単3×3 (4.5V)
  (+) ───────────────► 5V ピン  ┐
  (-) ───────────────► GND ピン │  ESP32-C3 Super Mini
                                │
 3V3 ピン ─┬───[SW1]───┬──► GPIO0   └ GPIO0 ─ [100kΩ] ─ GND
           ├───[SW2]───┼──► GPIO1     GPIO1 ─ [100kΩ] ─ GND
           ├───[SW3]───┼──► GPIO3     GPIO3 ─ [100kΩ] ─ GND
           └───[SW4]───┴──► GPIO4     GPIO4 ─ [100kΩ] ─ GND
```

### 配線チェックリスト

- [ ] 電池(+) → **5Vピン**、電池(−) → GND（3V3ピンに電池を直結しない）
- [ ] 3V3ピンから各ボタンの片足へ
- [ ] 各ボタンのもう片足 → 対応するGPIO、同じ点から100kΩ → GND
- [ ] 電池を入れる前にテスターで 3V3 と GND の短絡がないか確認
- [ ] 電池を入れて 3V3 ピンが約3.3Vか確認（高すぎ・低すぎたら5V入力を疑う）

---

## 4. ソフトの準備

### 4-1. Arduino IDE

1. Arduino IDE をインストール
2. ボードマネージャで「esp32 by Espressif Systems」をインストール（バージョン3系を想定）
3. ボード選択：「ESP32C3 Dev Module」
4. 「USB CDC On Boot」を **Enabled**（書き込み後にシリアルログを見るため）
5. USBケーブルで接続して書き込み

書き込みがうまくいかないときは、BOOTボタンを押しながらUSBを挿す（書き込みモード）。

### 4-2. 管理画面でボタン4個を登録して token を発行

お小遣い手帳の管理者ページ（admin.html）→「🔘 IoTボタン管理」→「➕ 新しいボタンを登録」。

| 項目 | 例 |
|------|----|
| ボタンの名前 | いろはのゴミ出し |
| 対象の子 | プルダウンから選択 |
| 家事の名前 | ゴミ出し |
| ポイント | 2 |
| クールダウン秒数 | 30（初期値） |

4個ぶん登録し、各ボタンの「URL / QR / テスト」から `tok_xxxx…` をコピーして控える。

> 割り当て（誰の・何の家事・何pt）は後から管理画面で変えられる。
> ESP32 を書き換える必要があるのは、ボタンを増やす・token を作り直すときだけ。

### 4-3. スケッチ

フォルダ `button_remote` を作り、2ファイルを置く。

**`secrets.h`**（Wi-Fiの情報と token。**GitHubに上げない**）

```cpp
#pragma once

#define WIFI_SSID     "ここにWi-FiのSSID"
#define WIFI_PASSWORD "ここにWi-Fiのパスワード"

// 管理画面で発行した token（ボタン1〜4の順）
#define TOKEN_1 "tok_ここに1つめ"
#define TOKEN_2 "tok_ここに2つめ"
#define TOKEN_3 "tok_ここに3つめ"
#define TOKEN_4 "tok_ここに4つめ"
```

**`button_remote.ino`**

```cpp
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "esp_sleep.h"
#include "secrets.h"

// button-action Edge Function と公開キー（button-listener.py と同じ値。公開前提のキー）
static const char* ENDPOINT = "https://ynecezxnltigplrfzzoh.supabase.co/functions/v1/button-action";
static const char* APIKEY   = "sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4";

// ボタンのGPIO（ディープスリープ起床に使えるのは GPIO0〜5。GPIO2 は避ける）
static const int   PINS[]   = {0, 1, 3, 4};
static const char* TOKENS[] = {TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4};
static const int   N        = 4;

static const uint32_t WIFI_TIMEOUT_MS = 10000;

// 起床の原因になったボタンの番号（なければ -1）
int pressedIndex() {
  uint64_t status = esp_sleep_get_gpio_wakeup_status();
  for (int i = 0; i < N; i++) {
    if (status & (1ULL << PINS[i])) return i;
  }
  return -1;
}

bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > WIFI_TIMEOUT_MS) return false;
    delay(50);
  }
  return true;
}

bool postToken(const char* token) {
  WiFiClientSecure client;
  client.setInsecure();   // 証明書の検証は省略（このAPIは token と公開キーのみ）

  HTTPClient http;
  http.setTimeout(10000);
  if (!http.begin(client, ENDPOINT)) return false;
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", APIKEY);

  String body = String("{\"token\":\"") + token + "\"}";
  int code = http.POST(body);
  Serial.printf("HTTP %d\n", code);
  if (code > 0) Serial.println(http.getString());
  http.end();
  return code == 200;
}

void goToSleep() {
  // ボタンが離されるまで待つ（押しっぱなしだと、寝た瞬間にまた起きてしまう）
  uint32_t start = millis();
  bool anyHigh = true;
  while (anyHigh && millis() - start < 5000) {
    anyHigh = false;
    for (int i = 0; i < N; i++) if (digitalRead(PINS[i]) == HIGH) anyHigh = true;
    delay(20);
  }

  uint64_t mask = 0;
  for (int i = 0; i < N; i++) mask |= (1ULL << PINS[i]);
  esp_deep_sleep_enable_gpio_wakeup(mask, ESP_GPIO_WAKEUP_GPIO_HIGH);
  Serial.println("sleep");
  Serial.flush();
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < N; i++) pinMode(PINS[i], INPUT);   // プルダウンは外付け抵抗

  // 電池を入れた直後など、ボタン以外の起動では何もせず眠る
  int idx = (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_GPIO) ? pressedIndex() : -1;
  Serial.printf("wake button index = %d\n", idx);

  if (idx >= 0 && connectWifi()) {
    if (!postToken(TOKENS[idx])) {
      delay(500);
      postToken(TOKENS[idx]);   // 失敗したら1回だけやり直す
    }
  }
  goToSleep();
}

void loop() {}
```

スケッチ内の注意：

- `esp_sleep_get_gpio_wakeup_status()` は Arduino-ESP32 3系（ESP-IDF 5系）で使う前提。
  コンパイルで通らない場合は core のバージョンを確認する（実機未確認）
- 再送は1回だけ。サーバー側に連打防止（cooldown）があるので、二重申請になりにくい
- `setInsecure()` は証明書を検証しない。送るのは token と公開キーだけなので許容した

---

## 5. ラズパイ側（音声リスナー）

ボタンの申請を読み上げる常駐サービス。リポジトリに追加済み（mainにマージ済み）。

### 5-1. Supabase で Realtime を有効化（初回1回だけ・実施済み）

SQL Editor で実行する内容（`sql/enable_realtime_button_action_logs.sql`）：

```sql
ALTER TABLE button_action_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE button_action_logs;
```

### 5-2. ラズパイへの導入

```bash
cd ~/okodukai_history      # 無ければ git clone https://github.com/osho0625/okodukai_history.git
git pull
cd raspi
bash button-voice-setup.sh
sudo systemctl start button-voice
```

- 既存の `broadcast`（Alexa連携）サービスとは別プロセスなので共存できる
- スピーカー（3.5mm / USB / HDMI）がつながっていること
- 詳細は `raspi/BUTTON_VOICE_README.md`

### 5-3. コードを変えたとき（会社PCなどから）

GitHub に push → ラズパイで次を実行：

```bash
cd ~/okodukai_history/raspi && bash button-voice-update.sh
```

### 5-4. 読み上げの内容

| 結果 (`result`) | 読み上げ |
|-----------------|----------|
| applied（申請成功） | 「○○が、△△を もうしこみました。Nポイントです」 |
| cooldown / disabled / not_found / error | 喋らない |

---

## 6. 動作確認の順番（部品が届く前から始められる）

### ステップA：ラズパイ側だけ確認（ボタン不要）

1. ラズパイで `journalctl -u button-voice -f` を表示
2. admin.html → 「🔘 IoTボタン管理」→ ボタンの「🧪 テスト発火」を押す
3. ログに `📨 ボタン申請` が出て、スピーカーから読み上げられれば成功
4. 30秒以内にもう一度押すと cooldown になり、喋らない（仕様どおり）

### ステップB：ESP32 単体で確認（ブレッドボード）

1. 配線を仮組み（はんだ付け前）
2. Arduino IDE のシリアルモニタ（115200）を開いてボタンを押す
3. `wake button index = 0` → `HTTP 200` → `sleep` と出れば成功
4. 管理画面の承認待ちに申請が入り、ラズパイが喋る

### ステップC：組み立て

1. 電源LEDを外す（2章）→ ディープスリープ中の電流を測る
2. ケースに収めて電池ボックスを接続
3. 1週間ほど使って電池の減りを見る

### 確認後の後片付け

テスト発火も本物の申請と同じく `chore_points` に pending を作る。
確認が終わったら、管理画面の承認待ち一覧から却下しておく。

---

## 7. うまくいかないとき

| 症状 | 確認すること |
|------|-------------|
| 押しても何も起きない | シリアルログに `wake button index` が出るか。出なければ配線（3V3→ボタン→GPIO、100kΩ→GND） |
| 書き込めない | BOOTボタンを押しながらUSBを挿す。「USB CDC On Boot」の設定 |
| Wi-Fiに繋がらない | 2.4GHz帯のSSIDか（ESP32-C3は5GHz非対応）、`secrets.h` の綴り |
| `HTTP -1` など負の値 | 通信失敗。Wi-Fi電波、`setInsecure()` の有無、URLの綴り |
| `HTTP 404` | token が違う（管理画面の値と一致しているか。前後の空白に注意） |
| `HTTP 403` | ボタンが無効になっている（管理画面で有効に戻す） |
| `cooldown` ばかり | 仕様。管理画面でクールダウン秒数を調整できる |
| 申請は入るがラズパイが喋らない | Realtime有効化SQLの実行、`journalctl -u button-voice -f` に `📨` が出るか |
| `⏭️ スキップ` と出る | applied 以外（cooldown等）のログ。仕様どおり |
| 押してから反応まで数秒かかる | Wi-Fi接続と通信で2〜5秒かかる。仕様 |
| 電池がすぐ減る | 電源LEDの除去漏れ、またはボード上の別の常時通電部品。ディープスリープ中の電流を測る |
| ボタンを押していないのに起きる | 100kΩの付け忘れ、配線の浮き（GPIOが浮いていると誤検出する） |

---

## 8. ボタンを10個に増やすとき

4個〜5個までは上の方式のまま増やせる（GPIO5 を使えば5個）。
**GPIO0〜5 の6本しか起床に使えず、GPIO2を避けると実質5本**なので、それ以上は別の方法が必要。

| 方法 | 内容 | 向き不向き |
|------|------|-----------|
| A. 本体を2台作る（おすすめ） | 5ボタン×2台＝10個。同じスケッチ、token違いで増やすだけ | いちばん簡単。追加費用は約800円 |
| B. ダイオードOR＋抵抗ラダー | どのボタンでも1本の起床ピンがHIGHになるようダイオードで束ね、押された番号は別のアナログピンの電圧で判別する | 1台に10個収まる。回路・調整が増える。ここで初めてダイオードが必要になる |
| C. I/Oエキスパンダ | I2C のチップでボタンを増設し、割り込み線で起床 | 部品が増えるが確実 |

まずは4個で使ってみて、足りなくなったらAをおすすめする。B/Cが必要になったら、そのとき設計する。

---

## 9. 運用のヒント

- **色や置き場所で見分ける**：ボタンごとにシールや色を決めておくと子供が迷わない
- **割り当て変更は管理画面だけ**：ポイントの増減、一時停止はスケッチ書き換え不要
- **token が漏れた場合**：その1ボタンの申請しかできない（承認制なので親が弾ける）。管理画面で削除して作り直し、スケッチの token を差し替える
- **`secrets.h` は GitHub に上げない**：Wi-Fi パスワードが入るため。リポジトリに置くなら `.gitignore` に追加する
- **電池交換の目安**：週2〜3回の使用なら、LED除去後は半年〜1年が目安（実測前の見積もり。使いながら確認する）
- **反応が遅い・Wi-Fiに繋がらないとき**：先に電池を疑う

---

## 10. 関連ファイル（リポジトリ）

| ファイル | 内容 |
|----------|------|
| `supabase/functions/button-action/index.ts` | ボタン申請を受けるAPI |
| `sql/button_actions.sql` | ボタン定義・ログのテーブル |
| `sql/enable_realtime_button_action_logs.sql` | ログのRealtime有効化 |
| `raspi/button-voice-listener.py` | 申請を読み上げる常駐サービス |
| `raspi/button-voice-setup.sh` / `button-voice-update.sh` | 導入・更新スクリプト |
| `raspi/BUTTON_VOICE_README.md` | 音声リスナーの手順書 |
| `raspi/button-listener.py` | 有線版（ラズパイのGPIO直結）のクライアント |
