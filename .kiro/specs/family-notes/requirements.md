# Requirements Document

## Introduction

家族で共有して使えるメモ帳アプリ。管理者（親）が書いたメモを一時的に子供にも公開したり、リポジトリにpushしたマークダウンドキュメントを閲覧・管理する機能を含む。既存のお小遣い手帳PWAアプリ内の1ページとして動作する。

## Glossary

- **Family_Notes**: 家族共有メモ帳機能全体
- **Note**: メモ1件のデータ（タイトル、本文、作成者、公開フラグを持つ）
- **Admin_Note**: is_admin=true のメモ。管理者メモタブに表示される
- **Shared_Note**: shared=true にした管理者メモ。一時的にuserのメモタブにも表示される
- **Document**: リポジトリにpushされたマークダウンファイル。ドキュメントタブから閲覧
- **Shared_Document**: game_settings.shared_docs に含まれるドキュメント。userにも公開される
- **MD_FILES**: family-notes.html内で定義するドキュメント一覧配列

## Requirements

### Requirement 1: メモの作成・編集・削除

**User Story:** As a family member, I want to メモを作成・編集・削除できる, so that 家族で共有したい情報を管理できる。

#### Acceptance Criteria

1. WHEN a user opens the family-notes page, THE system SHALL display the メモタブ with all notes where is_admin=false, ordered by updated_at descending.
2. THE system SHALL allow any user (admin/user) to create, edit, and delete notes in the メモタブ.
3. WHEN a note is saved, THE system SHALL store title, content, author, updated_at to family_notes table.
4. THE system SHALL display each note with title, author name, updated date, and content preview.

### Requirement 2: 管理者メモ（admin専用タブ）

**User Story:** As an admin, I want to 管理者専用のメモを管理できる, so that 子供に見せない情報を記録できる。

#### Acceptance Criteria

1. THE system SHALL display the 「🔒 管理者メモ」タブ only when deviceRole=admin.
2. THE system SHALL store admin notes with is_admin=true in family_notes table.
3. WHEN an admin creates a note in the 管理者メモタブ, THE system SHALL set is_admin=true.
4. THE system SHALL provide a 「👀 みんなに公開する」checkbox when editing admin notes.
5. WHEN shared=true, THE admin note SHALL appear in the user's メモタブ as read-only.
6. WHEN a user taps a shared admin note, THE system SHALL display it in a read-only viewer (markdown rendered).

### Requirement 3: ドキュメント閲覧

**User Story:** As an admin, I want to リポジトリにpushしたマークダウンファイルを閲覧・管理できる, so that 家族向けの情報を整理して参照できる。

#### Acceptance Criteria

1. THE system SHALL display the ドキュメントタブ only when deviceRole=admin, OR when shared documents exist for user.
2. THE system SHALL render markdown files using marked.js library.
3. THE system SHALL fetch markdown files from the repository via relative path (../path).
4. FOR admin, THE system SHALL display a share toggle (🔒/👀) on each document card.
5. WHEN a document is shared, THE system SHALL store its path in game_settings.shared_docs JSONB array.
6. WHEN shared documents exist, THE system SHALL display the ドキュメントタブ to user devices.

### Requirement 4: アクセス制御

**User Story:** As a system operator, I want to 権限に応じた表示制御がされる, so that 管理者向けの情報が適切に保護される。

#### Acceptance Criteria

1. THE system SHALL show 📝 icon on TOP page (index.html) to all users.
2. THE system SHALL show メモタブ to all users.
3. THE system SHALL show 管理者メモタブ only to admin devices.
4. THE system SHALL show ドキュメントタブ only to admin devices, or to user devices when shared documents exist.
5. User devices SHALL NOT be able to edit or delete admin notes (read-only access for shared notes).

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS family_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  shared BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE family_notes DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_family_notes_is_admin ON family_notes (is_admin);
CREATE INDEX idx_family_notes_shared ON family_notes (shared) WHERE shared = true;

-- game_settingsにドキュメント公開管理用カラム追加
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS shared_docs JSONB DEFAULT '[]'::jsonb;
```

## Screens (画面一覧)

| 画面 | パス | 説明 |
|------|------|------|
| 家族メモ帳 | pages/family-notes.html | メモ・管理者メモ・ドキュメントの3タブ構成 |
| TOPアイコン | index.html | 📝アイコンで family-notes.html へ遷移 |

## ドキュメント管理

マークダウンファイルは `docs/` ディレクトリに配置し、`MD_FILES` 配列に登録する。

現在のドキュメント:
- `docs/outdoor-parks.md` — アスレチック・公園まとめ（川和町から）


## 関連ファイル

- #[[file:pages/family-notes.html]]
- #[[file:sql/create_family_notes_table.sql]]
- #[[file:sql/alter_game_settings_shared_docs.sql]]
