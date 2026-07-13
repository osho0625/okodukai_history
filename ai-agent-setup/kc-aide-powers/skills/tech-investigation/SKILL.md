---
name: tech-investigation
description: |
  Use when you need to investigate a technology, library, API, or tool before making design or implementation decisions.
  Use when you encounter an unfamiliar library or need to check the latest version, usage, or compatibility.
  Use when technical feasibility needs to be verified.
  Use when you need to find the correct way to use a specific API or SDK.
---

# Tech Investigation

## Overview

技術要素の実現可能性を調査し、構造化された調査結果を返すスキル。Web検索を活用して最新情報を確認する。知っている情報であっても、必ず最新情報を確認すること。

## Web Search Availability

このスキルは Web 検索に依存する。プラットフォームによって利用方法が異なる:

| 状況 | 対応 |
|---|---|
| WebSearch がネイティブに使える（Claude Code, Kiro IDE, Kiro CLI, Gemini CLI, VSCode Copilot） | そのまま WebSearch を使用する |
| WebSearch がネイティブに使えない（Copilot CLI, Codex CLI） | Web search MCP server を使用する（brave-search, tavily 等） |
| WebSearch も MCP server も使えない（企業制限等） | WebFetch + 検索エンジンURL で代替する（精度は低下する） |

### Fallback 手順（WebSearch が使えない場合）

1. **MCP server 確認**: Web search MCP server が設定されているか確認する
   - 設定されている場合: MCP server のツールを使用して検索する
   - 設定されていない場合: ステップ2へ

2. **WebFetch + 検索エンジン**: 以下の手順で代替する
   - WebFetch で `https://www.google.com/search?q={検索クエリ}` を取得する
   - 検索結果のスニペットから関連URLを抽出する
   - 各URLを WebFetch で取得し、必要な情報を収集する
   - ※ この方法は精度が低いため、可能な限り MCP server の導入を推奨する

3. **ユーザーへの案内**: 上記いずれも使えない場合
   - ユーザーに「Web検索が利用できません。tech-investigation スキルを使用するには、web search MCP server（brave-search 等）の設定を推奨します」と案内する
   - ユーザーが手動で検索した結果を提供してもらう形で調査を続行する

## Process

1. 調査対象を明確にする（何を、なぜ調べるのか）
2. tech-investigator-prompt.md に従ってサブエージェントを起動する
3. サブエージェントがWeb検索で最新情報を収集し、構造化された調査結果を返す
4. 調査結果を `.aide/specs/{feature_name}/tech-investigation/{調査対象名}.md` に格納する
5. 調査結果に基づいて設計・実装の判断を行う

## Iron Law

- **知っている情報でも必ずWeb検索で最新情報を確認すること。** LLMの学習データは古い可能性がある。
- **調査結果は必ず構造化して格納すること。** 口頭での報告のみで終わらせない。

**注記:** WebSearch が使えない環境では、上記「Web Search Availability」セクションの Fallback 手順に従うこと。WebSearch が使えないことを理由に調査をスキップしてはならない。

## Red Flags

| Red Flag | 正しい対応 |
|---|---|
| 「たぶんこうだと思う」で実装を進めている | tech-investigation スキルで調査してから判断する |
| ライブラリのバージョンが不明なまま使っている | 最新バージョンと互換性を調査する |
| APIの仕様を推測で書いている | 公式ドキュメントを確認する |

## Rationalizations to Reject

| 言い訳 | なぜダメか |
|---|---|
| 「前に使ったことがあるから大丈夫」 | バージョンアップで仕様が変わっている可能性がある |
| 「調査する時間がもったいない」 | 間違った前提で実装すると手戻りの方がコストが高い |
| 「ドキュメントに書いてあった気がする」 | 「気がする」は根拠にならない。確認すること |
