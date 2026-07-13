# 変更要求定義

## 変更概要
- **変更の目的・背景**: program-structure.md のフェーズスキル詳細セクションに記載されたプロセス定義（Step名一覧）が、対応する各 SKILL.md の実際の Step 構成と不一致を起こしている。この不整合は PI-044 として QA レビュー中に検出された既存問題であり、設計書としての信頼性・正確性を回復するために修正が必要である。
- **変更種別**: 変更（設計書の既存不整合修正）

## 要求事項

### REQ-C-001: fs-change-phase2-impl プロセス定義の修正
- **種別**: 変更
- **説明**: program-structure.md の `fs-change-phase2-impl` セクションのプロセス行に記載された Step 名一覧を、SKILL.md 内の実際の `## Step N: タイトル` と完全に一致させる
- **現状のプロセス定義（program-structure.md）**:
  - `前処理 → Step1: 差分設計の前段階更新 → Step2: 差分設計書作成 → Step3: 影響範囲精密分析 → Step4: QAレビュー → Step5: QA結果対応 → Step6: ユーザー確認 → Step7: タスク分解 → Step8: タスクリスト確認 → Step9: 工程チェック表 → Step10: 実装ループ → Step11: 全テスト → Step12: doc-sync → Step13: 動作確認試験書更新 → Step14: history.md → Step15: pending-issues確認 → 後処理`
- **正しいプロセス定義（SKILL.md 実体）**:
  - `前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: リグレッションテスト結果の確認・報告（セーフティネット） → Step12: 動作検証・ユーザー確認 → Step13: 設計書反映 → Step14: pending-issues 書き込み忘れチェック → Step15: 変更完了の案内 → 後処理`
- **受入基準**:
  - AC-001: program-structure.md の `fs-change-phase2-impl` プロセス行の全 Step 名が、skills/fs-change-phase2-impl/SKILL.md 内の `## Step N: タイトル` と完全一致すること
- **優先度**: 必須

### REQ-C-002: fs-bugfix-phase2-impl プロセス定義の修正
- **種別**: 変更
- **説明**: program-structure.md の `fs-bugfix-phase2-impl` セクションのプロセス行に記載された Step 名一覧を、SKILL.md 内の実際の `## Step N: タイトル` と完全に一致させる
- **現状のプロセス定義（program-structure.md）**:
  - `前処理 → Step1: 差分設計前段階更新 → Step2: 修正設計書作成 → Step3: 影響範囲精密分析 → Step4: QAレビュー → Step5: QA結果対応 → Step6: タスク分解 → Step7: タスクリスト確認 → Step8: 実装ループ → Step9: 全テスト → Step10: セーフティネット → Step11: doc-sync → Step12: history.md → Step13: pending-issues確認 → 後処理`
- **正しいプロセス定義（SKILL.md 実体）**:
  - `前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: リグレッションテスト結果の確認・報告（セーフティネット） → Step10: 動作検証・ユーザー確認 → Step11: 設計書反映 → Step12: pending-issues 書き込み忘れチェック → Step13: バグ修正完了の案内 → 後処理`
- **受入基準**:
  - AC-002: program-structure.md の `fs-bugfix-phase2-impl` プロセス行の全 Step 名が、skills/fs-bugfix-phase2-impl/SKILL.md 内の `## Step N: タイトル` と完全一致すること
- **優先度**: 必須

### REQ-C-003: fs-impl-phase4-execution プロセス定義の修正
- **種別**: 変更
- **説明**: program-structure.md の `fs-impl-phase4-execution` セクションのプロセス行に記載された Step 名一覧を、SKILL.md 内の実際の `## Step N: タイトル` と完全に一致させる
- **現状のプロセス定義（program-structure.md）**:
  - `前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: 全タスク完了確認 → 後処理`
- **正しいプロセス定義（SKILL.md 実体）**:
  - `前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作検証・ユーザー確認 → 後処理`
- **受入基準**:
  - AC-003: program-structure.md の `fs-impl-phase4-execution` プロセス行の全 Step 名が、skills/fs-impl-phase4-execution/SKILL.md 内の `## Step N: タイトル` と完全一致すること
- **優先度**: 必須

## 対象外（スコープ外）
- SKILL.md 自体の変更（各 SKILL.md は既に正しい状態であり変更対象外）
- program-structure.md のプロセス定義以外のセクション（役割・成果物・呼び出しスキル・プロンプトテンプレート行等）の変更
- program-structure.md の上記3スキル以外のフェーズスキルのプロセス定義の変更

## 前提条件
- 各 SKILL.md（fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-impl-phase4-execution）は既に正しい状態である（直前の変更WFで更新済み）
- program-structure.md の対象セクションはフェーズスキル詳細の「プロセス」行のみ

## 関連する既存要件
- UR-001: 7つのワークフローを提供すること — プロセス定義の正確性はワークフロー仕様の信頼性に直結する
- UR-011: ファイルベースのデータ管理 — 設計書の正確性がファイルベース管理の前提条件となる
