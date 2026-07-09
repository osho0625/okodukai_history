# トラブルシューティング

aide-powers の利用エンジニアが遭遇しやすいインストール・設定・利用上の問題と、その対処手順をまとめています。

各項目は「症状 / 原因 / 対処」の3点セットで記載しています。実運用で気付いた嵌まりポイントは末尾の「実運用で発生したトラブル」セクションに集約しています。

---

## 1. インストール後にスキルが認識されない（Claude Code）

**症状**

`Skill` ツールでハブスキル `using-aide-powers` を呼び出そうとしても見つからない、もしくはセッション開始時にハブスキル本文が会話コンテキストへ自動注入されません。

**原因**

`setup.bat` / `setup.sh` の手動コピーでは、`hooks/` 配下のスクリプトが SessionStart hook として Claude Code に登録されません。Claude Code の SessionStart 注入は環境変数 `${CLAUDE_PLUGIN_ROOT}` を前提に動作するため、プラグインインストール経路でなければハブスキル全文の自動注入が発火しません。

**対処**

プラグインインストールを実行してください。

```
claude plugin install <repository-path>
```

プラグインインストール後に Claude Code を再起動すると、SessionStart hook がハブスキル全文を `additionalContext` として注入する状態になります。手動コピー側で配置した `~/.claude/skills/` は残しておいて構いません。

---

## 2. `.aide/references/` が見つからない

**症状**

スキル実行中に `.aide/references/global-rules.md` や `.aide/references/kiro-ide-tools.md` を参照しようとしてファイルが見つからずエラーになります。

**原因**

ハブスキル `using-aide-powers` の STEP 2（references 配置）が初回セッションで完了していないと `.aide/references/` フォルダ一式が用意されません。STEP 2 は `skills/using-aide-powers/references/` 内のツールマップ・グローバルルール等をワークスペース内 `.aide/references/` にコピーする処理で、`rules-distribute` の global モードより先に必ず実行される必要があります。

**対処**

新規セッションを開いてハブスキルを再起動してください。ハブスキルが STEP 2 を実行し、不足しているファイル一式（`global-rules.md`, `progress-file-format.md`, `kiro-ide-tools.md` 他のツールマップ）を `.aide/references/` に配置します。中身が中途半端に残っている場合は `.aide/references/` フォルダを一旦削除してから新規セッションを開き直すと、全ファイルが配置し直されて確実です。

> **削除前の注意**: `.aide/references/` は aide-powers のスキルが参照中のフォルダです。削除する場合は他のフェーズスキルが進行中でないことを確認してから操作してください。

---

## 3. VSCode GitHub Copilot で hooks が動かない

**症状**

VSCode の Copilot Chat でセッションを開始してもハブスキル本文が注入されず、SessionStart hook が発火しません。

**原因**

VSCode の `settings.json` に Copilot Chat 用の設定キー（Windows では `chat.pluginLocations` と `chat.plugins.enabled`、Linux/Mac では `chat.hookFilesLocations`）が設定されていないと、`~/.copilot/hooks/` や `agentPlugins/aide-powers/` 配下の hooks / skills が認識されません。

**対処**

`setup.bat` または `setup.sh` の選択肢「3. GitHub Copilot（CLI + VSCode）」を再実行してください。setup スクリプトが既存の `settings.json` を JSON 構造を保ったまま編集し、必要なキーを自動で追記します。スクリプト実行後は VSCode を再起動してください。

---

## 4. Gemini CLI で aide-powers が起動しない

**症状**

Gemini CLI でセッションを開始してもハブスキルが読み込まれず、`@./skills/using-aide-powers/SKILL.md` の内容が会話コンテキストに展開されません。

**原因**

Gemini CLI 用のセットアップは「コピー」ではなく「エクステンションリンク」で完結する仕組みです。`setup.bat` / `setup.sh` の選択肢「Gemini CLI」は案内表示のみでコピー処理を行わないため、`gemini extensions link` を別途実行する必要があります。リンクが未実行のままだと、Gemini CLI は aide-powers リポジトリをエクステンションとして認識できません。

**対処**

aide-powers リポジトリのルートで以下を実行してください。

```
cd <aide-powers リポジトリのパス>
gemini extensions link .
```

リンク後に Gemini CLI のセッションを開き直すと、`GEMINI.md` の `@import` 行経由でハブスキル本文とツールマップ（`gemini-tools.md`）が起動時注入されるようになります。

---

## 5. Codex / OpenCode で AGENTS.md の参照行が反映されない

**症状**

Codex / OpenCode でセッションを開始しても、aide-powers のグローバルルール（Quick Routing、Iron Law、フェーズ厳守ルール等）が読み込まれません。

**原因**

Codex / OpenCode は `AGENTS.md` 末尾の参照行（`以下のファイルのルールに従うこと: aide-powers-global-rules.agents.md`）を起点にグローバルルールを取得します。この参照行と `aide-powers-global-rules.agents.md` 本体は `rules-distribute` の global モードが配置するため、global モードが未実行のワークスペースでは aide-powers のグローバルルールが読み込まれません。

**対処**

該当プラットフォームで新規セッションを開いてください。ハブスキルの STEP 3 で `rules-distribute` の global モードが起動し、`AGENTS.md` への参照行追記と `aide-powers-global-rules.agents.md` の生成が行われます。Codex と OpenCode は同一の `aide-powers-global-rules.agents.md` を共有するため、片方で global モードを実行すれば両方から読み込めます。

---

## 6. 古いワークフロー構造が `~/.kiro/skills/` 等に残っている

**症状**

`~/.kiro/skills/` や `~/.claude/skills/` 配下に `design-workflow/` `bugfix-workflow/` `change-workflow/` などのフォルダが残っており、AI Agent がスキル発見で旧構造と新構造を混同します。

