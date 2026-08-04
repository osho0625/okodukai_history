// settlement-app.js — 家庭内精算アプリケーション層（UI操作・DB通信）
// Uses global `client` from common.js and pure functions from settlement-utils.js

// ========== Toast ==========
function showToast(msg, duration) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration || 3000);
}

// ========== Utility ==========
function getCurrentYearMonth() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}

function formatAmount(n) {
  if (n == null) return '-';
  return n.toLocaleString() + '円';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ========== State ==========
let currentMonthlyYearMonth = getCurrentYearMonth();
let currentDiffYear = new Date().getFullYear();
let currentDiffPeriod = getDifferenceSettlementPeriod(getCurrentYearMonth());

// ========== Audit Log ==========
async function logSettlementAction(action, targetType, detail, yearMonth, targetId) {
  try {
    await client.from('settlement_audit_log').insert({
      action,
      target_type: targetType,
      detail,
      year_month: yearMonth || null,
      target_id: targetId || null
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

async function loadAuditLog(yearMonth) {
  const { data, error } = await client
    .from('settlement_audit_log')
    .select('id, action, target_type, detail, year_month, created_at')
    .eq('year_month', yearMonth)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) { console.error('Load audit log error:', error); return []; }
  return data || [];
}

function renderAuditLog(logs) {
  if (!logs || logs.length === 0) return '';
  let html = '<div class="card" style="margin-top:16px;">';
  html += '<h4 style="margin-bottom:8px;">📝 操作履歴</h4>';
  html += '<div style="max-height:200px;overflow-y:auto;font-size:0.85em;">';
  for (const log of logs) {
    const time = new Date(log.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    html += `<div style="padding:4px 0;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;">`;
    html += `<span>${escapeHtml(log.detail)}</span>`;
    html += `<span style="color:#999;white-space:nowrap;margin-left:8px;">${time}</span>`;
    html += `</div>`;
  }
  html += '</div></div>';
  return html;
}

// ========== initApp ==========
function initApp() {
  // Tab switching is handled by inline script in HTML.
  // Hook into tab buttons to load data when switching.
  document.querySelectorAll('.tab-bar button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      onTabSwitch(tab);
    });
  });
  // Load dashboard on init
  loadDashboard();
}

function onTabSwitch(tab) {
  switch (tab) {
    case 'dashboard': loadDashboard(); break;
    case 'master': loadExpenseMasters(); break;
    case 'monthly': loadMonthlySettlement(currentMonthlyYearMonth); break;
    case 'diff-settlement': loadDifferenceSettlement(getCurrentYearMonth()); break;
  }
}

// ========== Dashboard ==========
async function loadDashboard() {
  const container = document.getElementById('tab-dashboard');
  container.innerHTML = '<div class="loading">読み込み中...</div>';

  try {
    const yearMonth = getCurrentYearMonth();
    const nextYM = nextMonth(yearMonth);

    // 1. Current month settlement result
    const { data: monthlyExpenses, error: meErr } = await client
      .from('monthly_expenses')
      .select('id, payer, planned_amount, actual_amount, expense_master_id')
      .eq('year_month', yearMonth);
    if (meErr) throw meErr;

    const { data: tempExpenses, error: teErr } = await client
      .from('temporary_expenses')
      .select('id, title, payer, amount, beneficiaries, note, settled, expense_type')
      .eq('year_month', yearMonth)
      .eq('settled', false);
    if (teErr) throw teErr;

    // Check if already settled
    const { data: historyCheck } = await client
      .from('settlement_history')
      .select('id, status, payer_from, payer_to, amount')
      .eq('target_period', yearMonth)
      .eq('settlement_type', 'monthly')
      .maybeSingle();

    const result = calculateSettlement(monthlyExpenses || [], tempExpenses || [], ['めぐみ', '涼介']);

    // 2. Unsettled months: months from SETTLEMENT_START_MONTH to current that have no monthly settlement in history
    const allMonths = [];
    let ym = SETTLEMENT_START_MONTH;
    while (ym <= yearMonth) {
      allMonths.push(ym);
      ym = nextMonth(ym);
    }

    const { data: settledMonths, error: smErr } = await client
      .from('settlement_history')
      .select('target_period')
      .eq('settlement_type', 'monthly')
      .in('target_period', allMonths);
    if (smErr) throw smErr;

    const settledSet = new Set((settledMonths || []).map(s => s.target_period));
    const unsettledMonths = allMonths.filter(m => !settledSet.has(m));

    // 3. Difference settlement pending: months with half_year items that are missing actual_amount or not difference_settled
    const { data: halfYearExpenses, error: hyErr } = await client
      .from('monthly_expenses')
      .select('id, year_month, actual_amount, difference_settled, expense_master:expense_master_id(settlement_cycle)')
      .in('year_month', allMonths);
    if (hyErr) throw hyErr;

    const halfYearItems = (halfYearExpenses || []).filter(e => e.expense_master && e.expense_master.settlement_cycle === 'half_year');
    const diffPendingMonths = new Set();
    for (const item of halfYearItems) {
      if (item.actual_amount == null || !item.difference_settled) {
        diffPendingMonths.add(item.year_month);
      }
    }

    // Render dashboard
    let html = '';

    // Settlement result card
    html += '<div class="card">';
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">`;
    html += `<h3 style="margin:0;">📊 今月の精算 (${yearMonth})</h3>`;
    html += `<button class="btn-secondary" style="padding:6px 12px;font-size:0.85em;" onclick="showTemporaryExpenseModal(null, '${nextYM}')">＋立替追加</button>`;
    html += `</div>`;
    if (historyCheck) {
      html += `<div style="color:#4caf50;font-weight:600;">✅ 精算済み</div>`;
      html += `<div style="margin-top:8px;">${escapeHtml(historyCheck.payer_from)} → ${escapeHtml(historyCheck.payer_to)}: ${formatAmount(historyCheck.amount)}</div>`;
    } else if (result.transfers.length > 0) {
      const t = result.transfers[0];
      html += `<div style="font-size:1.2em;font-weight:700;color:#1565c0;">${escapeHtml(t.from)} → ${escapeHtml(t.to)}: ${formatAmount(t.amount)}</div>`;
    } else {
      html += '<div style="color:#888;">精算額は0円です（精算不要）</div>';
    }
    html += '</div>';

    // Unsettled months
    html += '<div class="card">';
    html += `<h3 style="margin-bottom:12px;">⏳ 未精算月 <span style="background:#ff5722;color:#fff;border-radius:12px;padding:2px 10px;font-size:0.85em;margin-left:8px;">${unsettledMonths.length}件</span></h3>`;
    if (unsettledMonths.length > 0) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      for (const m of unsettledMonths) {
        html += `<span style="background:#fff3e0;border:1px solid #ffcc80;border-radius:6px;padding:4px 10px;font-size:0.9em;">${m}</span>`;
      }
      html += '</div>';
    } else {
      html += '<div style="color:#4caf50;">すべて精算済みです 🎉</div>';
    }
    html += '</div>';

    // Difference pending months
    html += '<div class="card">';
    html += `<h3 style="margin-bottom:12px;">📈 差額精算待ち <span style="background:#ff9800;color:#fff;border-radius:12px;padding:2px 10px;font-size:0.85em;margin-left:8px;">${diffPendingMonths.size}件</span></h3>`;
    if (diffPendingMonths.size > 0) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      for (const m of [...diffPendingMonths].sort()) {
        html += `<span style="background:#fce4ec;border:1px solid #f48fb1;border-radius:6px;padding:4px 10px;font-size:0.9em;">${m}</span>`;
      }
      html += '</div>';
    } else {
      html += '<div style="color:#4caf50;">差額精算待ちの項目はありません</div>';
    }
    html += '</div>';

    // Temporary expenses list
    html += '<div class="card">';
    html += `<h3 style="margin-bottom:12px;">🧾 今月の一時立替 (未精算)</h3>`;
    if ((tempExpenses || []).length > 0) {
      html += '<ul style="list-style:none;padding:0;">';
      for (const t of tempExpenses) {
        html += `<li style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(t.title)} (${escapeHtml(t.payer)}): ${formatAmount(t.amount)}${t.note ? ' - ' + escapeHtml(t.note) : ''}</li>`;
      }
      html += '</ul>';
    } else {
      html += '<div style="color:#888;">未精算の一時立替はありません</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  } catch (err) {
    console.error('Dashboard load error:', err);
    container.innerHTML = '<div class="card"><div style="color:#d32f2f;">データの取得に失敗しました</div><button class="btn-secondary" style="margin-top:12px;" onclick="loadDashboard()">リトライ</button></div>';
    showToast('データの取得に失敗しました');
  }
}

// ========== Expense Masters ==========
async function loadExpenseMasters() {
  const container = document.getElementById('tab-master');
  container.innerHTML = '<div class="loading">読み込み中...</div>';

  try {
    const { data: masters, error } = await client
      .from('expense_master')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;

    let html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<h3>📋 固定費マスタ一覧</h3>';
    html += '<button class="btn-primary" onclick="showExpenseMasterModal()">＋追加</button>';
    html += '</div>';

    if (!masters || masters.length === 0) {
      html += '<div class="empty-state"><div class="emoji">📋</div><div>固定費マスタが登録されていません</div></div>';
    } else {
      const monthlyMasters = masters.filter(m => m.settlement_cycle === 'monthly' && m.expense_type !== 'subsidy');
      const halfYearMasters = masters.filter(m => m.settlement_cycle === 'half_year' && m.expense_type !== 'subsidy');
      const subsidyMasters = masters.filter(m => m.expense_type === 'subsidy');

      // 月次セクション
      html += `<details class="card" style="padding:0;">`;
      html += `<summary style="padding:16px 20px;cursor:pointer;font-weight:600;font-size:1.05em;list-style:none;display:flex;justify-content:space-between;align-items:center;">`;
      html += `<span>💴 月次（${monthlyMasters.length}件）</span><span style="font-size:0.8em;color:#888;">タップで開閉</span>`;
      html += `</summary>`;
      html += `<div style="padding:0 20px 16px;">`;
      if (monthlyMasters.length === 0) {
        html += '<div style="color:#888;text-align:center;padding:12px;">月次項目はありません</div>';
      } else {
        for (const m of monthlyMasters) {
          const enabledClass = m.enabled ? '' : 'opacity:0.5;';
          html += `<div style="${enabledClass}border-bottom:1px solid #f0f0f0;padding:12px 0;display:flex;justify-content:space-between;align-items:center;">`;
          html += `<div>`;
          html += `<div style="font-weight:600;">${escapeHtml(m.name)}</div>`;
          html += `<div style="color:#666;margin-top:2px;font-size:0.9em;">${escapeHtml(m.payer)} / ${formatAmount(m.base_amount)}</div>`;
          html += `</div>`;
          html += `<div style="display:flex;gap:8px;align-items:center;">`;
          html += `<button class="btn-secondary" style="padding:4px 10px;font-size:0.8em;" onclick="showExpenseMasterModal('${m.id}')">編集</button>`;
          html += `<label style="cursor:pointer;font-size:0.85em;"><input type="checkbox" ${m.enabled ? 'checked' : ''} onchange="toggleExpenseMasterEnabled('${m.id}', this.checked)"> 有効</label>`;
          html += `</div></div>`;
        }
      }
      html += `</div></details>`;

      // 半年セクション
      html += `<details class="card" style="padding:0;margin-top:12px;">`;
      html += `<summary style="padding:16px 20px;cursor:pointer;font-weight:600;font-size:1.05em;list-style:none;display:flex;justify-content:space-between;align-items:center;">`;
      html += `<span>📈 半年（${halfYearMasters.length}件）</span><span style="font-size:0.8em;color:#888;">タップで開閉</span>`;
      html += `</summary>`;
      html += `<div style="padding:0 20px 16px;">`;
      if (halfYearMasters.length === 0) {
        html += '<div style="color:#888;text-align:center;padding:12px;">半年項目はありません</div>';
      } else {
        for (const m of halfYearMasters) {
          const enabledClass = m.enabled ? '' : 'opacity:0.5;';
          html += `<div style="${enabledClass}border-bottom:1px solid #f0f0f0;padding:12px 0;display:flex;justify-content:space-between;align-items:center;">`;
          html += `<div>`;
          html += `<div style="font-weight:600;">${escapeHtml(m.name)}</div>`;
          html += `<div style="color:#666;margin-top:2px;font-size:0.9em;">${escapeHtml(m.payer)} / ${formatAmount(m.base_amount)}</div>`;
          html += `</div>`;
          html += `<div style="display:flex;gap:8px;align-items:center;">`;
          html += `<button class="btn-secondary" style="padding:4px 10px;font-size:0.8em;" onclick="showExpenseMasterModal('${m.id}')">編集</button>`;
          html += `<label style="cursor:pointer;font-size:0.85em;"><input type="checkbox" ${m.enabled ? 'checked' : ''} onchange="toggleExpenseMasterEnabled('${m.id}', this.checked)"> 有効</label>`;
          html += `</div></div>`;
        }
      }
      html += `</div></details>`;

      // 補助金セクション
      html += `<details class="card" style="padding:0;margin-top:12px;">`;
      html += `<summary style="padding:16px 20px;cursor:pointer;font-weight:600;font-size:1.05em;list-style:none;display:flex;justify-content:space-between;align-items:center;">`;
      html += `<span>💰 補助金（${subsidyMasters.length}件）</span><span style="font-size:0.8em;color:#888;">タップで開閉</span>`;
      html += `</summary>`;
      html += `<div style="padding:0 20px 16px;">`;
      if (subsidyMasters.length === 0) {
        html += '<div style="color:#888;text-align:center;padding:12px;">補助金項目はありません</div>';
      } else {
        for (const m of subsidyMasters) {
          const enabledClass = m.enabled ? '' : 'opacity:0.5;';
          html += `<div style="${enabledClass}border-bottom:1px solid #f0f0f0;padding:12px 0;display:flex;justify-content:space-between;align-items:center;">`;
          html += `<div>`;
          html += `<div style="font-weight:600;">${escapeHtml(m.name)}</div>`;
          html += `<div style="color:#666;margin-top:2px;font-size:0.9em;">${escapeHtml(m.payer)} / ${formatAmount(m.base_amount)}</div>`;
          html += `</div>`;
          html += `<div style="display:flex;gap:8px;align-items:center;">`;
          html += `<button class="btn-secondary" style="padding:4px 10px;font-size:0.8em;" onclick="showExpenseMasterModal('${m.id}')">編集</button>`;
          html += `<label style="cursor:pointer;font-size:0.85em;"><input type="checkbox" ${m.enabled ? 'checked' : ''} onchange="toggleExpenseMasterEnabled('${m.id}', this.checked)"> 有効</label>`;
          html += `</div></div>`;
        }
      }
      html += `</div></details>`;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Expense masters load error:', err);
    container.innerHTML = '<div class="card"><div style="color:#d32f2f;">データの取得に失敗しました</div><button class="btn-secondary" style="margin-top:12px;" onclick="loadExpenseMasters()">リトライ</button></div>';
    showToast('データの取得に失敗しました');
  }
}

async function showExpenseMasterModal(id) {
  let existing = null;
  if (id) {
    const { data, error } = await client
      .from('expense_master')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) { showToast('データ取得に失敗しました'); return; }
    existing = data;
  }

  const modal = document.createElement('div');
  modal.id = 'master-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:400px;max-height:90vh;overflow-y:auto;">
      <h3 style="margin-bottom:16px;">${existing ? '固定費編集' : '固定費追加'}</h3>
      <div id="master-errors" style="color:#d32f2f;margin-bottom:12px;font-size:0.9em;"></div>
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">項目名</span>
        <input id="master-name" type="text" value="${existing ? escapeHtml(existing.name) : ''}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">支払担当者</span>
        <input id="master-payer" type="hidden" value="${existing ? escapeHtml(existing.payer) : ''}">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="payer-btn" data-target="master-payer" data-value="めぐみ" style="flex:1;padding:10px;border:2px solid ${existing && existing.payer === 'めぐみ' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.payer === 'めぐみ' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">めぐみ</button>
          <button type="button" class="payer-btn" data-target="master-payer" data-value="涼介" style="flex:1;padding:10px;border:2px solid ${existing && existing.payer === '涼介' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.payer === '涼介' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">涼介</button>
        </div>
      </div>
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">基準額（円）</span>
        <input id="master-amount" type="number" min="0" value="${existing ? existing.base_amount : ''}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:block;margin-bottom:16px;">
        <span style="font-weight:600;">精算周期</span>
        <input id="master-cycle" type="hidden" value="${existing ? existing.settlement_cycle : 'monthly'}">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="cycle-btn" data-value="monthly" style="flex:1;padding:10px;border:2px solid ${!existing || existing.settlement_cycle === 'monthly' ? '#1565c0' : '#ddd'};border-radius:8px;background:${!existing || existing.settlement_cycle === 'monthly' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">月次</button>
          <button type="button" class="cycle-btn" data-value="half_year" style="flex:1;padding:10px;border:2px solid ${existing && existing.settlement_cycle === 'half_year' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.settlement_cycle === 'half_year' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">半年</button>
        </div>
      </div>
      <div style="display:block;margin-bottom:16px;">
        <span style="font-weight:600;">種別</span>
        <input id="master-expense-type" type="hidden" value="${existing && existing.expense_type === 'subsidy' ? 'subsidy' : 'expense'}">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="master-type-btn" data-value="expense" style="flex:1;padding:10px;border:2px solid ${!existing || existing.expense_type !== 'subsidy' ? '#1565c0' : '#ddd'};border-radius:8px;background:${!existing || existing.expense_type !== 'subsidy' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">🧾 固定費</button>
          <button type="button" class="master-type-btn" data-value="subsidy" style="flex:1;padding:10px;border:2px solid ${existing && existing.expense_type === 'subsidy' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.expense_type === 'subsidy' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">💰 補助金</button>
        </div>
      </div>
      <div style="display:flex;gap:12px;">
        <button class="btn-primary" style="flex:1;" onclick="saveExpenseMaster(${existing ? "'" + existing.id + "'" : 'null'})">${existing ? '更新' : '追加'}</button>
        <button class="btn-secondary" style="flex:1;" onclick="closeMasterModal()">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeMasterModal(); });
  modal.querySelectorAll('.payer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      target.value = btn.dataset.value;
      btn.parentElement.querySelectorAll('.payer-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
    });
  });
  modal.querySelectorAll('.cycle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('master-cycle').value = btn.dataset.value;
      modal.querySelectorAll('.cycle-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
    });
  });
  modal.querySelectorAll('.master-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('master-expense-type').value = btn.dataset.value;
      modal.querySelectorAll('.master-type-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
    });
  });
}

