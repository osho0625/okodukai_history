# 対応方針書

## 方針概要
- **対応方針**: 既存ファイル変更のみ（新規ファイル追加なし）
- **OCP検討結果**: global-rules.md にカタログセクションを直接追加。phase-skill-rules.md の圧縮は既存変更が必要だが、いずれも最小限の変更

## 関連箇所

### 変更対象
| ファイル | セクション | 変更内容 |
|---|---|---|
| `skills/using-aide-powers/references/global-rules.md` | 新規セクション追加 | 7スキル分の共通スキル発動条件カタログセクションを直接追加 |
| `skills/using-aide-powers/references/phase-skill-rules.md` | 全体 | 冗長表現の排除・圧縮（176行 → 目標150行以下） |
| `skills/using-aide-powers/references/version.json` | version フィールド | version を +1 する（配布トリガー） |

---

## カタログ配置先の検討

### 候補比較

| 候補 | 配置先 | Pros | Cons |
|---|---|---|---|
| A: references 配下 | `skills/using-aide-powers/references/common-skill-catalog.md` | ① rules-distribute 既存機構で自動配布可能 ② global-rules.md と同じ仕組みで参照できる ③ カタログ単独でメンテナンス可能 ④ SKILL.md 肥大化を回避 | ① 新規ファイル追加のため version.json bump が必要 ② AI が参照するには明示的なパス認識が必要 ③ 別途ファイルを読む手間がかかる |
| B: SKILL.md 内 | `skills/using-aide-powers/SKILL.md` に直接セクション追加 | ① activate 時に自動でコンテキストに入る ② 追加ファイル不要 | ① SKILL.md が肥大化する（現在既に大きい）② コンテキストウィンドウを常時消費 ③ メンテナンス時に SKILL.md 全体のリスクが生じる |
| **C: global-rules.md 内** | `skills/using-aide-powers/references/global-rules.md` に直接記載 | ① 常時適用されるため確実に参照される ② 追加ファイル不要 ③ 参照先を別途読む手間がない ④ rules-distribute 経由で全プラットフォームに自動配布 | ① global-rules.md が若干肥大化する（7スキル分で50行程度増加） |

### 最適案: **候補C（global-rules.md 内に直接記載）**

**選定理由:**
1. **7スキルなら別ファイルにするほどではない**: 対象スキルが7つと限定的であり、別ファイルに分離するほどの規模ではない。global-rules.md に直接書いても管理可能なサイズに収まる
2. **常時コンテキスト注入される**: global-rules.md は全プラットフォームで常時適用されるため、AI がカタログの存在を認識し損ねるリスクがゼロ。別ファイルの場合に生じる「参照パスを知っているが読み忘れる」問題を根本的に解消する
3. **参照先を別途読む手間がない**: カタログが global-rules.md 内にあれば、AI は追加のファイル読み取り操作なしに発動条件を判定できる。判定のレイテンシとコンテキスト消費の両面で有利
4. **配布メカニズムとの整合**: global-rules.md の変更は rules-distribute 経由で全プラットフォーム（Kiro/.kiro/steering、Claude Code/CLAUDE.md 等）に自動配布される。追加の配布設定が不要

**配布方法:**
- `skills/using-aide-powers/references/global-rules.md` にカタログセクション追加 → `version.json` bump → rules-distribute 経由で全プラットフォームに自動配布

---

## 変更方針の詳細

### REQ-C-001: 共通スキル発動条件カタログの作成
- **方針**: `skills/using-aide-powers/references/global-rules.md` 内にカタログセクションとして直接記載する。対象7スキル（session-handover, doc-index-maintenance, visual-companion, pending-issues-management, tech-investigation, git-commit-workflow, task-orchestration）それぞれについて「発動条件」「使用場面」「判定基準」を構造化テーブルで記載する
- **理由**: global-rules.md に直接記載することで、AI が常時コンテキストとして保持し、別途ファイルを読む手間なく即座に発動条件を判定できる。7スキル分であれば global-rules.md の肥大化も許容範囲内

