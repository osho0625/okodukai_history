# Requirements Document

## Introduction

クトゥルフ神話TRPGのシナリオを、KP（キーパー＝管理者）がセッション中に参照・進行するためのシナリオリーダーアプリ。ゲームブック方式（選択肢で分岐）ではなく、TRPGセッションの実際の進行に合わせた設計とする。KPがシーンを自由に行き来し、PLの行動に応じて適切なシーンを開き、判定情報やNPC情報をすぐ参照できるツール。

複数シナリオに対応し、最初にシナリオ選択画面を表示する。管理者がスマホで画面を見ながら口頭でセッションを進行し、プレイヤー（子供たち）は画面を見ない想定。初回リリースでは「毒入りスープ」シナリオを収録し、今後シナリオを追加していく設計とする。

## Glossary

- **Scenario_Reader**: KP向けシナリオリーダーアプリ本体（pages/trpg-cthulhu.html）
- **Scenario_Select**: シナリオ選択画面。登録済みシナリオ一覧を表示し、プレイするシナリオを選ぶ
- **Scenario_Registry**: 利用可能なシナリオのメタ情報一覧。HTML内のJS配列として定義
- **KP**: キーパー。セッションの進行役（管理者）
- **PL**: プレイヤー。セッションの参加者（子供たち）
- **Scene**: シナリオ内の1つの場面/場所。KPが自由に開いて読み上げる単位
- **Scene_Node**: シナリオデータ内の1ノード。描写テキスト・KPメモ・関連シーンリンク・NPC情報・判定情報を含む
- **KP_Note**: KPだけが見る進行メモ（判定の目標値、NPC行動指針、分岐条件、演出ヒント等）
- **Scene_Map**: シナリオの場所関係を視覚的に表示するマップ。KPが現在地と移動可能先を把握する
- **NPC_List**: シナリオに登場するNPC一覧。名前・特徴・居場所・秘密をまとめて参照
- **Scenario_Data**: シナリオの全データを定義するJSファイル。`window.TRPG_SCENARIOS[id]` に登録する形式
- **Progress_State**: シナリオごとの進行状態 `{ currentNodeId, visitedNodeIds[], history[], phase, updatedAt }`
- **Completion_State**: シナリオ完了状態 `{ completed: true, completedAt: timestamp }`
- **Phase**: シナリオの大きな進行段階（導入/調査/クライマックス/エンディング等）
- **Admin_Guard**: deviceRole='admin' による管理者限定アクセス制御

## Data Structures

### Scenario_Registry Entry
```javascript
{
  id: "poisoned_soup",
  title: "毒入りスープ",
  description: "初心者向け・1セッション完結",
  estimatedTime: "60-90分",
  playerCount: "2-4人",
  icon: "🦑",
  file: "js/trpg-poisoned-soup-scenario.js"
}
```

### Scenario_Data Format
```javascript
window.TRPG_SCENARIOS = window.TRPG_SCENARIOS || {};
window.TRPG_SCENARIOS["poisoned_soup"] = {
  id: "poisoned_soup",
  title: "毒入りスープ",
  startNode: "intro",
  phases: [
    { id: "introduction", title: "導入", nodes: ["intro"] },
    { id: "investigation", title: "調査パート", nodes: ["kitchen", "living_room", "bathroom", "garden"] },
    { id: "climax", title: "クライマックス", nodes: ["confrontation", "ritual"] },
    { id: "ending", title: "エンディング", nodes: ["ending_good", "ending_bad"] }
  ],
  npcs: [
    { id: "tanaka", name: "田中 誠", age: 35, description: "パーティの主催者。温厚だが秘密を抱えている", defaultLocation: "living_room", secret: "実は邪神崇拝者" },
    { id: "suzuki", name: "鈴木 花子", age: 28, description: "田中の妻。最近夫の様子がおかしいと感じている", defaultLocation: "kitchen", secret: "スープに違和感を感じていた" }
  ],
  map: {
    locations: [
      { id: "living_room", label: "リビング", x: 50, y: 30 },
      { id: "kitchen", label: "キッチン", x: 80, y: 30 },
      { id: "bathroom", label: "浴室", x: 80, y: 60 },
      { id: "garden", label: "庭", x: 50, y: 70 }
    ],
    connections: [
      { from: "living_room", to: "kitchen" },
      { from: "living_room", to: "garden" },
      { from: "kitchen", to: "bathroom" }
    ]
  },
  nodes: {
    intro: {
      id: "intro",
      title: "導入",
      phase: "introduction",
      location: "living_room",
      text: [
        "探索者たちは友人・田中誠の自宅に招かれた。",
        "テーブルにはスープが並んでいる。",
        "全員がスープを口にした直後、田中が突然苦しみ出す。"
      ],
      kpNote: "ここはゆっくり読み上げる。PLに自己紹介させてから本題に入る。\n田中が倒れた後、PLに「どうする？」と聞く。\n【医学】40 で毒物の可能性に気づく。",
      relatedScenes: ["kitchen", "living_room"],
      handouts: []
    },
    kitchen: {
      id: "kitchen",
      title: "キッチンの調査",
      phase: "investigation",
      location: "kitchen",
      text: [
        "キッチンには調理器具が散乱している。",
        "鍋にはスープの残りがある。",
        "流し台の下に不審な小瓶がある。"
      ],
      kpNote: "【目星】50 → 小瓶を発見\n【化学】or【薬学】40 → 小瓶の中身が毒物と判明\n【図書館】60 → 小瓶のラベルが古代の文字と判明\n\n小瓶を見つけられなかった場合、鈴木花子が「さっき変なものを見た」とヒントを出す。",
      relatedScenes: ["living_room", "bathroom"],
      handouts: []
    }
  }
};
```