function closeMasterModal() {
  const modal = document.getElementById('master-modal');
  if (modal) modal.remove();
}

async function saveExpenseMaster(id) {
  const name = document.getElementById('master-name').value;
  const payer = document.getElementById('master-payer').value;
  const baseAmount = parseInt(document.getElementById('master-amount').value, 10);
  const cycle = document.getElementById('master-cycle').value;
  const expenseType = document.getElementById('master-expense-type').value || 'expense';

  const data = { name, payer, base_amount: isNaN(baseAmount) ? -1 : baseAmount, settlement_cycle: cycle };
  const validation = validateExpenseMaster(data);
  if (!validation.valid) {
    document.getElementById('master-errors').innerHTML = validation.errors.map(e => '<div>' + escapeHtml(e) + '</div>').join('');
    return;
  }

  try {
    if (id) {
      const { error } = await client
        .from('expense_master')
        .update({ name: name.trim(), payer: payer.trim(), base_amount: baseAmount, settlement_cycle: cycle, expense_type: expenseType, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      showToast('固定費を更新しました');
    } else {
      const { error } = await client
        .from('expense_master')
        .insert({ name: name.trim(), payer: payer.trim(), base_amount: baseAmount, settlement_cycle: cycle, expense_type: expenseType });
      if (error) throw error;
      showToast('固定費を追加しました');
    }
    closeMasterModal();
    loadExpenseMasters();
  } catch (err) {
    console.error('Save expense master error:', err);
    showToast('保存に失敗しました');
  }
}

async function toggleExpenseMasterEnabled(id, enabled) {
  try {
    const { error } = await client
      .from('expense_master')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    showToast(enabled ? '有効にしました' : '無効にしました');
    loadExpenseMasters();
  } catch (err) {
    console.error('Toggle enabled error:', err);
    showToast('更新に失敗しました');
  }
}

// ========== Monthly Settlement ==========
async function generateMonthlyData(yearMonth) {
  try {
    const { data: masters, error: masterErr } = await client
      .from('expense_master')
      .select('*')
      .eq('enabled', true);
    if (masterErr) throw masterErr;

    const { data: existing, error: existErr } = await client
      .from('monthly_expenses')
      .select('expense_master_id')
      .eq('year_month', yearMonth);
    if (existErr) throw existErr;

    const newRecords = generateMonthlyExpenses(masters || [], existing || [], yearMonth);
    if (newRecords.length === 0) {
      showToast('作成対象の有効な固定費がありません');
      return;
    }

    const { error: insertErr } = await client
      .from('monthly_expenses')
      .upsert(newRecords, { onConflict: 'year_month,expense_master_id', ignoreDuplicates: true });
    if (insertErr) throw insertErr;

    showToast(`${yearMonth} の精算データを作成しました（${newRecords.length}件）`);
    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Generate monthly data error:', err);
    showToast('精算データの作成に失敗しました');
  }
}

async function regenerateMonthlyData(yearMonth) {
  if (!confirm('精算データを再生成しますか？\n現在のデータを削除して、最新のマスタから再作成します。')) return;

  try {
    // 精算確定済みチェック
    const { data: settled } = await client
      .from('settlement_history')
      .select('id')
      .eq('target_period', yearMonth)
      .eq('settlement_type', 'monthly')
      .maybeSingle();

    if (settled) {
      showToast('精算確定済みのため再生成できません。先に精算を取り消してください。');
      return;
    }

    // 既存の monthly_expenses を削除
    const { error: delErr } = await client
      .from('monthly_expenses')
      .delete()
      .eq('year_month', yearMonth);
    if (delErr) throw delErr;

    // 最新のマスタから再生成
    const { data: masters, error: masterErr } = await client
      .from('expense_master')
      .select('*')
      .eq('enabled', true);
    if (masterErr) throw masterErr;

    const newRecords = generateMonthlyExpenses(masters || [], [], yearMonth);
    if (newRecords.length === 0) {
      showToast('有効な固定費がないため再生成データがありません');
      loadMonthlySettlement(yearMonth);
      return;
    }

    const { error: insertErr } = await client
      .from('monthly_expenses')
      .insert(newRecords);
    if (insertErr) throw insertErr;

    showToast(`${yearMonth} の精算データを再生成しました（${newRecords.length}件）`);
    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Regenerate monthly data error:', err);
    showToast('精算データの再生成に失敗しました');
  }
}

async function loadMonthlySettlement(yearMonth) {
  // 開始月より前には遡らせない
  if (yearMonth < SETTLEMENT_START_MONTH) yearMonth = SETTLEMENT_START_MONTH;
  currentMonthlyYearMonth = yearMonth;
  const container = document.getElementById('tab-monthly');
  container.innerHTML = '<div class="loading">読み込み中...</div>';

  try {
    // 1. Get enabled masters
    const { data: masters, error: masterErr } = await client
      .from('expense_master')
      .select('*')
      .eq('enabled', true);
    if (masterErr) throw masterErr;

    // 2. Get existing monthly expenses
    const { data: monthlyExpenses, error: meErr } = await client
      .from('monthly_expenses')
      .select('id, year_month, expense_master_id, payer, planned_amount, actual_amount, difference, difference_settled, name, expense_type, expense_master:expense_master_id(name, settlement_cycle)')
      .eq('year_month', yearMonth)
      .order('created_at', { ascending: true });
    if (meErr) throw meErr;

    // 3. Get temporary expenses for this month
    const { data: tempExpenses, error: teErr } = await client
      .from('temporary_expenses')
      .select('id, title, payer, amount, beneficiaries, note, settled, expense_type')
      .eq('year_month', yearMonth)
      .order('created_at', { ascending: true });
    if (teErr) throw teErr;

    // 4. Check if this month is already settled
    const { data: settlementRecord } = await client
      .from('settlement_history')
      .select('id, status, payer_from, payer_to, amount, memo, paid_at, created_at')
      .eq('target_period', yearMonth)
      .eq('settlement_type', 'monthly')
      .maybeSingle();

    const isSettled = !!settlementRecord;
    const unsettledTemp = (tempExpenses || []).filter(t => !t.settled);

    // 7. Calculate settlement
    const result = calculateSettlement(monthlyExpenses || [], unsettledTemp, ['めぐみ', '涼介']);

    // Render
    let html = '';

    // Year-month selector
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
    const prevDisabled = yearMonth <= SETTLEMENT_START_MONTH ? 'disabled style="padding:8px 12px;opacity:0.3;cursor:not-allowed;"' : 'style="padding:8px 12px;"';
    html += `<button class="btn-secondary" ${prevDisabled} onclick="loadMonthlySettlement(prevMonth('${yearMonth}'))">◀</button>`;
    html += `<h3 style="margin:0;">💴 ${yearMonth} の精算</h3>`;
    html += `<button class="btn-secondary" style="padding:8px 12px;" onclick="loadMonthlySettlement(nextMonth('${yearMonth}'))">▶</button>`;
    html += '</div>';

    // 月次データが未作成の場合、作成ボタンを表示
    if ((!monthlyExpenses || monthlyExpenses.length === 0) && !isSettled) {
      html += '<div class="card" style="text-align:center;">';
      html += '<div style="font-size:2em;margin-bottom:12px;">📋</div>';
      html += `<div style="color:#888;margin-bottom:16px;">${yearMonth} の精算データはまだ作成されていません</div>`;
      html += `<button class="btn-primary" onclick="generateMonthlyData('${yearMonth}')">この月の精算データを作成する</button>`;
      html += '</div>';

      // 立替金セクションは月次データなくても表示
      html += '<div class="card">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
      html += '<h4>🧾 一時立替金</h4>';
      html += `<button class="btn-secondary" style="padding:6px 12px;font-size:0.85em;" onclick="showTemporaryExpenseModal(null, '${yearMonth}')">＋追加</button>`;
      html += '</div>';
      html += renderTemporaryExpensesList(tempExpenses || [], false);
      html += '</div>';

      container.innerHTML = html;
      return;
    }

    // Settled badge
    if (isSettled) {
      html += `<div class="card" style="background:#e8f5e9;border:1px solid #a5d6a7;">`;
      html += `<div style="color:#2e7d32;font-weight:600;">✅ 精算確定済み</div>`;
      html += `<div style="margin-top:4px;">${escapeHtml(settlementRecord.payer_from)} → ${escapeHtml(settlementRecord.payer_to)}: ${formatAmount(settlementRecord.amount)}</div>`;
      if (settlementRecord.memo) html += `<div style="margin-top:4px;color:#666;">メモ: ${escapeHtml(settlementRecord.memo)}</div>`;
      html += `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">`;
      html += `<button class="btn-secondary" style="padding:8px 16px;font-size:0.9em;" onclick="editSettlementMemo('${settlementRecord.id}')">メモ編集</button>`;
      html += `<button class="btn-secondary" style="padding:8px 16px;font-size:0.9em;color:#d32f2f;border-color:#d32f2f;" onclick="revertMonthlySettlement('${settlementRecord.id}', '${yearMonth}')">⏪ 精算取消</button>`;
      html += `</div>`;
      html += '</div>';
    }

    // Payer breakdown
    const payers = Object.keys(result.payerTotals);
    for (const payer of payers) {
      html += `<div class="card">`;
      html += `<h4 style="margin-bottom:8px;">${escapeHtml(payer)} の項目</h4>`;
      const payerMonthly = (monthlyExpenses || []).filter(e => e.payer === payer && e.expense_type !== 'subsidy');
      const payerSubsidyMonthly = (monthlyExpenses || []).filter(e => e.payer === payer && e.expense_type === 'subsidy');
      if (payerMonthly.length > 0) {
        html += '<div style="margin-bottom:8px;">';
        for (const exp of payerMonthly) {
          const name = exp.expense_master ? exp.expense_master.name : (exp.name || '(手動追加)');
          html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0;">`;
          html += `<span>${escapeHtml(name)}</span>`;
          html += `<div style="display:flex;align-items:center;gap:6px;">`;
          html += `<span>${formatAmount(exp.planned_amount)}</span>`;
          if (!isSettled) {
            html += `<button class="btn-secondary" style="padding:2px 8px;font-size:0.75em;" onclick="showMonthlyExpenseEditModal('${exp.id}')">✏️</button>`;
            html += `<button class="btn-secondary" style="padding:2px 8px;font-size:0.75em;color:#d32f2f;border-color:#d32f2f;" onclick="deleteMonthlyExpense('${exp.id}', '${yearMonth}')">🗑</button>`;
          }
          html += `</div></div>`;
        }
        html += '</div>';
      }
      // 補助金（固定費マスタから生成）
      if (payerSubsidyMonthly.length > 0) {
        html += '<div style="border-top:1px dashed #ddd;padding-top:8px;margin-top:8px;">';
        html += '<div style="font-size:0.85em;color:#888;margin-bottom:4px;">💰 補助金:</div>';
        for (const exp of payerSubsidyMonthly) {
          const name = exp.expense_master ? exp.expense_master.name : (exp.name || '(手動追加)');
          html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0;">`;
          html += `<span>${escapeHtml(name)}</span>`;
          html += `<div style="display:flex;align-items:center;gap:6px;">`;
          html += `<span>${formatAmount(exp.planned_amount)}</span>`;
          if (!isSettled) {
            html += `<button class="btn-secondary" style="padding:2px 8px;font-size:0.75em;" onclick="showMonthlyExpenseEditModal('${exp.id}')">✏️</button>`;
            html += `<button class="btn-secondary" style="padding:2px 8px;font-size:0.75em;color:#d32f2f;border-color:#d32f2f;" onclick="deleteMonthlyExpense('${exp.id}', '${yearMonth}')">🗑</button>`;
          }
          html += `</div></div>`;
        }
        html += '</div>';
      }
      // Temporary expenses for this payer (分けて表示: 立替金と補助金)
      const payerTemp = isSettled
        ? (tempExpenses || []).filter(t => t.payer === payer && t.settled)
        : unsettledTemp.filter(t => t.payer === payer);
      const payerExpenses = payerTemp.filter(t => t.expense_type !== 'subsidy');
      const payerSubsidies = payerTemp.filter(t => t.expense_type === 'subsidy');
      if (payerExpenses.length > 0) {
        html += '<div style="border-top:1px dashed #ddd;padding-top:8px;margin-top:8px;">';
        html += '<div style="font-size:0.85em;color:#888;margin-bottom:4px;">一時立替:</div>';
        for (const t of payerExpenses) {
          html += `<div style="display:flex;justify-content:space-between;padding:4px 0;">`;
          html += `<span>${escapeHtml(t.title)}</span><span>${formatAmount(t.amount)}</span>`;
          html += `</div>`;
        }
        html += '</div>';
      }
      if (payerSubsidies.length > 0) {
        html += '<div style="border-top:1px dashed #ddd;padding-top:8px;margin-top:8px;">';
        html += '<div style="font-size:0.85em;color:#888;margin-bottom:4px;">💰 補助金:</div>';
        for (const t of payerSubsidies) {
          html += `<div style="display:flex;justify-content:space-between;padding:4px 0;">`;
          html += `<span>${escapeHtml(t.title)}</span><span>${formatAmount(t.amount)}</span>`;
          html += `</div>`;
        }
        html += '</div>';
      }
      html += `<div style="border-top:1px solid #ddd;padding-top:8px;margin-top:8px;font-weight:600;display:flex;justify-content:space-between;">`;
      html += `<span>小計</span><span>${formatAmount(result.payerTotals[payer])}</span>`;
      html += `</div>`;
      // 相手→自分の精算額を表示（このpayerの項目内で相手が負担すべき金額）
      {
        const otherPayer = payers.find(p => p !== payer);
        if (otherPayer && result.payerTotals[payer] > 0) {
          // 固定費: 折半なので planned_amount / 2 が相手の負担分
          let otherOwes = 0;
          for (const exp of payerMonthly) {
            otherOwes += exp.planned_amount / 2;
          }
          // 一時立替: beneficiariesに応じて按分
          for (const t of payerTemp) {
            const beneficiaries = (t.beneficiaries && t.beneficiaries.length > 0) ? t.beneficiaries : payers;
            if (beneficiaries.includes(otherPayer)) {
              otherOwes += t.amount / beneficiaries.length;
            }
          }
          otherOwes = Math.round(otherOwes);
          if (otherOwes > 0) {
            html += `<div style="margin-top:8px;padding:10px;background:#e8f5e9;border-radius:8px;text-align:center;font-weight:700;color:#2e7d32;">`;
            html += `${escapeHtml(otherPayer)} → ${escapeHtml(payer)}: ${formatAmount(otherOwes)}`;
            html += `</div>`;
          }
        }
      }
      html += `</div>`;
    }

    // 固定費行の追加ボタン（未確定時のみ）
    if (!isSettled) {
      html += `<div style="text-align:center;margin-bottom:12px;">`;
      html += `<button class="btn-secondary" style="padding:8px 16px;font-size:0.9em;" onclick="showMonthlyExpenseAddModal('${yearMonth}')">＋ 固定費項目を追加</button>`;
      html += `</div>`;
    }

    // Calculation result
    html += '<div class="card" style="background:#e3f2fd;">';
    html += `<h4 style="margin-bottom:8px;">精算結果</h4>`;
    // 各payerの項目内での相手負担額を表示
    for (const payer of payers) {
      const otherPayer = payers.find(p => p !== payer);
      if (!otherPayer) continue;
      const payerMonthlyForCalc = (monthlyExpenses || []).filter(e => e.payer === payer);
      const payerTempForCalc = isSettled
        ? (tempExpenses || []).filter(t => t.payer === payer && t.settled)
        : unsettledTemp.filter(t => t.payer === payer);
      let otherOwesForPayer = 0;
      for (const exp of payerMonthlyForCalc) {
        otherOwesForPayer += exp.planned_amount / 2;
      }
      for (const t of payerTempForCalc) {
        if (t.expense_type === 'subsidy') continue; // 補助金は別計算
        const beneficiaries = (t.beneficiaries && t.beneficiaries.length > 0) ? t.beneficiaries : payers;
        if (beneficiaries.includes(otherPayer)) {
          otherOwesForPayer += t.amount / beneficiaries.length;
        }
      }
      // 補助金: 相手がpayerの補助金 → 自分が相手に半額もらえる
      const otherTempForCalc = isSettled
        ? (tempExpenses || []).filter(t => t.payer === otherPayer && t.settled && t.expense_type === 'subsidy')
        : unsettledTemp.filter(t => t.payer === otherPayer && t.expense_type === 'subsidy');
      for (const t of otherTempForCalc) {
        otherOwesForPayer += Math.floor(t.amount / payers.length);
      }
      otherOwesForPayer = Math.round(otherOwesForPayer);
      if (otherOwesForPayer > 0) {
        html += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.95em;"><span>${escapeHtml(payer)}の項目</span><span>${escapeHtml(otherPayer)}→${escapeHtml(payer)}: ${formatAmount(otherOwesForPayer)}</span></div>`;
      }
    }
    if (result.transfers.length > 0) {
      const t = result.transfers[0];
      html += `<div style="margin-top:8px;padding:12px;background:#fff;border-radius:8px;text-align:center;font-size:1.1em;font-weight:700;">`;
      html += `${escapeHtml(t.from)} → ${escapeHtml(t.to)}: ${formatAmount(t.amount)}`;
      html += `</div>`;
    } else {
      html += `<div style="margin-top:8px;text-align:center;color:#888;">精算不要（差額0円）</div>`;
    }
    html += '</div>';

    // Execute button
    if (!isSettled) {
      const canSettle = result.transfers.length > 0 && result.transfers[0].amount > 0;
      html += '<div style="text-align:center;margin:16px 0;display:flex;flex-direction:column;gap:8px;align-items:center;">';
      if (canSettle) {
        html += `<button class="btn-primary" id="btn-execute-monthly" onclick="executeMonthlySettlement('${yearMonth}')">精算を確定する</button>`;
      } else {
        html += `<button class="btn-primary" disabled style="opacity:0.5;cursor:not-allowed;">精算額が0円のため精算不要です</button>`;
      }
      html += `<button class="btn-secondary" style="padding:6px 14px;font-size:0.85em;" onclick="regenerateMonthlyData('${yearMonth}')">🔄 精算データを再生成</button>`;
      html += '</div>';
    } else if (unsettledTemp.length > 0) {
      // 精算確定後に追加された未精算立替がある
      const additionalResult = calculateSettlement([], unsettledTemp, ['めぐみ', '涼介']);
      if (additionalResult.transfers.length > 0 && additionalResult.transfers[0].amount > 0) {
        const at = additionalResult.transfers[0];
        html += '<div class="card" style="background:#fff3e0;border:1px solid #ffcc80;">';
        html += `<div style="color:#e65100;font-weight:600;">⚠️ 精算後に追加された立替があります</div>`;
        html += `<div style="margin-top:8px;font-size:1.05em;font-weight:600;">${escapeHtml(at.from)} → ${escapeHtml(at.to)}: ${formatAmount(at.amount)}</div>`;
        html += `<div style="margin-top:12px;text-align:center;">`;
        html += `<button class="btn-primary" id="btn-execute-monthly" onclick="executeAdditionalSettlement('${yearMonth}')">追加精算を確定する</button>`;
        html += `</div>`;
        html += '</div>';
      }
    }

    // Temporary expenses section
    html += '<div class="card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    html += '<h4>🧾 一時立替金</h4>';
    html += `<button class="btn-secondary" style="padding:6px 12px;font-size:0.85em;" onclick="showTemporaryExpenseModal(null, '${yearMonth}')">＋追加</button>`;
    html += '</div>';
    html += renderTemporaryExpensesList(tempExpenses || [], isSettled);
    html += '</div>';

    // Settlement history
    const { data: historyList } = await client
      .from('settlement_history')
      .select('*')
      .eq('target_period', yearMonth)
      .order('created_at', { ascending: false });

    if (historyList && historyList.length > 0) {
      html += '<div class="card">';
      html += '<h4 style="margin-bottom:8px;">📝 精算履歴</h4>';
      for (const h of historyList) {
        const typeLabel = h.settlement_type === 'monthly' ? '月次' : '差額';
        html += `<div style="padding:8px 0;border-bottom:1px solid #f0f0f0;">`;
        html += `<div>✅ ${typeLabel}: ${escapeHtml(h.payer_from)} → ${escapeHtml(h.payer_to)} ${formatAmount(h.amount)}</div>`;
        if (h.memo) html += `<div style="color:#666;font-size:0.85em;">メモ: ${escapeHtml(h.memo)}</div>`;
        html += `</div>`;
      }
      html += '</div>';
    }

    // 操作履歴
    const auditLogs = await loadAuditLog(yearMonth);
    html += renderAuditLog(auditLogs);

    container.innerHTML = html;
  } catch (err) {
    console.error('Monthly settlement load error:', err);
    container.innerHTML = '<div class="card"><div style="color:#d32f2f;">データの取得に失敗しました</div><button class="btn-secondary" style="margin-top:12px;" onclick="loadMonthlySettlement(\'' + yearMonth + '\')">リトライ</button></div>';
    showToast('データの取得に失敗しました');
  }
}

async function executeMonthlySettlement(yearMonth) {
  if (!confirm('精算を確定しますか？')) return;

  const btn = document.getElementById('btn-execute-monthly');
  if (btn) btn.disabled = true;

  try {
    // Re-fetch data for calculation
    const { data: monthlyExpenses } = await client
      .from('monthly_expenses')
      .select('id, payer, planned_amount')
      .eq('year_month', yearMonth);

    const { data: tempExpenses } = await client
      .from('temporary_expenses')
      .select('id, payer, amount, beneficiaries, settled, expense_type')
      .eq('year_month', yearMonth)
      .eq('settled', false);

    const result = calculateSettlement(monthlyExpenses || [], tempExpenses || [], ['めぐみ', '涼介']);

    if (result.transfers.length === 0 || !shouldCreateSettlement(result.transfers[0].amount)) {
      showToast('精算額が0円のため精算不要です');
      if (btn) btn.disabled = false;
      return;
    }

    const transfer = result.transfers[0];
    const tempIds = (tempExpenses || []).map(t => t.id);

    const { data: settlementId, error } = await client.rpc('execute_monthly_settlement', {
      p_year_month: yearMonth,
      p_payer_from: transfer.from,
      p_payer_to: transfer.to,
      p_amount: transfer.amount,
      p_temporary_expense_ids: tempIds
    });

    if (error) throw error;

    // 精算確定=支払い完了なので即paidに更新
    if (settlementId) {
      await client.from('settlement_history').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', settlementId);
    }

    showToast('精算を確定しました');
    logSettlementAction('settlement_confirm', 'monthly_settlement', `${transfer.from}→${transfer.to}: ${transfer.amount.toLocaleString()}円 確定`, yearMonth);

    // Discord通知
    notifyDiscord(`✅ **月次精算確定** (${yearMonth})\n${transfer.from} → ${transfer.to}: ${transfer.amount.toLocaleString()}円`);
    // Push通知
    queuePushNotification('✅ 月次精算確定', `${yearMonth} の精算が確定しました。${transfer.from}→${transfer.to} ${transfer.amount.toLocaleString()}円`, 'all');

    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Execute monthly settlement error:', err);
    if (btn) btn.disabled = false;
    if (err.message && err.message.includes('Already settled')) {
      showToast('この月は既に精算済みです');
    } else {
      showToast('精算確定に失敗しました');
    }
  }
}

async function executeAdditionalSettlement(yearMonth) {
  if (!confirm('追加精算を確定しますか？')) return;

  const btn = document.getElementById('btn-execute-monthly');
  if (btn) btn.disabled = true;

  try {
    const { data: tempExpenses } = await client
      .from('temporary_expenses')
      .select('id, payer, amount, beneficiaries, settled, expense_type')
      .eq('year_month', yearMonth)
      .eq('settled', false);

    const result = calculateSettlement([], tempExpenses || [], ['めぐみ', '涼介']);

    if (result.transfers.length === 0 || !shouldCreateSettlement(result.transfers[0].amount)) {
      showToast('追加精算額が0円のため精算不要です');
      if (btn) btn.disabled = false;
      return;
    }

    const transfer = result.transfers[0];
    const tempIds = (tempExpenses || []).map(t => t.id);

    const { error } = await client.rpc('execute_monthly_settlement', {
      p_year_month: yearMonth,
      p_payer_from: transfer.from,
      p_payer_to: transfer.to,
      p_amount: transfer.amount,
      p_temporary_expense_ids: tempIds
    });

    if (error) throw error;

    // 精算確定=支払い完了なので最新レコードをpaidに更新
    const { data: latestRecord } = await client
      .from('settlement_history')
      .select('id')
      .eq('target_period', yearMonth)
      .eq('settlement_type', 'monthly')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestRecord) {
      await client.from('settlement_history').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', latestRecord.id);
    }

    showToast('追加精算を確定しました');
    logSettlementAction('settlement_confirm', 'monthly_settlement', `追加精算 ${transfer.from}→${transfer.to}: ${transfer.amount.toLocaleString()}円 確定`, yearMonth);

    // Discord通知
    notifyDiscord(`✅ **追加精算確定** (${yearMonth})\n${transfer.from} → ${transfer.to}: ${transfer.amount.toLocaleString()}円`);
    // Push通知
    queuePushNotification('✅ 追加精算確定', `${yearMonth} の追加精算が確定しました。${transfer.from}→${transfer.to} ${transfer.amount.toLocaleString()}円`, 'all');

    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Execute additional settlement error:', err);
    if (btn) btn.disabled = false;
    showToast('追加精算確定に失敗しました');
  }
}

async function markSettlementPaid(id) {
  try {
    const { error } = await client
      .from('settlement_history')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    showToast('支払い完了にしました');
    loadMonthlySettlement(currentMonthlyYearMonth);
  } catch (err) {
    console.error('Mark paid error:', err);
    showToast('更新に失敗しました');
  }
}

async function editSettlementMemo(id) {
  // Fetch current memo from DB to avoid HTML escaping issues
  const { data: record } = await client
    .from('settlement_history')
    .select('memo')
    .eq('id', id)
    .maybeSingle();
  const currentMemo = record ? record.memo || '' : '';
  const memo = prompt('メモを入力してください:', currentMemo);
  if (memo === null) return;
  try {
    const { error } = await client
      .from('settlement_history')
      .update({ memo: memo || null })
      .eq('id', id);
    if (error) throw error;
    showToast('メモを更新しました');
    loadMonthlySettlement(currentMonthlyYearMonth);
  } catch (err) {
    console.error('Edit memo error:', err);
    showToast('更新に失敗しました');
  }
}

// 精算機能の開始年月（これ以前には遡れない）
const SETTLEMENT_START_MONTH = '2026-06';

function prevMonth(ym) {
  if (ym <= SETTLEMENT_START_MONTH) return SETTLEMENT_START_MONTH;
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

// ========== Temporary Expenses ==========
function renderTemporaryExpensesList(tempExpenses, isMonthSettled) {
  if (!tempExpenses || tempExpenses.length === 0) {
    return '<div style="color:#888;text-align:center;padding:12px;">一時立替はありません</div>';
  }
  let html = '<ul style="list-style:none;padding:0;">';
  for (const t of tempExpenses) {
    const settledBadge = t.settled ? '<span style="background:#4caf50;color:#fff;border-radius:4px;padding:2px 6px;font-size:0.75em;margin-left:6px;">精算済</span>' : '';
    html += `<li style="padding:10px 0;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">`;
    html += `<div>`;
    html += `<div style="font-weight:600;">${escapeHtml(t.title)} ${settledBadge}</div>`;
    html += `<div style="color:#666;font-size:0.9em;">${escapeHtml(t.payer)}が${t.beneficiaries && t.beneficiaries.length === 1 ? escapeHtml(t.beneficiaries[0]) + 'の分' : 'みんなの分'}を立替 / ${formatAmount(t.amount)}${t.note ? ' / ' + escapeHtml(t.note) : ''}</div>`;
    html += `</div>`;
    if (!t.settled) {
      html += `<div style="display:flex;gap:6px;">`;
      html += `<button class="btn-secondary" style="padding:4px 10px;font-size:0.8em;" onclick="showTemporaryExpenseModal('${t.id}')">編集</button>`;
      html += `<button class="btn-secondary" style="padding:4px 10px;font-size:0.8em;color:#d32f2f;border-color:#d32f2f;" onclick="deleteTemporaryExpense('${t.id}')">削除</button>`;
      html += `</div>`;
    }
    html += `</li>`;
  }
  html += '</ul>';
  return html;
}

async function loadTemporaryExpenses(yearMonth) {
  // This is called within the monthly settlement context.
  // Re-render the monthly settlement tab.
  loadMonthlySettlement(yearMonth);
}

async function showTemporaryExpenseModal(id, yearMonth) {
  let existing = null;
  if (id) {
    const { data, error } = await client
      .from('temporary_expenses')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) { showToast('データ取得に失敗しました'); return; }
    existing = data;
    if (existing && !canEditTemporaryExpense(existing)) {
      showToast('精算済みのため変更できません');
      return;
    }
  }

  const ym = existing ? existing.year_month : (yearMonth || currentMonthlyYearMonth);
  const existingBeneficiaries = existing && existing.beneficiaries ? existing.beneficiaries : ['めぐみ', '涼介'];
  const megumiBenef = existingBeneficiaries.includes('めぐみ');
  const ryosukeBenef = existingBeneficiaries.includes('涼介');

  const modal = document.createElement('div');
  modal.id = 'temp-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:400px;max-height:90vh;overflow-y:auto;">
      <h3 style="margin-bottom:16px;">${existing ? '編集' : '追加'}</h3>
      <div id="temp-errors" style="color:#d32f2f;margin-bottom:12px;font-size:0.9em;"></div>
      <div style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">種別</span>
        <input id="temp-expense-type" type="hidden" value="${existing && existing.expense_type === 'subsidy' ? 'subsidy' : 'expense'}">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="expense-type-btn" data-value="expense" style="flex:1;padding:10px;border:2px solid ${!existing || existing.expense_type !== 'subsidy' ? '#1565c0' : '#ddd'};border-radius:8px;background:${!existing || existing.expense_type !== 'subsidy' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">🧾 立替金</button>
          <button type="button" class="expense-type-btn" data-value="subsidy" style="flex:1;padding:10px;border:2px solid ${existing && existing.expense_type === 'subsidy' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.expense_type === 'subsidy' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">💰 補助金</button>
        </div>
      </div>
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">タイトル</span>
        <input id="temp-title" type="text" value="${existing ? escapeHtml(existing.title) : ''}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;" id="temp-payer-label">${existing && existing.expense_type === 'subsidy' ? '受取人' : '支払担当者'}</span>
        <input id="temp-payer" type="hidden" value="${existing ? escapeHtml(existing.payer) : ''}">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="payer-btn" data-target="temp-payer" data-value="めぐみ" style="flex:1;padding:10px;border:2px solid ${existing && existing.payer === 'めぐみ' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.payer === 'めぐみ' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">めぐみ</button>
          <button type="button" class="payer-btn" data-target="temp-payer" data-value="涼介" style="flex:1;padding:10px;border:2px solid ${existing && existing.payer === '涼介' ? '#1565c0' : '#ddd'};border-radius:8px;background:${existing && existing.payer === '涼介' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">涼介</button>
        </div>
      </div>
      <div style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">誰の分？</span>
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="beneficiary-btn" data-value="めぐみ" style="flex:1;padding:10px;border:2px solid ${megumiBenef ? '#43a047' : '#ddd'};border-radius:8px;background:${megumiBenef ? '#e8f5e9' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">めぐみ</button>
          <button type="button" class="beneficiary-btn" data-value="涼介" style="flex:1;padding:10px;border:2px solid ${ryosukeBenef ? '#43a047' : '#ddd'};border-radius:8px;background:${ryosukeBenef ? '#e8f5e9' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">涼介</button>
        </div>
      </div>
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">金額（円）</span>
        <input id="temp-amount" type="number" min="1" value="${existing ? existing.amount : ''}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">年月</span>
        <input id="temp-yearmonth" type="month" value="${ym}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <label style="display:block;margin-bottom:16px;">
        <span style="font-weight:600;">メモ（任意）</span>
        <input id="temp-note" type="text" value="${existing && existing.note ? escapeHtml(existing.note) : ''}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:flex;gap:12px;">
        <button class="btn-primary" style="flex:1;" onclick="saveTemporaryExpense(${existing ? "'" + existing.id + "'" : 'null'})">${existing ? '更新' : '追加'}</button>
        <button class="btn-secondary" style="flex:1;" onclick="closeTempModal()">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeTempModal(); });
  // 種別ボタン
  modal.querySelectorAll('.expense-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('temp-expense-type').value = btn.dataset.value;
      modal.querySelectorAll('.expense-type-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
      // ラベル切り替え
      const label = document.getElementById('temp-payer-label');
      if (label) label.textContent = btn.dataset.value === 'subsidy' ? '受取人' : '支払担当者';
    });
  });
  modal.querySelectorAll('.payer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      target.value = btn.dataset.value;
      btn.parentElement.querySelectorAll('.payer-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
    });
  });
  // 受益者ボタン（トグル式：複数選択可、最低1人）
  modal.querySelectorAll('.beneficiary-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.style.borderColor === 'rgb(67, 160, 71)';
      const allBtns = modal.querySelectorAll('.beneficiary-btn');
      const activeCount = [...allBtns].filter(b => b.style.borderColor === 'rgb(67, 160, 71)').length;
      if (isActive && activeCount <= 1) {
        showToast('少なくとも1人は選択してください');
        return;
      }
      if (isActive) {
        btn.style.borderColor = '#ddd';
        btn.style.background = '#fff';
      } else {
        btn.style.borderColor = '#43a047';
        btn.style.background = '#e8f5e9';
      }
    });
  });
}

