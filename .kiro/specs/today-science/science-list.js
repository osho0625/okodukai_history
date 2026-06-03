// 今日のサイエンス - データリスト
// 画像を追加したら、ここにエントリーを追記してください。
// 日付に応じてローテーションで1日1つ表示されます。
//
// 使い方:
//   1. .kiro/specs/today-science/images/ に画像を配置
//   2. 下の配列にオブジェクトを追加
//      - id: ユニークな識別子（実績管理に使用）
//      - title: 表示するタイトル（「重力ってなに？」など）
//      - image: 画像パス（.kiro/specs/today-science/images/ からの相対）
//
// 例:
//   { id: 'gravity', title: '重力ってなに？', image: '.kiro/specs/today-science/images/gravity.png' },

window.SCIENCE_DATA = [
  { id: 'gravity', title: '重力ってなに？', image: '.kiro/specs/today-science/images/重力ってなに.png' },
  { id: 'sky_blue', title: '空はなんで青いの？', image: '.kiro/specs/today-science/images/空はなんで青いの.png' },
  { id: 'rain', title: '雨ってなんで降るの？', image: '.kiro/specs/today-science/images/雨ってなんで降るの.png' },
];