### Key Design Decisions

- **relatedScenes**: 推奨読み順で並べる（KPが迷わないよう、最も自然な遷移先を先頭に）
- **map.connections**: 双方向として扱う（`{from:"a", to:"b"}` は a↔b の移動が可能）
- **NPC location**: `defaultLocation` は初期位置。将来的に Progress_State 側で `npcLocations` を管理して動的移動に対応可能（v1では固定）
- **handouts**: 将来拡張用。v1では `string[]`（テキストID）、将来は `{ id, title, type, content }` 形式に拡張予定
- **Final node**: このアプリではゲームブック方式の「終端ノード」は存在しない。セッション終了はKPが明示的に「セッション終了」ボタンを押す

### Scene_Node Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | ノード一意ID |
| title | string | ✓ | シーンタイトル |
| phase | string | ✓ | 所属フェーズID |
| location | string | | マップ上の場所ID |
| text | string[] | ✓ | KPが読み上げる描写テキスト |
| kpNote | string | | KP専用メモ（判定値、NPC指針、演出ヒント） |
| relatedScenes | string[] | | 推奨読み順で並べた関連シーンIDリスト |
| handouts | string[] | | PLに見せる資料ID（将来拡張用） |

### Progress_State Schema
```javascript
{
  currentNodeId: string,      // 現在表示中のノードID
  visitedNodeIds: string[],   // 訪問済みノードID一覧（重複なし、Set扱い）
  history: string[],          // 遷移履歴スタック（Back機能用）
  phase: string,              // 現在のフェーズID
  updatedAt: number           // 最終更新タイムスタンプ
}
```
localStorage key: `trpg_cthulhu_progress_{scenarioId}` (例: `trpg_cthulhu_progress_poisoned_soup`)

### Completion_State Schema
```javascript
{ completed: true, completedAt: number }
```
localStorage key: `trpg_cthulhu_completed_{scenarioId}` (例: `trpg_cthulhu_completed_poisoned_soup`)

## Implementation Notes

- Script load timeout: 5000ms。超過時はエラー表示
- Back操作時、visitedNodeIds は消さない（一度見たノードは既読のまま）
- visitedNodeIds は重複なし（Set扱い。追加時に既存チェック）
- Reset は Progress_State のみクリア。Completion_State は消さない
- ゲームブック方式ではない: KPはTOC/マップ/関連シーンから自由にシーンを開ける
- relatedScenes は「次に開きそうなシーン」のサジェスト（推奨読み順）
- map.connections は双方向（明示的に directional: true がない限り）
- TOC内のシーン並び順は `phases[].nodes` の定義順に従う

## Requirements

### Requirement 1: 管理者限定アクセス

**User Story:** As a KP（管理者）, I want シナリオリーダーに管理者のみアクセスできるようにしたい, so that プレイヤー（子供たち）にシナリオ内容が見えない。

#### Acceptance Criteria

1. WHEN a user accesses the Scenario_Reader page, THE Admin_Guard SHALL verify that deviceRole in localStorage equals 'admin'
2. IF deviceRole is not 'admin', THEN THE Scenario_Reader SHALL display an access denied message and prevent scenario content from loading
3. THE Scenario_Reader SHALL NOT appear in the arcade.html game list for non-admin users

### Requirement 2: シナリオ選択画面