function closeTempModal() {
  const modal = document.getElementById('temp-modal');
  if (modal) modal.remove();
}

async function saveTemporaryExpense(id) {
  const title = document.getElementById('temp-title').value;
  const payer = document.getElementById('temp-payer').value;
  const amount = parseInt(document.getElementById('temp-amount').value, 10);
  const yearMonth = document.getElementById('temp-yearmonth').value;
  const note = document.getElementById('temp-note').value || null;
  const expenseType = document.getElementById('temp-expense-type').value || 'expense';

  // 受益者ボタンから選択状態を読み取る
  const modal = document.getElementById('temp-modal');
  const beneficiaries = [];
  modal.querySelectorAll('.beneficiary-btn').forEach(btn => {
    if (btn.style.borderColor === 'rgb(67, 160, 71)') {
      beneficiaries.push(btn.dataset.value);
    }
  });

  const data = { title, payer, amount: isNaN(amount) ? 0 : amount, year_month: yearMonth, beneficiaries, note };
  const validation = validateTemporaryExpense(data);
  if (!validation.valid) {
    document.getElementById('temp-errors').innerHTML = validation.errors.map(e => '<div>' + escapeHtml(e) + '</div>').join('');
    return;
  }

  try {
    if (id) {
      const { error } = await client
        .from('temporary_expenses')
        .update({ title: title.trim(), payer: payer.trim(), amount, year_month: yearMonth, beneficiaries, note, expense_type: expenseType })
        .eq('id', id);
      if (error) throw error;
      showToast(expenseType === 'subsidy' ? '補助金を更新しました' : '立替金を更新しました');
      logSettlementAction('temp_edit', 'temporary_expense', `${title.trim()} (${payer}) ${amount.toLocaleString()}円 編集`, yearMonth, id);
    } else {
      const { error } = await client
        .from('temporary_expenses')
        .insert({ title: title.trim(), payer: payer.trim(), amount, year_month: yearMonth, beneficiaries, note, expense_type: expenseType });
      if (error) throw error;
      showToast(expenseType === 'subsidy' ? '補助金を追加しました' : '立替金を追加しました');
      logSettlementAction('temp_add', 'temporary_expense', `${title.trim()} (${payer}) ${amount.toLocaleString()}円 追加`, yearMonth);
    }
    closeTempModal();
    loadMonthlySettlement(currentMonthlyYearMonth);
  } catch (err) {
    console.error('Save temporary expense error:', err);
    showToast('保存に失敗しました');
  }
}

