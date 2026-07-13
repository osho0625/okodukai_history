# 変更履歴: aide-agent 関連ファイルの削除

## 変更ID
202606162000-remove-aide-agent

## 変更概要
aide-agent（オーケストレータエージェント）関連ファイルを全て削除し、プラットフォームのデフォルト Agent が using-aide-powers スキルを直接 activate して動作する形に変更した。

## 変更理由
aide-agent を専用エージェントとして定義・注入する方式は、Kiro IDE のネスト実行制限等の問題により期待通りに機能しなかった。プラットフォームのデフォルト Agent で直接動作する形に戻すことで、安定した運用を実現する。

## 変更内容

### 削除したファイル
- `steering/aide-agent.md` — オーケストレータ steering 定義
- `agents/aide-agent.md` — エージェント定義本体
- `.kiro/steering/aide-agent.md` — Kiro IDE 配布先 steering
- `.kiro/agents/aide-agent.json` — Kiro CLI 用エージェント JSON

### 修正したファイル
- `steering/aide-powers-bootstrap.md` — aide-agent 読み込み指示行を削除
- `skills/using-aide-powers/SKILL.md` — エージェント切り替えガードセクションを削除
- `setup.bat` — aide-agent.md コピー処理を削除
- `rules/aide-powers-bootstrap.md` — using-aide-powers activate 指示に修正
- `rules/aide-powers-bootstrap.mdc` — using-aide-powers activate 指示に修正
- `instructions/aide-powers-bootstrap.instructions.md` — using-aide-powers activate 指示に修正

### 更新した設計書
- `.aide/specs/aide-powers/program-structure.md` — aide-agent 関連記述を削除・更新（エージェント一覧13→12、フォルダツリー、起動フロー図、配布マッピング表）

## 影響範囲
- シグネチャ変更なし
- 既存要件との矛盾なし
- AIエージェントの起動フローが短縮される（aide-agent steering 経由 → 直接 using-aide-powers activate）

## 変更日時
2026-06-16
