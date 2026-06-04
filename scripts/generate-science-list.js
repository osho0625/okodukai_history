#!/usr/bin/env node
/**
 * today-science/images/ 内の画像を自動スキャンして science-list.js を生成する。
 * 画像追加後にこのスクリプトを実行すること。
 *
 * Usage: node scripts/generate-science-list.js
 *
 * ファイル名（拡張子除く）がそのままタイトルとIDになる。
 * 例: "重力ってなに.png" → { id: '重力ってなに', title: '重力ってなに？', image: '...' }
 *   ファイル名末尾に「？」がなければ自動付与
 */
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', '.kiro', 'specs', 'today-science', 'images');
const outputFile = path.join(__dirname, '..', '.kiro', 'specs', 'today-science', 'science-list.js');

const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'];

const files = fs.readdirSync(imagesDir)
  .filter(f => imageExts.includes(path.extname(f).toLowerCase()))
  .sort();

const entries = files.map(f => {
  const name = path.basename(f, path.extname(f));
  const id = name.replace(/[？?]/g, '');
  // タイトル: 末尾に？がなければ追加
  const title = name.endsWith('？') || name.endsWith('?') ? name : name + '？';
  const image = '.kiro/specs/today-science/images/' + f;
  return { id, title, image };
});

const js = `// 自動生成ファイル - scripts/generate-science-list.js で生成
// 手動編集しないでください。画像追加後に node scripts/generate-science-list.js を実行。
window.SCIENCE_DATA = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(outputFile, js, 'utf8');
console.log(`✅ ${entries.length}件のサイエンス画像を検出 → science-list.js を更新しました`);
entries.forEach(e => console.log(`   - ${e.title}`));