async function deleteTemporaryExpense(id) {
  // Check if editable
  const { data: exp } = await client
    .from('temporary_expenses')
    .select('settled')
    .eq('id', id)
    .maybeSingle();
  if (exp && !canDeleteTemporaryExpense(exp)) {
    showToast('精算済みのため削除できません');
    return;
  }
  if (!confirm('この立替金を削除しますか？')) return;

  try {
    const { error } = await client
      .from('temporary_expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    showToast('立替金を削除しました');
    logSettlementAction('temp_delete', 'temporary_expense', `立替金削除`, currentMonthlyYearMonth, id);
    loadMonthlySettlement(currentMonthlyYearMonth);
  } catch (err) {
    console.error('Delete temporary expense error:', err);
    showToast('削除に失敗しました');
  }
}

// ========== Difference Management ==========
async function loadDifferenceManagement() {
  const container = document.getElementById('tab-difference');
  container.innerHTML = '<div class="loading">読み込み中...</div>';

  try {
    // Get half_year monthly expenses (all, not just unsettled for display)
    const { data: expenses, error } = await client
      .from('monthly_expenses')
      .select('id, year_month, expense_master_id, payer, planned_amount, actual_amount, difference, difference_settled, expense_master:expense_master_id(name, settlement_cycle)')
      .order('year_month', { ascending: false });
    if (error) throw error;

    // Filter to half_year items only
    const halfYearExpenses = (expenses || []).filter(e => e.expense_master && e.expense_master.settlement_cycle === 'half_year');

    let html = '';
    html += '<h3 style="margin-bottom:16px;">📈 差額管理（半年精算項目）</h3>';

    if (halfYearExpenses.length === 0) {
      html += '<div class="empty-state"><div class="emoji">📈</div><div>半年精算の項目はありません</div></div>';
      container.innerHTML = html;
      return;
    }

    // Group by expense_master_id for accumulated view
    const grouped = {};
    for (const exp of halfYearExpenses) {
      const key = exp.expense_master_id;
      if (!grouped[key]) {
        grouped[key] = { name: exp.expense_master ? exp.expense_master.name : (exp.name || '(手動追加)'), payer: exp.payer, records: [] };
      }
      grouped[key].records.push(exp);
    }

    // Accumulated difference for unsettled items
    const unsettled = halfYearExpenses.filter(e => !e.difference_settled);
    const accumulated = calculateAccumulatedDifference(unsettled);

    // Show accumulated summary
    html += '<div class="card">';
    html += '<h4 style="margin-bottom:8px;">累積差額（未精算分）</h4>';
    const payers = Object.keys(accumulated);
    if (payers.length > 0) {
      for (const payer of payers) {
        const val = accumulated[payer];
        const color = val > 0 ? '#d32f2f' : val < 0 ? '#2e7d32' : '#333';
        html += `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${escapeHtml(payer)}</span><span style="color:${color};font-weight:600;">${val >= 0 ? '+' : ''}${formatAmount(val)}</span></div>`;
      }
    } else {
      html += '<div style="color:#888;">累積差額はありません</div>';
    }
    html += '</div>';

    // List each item with actual amount input
    for (const [masterId, group] of Object.entries(grouped)) {
      html += `<div class="card">`;
      html += `<h4 style="margin-bottom:8px;">${escapeHtml(group.name)} (${escapeHtml(group.payer)})</h4>`;
      html += '<table style="width:100%;font-size:0.9em;border-collapse:collapse;">';
      html += '<thead><tr style="border-bottom:2px solid #ddd;"><th style="text-align:left;padding:4px;">年月</th><th style="text-align:right;padding:4px;">基準額</th><th style="text-align:right;padding:4px;">実費</th><th style="text-align:right;padding:4px;">差額</th></tr></thead>';
      html += '<tbody>';
      for (const rec of group.records) {
        const diff = calculateDifference(rec.actual_amount, rec.planned_amount);
        const diffColor = diff > 0 ? '#d32f2f' : diff < 0 ? '#2e7d32' : '#888';
        const diffText = rec.actual_amount != null ? ((diff >= 0 ? '+' : '') + formatAmount(diff)) : '-';
        const settledBadge = rec.difference_settled ? ' <span style="font-size:0.75em;color:#4caf50;">✓精算済</span>' : '';
        const disabled = rec.difference_settled ? 'disabled style="background:#f5f5f5;"' : '';

        html += `<tr style="border-bottom:1px solid #f0f0f0;">`;
        html += `<td style="padding:6px 4px;">${rec.year_month}${settledBadge}</td>`;
        html += `<td style="text-align:right;padding:6px 4px;">${formatAmount(rec.planned_amount)}</td>`;
        html += `<td style="text-align:right;padding:6px 4px;">`;
        if (rec.difference_settled) {
          html += `<span style="font-size:0.95em;">${rec.actual_amount != null ? formatAmount(rec.actual_amount) : '-'}</span>`;
        } else if (rec.actual_amount != null) {
          html += `<span id="actual-display-${rec.id}" style="font-size:0.95em;">${formatAmount(rec.actual_amount)} <button class="btn-secondary" style="padding:2px 8px;font-size:0.75em;" onclick="enableActualEdit('${rec.id}', ${rec.planned_amount})">✏️</button></span>`;
          html += `<input id="actual-input-${rec.id}" type="number" value="${rec.actual_amount}" data-id="${rec.id}" data-planned="${rec.planned_amount}" onchange="onActualAmountChange(this)" style="display:none;width:80px;padding:4px;border:1px solid #ddd;border-radius:4px;text-align:right;font-size:0.95em;-moz-appearance:textfield;" onkeydown="if(event.key==='Enter')this.blur()">`;
        } else {
          html += `<input type="number" value="" placeholder="未入力" data-id="${rec.id}" data-planned="${rec.planned_amount}" onchange="onActualAmountChange(this)" style="width:80px;padding:4px;border:1px solid #ddd;border-radius:4px;text-align:right;font-size:0.95em;-moz-appearance:textfield;">`;
        }
        html += `</td>`;
        html += `<td style="text-align:right;padding:6px 4px;color:${diffColor};font-weight:600;" id="diff-${rec.id}">${diffText}</td>`;
        html += `</tr>`;
      }
      html += '</tbody></table>';
      html += '</div>';
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Difference management load error:', err);
    container.innerHTML = '<div class="card"><div style="color:#d32f2f;">データの取得に失敗しました</div><button class="btn-secondary" style="margin-top:12px;" onclick="loadDifferenceManagement()">リトライ</button></div>';
    showToast('データの取得に失敗しました');
  }
}

function enableActualEdit(id, planned) {
  const display = document.getElementById('actual-display-' + id);
  const input = document.getElementById('actual-input-' + id);
  if (display && input) {
    display.style.display = 'none';
    input.style.display = 'inline-block';
    input.focus();
    input.select();
  }
}

async function onActualAmountChange(input) {
  const id = input.dataset.id;
  const planned = parseInt(input.dataset.planned, 10);
  const value = input.value.trim();
  const actualAmount = value === '' ? null : parseInt(value, 10);

  // Save to DB
  try {
    const { error } = await client
      .from('monthly_expenses')
      .update({ actual_amount: actualAmount })
      .eq('id', id);
    if (error) throw error;
    // 操作ログ
    const container = document.getElementById('tab-diff-settlement');
    let logYm = null;
    if (container && container.classList.contains('active')) {
      const monthHeader = container.querySelector('h3');
      const match = monthHeader && monthHeader.textContent.match(/(\d{4}-\d{2})/);
      if (match) logYm = match[1];
    }
    logSettlementAction('actual_amount_edit', 'monthly_expense', `実費 ${actualAmount != null ? actualAmount.toLocaleString() + '円' : '未入力'} に変更`, logYm, id);
    // ページを自動更新して精算結果を再計算
    if (container && container.classList.contains('active')) {
      const monthHeader = container.querySelector('h3');
      const match = monthHeader && monthHeader.textContent.match(/(\d{4}-\d{2})/);
      if (match) {
        loadDifferenceSettlement(match[1]);
      }
    }
  } catch (err) {
    console.error('Save actual amount error:', err);
    showToast('保存に失敗しました');
  }
}

// ========== Difference Settlement ==========
async function loadDifferenceSettlement(year, period) {
  // period引数は互換性のため残すが、yearMonthベースに変更
  // year が YYYY-MM形式の文字列ならそのまま使う、それ以外は現在月
  let yearMonth;
  if (typeof year === 'string' && year.match(/^\d{4}-\d{2}$/)) {
    yearMonth = year;
  } else {
    yearMonth = getCurrentYearMonth();
  }
  if (yearMonth < SETTLEMENT_START_MONTH) yearMonth = SETTLEMENT_START_MONTH;

  const container = document.getElementById('tab-diff-settlement');
  container.innerHTML = '<div class="loading">読み込み中...</div>';

  try {
    const targetPeriod = yearMonth;

    // Check if already settled for this month
    const { data: existingSettlement } = await client
      .from('settlement_history')
      .select('id, status, payer_from, payer_to, amount, memo, created_at')
      .eq('target_period', targetPeriod)
      .eq('settlement_type', 'difference')
      .maybeSingle();

    const isSettled = !!existingSettlement;

    // Get half_year expenses for this month
    const { data: expenses, error } = await client
      .from('monthly_expenses')
      .select('id, year_month, expense_master_id, payer, planned_amount, actual_amount, difference, difference_settled, expense_master:expense_master_id(name, settlement_cycle, base_amount)')
      .eq('year_month', yearMonth)
      .order('created_at', { ascending: true });
    if (error) throw error;

    // Filter to half_year items only
    const halfYearExpenses = (expenses || []).filter(e => e.expense_master && e.expense_master.settlement_cycle === 'half_year');

    // Calculate difference settlement
    const result = calculateDifferenceSettlement(halfYearExpenses, ['めぐみ', '涼介']);

    // Render
    let html = '';

    // Month selector
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
    const prevDisabled = yearMonth <= SETTLEMENT_START_MONTH ? 'disabled style="padding:8px 12px;opacity:0.3;cursor:not-allowed;"' : 'style="padding:8px 12px;"';
    html += `<button class="btn-secondary" ${prevDisabled} onclick="loadDifferenceSettlement('${prevMonth(yearMonth)}')">◀</button>`;
    html += `<h3 style="margin:0;">🔄 ${yearMonth} の差額精算</h3>`;
    html += `<button class="btn-secondary" style="padding:8px 12px;" onclick="loadDifferenceSettlement('${nextMonth(yearMonth)}')">▶</button>`;
    html += '</div>';

    // Already settled notice
    if (isSettled) {
      html += `<div class="card" style="background:#e8f5e9;border:1px solid #a5d6a7;">`;
      html += `<div style="color:#2e7d32;font-weight:600;">✅ 差額精算済み</div>`;
      html += `<div style="margin-top:4px;">${escapeHtml(existingSettlement.payer_from)} → ${escapeHtml(existingSettlement.payer_to)}: ${formatAmount(existingSettlement.amount)}</div>`;
      html += `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">`;
      html += `<button class="btn-secondary" style="padding:8px 16px;font-size:0.9em;color:#d32f2f;border-color:#d32f2f;" onclick="revertDifferenceSettlement('${existingSettlement.id}', '${yearMonth}')">⏪ 精算取消</button>`;
      html += `</div>`;
      html += '</div>';
    }

    // Difference list with actual amount input
    html += '<div class="card">';
    html += '<h4 style="margin-bottom:8px;">差額一覧</h4>';
    if (halfYearExpenses.length === 0) {
      html += '<div style="color:#888;">対象月に半年精算項目はありません</div>';
    } else {
      html += '<table style="width:100%;font-size:0.9em;border-collapse:collapse;">';
      html += '<thead><tr style="border-bottom:2px solid #ddd;"><th style="text-align:left;padding:4px;">項目</th><th style="text-align:left;padding:4px;">支払者</th><th style="text-align:right;padding:4px;">基準額</th><th style="text-align:right;padding:4px;">実費</th><th style="text-align:right;padding:4px;">差額</th></tr></thead>';
      html += '<tbody>';
      for (const exp of halfYearExpenses) {
        const name = exp.expense_master ? exp.expense_master.name : '(不明)';
        const diff = calculateDifference(exp.actual_amount, exp.planned_amount);
        const diffColor = diff > 0 ? '#d32f2f' : diff < 0 ? '#2e7d32' : '#888';
        html += `<tr style="border-bottom:1px solid #f0f0f0;">`;
        html += `<td style="padding:4px;">${escapeHtml(name)}</td>`;
        html += `<td style="padding:4px;">${escapeHtml(exp.payer)}</td>`;
        html += `<td style="text-align:right;padding:4px;">${formatAmount(exp.planned_amount)}</td>`;
        html += `<td style="text-align:right;padding:4px;">`;
        if (exp.difference_settled) {
          html += `<span style="font-size:0.95em;">${exp.actual_amount != null ? formatAmount(exp.actual_amount) : '-'}</span>`;
        } else if (exp.actual_amount != null) {
          html += `<span id="actual-display-${exp.id}" style="font-size:0.95em;">${formatAmount(exp.actual_amount)} <button class="btn-secondary" style="padding:2px 8px;font-size:0.75em;" onclick="enableActualEdit('${exp.id}', ${exp.planned_amount})">✏️</button></span>`;
          html += `<input id="actual-input-${exp.id}" type="number" value="${exp.actual_amount}" data-id="${exp.id}" data-planned="${exp.planned_amount}" onchange="onActualAmountChange(this)" style="display:none;width:80px;padding:4px;border:1px solid #ddd;border-radius:4px;text-align:right;font-size:0.95em;-moz-appearance:textfield;" onkeydown="if(event.key==='Enter')this.blur()">`;
        } else {
          html += `<input type="number" value="" placeholder="未入力" data-id="${exp.id}" data-planned="${exp.planned_amount}" onchange="onActualAmountChange(this)" style="width:80px;padding:4px;border:1px solid #ddd;border-radius:4px;text-align:right;font-size:0.95em;-moz-appearance:textfield;">`;
        }
        html += `</td>`;
        html += `<td style="text-align:right;padding:4px;color:${diffColor};font-weight:600;" id="diff-${exp.id}">${exp.actual_amount != null ? ((diff >= 0 ? '+' : '') + formatAmount(diff)) : '-'}</td>`;
        html += `</tr>`;
      }
      html += '</tbody></table>';
    }
    html += '</div>';

    // Settlement calculation result
    html += '<div class="card" style="background:#e3f2fd;">';
    html += '<h4 style="margin-bottom:8px;">差額精算結果</h4>';
    const diffPayers = Object.keys(result.payerDiffs);
    for (const payer of diffPayers) {
      const val = result.payerDiffs[payer];
      const color = val > 0 ? '#d32f2f' : val < 0 ? '#2e7d32' : '#333';
      html += `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${escapeHtml(payer)} 差額</span><span style="color:${color};font-weight:600;">${val >= 0 ? '+' : ''}${formatAmount(val)}</span></div>`;
    }
    if (result.transfers.length > 0) {
      const t = result.transfers[0];
      html += `<div style="margin-top:12px;padding:12px;background:#fff;border-radius:8px;text-align:center;font-size:1.1em;font-weight:700;">`;
      html += `${escapeHtml(t.from)} → ${escapeHtml(t.to)}: ${formatAmount(t.amount)}`;
      html += `</div>`;
    } else {
      html += `<div style="margin-top:12px;text-align:center;color:#888;">差額精算不要（差額0円）</div>`;
    }
    html += '</div>';

    // Execute button
    if (!isSettled) {
      const canSettle = result.transfers.length > 0 && result.transfers[0].amount > 0;
      html += '<div style="text-align:center;margin:16px 0;">';
      if (canSettle) {
        html += `<button class="btn-primary" id="btn-execute-diff" onclick="executeDifferenceSettlementMonthly('${yearMonth}')">差額精算を確定する</button>`;
      } else {
        html += `<button class="btn-primary" disabled style="opacity:0.5;cursor:not-allowed;">差額が0円のため精算不要です</button>`;
      }
      html += '</div>';
    }

    // 操作履歴
    const auditLogs = await loadAuditLog(yearMonth);
    html += renderAuditLog(auditLogs);

    container.innerHTML = html;
  } catch (err) {
    console.error('Difference settlement load error:', err);
    container.innerHTML = '<div class="card"><div style="color:#d32f2f;">データの取得に失敗しました</div><button class="btn-secondary" style="margin-top:12px;" onclick="loadDifferenceSettlement(\'' + yearMonth + '\')">リトライ</button></div>';
    showToast('データの取得に失敗しました');
  }
}

async function executeDifferenceSettlement(year, period) {
  if (!confirm('差額精算を確定しますか？')) return;

  const btn = document.getElementById('btn-execute-diff');
  if (btn) btn.disabled = true;

  try {
    const periodMonths = getPeriodMonths(year, period);

    // Get target expenses
    const { data: expenses, error: fetchErr } = await client
      .from('monthly_expenses')
      .select('id, payer, planned_amount, actual_amount, difference, expense_master:expense_master_id(settlement_cycle)')
      .in('year_month', periodMonths)
      .eq('difference_settled', false);
    if (fetchErr) throw fetchErr;

    const halfYearExpenses = (expenses || []).filter(e => e.expense_master && e.expense_master.settlement_cycle === 'half_year');
    const result = calculateDifferenceSettlement(halfYearExpenses, ['めぐみ', '涼介']);

    if (result.transfers.length === 0 || !shouldCreateSettlement(result.transfers[0].amount)) {
      showToast('差額が0円のため精算不要です');
      if (btn) btn.disabled = false;
      return;
    }

    const transfer = result.transfers[0];
    const expenseIds = halfYearExpenses.map(e => e.id);

    const { data: settlementId, error } = await client.rpc('execute_difference_settlement', {
      p_year: String(year),
      p_period: period,
      p_payer_from: transfer.from,
      p_payer_to: transfer.to,
      p_amount: transfer.amount,
      p_monthly_expense_ids: expenseIds
    });

    if (error) throw error;

    showToast('差額精算を確定しました');

    // Discord通知
    const periodLabel = period === 'first_half' ? '上半期' : '下半期';
    notifyDiscord(`✅ **差額精算確定** (${year}年${periodLabel})\n${transfer.from} → ${transfer.to}: ${transfer.amount.toLocaleString()}円`);
    // Push通知
    queuePushNotification('✅ 差額精算確定', `${year}年${periodLabel}の差額精算が確定しました。${transfer.from}→${transfer.to} ${transfer.amount.toLocaleString()}円`, 'all');

    loadDifferenceSettlement(year, period);
  } catch (err) {
    console.error('Execute difference settlement error:', err);
    if (btn) btn.disabled = false;
    if (err.message && err.message.includes('Already settled')) {
      showToast('この期間は既に差額精算済みです');
    } else {
      showToast('差額精算確定に失敗しました');
    }
  }
}

async function executeDifferenceSettlementMonthly(yearMonth) {
  if (!confirm(`${yearMonth} の差額精算を確定しますか？`)) return;

  const btn = document.getElementById('btn-execute-diff');
  if (btn) btn.disabled = true;

  try {
    // Get target expenses for this month
    const { data: expenses, error: fetchErr } = await client
      .from('monthly_expenses')
      .select('id, payer, planned_amount, actual_amount, difference, expense_master:expense_master_id(settlement_cycle)')
      .eq('year_month', yearMonth)
      .eq('difference_settled', false);
    if (fetchErr) throw fetchErr;

    const halfYearExpenses = (expenses || []).filter(e => e.expense_master && e.expense_master.settlement_cycle === 'half_year');
    const result = calculateDifferenceSettlement(halfYearExpenses, ['めぐみ', '涼介']);

    if (result.transfers.length === 0 || !shouldCreateSettlement(result.transfers[0].amount)) {
      showToast('差額が0円のため精算不要です');
      if (btn) btn.disabled = false;
      return;
    }

    const transfer = result.transfers[0];
    const expenseIds = halfYearExpenses.map(e => e.id);

    const { data: settlementId, error } = await client.rpc('execute_difference_settlement_monthly', {
      p_year_month: yearMonth,
      p_payer_from: transfer.from,
      p_payer_to: transfer.to,
      p_amount: transfer.amount,
      p_monthly_expense_ids: expenseIds
    });

    if (error) throw error;

    showToast('差額精算を確定しました');
    logSettlementAction('settlement_confirm', 'difference_settlement', `${transfer.from}→${transfer.to}: ${transfer.amount.toLocaleString()}円 差額精算確定`, yearMonth);

    // Discord通知
    notifyDiscord(`✅ **差額精算確定** (${yearMonth})\n${transfer.from} → ${transfer.to}: ${transfer.amount.toLocaleString()}円`);
    // Push通知
    queuePushNotification('✅ 差額精算確定', `${yearMonth}の差額精算が確定しました。${transfer.from}→${transfer.to} ${transfer.amount.toLocaleString()}円`, 'all');

    loadDifferenceSettlement(yearMonth);
  } catch (err) {
    console.error('Execute difference settlement monthly error:', err);
    if (btn) btn.disabled = false;
    if (err.message && err.message.includes('Already settled')) {
      showToast('この月は既に差額精算済みです');
    } else {
      showToast('差額精算確定に失敗しました');
    }
  }
}

async function markSettlementPaidDiff(id) {
  try {
    const { error } = await client
      .from('settlement_history')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    showToast('支払い完了にしました');
    loadDifferenceSettlement(currentDiffYear, currentDiffPeriod);
  } catch (err) {
    console.error('Mark paid error:', err);
    showToast('更新に失敗しました');
  }
}

// ========== Monthly Expense CRUD (個別編集) ==========
async function showMonthlyExpenseEditModal(id) {
  const { data: exp, error } = await client
    .from('monthly_expenses')
    .select('id, year_month, expense_master_id, payer, planned_amount, name, expense_master:expense_master_id(name)')
    .eq('id', id)
    .maybeSingle();
  if (error || !exp) { showToast('データ取得に失敗しました'); return; }

  const displayName = exp.expense_master ? exp.expense_master.name : (exp.name || '(手動追加)');
  const isManual = !exp.expense_master_id;

  const modal = document.createElement('div');
  modal.id = 'me-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:400px;">
      <h3 style="margin-bottom:16px;">固定費項目を編集</h3>
      ${isManual ? `
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">項目名</span>
        <input id="me-name" type="text" value="${escapeHtml(exp.name || '')}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>` : `
      <div style="margin-bottom:12px;color:#666;font-size:0.9em;">${escapeHtml(displayName)} (${exp.year_month})</div>`}
      <div style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">支払担当者</span>
        <input id="me-payer" type="hidden" value="${escapeHtml(exp.payer)}">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="payer-btn" data-target="me-payer" data-value="めぐみ" style="flex:1;padding:10px;border:2px solid ${exp.payer === 'めぐみ' ? '#1565c0' : '#ddd'};border-radius:8px;background:${exp.payer === 'めぐみ' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">めぐみ</button>
          <button type="button" class="payer-btn" data-target="me-payer" data-value="涼介" style="flex:1;padding:10px;border:2px solid ${exp.payer === '涼介' ? '#1565c0' : '#ddd'};border-radius:8px;background:${exp.payer === '涼介' ? '#e3f2fd' : '#fff'};font-size:1em;font-weight:600;cursor:pointer;">涼介</button>
        </div>
      </div>
      <label style="display:block;margin-bottom:16px;">
        <span style="font-weight:600;">金額（円）</span>
        <input id="me-amount" type="number" min="0" value="${exp.planned_amount}" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:flex;gap:12px;">
        <button class="btn-primary" style="flex:1;" onclick="saveMonthlyExpenseEdit('${exp.id}', ${isManual})">${isManual ? '更新' : '更新'}</button>
        <button class="btn-secondary" style="flex:1;" onclick="closeMonthlyExpenseModal()">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeMonthlyExpenseModal(); });
  modal.querySelectorAll('.payer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      target.value = btn.dataset.value;
      btn.parentElement.querySelectorAll('.payer-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
    });
  });
}

