// Main Controller - 漢字50問テスト
// Tasks 9.1-9.5, 10.1, 11.1: ビュー遷移・イベント・モード選択・テスト進行・結果・採点・通知
(function() {
  'use strict';

  // --- Module references ---
  const Registry = window.KanjiRegistry;
  const Engine = window.QuizEngine;
  const Session = window.SessionManager;
  const Grading = window.AdminGrading;
  const Notify = window.NotificationService;
  const Canvas = window.HandwritingCanvas;
  const Storage = window.KanjiStorage;

  // --- State ---
  let currentRangeId = null;
  let currentSession = null;
  let currentInputMode = 'handwriting';
  let currentStrokesMap = {}; // {[questionIndex]: Point[][]}
  let editingRangeId = null; // range-edit-viewで編集中のID（null=新規）
  let rangeEditBackTarget = 'top-view'; // 範囲編集画面の戻り先
  let gradingTestId = null;  // 採点中のPendingTestId
  let gradingQuestionIndex = 0; // 採点中の問題インデックス
  let lastTestResult = null; // 最後のテスト結果（リトライ用）
  let isReviewEditing = false; // 見直しフェーズから再回答中かどうか

  // --- View Routing (Task 9.1) ---

  function showView(viewId) {
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
      views[i].style.display = 'none';
    }
    var target = document.getElementById(viewId);
    if (target) {
      target.style.display = 'block';
    }

    // ビュー表示後のフック
    if (viewId === 'top-view') {
      renderRangeList();
      updatePendingBadge();
    } else if (viewId === 'grading-view') {
      renderGradingTestList();
    }
  }

  // Make showView globally accessible for inline onclick handlers in HTML
  window.showView = showView;

  // --- Range List Rendering (Task 9.1) ---

  function renderRangeList() {
    var list = document.getElementById('range-list');
    var ranges = Registry.getAllRanges();
    list.innerHTML = '';

    if (ranges.length === 0) {
      list.innerHTML = '<div class="empty-msg">テスト範囲がまだありません</div>';
      return;
    }

    // 新しい範囲を上に表示（createdAt降順）
    ranges.sort(function(a, b) {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var entries = Registry.getEntriesByRange(range.id);
      var item = document.createElement('div');
      item.className = 'range-item';
      item.setAttribute('data-range-id', range.id);
      item.innerHTML = '<div><span class="range-item-name">' + escapeHtml(range.name) + '</span>'
        + '<div class="range-item-count">' + entries.length + '問</div></div>'
        + '<span class="range-item-arrow">▶</span>';
      item.addEventListener('click', (function(rangeId) {
        return function() { openKanjiList(rangeId); };
      })(range.id));
      list.appendChild(item);
    }
  }

  // --- Range Create/Edit (Task 9.1) ---

  function openRangeEdit(rangeId) {
    editingRangeId = rangeId || null;
    // 編集の場合は漢字一覧へ、新規の場合はトップへ戻る
    rangeEditBackTarget = editingRangeId ? 'kanji-list' : 'top-view';
    var title = document.getElementById('range-edit-title');
    var nameInput = document.getElementById('range-name-input');
    var deleteBtn = document.getElementById('range-delete-btn');
    var errorEl = document.getElementById('range-edit-error');

    errorEl.style.display = 'none';

    if (editingRangeId) {
      title.textContent = '範囲を編集';
      var ranges = Registry.getAllRanges();
      var range = ranges.find(function(r) { return r.id === editingRangeId; });
      nameInput.value = range ? range.name : '';
      // 削除ボタンは作成者 or 管理者のみ表示
      deleteBtn.style.display = Registry.canDeleteRange(editingRangeId) ? 'block' : 'none';
    } else {
      title.textContent = '範囲を作成';
      nameInput.value = '';
      deleteBtn.style.display = 'none';
    }

    showView('range-edit-view');
  }

  function saveRange() {
    var nameInput = document.getElementById('range-name-input');
    var errorEl = document.getElementById('range-edit-error');
    var name = nameInput.value.trim();

    if (!name) {
      errorEl.textContent = '範囲名を入力してください';
      errorEl.style.display = 'block';
      return;
    }

    if (editingRangeId) {
      var result = Registry.updateRange(editingRangeId, name);
      if (!result) {
        errorEl.textContent = '保存に失敗しました';
        errorEl.style.display = 'block';
        return;
      }
    } else {
      var created = Registry.createRange(name);
      if (!created) {
        errorEl.textContent = '保存に失敗しました';
        errorEl.style.display = 'block';
        return;
      }
    }

    showView('top-view');
  }

  function deleteRange() {
    if (!editingRangeId) return;
    if (!Registry.canDeleteRange(editingRangeId)) {
      alert('この範囲を削除する権限がありません');
      return;
    }
    if (!confirm('この範囲と所属する全ての漢字を削除しますか？')) return;
    Registry.deleteRange(editingRangeId);
    editingRangeId = null;
    showView('top-view');
  }

  // --- Kanji Entry List (Task 9.1) ---

  function openKanjiList(rangeId) {
    currentRangeId = rangeId;
    var ranges = Registry.getAllRanges();
    var range = ranges.find(function(r) { return r.id === rangeId; });
    document.getElementById('kanji-list-title').textContent = range ? range.name : '漢字一覧';
    renderEntryList();
    showView('kanji-list-view');
  }

  function renderEntryList() {
    var list = document.getElementById('kanji-entry-list');
    var emptyMsg = document.getElementById('kanji-list-empty');
    var entries = Registry.getEntriesByRange(currentRangeId);

    list.innerHTML = '';

    if (entries.length === 0) {
      emptyMsg.style.display = 'block';
      document.getElementById('start-test-btn').style.display = 'none';
    } else {
      emptyMsg.style.display = 'none';
      document.getElementById('start-test-btn').style.display = 'block';

      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var item = document.createElement('div');
        item.className = 'entry-item';
        item.innerHTML = '<div><span class="entry-reading">' + escapeHtml(entry.reading) + '</span>'
          + ' → <span class="entry-answer">' + escapeHtml(entry.answer) + '</span></div>'
          + '<button class="entry-delete" data-entry-id="' + entry.id + '">✕</button>';
        list.appendChild(item);
      }
    }
  }

  function deleteEntry(entryId) {
    Registry.deleteEntry(currentRangeId, entryId);
    renderEntryList();
  }

  // --- Kanji Registration (Task 9.1) ---

  function saveEntry() {
    var readingInput = document.getElementById('reading-input');
    var answerInput = document.getElementById('answer-input');
    var errorEl = document.getElementById('register-error');
    var successEl = document.getElementById('register-success');

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    var reading = readingInput.value.trim();
    var answer = answerInput.value.trim();

    if (!reading || !answer) {
      errorEl.textContent = '読み仮名と正解の漢字を入力してください';
      errorEl.style.display = 'block';
      return;
    }

    var entry = Registry.addEntry(currentRangeId, reading, answer);
    if (!entry) {
      errorEl.textContent = '追加に失敗しました';
      errorEl.style.display = 'block';
      return;
    }

    readingInput.value = '';
    answerInput.value = '';
    successEl.textContent = '「' + reading + ' → ' + answer + '」を追加しました';
    successEl.style.display = 'block';
  }

  function saveBulkEntries() {
    var bulkInput = document.getElementById('bulk-input');
    var errorEl = document.getElementById('bulk-error');
    var successEl = document.getElementById('bulk-success');

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    var text = bulkInput.value;
    if (!text.trim()) {
      errorEl.textContent = 'テキストを入力してください';
      errorEl.style.display = 'block';
      return;
    }

    var added = Registry.addEntriesBulk(currentRangeId, text);
    if (added.length === 0) {
      errorEl.textContent = '有効なデータが見つかりませんでした（形式: 読み仮名,漢字）';
      errorEl.style.display = 'block';
      return;
    }

    bulkInput.value = '';
    successEl.textContent = added.length + '件の漢字を追加しました';
    successEl.style.display = 'block';
  }

  // --- Photo OCR Registration ---

  async function handlePhotoRegistration(file) {
    var statusEl = document.getElementById('photo-status');
    statusEl.style.display = 'block';
    statusEl.textContent = '🔄 画像を解析中...';
    statusEl.style.background = '#e3f2fd';

    try {
      // Convert image to base64
      var base64 = await fileToBase64(file);
      var mimeType = file.type || 'image/jpeg';

      // AI(Vision)呼び出しはEdge Function経由（APIキーはサーバー側に隔離）
      var prompt = 'この画像は漢字テストの範囲表またはプリントです。画像から漢字の問題を読み取り、以下の形式で全て出力してください。\n\n形式: 1行に「読み仮名,漢字」（カンマ区切り）\n\n例:\nがっこう,学校\nせんせい,先生\n\n注意:\n- 読み仮名はひらがなで書いてください\n- 余計な説明は不要です。データだけ出力してください\n- 画像内の全ての漢字を漏れなく抽出してください';

      var text = '';
      if (typeof callAiProxy === 'function') {
        text = await callAiProxy(prompt, { image: { mimeType: mimeType, data: base64 } });
      }

      if (!text || !text.trim()) {
        statusEl.textContent = '❌ 画像から漢字を読み取れませんでした';
        statusEl.style.background = '#ffebee';
        return;
      }

      // Parse and register
      var added = Registry.addEntriesBulk(currentRangeId, text);
      if (added.length === 0) {
        statusEl.textContent = '❌ 有効な漢字データが見つかりませんでした';
        statusEl.style.background = '#ffebee';
      } else {
        statusEl.textContent = '✅ ' + added.length + '件の漢字を自動登録しました！';
        statusEl.style.background = '#e8f5e9';
      }
    } catch (e) {
      statusEl.textContent = '❌ エラー: ' + (e.message || '不明なエラー');
      statusEl.style.background = '#ffebee';
    }
  }

  function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        // Remove the data:image/xxx;base64, prefix
        var result = reader.result.split(',')[1];
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- Export/Import (Task 9.1) ---

  function exportData() {
    var json = Registry.exportAllData();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kanji-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var json = e.target.result;

      // Check for conflicts
      var data;
      try { data = JSON.parse(json); } catch (err) {
        alert('JSONファイルの読み込みに失敗しました');
        return;
      }

      if (!data || !Array.isArray(data.ranges)) {
        alert('不正なデータ形式です');
        return;
      }

      var existingRanges = Registry.getAllRanges();
      var hasConflict = data.ranges.some(function(r) {
        return existingRanges.some(function(er) { return er.name === (r.name || '').trim(); });
      });

      var strategy = 'rename';
      if (hasConflict) {
        var choice = confirm('同名の範囲が存在します。\n\nOK: 上書き\nキャンセル: 別名で保存');
        strategy = choice ? 'overwrite' : 'rename';
      }

      var result = Registry.importData(json, strategy);
      if (result.errors.length > 0) {
        alert('インポートエラー: ' + result.errors.join(', '));
      } else {
        alert(result.imported + '件の範囲をインポートしました');
      }

      renderRangeList();
    };
    reader.readAsText(file);
  }


  // --- Mode Selection (Task 9.2) ---

  function openModeSelect() {
    var ranges = Registry.getAllRanges();
    var range = ranges.find(function(r) { return r.id === currentRangeId; });
    var entries = Registry.getEntriesByRange(currentRangeId);

    document.getElementById('mode-range-name').textContent = range ? range.name : '';
    document.getElementById('mode-entry-count').textContent = entries.length;

    showView('mode-select-view');
  }

  function startTestMode() {
    startQuizWithMode('test');
  }

  function startPracticeMode() {
    startQuizWithMode('practice');
  }

  function startQuizWithMode(mode) {
    // Save last mode selection
    localStorage.setItem('kanji_last_mode', mode);

    var entries = Registry.getEntriesByRange(currentRangeId);
    if (entries.length === 0) {
      alert('漢字が登録されていません');
      return;
    }

    var ranges = Registry.getAllRanges();
    var range = ranges.find(function(r) { return r.id === currentRangeId; });

    currentSession = Engine.startQuiz(entries, mode);
    currentSession.rangeName = range ? range.name : '';
    currentSession.rangeId = currentRangeId;
    currentStrokesMap = {};

    // Save session immediately
    Session.saveSession(currentSession);

    showQuizQuestion();
  }

  // --- Quiz Progression (Task 9.2) ---

  function showQuizQuestion() {
    showView('quiz-view');

    var q = currentSession.questions[currentSession.currentIndex];
    var total = currentSession.questions.length;
    var current = currentSession.currentIndex + 1;

    // Progress
    document.getElementById('quiz-progress').textContent = '問題 ' + current + ' / ' + total;

    // Mode label
    var modeLabel = document.getElementById('quiz-mode-label');
    modeLabel.textContent = currentSession.mode === 'test' ? 'テストモード' : '練習モード';

    // Reading
    document.getElementById('quiz-reading').textContent = q.reading;

    // Reset input
    var textInput = document.getElementById('quiz-text-input');
    if (textInput) textInput.value = q.userAnswer || '';

    // Show/hide action buttons based on mode
    if (currentSession.mode === 'test') {
      document.getElementById('quiz-actions-test').style.display = 'flex';
      document.getElementById('quiz-actions-practice').style.display = 'none';
    } else {
      document.getElementById('quiz-actions-test').style.display = 'none';
      document.getElementById('quiz-actions-practice').style.display = 'flex';
    }

    // Hide result/self-check/next areas
    document.getElementById('quiz-result-area').style.display = 'none';
    document.getElementById('self-check-area').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'none';

    // Apply input mode
    applyInputMode();
  }

  function applyInputMode() {
    var canvasArea = document.getElementById('quiz-canvas-area');
    canvasArea.style.display = 'flex';
    // Always init canvas for handwriting
    var canvasEl = document.getElementById('quiz-canvas');
    Canvas.initCanvas(canvasEl);
  }

  function toggleInputMode() {
    if (currentInputMode === 'text' && Canvas.isSupported()) {
      currentInputMode = 'handwriting';
    } else {
      currentInputMode = 'text';
    }
    localStorage.setItem('kanji_input_mode', currentInputMode);
    applyInputMode();
  }

  // --- Test Mode: Submit/Skip (Task 9.2) ---

  function submitTestAnswer() {
    var index = currentSession.currentIndex;

    if (!Canvas.hasContent()) {
      alert('手書きで回答を入力してください');
      return;
    }
    currentStrokesMap[index] = Canvas.getStrokes();
    currentSession = Engine.submitHandwritingAnswer(currentSession, index);

    // Auto-save session (Task 10.1)
    Session.saveSession(currentSession);

    if (isReviewEditing) {
      isReviewEditing = false;
      showReviewView();
    } else {
      advanceTestQuestion();
    }
  }

  function skipTestQuestion() {
    var index = currentSession.currentIndex;
    currentSession = Engine.skipQuestion(currentSession, index);

    // Auto-save session (Task 10.1)
    Session.saveSession(currentSession);

    if (isReviewEditing) {
      isReviewEditing = false;
      showReviewView();
    } else {
      advanceTestQuestion();
    }
  }

  function advanceTestQuestion() {
    if (currentSession.currentIndex < currentSession.questions.length - 1) {
      currentSession.currentIndex++;
      Session.saveSession(currentSession);
      Canvas.clearCanvas();
      showQuizQuestion();
    } else {
      // All questions answered → Review Phase
      currentSession.phase = 'review';
      Session.saveSession(currentSession);
      showReviewView();
    }
  }

  // --- Practice Mode: Submit/ShowAnswer/SelfCheck (Task 9.2) ---

  function submitPracticeAnswer() {
    var index = currentSession.currentIndex;

    if (!Canvas.hasContent()) {
      alert('手書きで回答を入力してください');
      return;
    }
    currentStrokesMap[index] = Canvas.getStrokes();
    currentSession = Engine.submitHandwritingAnswer(currentSession, index);

    // For handwriting in practice mode: show answer + self-check
    showPracticeResult(true);

    // Auto-save (Task 10.1)
    Session.saveSession(currentSession);
  }

  function showPracticeAnswer() {
    var index = currentSession.currentIndex;
    currentSession = Engine.showAnswer(currentSession, index);

    // Auto-save (Task 10.1)
    Session.saveSession(currentSession);
    showPracticeResult(false);
  }

  function showPracticeResult(needSelfCheck) {
    var index = currentSession.currentIndex;
    var q = currentSession.questions[index];

    // Hide action buttons
    document.getElementById('quiz-actions-practice').style.display = 'none';

    if (needSelfCheck) {
      // Show the correct answer and self-check buttons
      document.getElementById('quiz-result-area').style.display = 'block';
      document.getElementById('quiz-result-icon').textContent = '';
      document.getElementById('quiz-correct-answer').textContent = '正解: ' + q.correctAnswer;
      document.getElementById('self-check-area').style.display = 'block';
      document.getElementById('next-question-btn').style.display = 'none';
    } else {
      // Show result
      document.getElementById('quiz-result-area').style.display = 'block';
      if (q.result === 'correct') {
        document.getElementById('quiz-result-icon').textContent = '⭕';
      } else {
        document.getElementById('quiz-result-icon').textContent = '❌';
      }
      document.getElementById('quiz-correct-answer').textContent = '正解: ' + q.correctAnswer;
      document.getElementById('self-check-area').style.display = 'none';
      document.getElementById('next-question-btn').style.display = 'block';
    }
  }

  function selfCheckCorrect() {
    var index = currentSession.currentIndex;
    currentSession = Engine.selfCheck(currentSession, index, true);
    Session.saveSession(currentSession);

    document.getElementById('self-check-area').style.display = 'none';
    document.getElementById('quiz-result-icon').textContent = '⭕';
    document.getElementById('next-question-btn').style.display = 'block';
  }

  function selfCheckIncorrect() {
    var index = currentSession.currentIndex;
    currentSession = Engine.selfCheck(currentSession, index, false);
    Session.saveSession(currentSession);

    document.getElementById('self-check-area').style.display = 'none';
    document.getElementById('quiz-result-icon').textContent = '❌';
    document.getElementById('next-question-btn').style.display = 'block';
  }

  function nextPracticeQuestion() {
    if (currentSession.currentIndex < currentSession.questions.length - 1) {
      currentSession.currentIndex++;
      Session.saveSession(currentSession);
      Canvas.clearCanvas();
      showQuizQuestion();
    } else {
      // Practice complete → Result
      finishPracticeMode();
    }
  }

  function finishPracticeMode() {
    currentSession.phase = 'finished';
    var result = Engine.calculateResult(currentSession);
    lastTestResult = result;

    // Save result (Task 9.5)
    var results = Storage.loadFromLocalStorage('kanji_test_results') || [];
    results.push(result);
    Storage.saveToLocalStorage('kanji_test_results', results);

    // Clear session (Task 10.1)
    Session.clearSession();
    currentSession = null;

    showResultView(result);
  }


  // --- Review Phase (Task 9.3) ---

  function showReviewView() {
    showView('review-view');
    renderReviewList();
  }

  /**
   * ストロークデータを小さなcanvasにサムネイル描画して返す
   * @param {Array<Array<{x: number, y: number}>>} strokeData
   * @returns {HTMLCanvasElement|null}
   */
  function createStrokeThumbnail(strokeData) {
    if (!strokeData || strokeData.length === 0) return null;

    var thumb = document.createElement('canvas');
    thumb.width = 48;
    thumb.height = 48;
    thumb.className = 'review-item-thumb';
    var tctx = thumb.getContext('2d');

    // 元のキャンバスサイズ(300x300)から48x48に縮小描画
    var scale = 48 / 300;
    tctx.strokeStyle = '#000';
    tctx.lineWidth = 2;
    tctx.lineCap = 'round';
    tctx.lineJoin = 'round';

    for (var i = 0; i < strokeData.length; i++) {
      var stroke = strokeData[i];
      if (stroke.length === 0) continue;
      tctx.beginPath();
      tctx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
      if (stroke.length === 1) {
        tctx.lineTo(stroke[0].x * scale, stroke[0].y * scale);
      } else {
        for (var j = 1; j < stroke.length; j++) {
          tctx.lineTo(stroke[j].x * scale, stroke[j].y * scale);
        }
      }
      tctx.stroke();
    }

    return thumb;
  }

  function renderReviewList() {
    var list = document.getElementById('review-list');
    var reviewItems = Engine.getReviewList(currentSession);

    list.innerHTML = '';

    for (var i = 0; i < reviewItems.length; i++) {
      var item = reviewItems[i];
      var el = document.createElement('div');
      el.className = 'review-item';
      el.setAttribute('data-index', item.index);

      var statusClass = item.status === 'skipped' ? 'skipped' : 'answered';
      var statusText = item.status === 'skipped' ? 'スキップ' : '回答済み';
      var btnText = item.status === 'skipped' ? '回答する' : '修正する';

      el.innerHTML = '<div class="review-item-info">'
        + '<span class="review-item-number">Q' + (item.index + 1) + '.</span>'
        + '<span class="review-item-reading">' + escapeHtml(item.reading) + '</span>'
        + '<span class="review-item-status ' + statusClass + '">' + statusText + '</span>'
        + '</div>'
        + '<button class="btn-review-action btn-small btn-secondary" data-review-index="' + item.index + '">' + btnText + '</button>';

      // 回答済みのストロークがあればサムネイルを挿入
      if (item.status !== 'skipped' && currentStrokesMap[item.index]) {
        var thumb = createStrokeThumbnail(currentStrokesMap[item.index]);
        if (thumb) {
          var infoDiv = el.querySelector('.review-item-info');
          infoDiv.appendChild(thumb);
        }
      }

      list.appendChild(el);
    }

    // Attach button click handlers via event delegation
    var reviewListClickHandler = function(e) {
      var btn = e.target.closest('.btn-review-action');
      if (btn) {
        var idx = parseInt(btn.getAttribute('data-review-index'), 10);
        goToReviewQuestion(idx);
      }
    };

    // Remove previous handler to avoid stacking
    list.removeEventListener('click', list._reviewClickHandler);
    list._reviewClickHandler = reviewListClickHandler;
    list.addEventListener('click', reviewListClickHandler);
  }

  function goToReviewQuestion(index) {
    isReviewEditing = true;
    currentSession.currentIndex = index;
    Canvas.clearCanvas();
    showQuizQuestion();
    // In review phase, still show test mode buttons
    document.getElementById('quiz-actions-test').style.display = 'flex';
    document.getElementById('quiz-actions-practice').style.display = 'none';
  }

  function finishReview() {
    // Execute grading (Task 9.5)
    var result = Engine.finishTestMode(currentSession);

    if (result.pendingTest) {
      // Save PendingGradingTest
      var pending = Storage.loadFromLocalStorage('kanji_pending_tests') || [];
      pending.push(result.pendingTest);
      var saveResult = Storage.saveToLocalStorage('kanji_pending_tests', pending);
      if (!saveResult.success) {
        alert('保存容量が不足しています: ' + saveResult.error);
      }

      // Save StrokesStore
      if (Object.keys(currentStrokesMap).length > 0) {
        var strokesSave = Storage.saveToLocalStorage('kanji_pending_strokes_' + result.pendingTest.id, currentStrokesMap);
        if (!strokesSave.success) {
          alert('手書きデータの保存に失敗しました: ' + strokesSave.error);
        }
      }

      // Notify (Task 11.1)
      var handwritingCount = result.pendingTest.questions.filter(function(q) {
        return q.hasHandwritingAnswer;
      }).length;
      if (handwritingCount > 0) {
        Notify.notifyTestCompleted(result.pendingTest.id, result.pendingTest.rangeName, handwritingCount);
      }

      // Create a partial TestResult for display (pending questions not counted yet)
      lastTestResult = {
        id: result.pendingTest.id,
        rangeId: result.pendingTest.rangeId,
        rangeName: result.pendingTest.rangeName,
        mode: 'test',
        questions: result.pendingTest.questions,
        correctCount: result.pendingTest.textGradedCorrect,
        incorrectCount: result.pendingTest.textGradedIncorrect,
        skippedCount: result.pendingTest.skippedCount,
        pendingCount: result.pendingTest.questions.filter(function(q) { return q.result === 'pending_grading'; }).length,
        totalCount: result.pendingTest.totalCount,
        score: Math.round((result.pendingTest.textGradedCorrect / result.pendingTest.totalCount) * 100),
        completedAt: result.pendingTest.completedAt,
      };
    } else if (result.testResult) {
      // Save TestResult
      var results = Storage.loadFromLocalStorage('kanji_test_results') || [];
      results.push(result.testResult);
      Storage.saveToLocalStorage('kanji_test_results', results);
      lastTestResult = result.testResult;
    }

    // Clear session (Task 10.1)
    Session.clearSession();
    currentSession = null;
    currentStrokesMap = {};

    showResultView(lastTestResult);
  }

  // --- Result View (Task 9.3) ---

  function showResultView(result) {
    showView('result-view');

    // Score
    var score = result.score !== undefined ? Math.round(result.score) : 0;
    document.getElementById('result-score-value').textContent = score;

    // Perfect score
    var perfectEl = document.getElementById('result-perfect');
    if (score === 100 && !result.pendingCount) {
      perfectEl.style.display = 'block';
    } else {
      perfectEl.style.display = 'none';
    }

    // Counts
    document.getElementById('result-correct').textContent = result.correctCount || 0;
    document.getElementById('result-incorrect').textContent = result.incorrectCount || 0;
    document.getElementById('result-skipped').textContent = result.skippedCount || 0;

    // Pending area
    var pendingArea = document.getElementById('result-pending-area');
    if (result.pendingCount && result.pendingCount > 0) {
      pendingArea.style.display = 'inline';
      document.getElementById('result-pending').textContent = result.pendingCount;
    } else {
      pendingArea.style.display = 'none';
    }

    // Wrong list
    var wrongSection = document.getElementById('result-wrong-section');
    var wrongList = document.getElementById('result-wrong-list');
    var wrongItems = (result.questions || []).filter(function(q) { return q.result === 'incorrect'; });
    if (wrongItems.length > 0) {
      wrongSection.style.display = 'block';
      wrongList.innerHTML = '';
      for (var i = 0; i < wrongItems.length; i++) {
        wrongList.innerHTML += '<div class="result-list-item">'
          + '<span class="result-item-reading">' + escapeHtml(wrongItems[i].reading) + '</span>'
          + '<span class="result-item-answer">' + escapeHtml(wrongItems[i].correctAnswer) + '</span>'
          + '</div>';
      }
    } else {
      wrongSection.style.display = 'none';
    }

    // Skipped list
    var skippedSection = document.getElementById('result-skipped-section');
    var skippedList = document.getElementById('result-skipped-list');
    var skippedItems = (result.questions || []).filter(function(q) { return q.result === 'skipped'; });
    if (skippedItems.length > 0) {
      skippedSection.style.display = 'block';
      skippedList.innerHTML = '';
      for (var j = 0; j < skippedItems.length; j++) {
        skippedList.innerHTML += '<div class="result-list-item">'
          + '<span class="result-item-reading">' + escapeHtml(skippedItems[j].reading) + '</span>'
          + '<span class="result-item-answer">' + escapeHtml(skippedItems[j].correctAnswer) + '</span>'
          + '</div>';
      }
    } else {
      skippedSection.style.display = 'none';
    }

    // Retry button
    var retryBtn = document.getElementById('retry-wrong-btn');
    if ((wrongItems.length > 0 || skippedItems.length > 0) && !result.pendingCount) {
      retryBtn.style.display = 'block';
    } else {
      retryBtn.style.display = 'none';
    }
  }

  // --- Retry (Task 9.3) ---

  function retryWrongQuestions() {
    if (!lastTestResult) return;

    var retryEntryIds = Engine.getRetryEntries(lastTestResult);
    if (retryEntryIds.length === 0) return;

    // Get entries for retry
    var allEntries = Registry.getEntriesByRange(lastTestResult.rangeId);
    var retryEntries = allEntries.filter(function(e) {
      return retryEntryIds.indexOf(e.id) !== -1;
    });

    if (retryEntries.length === 0) return;

    var ranges = Registry.getAllRanges();
    var range = ranges.find(function(r) { return r.id === lastTestResult.rangeId; });

    currentRangeId = lastTestResult.rangeId;
    currentSession = Engine.startQuiz(retryEntries, lastTestResult.mode || 'test');
    currentSession.rangeName = range ? range.name : '';
    currentSession.rangeId = currentRangeId;
    currentStrokesMap = {};

    Session.saveSession(currentSession);
    showQuizQuestion();
  }

  // --- Admin Grading UI (Task 9.4) ---

  function renderGradingTestList() {
    var listEl = document.getElementById('grading-test-list');
    var emptyEl = document.getElementById('grading-empty');
    var interfaceEl = document.getElementById('grading-interface');

    interfaceEl.style.display = 'none';
    listEl.style.display = 'block';

    var tests = Grading.getPendingTests();

    if (tests.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = '';

    for (var i = 0; i < tests.length; i++) {
      var test = tests[i];
      var pendingCount = test.questions.filter(function(q) { return q.result === 'pending_grading'; }).length;
      var date = new Date(test.completedAt);
      var dateStr = (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');

      var item = document.createElement('div');
      item.className = 'grading-test-item';
      item.innerHTML = '<div><span class="grading-test-name">' + escapeHtml(test.rangeName) + '</span>'
        + '<div class="grading-test-date">' + dateStr + '</div></div>'
        + '<span class="grading-test-count">' + pendingCount + '問未採点</span>';
      item.addEventListener('click', (function(testId) {
        return function() { openGradingInterface(testId); };
      })(test.id));
      listEl.appendChild(item);
    }
  }

  function openGradingInterface(testId) {
    gradingTestId = testId;

    var tests = Grading.getPendingTests();
    var test = tests.find(function(t) { return t.id === testId; });
    if (!test) return;

    // Find first pending_grading question
    gradingQuestionIndex = 0;
    for (var i = 0; i < test.questions.length; i++) {
      if (test.questions[i].result === 'pending_grading') {
        gradingQuestionIndex = i;
        break;
      }
    }

    document.getElementById('grading-test-list').style.display = 'none';
    document.getElementById('grading-empty').style.display = 'none';
    document.getElementById('grading-interface').style.display = 'block';

    renderGradingQuestion();
  }

  function renderGradingQuestion() {
    var tests = Grading.getPendingTests();
    var test = tests.find(function(t) { return t.id === gradingTestId; });
    if (!test) return;

    var q = test.questions[gradingQuestionIndex];
    var totalPending = test.questions.filter(function(q2) { return q2.result === 'pending_grading'; }).length;
    var gradedCount = test.questions.filter(function(q2) { return q2.result === 'correct' || q2.result === 'incorrect'; }).length;
    var handwritingQuestions = test.questions.filter(function(q2) { return q2.hasHandwritingAnswer; });

    document.getElementById('grading-test-info').textContent = test.rangeName;
    document.getElementById('grading-progress').textContent = '採点済み: ' + gradedCount + '/' + test.questions.length;

    // Show correct answer and reading
    document.getElementById('grading-correct-answer').textContent = q.correctAnswer;
    document.getElementById('grading-reading-text').textContent = q.reading;

    // Render strokes on canvas
    var canvasEl = document.getElementById('grading-canvas');
    Canvas.initCanvas(canvasEl);
    var strokesData = Storage.loadFromLocalStorage('kanji_pending_strokes_' + gradingTestId);
    if (strokesData && strokesData[gradingQuestionIndex]) {
      Canvas.renderStrokes(strokesData[gradingQuestionIndex]);
    }

    // Show/hide grade buttons based on question status
    var gradeCorrectBtn = document.getElementById('grade-correct-btn');
    var gradeIncorrectBtn = document.getElementById('grade-incorrect-btn');
    if (q.result === 'pending_grading') {
      gradeCorrectBtn.style.display = 'block';
      gradeIncorrectBtn.style.display = 'block';
    } else {
      gradeCorrectBtn.style.display = 'none';
      gradeIncorrectBtn.style.display = 'none';
    }

    // Show finish button if all graded
    var finishBtn = document.getElementById('grading-finish-btn');
    if (Grading.isAllGraded(gradingTestId)) {
      finishBtn.style.display = 'inline-block';
    } else {
      finishBtn.style.display = 'none';
    }
  }

  function gradeCorrect() {
    Grading.gradeQuestion(gradingTestId, gradingQuestionIndex, true);
    afterGrade();
  }

  function gradeIncorrect() {
    Grading.gradeQuestion(gradingTestId, gradingQuestionIndex, false);
    afterGrade();
  }

  function afterGrade() {
    // Auto advance to next pending question
    var tests = Grading.getPendingTests();
    var test = tests.find(function(t) { return t.id === gradingTestId; });
    if (!test) return;

    // Find next pending_grading after current
    var found = false;
    for (var i = gradingQuestionIndex + 1; i < test.questions.length; i++) {
      if (test.questions[i].result === 'pending_grading') {
        gradingQuestionIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      // Search from beginning
      for (var j = 0; j < gradingQuestionIndex; j++) {
        if (test.questions[j].result === 'pending_grading') {
          gradingQuestionIndex = j;
          found = true;
          break;
        }
      }
    }

    renderGradingQuestion();
  }

  function gradingPrev() {
    var tests = Grading.getPendingTests();
    var test = tests.find(function(t) { return t.id === gradingTestId; });
    if (!test) return;

    if (gradingQuestionIndex > 0) {
      gradingQuestionIndex--;
    } else {
      gradingQuestionIndex = test.questions.length - 1;
    }
    renderGradingQuestion();
  }

  function gradingNext() {
    var tests = Grading.getPendingTests();
    var test = tests.find(function(t) { return t.id === gradingTestId; });
    if (!test) return;

    if (gradingQuestionIndex < test.questions.length - 1) {
      gradingQuestionIndex++;
    } else {
      gradingQuestionIndex = 0;
    }
    renderGradingQuestion();
  }

  function finishGradingTest() {
    if (!Grading.isAllGraded(gradingTestId)) {
      alert('全ての問題を採点してください');
      return;
    }

    try {
      Grading.finishGrading(gradingTestId);
    } catch (e) {
      alert('採点完了に失敗しました: ' + e.message);
      return;
    }

    gradingTestId = null;
    gradingQuestionIndex = 0;

    // Refresh badge (Task 11.1)
    updatePendingBadge();

    // Return to grading list
    document.getElementById('grading-interface').style.display = 'none';
    document.getElementById('grading-test-list').style.display = 'block';
    renderGradingTestList();
  }

  // --- Pending Badge (Task 11.1) ---

  function updatePendingBadge() {
    var badge = document.getElementById('pending-badge');
    var count = Notify.getPendingCount();
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }


  // --- Session Restore (Task 10.1) ---

  function checkPendingSession() {
    var session = Session.loadSession();
    if (!session) return false;

    // Show resume dialog
    var resume = confirm('中断したテストがあります。続きから再開しますか？\n\n範囲: ' + (session.rangeName || '') + '\nモード: ' + (session.mode === 'test' ? 'テスト' : '練習'));

    if (resume) {
      currentSession = session;
      currentRangeId = session.rangeId;
      currentStrokesMap = {};

      if (session.phase === 'review') {
        showReviewView();
      } else {
        showQuizQuestion();
      }
      return true;
    } else {
      Session.clearSession();
      return false;
    }
  }

  // --- Helpers ---

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Bindings ---

  function init() {
    // Range actions
    document.getElementById('add-range-btn').addEventListener('click', function() {
      openRangeEdit(null);
    });
    document.getElementById('range-save-btn').addEventListener('click', saveRange);
    document.getElementById('range-delete-btn').addEventListener('click', deleteRange);
    document.getElementById('range-edit-back-btn').addEventListener('click', function() {
      if (rangeEditBackTarget === 'kanji-list' && currentRangeId) {
        openKanjiList(currentRangeId);
      } else {
        showView('top-view');
      }
    });

    // Entry actions
    document.getElementById('kanji-entry-list').addEventListener('click', function(e) {
      var btn = e.target.closest('.entry-delete');
      if (btn) {
        var entryId = btn.getAttribute('data-entry-id');
        if (entryId && confirm('この漢字を削除しますか？')) {
          deleteEntry(entryId);
        }
      }
    });

    document.getElementById('save-entry-btn').addEventListener('click', saveEntry);
    document.getElementById('bulk-save-btn').addEventListener('click', saveBulkEntries);

    // Photo OCR registration
    document.getElementById('photo-btn').addEventListener('click', function() {
      document.getElementById('photo-input').click();
    });
    document.getElementById('photo-input').addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        handlePhotoRegistration(e.target.files[0]);
        e.target.value = '';
      }
    });

    document.getElementById('kanji-register-back-btn').addEventListener('click', function() {
      document.getElementById('register-error').style.display = 'none';
      document.getElementById('register-success').style.display = 'none';
      document.getElementById('bulk-error').style.display = 'none';
      document.getElementById('bulk-success').style.display = 'none';
      openKanjiList(currentRangeId);
    });

    // Edit range from kanji list
    document.getElementById('edit-range-btn').addEventListener('click', function() {
      openRangeEdit(currentRangeId);
    });

    // Start test
    document.getElementById('start-test-btn').addEventListener('click', openModeSelect);

    // Mode selection
    document.getElementById('test-mode-btn').addEventListener('click', startTestMode);
    document.getElementById('practice-mode-btn').addEventListener('click', startPracticeMode);
    document.getElementById('mode-select-back-btn').addEventListener('click', function() {
      openKanjiList(currentRangeId);
    });

    // Quiz actions (test mode)
    document.getElementById('submit-answer-btn').addEventListener('click', submitTestAnswer);
    document.getElementById('skip-btn').addEventListener('click', skipTestQuestion);

    // Quiz actions (practice mode)
    document.getElementById('practice-submit-btn').addEventListener('click', submitPracticeAnswer);
    document.getElementById('show-answer-btn').addEventListener('click', showPracticeAnswer);

    // Self check
    document.getElementById('self-check-correct').addEventListener('click', selfCheckCorrect);
    document.getElementById('self-check-incorrect').addEventListener('click', selfCheckIncorrect);

    // Next question (practice)
    document.getElementById('next-question-btn').addEventListener('click', nextPracticeQuestion);

    // Canvas clear
    document.getElementById('canvas-clear-btn').addEventListener('click', function() {
      Canvas.clearCanvas();
    });

    // Review phase
    document.getElementById('finish-review-btn').addEventListener('click', finishReview);

    // Result actions
    document.getElementById('retry-wrong-btn').addEventListener('click', retryWrongQuestions);

    // Grading actions
    document.getElementById('grade-correct-btn').addEventListener('click', gradeCorrect);
    document.getElementById('grade-incorrect-btn').addEventListener('click', gradeIncorrect);
    document.getElementById('grading-prev-btn').addEventListener('click', gradingPrev);
    document.getElementById('grading-next-btn').addEventListener('click', gradingNext);
    document.getElementById('grading-finish-btn').addEventListener('click', finishGradingTest);

    // Home button with confirm if session active
    document.getElementById('home-btn').addEventListener('click', function(e) {
      if (currentSession) {
        if (!confirm('テスト中の回答は保存されません。ホームに戻りますか？')) {
          e.preventDefault();
          return;
        }
        // Clear session before leaving
        Session.clearSession();
      }
    });

    // Check for pending session on app load (Task 10.1)
    var resumed = checkPendingSession();
    if (!resumed) {
      showView('top-view');
    }
  }

  // --- Initialize when DOM is ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