**原因**

aide-powers の旧バージョン（フラット化前のワークフロー構造）からの移行が完了していません。旧構造ではワークフロー単位のフォルダ配下にフェーズスキルが格納されていましたが、現行の aide-powers は `skills/{skill-name}/` のフラット配置に統一されています。

**対処**

`setup.bat` または `setup.sh` を再実行してください。setup スクリプトの `cleanup_legacy_skills` 関数が、各プラットフォームの配置先（`~/.kiro/skills/`, `~/.claude/skills/`, `~/.copilot/skills/aide-powers/`, `~/.agents/skills/aide-powers/`）から旧ワークフローフォルダ群（`design-workflow/`, `bugfix-workflow/`, `change-workflow/`, `impl-workflow/`, `planning-workflow/`, `refactoring-workflow/`, `reverse-design-workflow/`, `skills/`）を自動削除した上で、最新のフラット構造を再配置します。

---

## 7. kiro-agent から aide-powers に移行したい

**症状**

旧 kiro-agent 系のカスタムエージェント定義（`workflow-designer`, `migration-planner`, `phase-skill-detail-designer` 等）がプロジェクトに残っており、aide-powers の共通エージェントと役割が重複・競合します。

**原因**

旧プロジェクト（kiro-agent ベース）でセットアップされたカスタムエージェント定義が `.kiro/agents/`、`.kiro/steering/aide-powers-global-rules.md`、`AGENTS.md`、`aide-powers-global-rules.agents.md` に残置されています。

**対処**

リポジトリルートに同梱されている `cleanup-kiro-agent.bat` を実行してください。スクリプトは削除対象のファイル一覧（`.kiro/agents/` 配下の22ファイル、`.kiro/steering/aide-powers-global-rules.md`、ルートの `AGENTS.md` と `aide-powers-global-rules.agents.md`）を画面に表示し、`y/N` の確認を取ってから削除します。`.kiro/specs/` などの仕様ディレクトリは保護対象として残ります。

---

## 8. ワークフローが途中で別のワークフローに切り替わってしまう

**症状**

バグ修正ワークフローを進行中に「これは仕様変更ですね」と AI Agent が判断し、変更ワークフローを起動してしまうなど、フェーズの途中で別ワークフローに遷移します。

**原因**

aide-powers のグローバルルールでは「ワークフローのフェーズ進行中に、別のワークフローを起動することを禁止する」と定めています。AI Agent がこのルールを破ると、現在の進捗ファイル・差分設計書が中途半端な状態のまま別ワークフローのフェーズスキルが起動してしまいます。

**対処**

AI Agent に対して、発見した問題は `pending-issues.md` に記録した上で、現在のワークフローを最後まで完遂してから対応する旨を伝えてください。`pending-issues-management` 共通スキルがスコープ外問題の追記・管理を担うため、現行ワークフロー完遂後に `pending-issues.md` を起点として次のワークフローを選択します。

---

## 9. 「ワークスペースに skills/ がない」と AI Agent が言う

**症状**

AI Agent が「このワークスペースには `skills/` フォルダが存在しないため、aide-powers は利用できません」「フレームワークがインストールされていないようです」などと判断し、通常の開発支援に切り替えようとします。

**原因**

AI Agent の判断ミスです。aide-powers のスキルはグローバルエリア（`~/.kiro/skills/`, `~/.claude/skills/`, `~/.copilot/skills/aide-powers/`, `~/.agents/skills/aide-powers/` 等）にインストールされており、ワークスペース内の `skills/` フォルダの有無とは無関係に動作します。

**対処**

ハブスキル `using-aide-powers` が読み込めている時点で aide-powers は正常に動作可能です。AI Agent に対して `skills/using-aide-powers/SKILL.md` の §11「スキルの所在ルール」を再確認するよう促してください。同セクションは「Activated Skill としてスキルが読み込めている時点で、aide-powers は正常に動作している」「ワークスペースが空であっても、スキルの指示に従ってワークフローを実行すること」と明記しています。

---

## 10. 設計書ゲート FAIL でワークフローが進まない

**症状**

実装ワークフロー・変更ワークフロー・リファクタリングワークフロー・バグ修正ワークフローのフェーズ2を起動したのに、「設計書がない」「設計書ゲート FAIL」と判定されて先に進めません。

**原因**

実装系ワークフローの入口に置かれた設計書ゲートが、`doc-index.md` に登録された設計書の状態を機械的に確認しています。各設計書のステータスが `✅ 完了` または `⏭️ スキップ` になっていない場合、設計書ゲートは PASS せず、後続フェーズへの遷移をブロックします。

**対処**

既存コードがあるか・設計書があるかで対処が分岐します。

1. 既存コードはあるが設計書がない場合は、先に **設計逆引きワークフロー**（エントリポイント: `fs-reverse-phase1-program`）を実行して設計書を整備してください。
2. 設計書も既存コードもない新規開発の場合は、先に **設計ワークフロー**（エントリポイント: `fs-design-phase1-user-req`）を実行してください。
3. 設計書は揃っているが `doc-index.md` のステータスが古い場合は、`doc-index-maintenance` 共通スキルを起動してステータスを最新化してください。

---

## 実運用で発生したトラブル（🚧 ユーザー素材待ち）

> **🚧 このセクションはユーザー記入予定**
>
> 想定される記載項目（参考）:
> - 特定モデル × プラットフォームの組合せで起きた問題
> - パフォーマンス問題（トークン消費・処理時間）
> - チーム導入時の摩擦
> - その他、実運用で気付いた嵌まりポイント

<!-- USER-FILL-IN-HERE -->