async function showMonthlyExpenseAddModal(yearMonth) {
  const modal = document.createElement('div');
  modal.id = 'me-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:400px;">
      <h3 style="margin-bottom:16px;">固定費項目を追加 (${yearMonth})</h3>
      <div id="me-errors" style="color:#d32f2f;margin-bottom:12px;font-size:0.9em;"></div>
      <label style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">項目名</span>
        <input id="me-name" type="text" placeholder="例: 臨時の修繕費" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:block;margin-bottom:12px;">
        <span style="font-weight:600;">支払担当者</span>
        <input id="me-payer" type="hidden" value="">
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button type="button" class="payer-btn" data-target="me-payer" data-value="めぐみ" style="flex:1;padding:10px;border:2px solid #ddd;border-radius:8px;background:#fff;font-size:1em;font-weight:600;cursor:pointer;">めぐみ</button>
          <button type="button" class="payer-btn" data-target="me-payer" data-value="涼介" style="flex:1;padding:10px;border:2px solid #ddd;border-radius:8px;background:#fff;font-size:1em;font-weight:600;cursor:pointer;">涼介</button>
        </div>
      </div>
      <label style="display:block;margin-bottom:16px;">
        <span style="font-weight:600;">金額（円）</span>
        <input id="me-amount" type="number" min="0" value="" style="display:block;width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-size:1em;">
      </label>
      <div style="display:flex;gap:12px;">
        <button class="btn-primary" style="flex:1;" onclick="saveMonthlyExpenseAdd('${yearMonth}')">追加</button>
        <button class="btn-secondary" style="flex:1;" onclick="closeMonthlyExpenseModal()">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeMonthlyExpenseModal(); });
  modal.querySelectorAll('.payer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      target.value = btn.dataset.value;
      btn.parentElement.querySelectorAll('.payer-btn').forEach(b => {
        b.style.borderColor = '#ddd';
        b.style.background = '#fff';
      });
      btn.style.borderColor = '#1565c0';
      btn.style.background = '#e3f2fd';
    });
  });
}

