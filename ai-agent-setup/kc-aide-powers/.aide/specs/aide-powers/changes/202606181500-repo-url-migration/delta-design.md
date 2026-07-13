# 差分設計書

## 設計方針
- 5ファイルのテキスト置換（URL/パス参照の更新）
- コードロジック変更なし
- シグネチャ変更なし

## 既存変更の差分設計

### 変更1: apm.yml — repository フィールド

#### before

```yaml
repository: http://10.110.47.117/takashi/aide-powers
```

#### after

```yaml
repository: http://10.110.47.117/kc-apm/kc-aide-powers
```

#### 変更理由
リポジトリURLの移行（takashi/aide-powers → kc-apm/kc-aide-powers）

---

### 変更2: README.md — APMインストールコマンド・スクリプトパス

#### before

```cmd
apm install --allow-insecure --target kiro http://10.110.47.117/takashi/aide-powers
```

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\takashi\\aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/takashi/aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\takashi\\aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/takashi/aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\takashi\\aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/takashi/aide-powers/setup.sh 6"
```

```cmd
apm install --allow-insecure --update --target kiro http://10.110.47.117/takashi/aide-powers
```

#### after

```cmd
apm install --allow-insecure --target kiro http://10.110.47.117/kc-apm/kc-aide-powers
```

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/kc-apm/kc-aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/kc-apm/kc-aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/kc-apm/kc-aide-powers/setup.sh 6"
```

```cmd
apm install --allow-insecure --update --target kiro http://10.110.47.117/kc-apm/kc-aide-powers
```

#### 変更理由
リポジトリURLの移行（takashi/aide-powers → kc-apm/kc-aide-powers）およびAPMモジュールパスの更新

---

### 変更3: docs/02-getting-started.md — APMインストールコマンド・スクリプトパス

#### before

```cmd
apm install --allow-insecure --target kiro http://10.110.47.117/takashi/aide-powers
```

```
`apm_modules/takashi/aide-powers/` にリポジトリがクローンされ、skills が自動配置されます。
```

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\takashi\\aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/takashi/aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\takashi\\aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/takashi/aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\takashi\\aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/takashi/aide-powers/setup.sh 6"
```

#### after

```cmd
apm install --allow-insecure --target kiro http://10.110.47.117/kc-apm/kc-aide-powers
```

```
`apm_modules/kc-apm/kc-aide-powers/` にリポジトリがクローンされ、skills が自動配置されます。
```

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/kc-apm/kc-aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/kc-apm/kc-aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/kc-apm/kc-aide-powers/setup.sh 6"
```

#### 変更理由
リポジトリURLの移行（takashi/aide-powers → kc-apm/kc-aide-powers）およびAPMモジュールパスの更新

---

### 変更4: .aide/specs/aide-powers/dev-environment.md — §8.3 リモート構成

#### before

```markdown
### 8.3 リモート構成

このリポジトリは内部 GitLab 上に2系統のリポジトリを持ちます。**現在は同一の main ブランチ履歴を共有しています。**

| リモート名 | リポジトリ | 公開範囲 | 役割 |
|---|---|---|---|
| origin | `http://10.110.47.117/takashi/aide-claude.git` | プライベート | 開発用。通常の push 先 |
| public | `http://10.110.47.117/takashi/aide-powers.git` | パブリック | 安定版公開用。ユーザーの指示があった時のみ push する |

**ブランチ構成:**
- `main` — 開発ブランチ。origin と public で同一履歴を共有
- `old_develop` — 旧開発履歴（参照用。origin にのみ存在）

### 8.4 push ルール

| 操作 | コマンド | タイミング |
|---|---|---|
| 通常の push（開発用） | `git push origin main` | コミットごとに毎回 |
| 公開用への push | `git push public main` | **ユーザーの明示的な指示があった時のみ** |

**ルール:**
- 開発作業のコミットは `origin` に毎回 push する
- `public`（aide-powers.git）は安定版リポジトリのため、ユーザーが「public にも push して」と指示した場合のみ push する
- AI エージェントが自己判断で public に push することを禁止する
- public への push 時は、origin と同じ main ブランチをそのまま push する（差分コミット作成は不要）
```

#### after

```markdown
### 8.3 リモート構成

このリポジトリは内部 GitLab 上の単一リポジトリで管理されます。

| リモート名 | リポジトリ | 公開範囲 | 役割 |
|---|---|---|---|
| origin | `http://10.110.47.117/kc-apm/kc-aide-powers.git` | パブリック | 開発・公開兼用。通常の push 先 |

**ブランチ構成:**
- `main` — 開発ブランチ
- `old_develop` — 旧開発履歴（参照用）

### 8.4 push ルール

| 操作 | コマンド | タイミング |
|---|---|---|
| 通常の push | `git push origin main` | コミットごとに毎回 |

**ルール:**
- 開発作業のコミットは `origin` に毎回 push する
- AI エージェントが自己判断で push することを禁止する（git-commit-workflow 経由のみ）
```

#### 変更理由
git remote 変更の反映（origin URL変更: takashi/aide-claude.git → kc-apm/kc-aide-powers.git、public リモート削除）。2系統から単一リポジトリ運用への移行を文書に反映する。

---

### 変更5: docs-dev/01-system-platform/06-execution-units.md — リポジトリルート表記

#### before

```
aide-claude/                       ← 配布リポジトリのルート
```

#### after

```
kc-aide-powers/                    ← 配布リポジトリのルート
```

#### 変更理由
リポジトリ名変更に伴うドキュメント表記の更新（aide-claude → kc-aide-powers）

---

## 新規追加の設計
なし

## GUI差分
なし（該当しない）

## インターフェース影響サマリ
なし（シグネチャ変更なし。全てテキスト置換）

## 更新が必要な設計資料
- dev-environment.md（§8.3 リモート構成表・§8.4 push ルール。本変更で直接更新する）
- program-structure.md（検討結果: ルートフォルダ名 `aide-claude/` はローカルフォルダ名のため変更対象外）
