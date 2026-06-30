// auto-chore-tasks.js
// GitHub Actions Cron（毎朝9時JST）から実行
// auto_add: true の定型業務テンプレートを、activeに無ければ自動追加する
// Node.js 20+ native fetch を使用
//
// 環境変数:
//   SUPABASE_URL   - Supabase プロジェクト URL
//   SUPABASE_KEY   - Supabase anon/service key

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_KEY');
    process.exit(1);
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  // 1. game_settingsからchore_templatesを取得
  const settingsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/game_settings?id=eq.1&select=chore_templates`,
    { headers }
  );
  if (!settingsRes.ok) {
    console.error('Failed to fetch game_settings:', settingsRes.status);
    process.exit(1);
  }
  const settingsData = await settingsRes.json();
  const templates = (settingsData[0] && settingsData[0].chore_templates) || [];

  // auto_addが有効なテンプレートのみ
  const autoTemplates = templates.filter(t => t.auto_add);
  if (autoTemplates.length === 0) {
    console.log('No auto_add templates found. Done.');
    return;
  }
  console.log(`Found ${autoTemplates.length} auto_add templates.`);

  // 2. 現在のactiveタスクのタイトル+assign_to一覧を取得
  const activeRes = await fetch(
    `${SUPABASE_URL}/rest/v1/chore_tasks?status=eq.active&select=title,assign_to`,
    { headers }
  );
  if (!activeRes.ok) {
    console.error('Failed to fetch active tasks:', activeRes.status);
    process.exit(1);
  }
  const activeTasks = await activeRes.json();

  // 3. 重複しないものだけ追加
  let added = 0;
  for (const tpl of autoTemplates) {
    const duplicate = activeTasks.some(t => t.title === tpl.title && (t.assign_to || null) === (tpl.assign_to || null));
    if (duplicate) {
      console.log(`Skip (already active): ${tpl.title}${tpl.assign_to ? ' [' + tpl.assign_to + ']' : ''}`);
      continue;
    }

    const cl = tpl.checklist ? tpl.checklist.map(t => ({ text: t, checked: false })) : null;
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/chore_tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: tpl.title,
        checklist: cl,
        points: tpl.points || 1,
        priority: 0,
        assign_to: tpl.assign_to || null
      })
    });

    if (insertRes.ok) {
      console.log(`✓ Added: ${tpl.title}${tpl.assign_to ? ' (' + tpl.assign_to + ')' : ''}`);
      added++;
    } else {
      console.error(`Failed to add "${tpl.title}": ${insertRes.status}`);
    }
  }

  console.log(`Done. Added ${added} tasks.`);
}

main().catch(e => { console.error(e); process.exit(1); });