function onMonthlyExpenseMasterSelect(select) {
  // no longer used
}

function closeMonthlyExpenseModal() {
  const modal = document.getElementById('me-modal');
  if (modal) modal.remove();
}

async function saveMonthlyExpenseEdit(id, isManual) {
  const payer = document.getElementById('me-payer').value;
  const amount = parseInt(document.getElementById('me-amount').value, 10);

  if (!payer) { showToast('支払担当者を選択してください'); return; }
  if (isNaN(amount) || amount < 0) { showToast('有効な金額を入力してください'); return; }

  const updateData = { payer, planned_amount: amount };

  if (isManual) {
    const nameEl = document.getElementById('me-name');
    const name = nameEl ? nameEl.value : '';
    if (!name || name.trim() === '') { showToast('項目名を入力してください'); return; }
    updateData.name = name.trim();
  }

  try {
    const { error } = await client
      .from('monthly_expenses')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
    showToast('更新しました');
    logSettlementAction('monthly_expense_edit', 'monthly_expense', `${payer} ${amount.toLocaleString()}円 に更新`, currentMonthlyYearMonth, id);
    closeMonthlyExpenseModal();
    loadMonthlySettlement(currentMonthlyYearMonth);
  } catch (err) {
    console.error('Save monthly expense edit error:', err);
    showToast('更新に失敗しました');
  }
}