### REQ-C-002: カタログの参照可能性の確保
- **方針**: global-rules.md 内に直接記載されるため、別途参照パスの設定は不要。SKILL.md の references 一覧への追加も不要（別ファイルが存在しないため）
- **理由**: global-rules.md は全プラットフォームで常時適用されるため、カタログは自動的に AI のコンテキストに注入される。追加の参照設定なしに確実に参照される

### REQ-C-003: トリガー条件の判定可能性
- **方針**: カタログ内の各スキルの発動条件を「〜のとき」「〜が発生したら」等の条件文形式で記述し、曖昧表現（「適宜」「必要に応じて」「複雑だと思ったら」）を排除する。判定に必要なコンテキスト情報（ファイルの存在、行数、イベント種別等）を明示する
- **理由**: AI が現在の作業コンテキストから条件分岐的に判定できる形式にすることで、スキル発動の自律性を高める

### REQ-C-004: phase-skill-rules.md の冗長性排除と圧縮
- **方針**: 以下の圧縮方針に基づき、176行 → 150行以下を目標とする。**具体的な文面はユーザーとの共同作業で決定する**（実装フェーズで実施）
- **圧縮方針**:
  1. **「AIが陥りがちな誤り」リストの統合**: 現在4セクションに分散している禁止パターンリストを、重複を排除した1つの統合リスト（または各セクション最小限の2〜3項目）に圧縮する
  2. **「activate 必須」セクションの簡潔化**: 現在30行以上ある説明を、核心メッセージ（「毎回 activate して100%従う」「覚えているから省略は誤り」「自己流は後続チェックで検出されやり直し」）のみに凝縮する。詳細説明は SKILL.md 側にも記載があるため重複排除
  3. **「省略禁止」テーマの一本化**: 「フェーズ省略禁止」「前処理・後処理の絶対実行」「手順の改変禁止」の3セクションで繰り返されている「いかなる理由も省略の根拠にならない」「量が多い場合は task-orchestration」等の主張を各1回のみの記述にまとめる
  4. **冒頭の威嚇的前文の圧縮**: 冒頭3行（「守れないなら使ってはいけない」「後の不具合の元凶」「安易な判断で逸脱禁止」）は内容が後続セクションと重複するため、1行に圧縮する
- **理由**: Claude Code 公式推奨（200行以下、specific/concise/well-structured）に準拠し、ノイズ削減により重要ルールの強制力を維持・向上させる。同じ主張の繰り返しはAIにとって「重要度の信号」ではなく「読み飛ばしのきっかけ」になるため、各ルールを1回だけ明確に述べる方が効果的
- **ユーザーとの共同作業**: 具体的な圧縮後の文面は実装フェーズでユーザーと一緒に検討する。本方針書では方向性のみ確定する

---

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 本変更は既存ファイルへの変更（global-rules.md へのカタログセクション追加 + phase-skill-rules.md の圧縮）で対処可能。既存の設計構造（references/ 配下のファイル配置 → version.json による配布制御 → rules-distribute による全プラットフォーム配布）をそのまま活用でき、構造的な変更は不要。phase-skill-rules.md の圧縮は「リファクタリング」的だが、変更要求 REQ-C-004 として明示的にスコープ内に含まれているため、別途リファクタリングWFへの委譲は不要

---

## 実装時の注意事項

1. **version.json の bump**: `global-rules.md` へのカタログセクション追加 + `phase-skill-rules.md` 圧縮を全て完了した後、version を +1 する（global-rules.md の内容変更のため配布トリガーが必要）
2. **rules-distribute による自動配布**: global-rules.md の変更は rules-distribute 経由で全プラットフォーム（Kiro/.kiro/steering、Claude Code/CLAUDE.md 等）に自動配布される。追加の配布設定は不要
3. **phase-skill-rules.md 圧縮の文面**: ユーザーとの共同作業で決定。方針書に記載の4つの圧縮方向性をベースに、ユーザーが最終判断する