**User Story:** As a KP, I want 最初にシナリオ一覧から遊ぶシナリオを選びたい, so that 複数のシナリオを管理・切り替えできる。

#### Acceptance Criteria

1. WHEN the KP opens the Scenario_Reader page, THE Scenario_Select screen SHALL be displayed first showing all available scenarios
2. THE Scenario_Select SHALL display each scenario as a card with: icon, title, description, estimated play time, player count, and status (続きから/クリア済み)
3. WHEN the KP selects a scenario card, THE Scenario_Reader SHALL dynamically load the corresponding Scenario_Data JS file using script element injection, then transition to the scenario reading view
4. WHEN Scenario_Data for a scenario is already loaded in `window.TRPG_SCENARIOS`, THE Scenario_Reader SHALL reuse the existing entry instead of injecting the script again
5. IF a scenario has existing Progress_State (previously started but not completed), THE Scenario_Select SHALL display a "続きから" (resume) indicator on that scenario card
6. IF a scenario has been completed, THE Scenario_Select SHALL display a "クリア済み" indicator on that scenario card
7. THE Scenario_Registry SHALL be defined as a JavaScript array in the main HTML, making it easy to add new scenarios by adding an entry and a scenario JS file
8. WHEN a new scenario JS file is added to js/ directory and registered in the Scenario_Registry, THE Scenario_Select SHALL automatically display it in the list without other code changes
9. THE Scenario_Reader SHALL apply a script load timeout of 5000ms; if exceeded, display an error and remain on Scenario_Select

### Requirement 3: シーン表示と自由遷移

**User Story:** As a KP, I want PLの行動に応じて自由にシーンを開きたい, so that TRPGセッションの自然な流れに合わせて進行できる。

#### Acceptance Criteria

1. WHEN the KP opens a scenario, THE Scenario_Reader SHALL display the startNode of the selected Scenario_Data
2. THE Scenario_Reader SHALL display the Scene_Node text in a scrollable area with readable font size, showing all paragraphs at once
3. THE Scenario_Reader SHALL display "関連シーン" links below the main text, showing relatedScenes as tappable buttons for quick navigation (ordered by recommended reading priority)
4. WHEN the KP navigates to a different scene (via related scenes, TOC, or map), THE Scenario_Reader SHALL push the current node to the history stack
5. THE Scenario_Reader SHALL provide a "Back" button to return to the previously visited Scene_Node (pop from history stack)
6. WHEN the history stack is empty, THE Back button SHALL be disabled or hidden
7. THE Scenario_Reader SHALL display the current Scene_Node ID in a small label for KP reference (例: `[kitchen]`)
8. THE Scenario_Reader SHALL display the current phase name in the header area
9. KP SHALL be able to navigate to ANY scene at any time via TOC or map (no forced linear progression)

### Requirement 4: KPメモ表示

**User Story:** As a KP, I want 各シーンの判定値・NPC指針・演出ヒントをすぐ確認したい, so that セッション進行に必要な情報を素早く参照できる。

#### Acceptance Criteria

1. WHEN a Scene_Node contains a KP_Note, THE Scenario_Reader SHALL display the KP_Note in a visually distinct collapsible area separated from the main text
2. THE Scenario_Reader SHALL render KP_Note with a different background color and a "📝 KPメモ" label
3. THE KP_Note section SHALL support collapse/expand toggle (default: expanded)
4. THE KP_Note SHALL render newline characters (`\n`) as line breaks for readability
5. WHEN a Scene_Node does not contain a KP_Note, THE Scenario_Reader SHALL not display the KP_Note area

### Requirement 5: マップ表示