async function saveMonthlyExpenseAdd(yearMonth) {
  const name = document.getElementById('me-name').value;
  const payer = document.getElementById('me-payer').value;
  const amount = parseInt(document.getElementById('me-amount').value, 10);
  const errEl = document.getElementById('me-errors');

  const errors = [];
  if (!name || name.trim() === '') errors.push('項目名を入力してください');
  if (!payer) errors.push('支払担当者を選択してください');
  if (isNaN(amount) || amount < 0) errors.push('有効な金額を入力してください');
  if (errors.length > 0) {
    errEl.innerHTML = errors.map(e => '<div>' + escapeHtml(e) + '</div>').join('');
    return;
  }

  try {
    const { error } = await client
      .from('monthly_expenses')
      .insert({ year_month: yearMonth, payer, planned_amount: amount, name: name.trim() });
    if (error) throw error;
    showToast('固定費項目を追加しました');
    closeMonthlyExpenseModal();
    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Save monthly expense add error:', err);
    showToast('追加に失敗しました');
  }
}

async function deleteMonthlyExpense(id, yearMonth) {
  if (!confirm('この固定費項目を削除しますか？')) return;
  try {
    const { error } = await client
      .from('monthly_expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    showToast('項目を削除しました');
    logSettlementAction('monthly_expense_delete', 'monthly_expense', `固定費項目削除`, yearMonth, id);
    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Delete monthly expense error:', err);
    showToast('削除に失敗しました');
  }
}

// ========== Settlement Revert (精算取消) ==========
async function revertMonthlySettlement(settlementId, yearMonth) {
  if (!confirm('精算を取り消して処理前の状態に戻しますか？\n立替金の精算済みフラグも元に戻ります。')) return;

  try {
    // 取消前に情報を取得（通知用）
    const { data: record } = await client
      .from('settlement_history')
      .select('payer_from, payer_to, amount')
      .eq('id', settlementId)
      .maybeSingle();

    const { error } = await client.rpc('revert_monthly_settlement', {
      p_settlement_id: settlementId
    });

    if (error) throw error;

    showToast('精算を取り消しました');
    logSettlementAction('settlement_revert', 'monthly_settlement', `${record.payer_from}→${record.payer_to}: ${record.amount.toLocaleString()}円 取消`, yearMonth);

    // Discord通知
    const content = `⏪ **月次精算取消** (${yearMonth})\n${record.payer_from} → ${record.payer_to}: ${record.amount.toLocaleString()}円 の精算を取り消しました`;
    notifyDiscord(content);

    // Push通知（両方に通知）
    queuePushNotification(
      '⏪ 精算取消',
      `${yearMonth} の月次精算（${record.payer_from}→${record.payer_to} ${record.amount.toLocaleString()}円）が取り消されました`,
      'all'
    );

    loadMonthlySettlement(yearMonth);
  } catch (err) {
    console.error('Revert monthly settlement error:', err);
    if (err.message && err.message.includes('not found')) {
      showToast('対象の精算が見つかりません');
    } else {
      showToast('精算取消に失敗しました');
    }
  }
}

async function revertDifferenceSettlement(settlementId, yearMonth) {
  if (!confirm('差額精算を取り消して処理前の状態に戻しますか？\n差額精算済みフラグも元に戻ります。')) return;

  try {
    // 取消前に情報を取得（通知用）
    const { data: record } = await client
      .from('settlement_history')
      .select('payer_from, payer_to, amount, target_period')
      .eq('id', settlementId)
      .maybeSingle();

    const { error } = await client.rpc('revert_difference_settlement', {
      p_settlement_id: settlementId
    });

    if (error) throw error;

    showToast('差額精算を取り消しました');
    logSettlementAction('settlement_revert', 'difference_settlement', `${record.payer_from}→${record.payer_to}: ${record.amount.toLocaleString()}円 差額精算取消`, yearMonth);

    // Discord通知
    const content = `⏪ **差額精算取消** (${record.target_period})\n${record.payer_from} → ${record.payer_to}: ${record.amount.toLocaleString()}円 の差額精算を取り消しました`;
    notifyDiscord(content);

    // Push通知（両方に通知）
    queuePushNotification(
      '⏪ 差額精算取消',
      `${record.target_period}の差額精算（${record.payer_from}→${record.payer_to} ${record.amount.toLocaleString()}円）が取り消されました`,
      'all'
    );

    loadDifferenceSettlement(yearMonth);
  } catch (err) {
    console.error('Revert difference settlement error:', err);
    if (err.message && err.message.includes('not found')) {
      showToast('対象の精算が見つかりません');
    } else {
      showToast('差額精算取消に失敗しました');
    }
  }
}

// ========== Init on load ==========
document.addEventListener('DOMContentLoaded', initApp);
