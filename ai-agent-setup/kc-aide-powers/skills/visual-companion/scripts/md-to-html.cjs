#!/usr/bin/env node
/**
 * md-to-html.cjs
 *
 * Markdown → HTML 変換ユーティリティ（marked ベース）。
 * visual-companion でのユーザー確認用 HTML を 1 コマンドで生成する。
 *
 * 使い方:
 *   node md-to-html.cjs --md <mdファイルパス> --out <出力パス> [--title <タイトル>] [--options "A:OK,B:修正"]
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('./marked.min.js');

// ---- 引数パース ----
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- 出力テンプレート ----
function renderPage({ title, body, options }) {
  const optBlocks = options
    ? options.split(',').map(o => {
        const [letter, text] = o.split(':');
        return `<div class="option" data-choice="${(letter || '').toLowerCase()}" onclick="toggleSelect(this)"><span class="letter">${escapeHtml(letter || '')}</span> <span class="opt-text">${escapeHtml(text || '')}</span></div>`;
      }).join('\n')
    : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title || 'Confirm')}</title>
<style>
  body {
    font-family: -apple-system, "Segoe UI", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
    background: #fafafa;
    color: #1f2937;
    line-height: 1.7;
    padding: 32px;
    max-width: 1100px;
    margin: 0 auto;
  }
  h1 { color: #1f2937; border-bottom: 3px solid #2563eb; padding-bottom: 8px; }
  h2 { color: #1d4ed8; border-bottom: 2px solid #dbeafe; padding-bottom: 6px; margin-top: 32px; font-size: 20px; }
  h3 { color: #374151; margin-top: 20px; font-size: 17px; }
  h4 { color: #4b5563; margin-top: 16px; font-size: 15px; }
  h5, h6 { color: #6b7280; margin-top: 12px; }
  p { margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th, td { padding: 8px 12px; border: 1px solid #d1d5db; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; color: #374151; font-weight: 600; }
  pre { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 14px; border-radius: 4px; overflow-x: auto; font-size: 13px; color: #1f2937; }
  code { background: #f3f4f6; color: #be185d; padding: 1px 5px; border-radius: 3px; font-size: 13px; }
  pre code { background: transparent; color: #1f2937; padding: 0; }
  ul, ol { margin: 6px 0 12px; padding-left: 24px; }
  li { margin-bottom: 4px; }
  blockquote { border-left: 4px solid #6b7280; padding: 8px 14px; background: #f9fafb; color: #4b5563; margin: 12px 0; border-radius: 4px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  strong { color: #111827; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .header {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .content {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .options-area {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px 24px;
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .option {
    flex: 1;
    min-width: 180px;
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .option:hover { border-color: #2563eb; background: #eff6ff; }
  .option.selected { border-color: #2563eb; background: #dbeafe; }
  .option .letter {
    display: inline-block; background: #2563eb; color: white; width: 28px; height: 28px;
    border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; flex-shrink: 0;
  }
  .opt-text { font-weight: 500; color: #1f2937; }
</style>
</head>
<body>
<div class="header">
  <h1>${escapeHtml(title || 'Confirm')}</h1>
</div>
<div class="content">
${body}
</div>
${options ? `<div class="options-area">${optBlocks}</div>` : ''}
</body>
</html>`;
}

// ---- メイン ----
function main() {
  const args = parseArgs(process.argv);
  if (!args.md || !args.out) {
    console.error('Usage: node md-to-html.cjs --md <md-path> --out <html-path> [--title <title>] [--options "A:label1,B:label2"]');
    process.exit(2);
  }
  const md = fs.readFileSync(args.md, 'utf8');
  const body = marked(md);
  const html = renderPage({
    title: args.title || path.basename(args.md),
    body,
    options: args.options || '',
  });
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, html, 'utf8');
  console.log(`Wrote ${args.out}`);
}

main();