**User Story:** As a KP, I want シナリオの場所関係をマップで確認したい, so that PLの移動先を把握し、適切なシーンをすぐ開ける。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL provide a "🗺️ マップ" button in the toolbar area
2. WHEN the KP taps the map button, THE Scenario_Reader SHALL display the Scene_Map as an overlay or panel
3. THE Scene_Map SHALL render locations as labeled nodes and connections as lines between them (simple CSS/SVG diagram)
4. map.connections SHALL be treated as bidirectional (a↔b) unless a connection explicitly includes `directional: true`
5. THE Scene_Map SHALL highlight the current location (based on current Scene_Node's `location` property)
6. THE Scene_Map SHALL visually distinguish visited locations from unvisited ones
7. WHEN the KP taps a location on the map that has a single associated Scene_Node, THE Scenario_Reader SHALL navigate directly to that scene
8. WHEN the KP taps a location on the map that has multiple associated Scene_Nodes, THE Scenario_Reader SHALL show a scene picker prioritizing: (1) unvisited nodes in current phase, (2) current-phase nodes, (3) all nodes at that location
9. IF Scenario_Data does not include a `map` property, THE map button SHALL be hidden

### Requirement 6: NPC一覧

**User Story:** As a KP, I want NPCの情報（名前・特徴・居場所・秘密）を一覧で確認したい, so that ロールプレイ時にすぐ参照できる。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL provide a "👤 NPC" button in the toolbar area
2. WHEN the KP taps the NPC button, THE Scenario_Reader SHALL display a list of all NPCs defined in the scenario
3. THE NPC list SHALL show each NPC's name, age, short description, and defaultLocation
4. WHEN the KP taps an NPC entry, THE Scenario_Reader SHALL expand to show the NPC's secret and additional details
5. IF Scenario_Data does not include an `npcs` property, THE NPC button SHALL be hidden

### Requirement 7: シナリオデータ構造

**User Story:** As a developer, I want シナリオデータをJS外部ファイルに分離したい, so that シナリオの追加・編集が容易にできる。

#### Acceptance Criteria

1. THE Scenario_Data SHALL be defined in a separate JavaScript file that registers itself to `window.TRPG_SCENARIOS[id]`
2. THE Scenario_Data SHALL define each Scene_Node with: id, title, phase, location (optional), text[], kpNote (optional), relatedScenes[] (optional), handouts[] (optional)
3. THE Scenario_Data SHALL specify `startNode`, `phases[]`, `npcs[]` (optional), and `map` (optional)
4. THE Scenario_Reader SHALL dynamically load Scenario_Data using script element injection based on Scenario_Registry.file path
5. THE Scenario_Data SHALL include KP_Note entries for skill check target numbers, NPC behavioral guidelines, and branching conditions

### Requirement 8: シナリオデータ検証

**User Story:** As a KP, I want 壊れたシナリオデータでアプリがクラッシュしないようにしたい, so that 安心してシナリオを追加・編集できる。

#### Acceptance Criteria

1. WHEN Scenario_Data is loaded, THE Scenario_Reader SHALL validate that startNode exists in the nodes object
2. THE Scenario_Reader SHALL validate that all relatedScenes references point to existing node IDs
3. THE Scenario_Reader SHALL validate that every Scene_Node.phase exists in the phases[] array
4. THE Scenario_Reader SHALL validate that every Scene_Node.location (when defined) exists in map.locations (when map is defined)
5. WHEN Scenario_Data is malformed or fails validation, THE Scenario_Reader SHALL display a user-friendly error message and return to Scenario_Select without crashing
6. WHEN a Scenario_Data JS file fails to load (network error, 404, timeout), THE Scenario_Reader SHALL display an error message and not crash
7. WHEN Progress_State in localStorage cannot be parsed as valid JSON, THE Scenario_Reader SHALL discard it and start from startNode

### Requirement 9: 進行状態の保存と復元

**User Story:** As a KP, I want セッション途中でアプリを閉じても続きから再開したい, so that 複数回に分けてセッションを進行できる。

#### Acceptance Criteria

1. WHEN the KP navigates to a new Scene_Node, THE Scenario_Reader SHALL save the current Progress_State to localStorage keyed by scenario ID (`trpg_cthulhu_progress_{scenarioId}`)
2. WHEN the KP reopens a scenario, THE Scenario_Reader SHALL restore the Progress_State from localStorage and display the last visited Scene_Node
3. THE Scenario_Reader SHALL provide a "Reset" button that clears the Progress_State for the current scenario only and returns to the first Scene_Node
4. WHEN the KP taps the Reset button, THE Scenario_Reader SHALL display a confirmation dialog before clearing progress
5. THE Progress_State for each scenario SHALL be stored independently so that progress in one scenario does not affect another
6. THE Progress_State SHALL include: currentNodeId, visitedNodeIds[] (unique, Set-like), history[], phase, and updatedAt timestamp
7. Reset SHALL NOT clear the Completion_State (クリア済みは維持される)

### Requirement 10: フェーズ別シーン一覧（目次）

**User Story:** As a KP, I want シナリオの全シーンをフェーズごとに一覧で見たい, so that セッション中に特定の場面をすぐ参照できる。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL provide a "📖 目次" button in the toolbar area
2. WHEN the KP taps the TOC button, THE Scenario_Reader SHALL display all Scene_Nodes grouped by phase, in the order defined by `phases[].nodes`
3. WHEN the KP selects a Scene_Node from the TOC, THE Scenario_Reader SHALL navigate to that Scene_Node, push the current node to history, and update the Progress_State
4. THE Scenario_Reader SHALL visually indicate which Scene_Nodes have been previously visited
5. THE TOC SHALL support keyword filtering for quick search
6. THE TOC SHALL display the phase structure (導入/調査/クライマックス/エンディング) as section headers

### Requirement 11: UI/UXデザイン

**User Story:** As a KP, I want 暗い場所でも読みやすいダークテーマのUIで使いたい, so that TRPG セッション中の雰囲気を壊さずに進行できる。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL use a dark theme (dark background, light text)
2. THE Scenario_Reader SHALL use a color scheme that evokes a Cthulhu/horror atmosphere (deep greens, purples, or dark blues)
3. THE Scenario_Reader SHALL be responsive and optimized for mobile (max-width: 420px content area)
4. THE Scenario_Reader SHALL include a header with: back button (Scenario_Select に戻る), scenario title, and home link
5. THE Scenario_Reader SHALL include a toolbar with: 📖目次, 🗺️マップ, 👤NPC, 🔄リセット buttons
6. THE Scenario_Reader SHALL use a font size of at least 0.95em for main text to ensure readability

### Requirement 12: ゲームセンター統合

**User Story:** As a KP, I want ゲームセンターからシナリオリーダーにアクセスしたい, so that 他のゲームと同じ導線で起動できる。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL be listed in arcade.html as a game card with a Cthulhu-themed icon and title
2. arcade.html SHALL read game_settings.game_publish.game_trpg_cthulhu before rendering the TRPG game card
3. WHILE deviceRole is not 'admin', THE Scenario_Reader card SHALL be hidden from the arcade game list regardless of game_publish setting

### Requirement 13: シナリオ完了管理

**User Story:** As a KP, I want シナリオのクリア状態を管理したい, so that どのシナリオを遊んだか一目でわかる。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL provide a "セッション終了" button visible during the ending phase
2. WHEN the KP taps "セッション終了", THE Scenario_Reader SHALL mark the scenario as completed in localStorage (`trpg_cthulhu_completed_{scenarioId}`)
3. THE Completion_State SHALL store: `{ completed: true, completedAt: <timestamp> }`
4. THE Scenario_Select SHALL display a "クリア済み" badge on completed scenarios
5. THE completed status SHALL be independent of Progress_State (Reset does not clear completion)

### Requirement 14: フォントサイズ変更

**User Story:** As a KP, I want フォントサイズを変更したい, so that 自分の見やすいサイズでシナリオを読める。

#### Acceptance Criteria

1. THE Scenario_Reader SHALL provide font size controls (小/中/大) in the toolbar or settings area
2. WHEN the KP changes font size, THE Scenario_Reader SHALL immediately apply the new size to all text content
3. THE selected font size SHALL be saved to localStorage (`trpg_cthulhu_font_size`) and restored on next visit

### Requirement 15: シナリオテキストの著作権

**User Story:** As a developer, I want シナリオテキストが著作権に配慮されていることを確認したい, so that 法的問題を避けられる。

#### Acceptance Criteria

1. THE Scenario_Data text content SHALL use only original content or properly licensed/permitted content
2. THE Scenario_Data SHALL NOT reproduce copyrighted scenario text verbatim from published sources
3. IF based on a known scenario premise, THE Scenario_Data SHALL use original writing inspired by classic CoC scenario structure without copying specific text

### Requirement 16: 「毒入りスープ」シナリオ内容

**User Story:** As a KP, I want オリジナルの初心者向けミステリーシナリオでセッションを進行したい, so that 初心者PLとスムーズにセッションできる。

#### Acceptance Criteria

1. THE Scenario_Data SHALL be an original beginner-friendly mystery scenario inspired by classic CoC structure (友人の家でのパーティ、スープを飲んだ後に異変が起きる)
2. THE Scenario_Data SHALL include at least 4 investigation scenes (kitchen, living room, bathroom, garden or similar)
3. THE Scenario_Data SHALL include at least 2 NPCs with name, description, defaultLocation, and secret
4. THE Scenario_Data SHALL include a map with location nodes and connections
5. THE Scenario_Data SHALL define phases: 導入, 調査パート, クライマックス, エンディング
6. WHEN a Scene_Node involves a skill check, THE KP_Note SHALL specify the skill name and target number (例: 【目星】50, 【図書館】60)
7. THE Scenario_Data SHALL include at least 2 ending variations (good/bad)
8. ALL scenario text SHALL be original writing per Requirement 15
