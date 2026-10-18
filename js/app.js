/**
 * Main Application Controller (app.js)
 * Theory of Computation — Turing Machine Simulator
 * Features:
 * - Live Infinite Sliding Tape Visualizer & Pointer
 * - Dynamic SVG State Diagram with Active State & Edge Glow
 * - Formal 7-Tuple & Dynamic Transition Table
 * - Live Instantaneous Description (ID) Display (u (q) v)
 * - Quick Input Preset Chips
 * - Automated Batch Test Suite with 1-click test runner
 * - Step-by-Step Execution Trace Log with CSV Export
 * - Real-time Web Audio API mechanical clicks & chimes
 * - Bidirectional JFLAP 7.x/8.x .jff Export & Import Parser
 * - Custom Machine Builder / Editor
 * 
 * Author: Vishal Kumar Gupta
 */

(function () {
  'use strict';

  let currentPresetKey = 'even_ones';
  let tm = new TuringMachine(MACHINE_PRESETS[currentPresetKey]);
  let diagramRenderer = new StateDiagramRenderer('transitionSvg');

  let simulationTimer = null;
  let isRunning = false;
  let stepIntervalMs = 500;
  let hasScrolledToDiagram = false;

  // Active tests for current preset
  let currentTests = [];

  // SVG Icons
  const SVGS = {
    soundOn: '<svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
    soundOff: '<svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>',
    sun: '<svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    moon: '<svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    play: '<svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>',
    pause: '<svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>',
    pass: '<svg class="badge-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    fail: '<svg class="badge-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
  };

  // DOM Elements
  const machineSelect = document.getElementById('machineSelect');
  const machineTitle = document.getElementById('machineTitle');
  const machineDescription = document.getElementById('machineDescription');

  // Audio & Theme & Modals
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const importJflapBtn = document.getElementById('importJflapBtn');
  const jflapFileInput = document.getElementById('jflapFileInput');
  const customMachineBtn = document.getElementById('customMachineBtn');
  const downloadJflapBtn = document.getElementById('downloadJflapBtn');

  // Tape & Status
  const tapeTrack = document.getElementById('tapeTrack');
  const inputTapeString = document.getElementById('inputTapeString');
  const loadTapeBtn = document.getElementById('loadTapeBtn');
  const inputValidationMsg = document.getElementById('inputValidationMsg');
  const quickPresetsContainer = document.getElementById('quickPresetsContainer');

  const stepCountDisplay = document.getElementById('stepCountDisplay');
  const headIndexDisplay = document.getElementById('headIndexDisplay');
  const currentStateBadge = document.getElementById('currentStateBadge');
  const statusBadge = document.getElementById('statusBadge');
  const instantaneousDescriptionDisplay = document.getElementById('instantaneousDescriptionDisplay');

  // Playback Controls
  const playPauseBtn = document.getElementById('playPauseBtn');
  const stepForwardBtn = document.getElementById('stepForwardBtn');
  const stepBackBtn = document.getElementById('stepBackBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValueLabel = document.getElementById('speedValueLabel');

  // Tuple & Transition
  const tupleDetails = document.getElementById('tupleDetails');
  const transitionTableBody = document.getElementById('transitionTableBody');
  const toggleTransitionBtn = document.getElementById('toggleTransitionBtn');
  const toggleArrow = document.getElementById('toggleArrow');
  const transitionTableWrapper = document.getElementById('transitionTableWrapper');
  const transitionCountBadge = document.getElementById('transitionCountBadge');

  // Batch Test Suite
  const toggleBatchTestBtn = document.getElementById('toggleBatchTestBtn');
  const batchTestArrow = document.getElementById('batchTestArrow');
  const batchTestWrapper = document.getElementById('batchTestWrapper');
  const batchTestSummaryBadge = document.getElementById('batchTestSummaryBadge');
  const testSuiteScore = document.getElementById('testSuiteScore');
  const runAllTestsBtn = document.getElementById('runAllTestsBtn');
  const addCustomTestBtn = document.getElementById('addCustomTestBtn');
  const resetDefaultTestsBtn = document.getElementById('resetDefaultTestsBtn');
  const batchTestTableBody = document.getElementById('batchTestTableBody');

  // Trace Log
  const toggleTraceLogBtn = document.getElementById('toggleTraceLogBtn');
  const traceLogArrow = document.getElementById('traceLogArrow');
  const traceLogWrapper = document.getElementById('traceLogWrapper');
  const traceLogCountBadge = document.getElementById('traceLogCountBadge');
  const traceStatusLabel = document.getElementById('traceStatusLabel');
  const exportTraceCsvBtn = document.getElementById('exportTraceCsvBtn');
  const clearTraceLogBtn = document.getElementById('clearTraceLogBtn');
  const traceTableBody = document.getElementById('traceTableBody');

  // Modals
  const jflapModal = document.getElementById('jflapModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const jflapXmlContent = document.getElementById('jflapXmlContent');
  const copyXmlBtn = document.getElementById('copyXmlBtn');
  const downloadXmlFileBtn = document.getElementById('downloadXmlFileBtn');

  const customMachineModal = document.getElementById('customMachineModal');
  const closeCustomModalBtn = document.getElementById('closeCustomModalBtn');
  const cancelCustomBtn = document.getElementById('cancelCustomBtn');
  const saveCustomMachineBtn = document.getElementById('saveCustomMachineBtn');
  const customMachineTitle = document.getElementById('customMachineTitle');
  const customInitialState = document.getElementById('customInitialState');
  const customAcceptStates = document.getElementById('customAcceptStates');
  const customRejectStates = document.getElementById('customRejectStates');
  const customTransitionsJson = document.getElementById('customTransitionsJson');
  const customMachineError = document.getElementById('customMachineError');
  const loadSampleTemplateBtn = document.getElementById('loadSampleTemplateBtn');

  const addTestModal = document.getElementById('addTestModal');
  const closeAddTestBtn = document.getElementById('closeAddTestBtn');
  const cancelAddTestBtn = document.getElementById('cancelAddTestBtn');
  const saveCustomTestBtn = document.getElementById('saveCustomTestBtn');
  const customTestInput = document.getElementById('customTestInput');
  const customTestExpected = document.getElementById('customTestExpected');
  const customTestLabel = document.getElementById('customTestLabel');

  // ---- Audio Management ----

  function updateSoundButton() {
    if (!soundToggleBtn || !window.tmAudio) return;
    if (window.tmAudio.enabled) {
      soundToggleBtn.innerHTML = `${SVGS.soundOn}<span>Sound: ON</span>`;
      soundToggleBtn.classList.remove('btn-muted');
      soundToggleBtn.title = 'Sound effects enabled. Click to mute.';
    } else {
      soundToggleBtn.innerHTML = `${SVGS.soundOff}<span>Sound: OFF</span>`;
      soundToggleBtn.classList.add('btn-muted');
      soundToggleBtn.title = 'Sound effects muted. Click to enable.';
    }
  }

  function toggleSound() {
    if (window.tmAudio) {
      window.tmAudio.toggle();
      updateSoundButton();
    }
  }

  // ---- Theme (Dark / Light) ----

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = SVGS.sun;
        themeToggleBtn.title = 'Switch to light mode';
      }
    } else {
      document.body.classList.remove('dark');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = SVGS.moon;
        themeToggleBtn.title = 'Switch to dark mode';
      }
    }
    diagramRenderer.render(tm.config);
  }

  function toggleTheme() {
    const isDark = !document.body.classList.contains('dark');
    applyTheme(isDark);
    try {
      localStorage.setItem('tm_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
  }

  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem('tm_theme');
    } catch (e) {}
    if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      applyTheme(true);
    } else {
      applyTheme(false);
    }
  }

  // ---- Load Preset ----

  function loadMachinePreset(presetKey) {
    pauseSimulation();
    currentPresetKey = presetKey;
    const preset = MACHINE_PRESETS[presetKey];
    if (!preset) return;

    tm.loadPreset(presetKey);

    machineTitle.textContent = preset.title;
    machineDescription.innerHTML = preset.description;

    diagramRenderer.render(preset);
    renderFormalTuple(preset);
    renderTransitionTable(preset);
    renderQuickPresetChips(preset);

    // Initialize test suite
    currentTests = preset.defaultTests ? JSON.parse(JSON.stringify(preset.defaultTests)) : [];
    renderBatchTestTable();
    testSuiteScore.textContent = `${currentTests.length} tests ready`;
    testSuiteScore.className = 'test-score-text';

    // Default input per preset
    const defaults = {
      even_ones: '1011001',
      equal_zeros_ones: '000111',
      palindrome: '1001',
      binary_increment: '1011'
    };
    inputTapeString.value = defaults[presetKey] !== undefined ? defaults[presetKey] : (preset.quickInputs?.[0]?.val || '');
    inputValidationMsg.textContent = '';

    resetSimulation();
  }

  // ---- Formal Tuple ----

  function renderFormalTuple(preset) {
    const t = preset.formalTuple || {};
    tupleDetails.innerHTML = `
      <div class="tuple-item"><strong>Q</strong> = ${escapeHtml(t.Q || '{ }')}</div>
      <div class="tuple-item"><strong>&Sigma;</strong> = ${escapeHtml(t.Sigma || '{ }')}</div>
      <div class="tuple-item"><strong>&Gamma;</strong> = ${escapeHtml(t.Gamma || '{ }')}</div>
      <div class="tuple-item"><strong>q₀</strong> = ${escapeHtml(t.q0 || 'q0')}</div>
      <div class="tuple-item"><strong>B</strong> = ${escapeHtml(t.B || '␣')}</div>
      <div class="tuple-item"><strong>F</strong> = ${escapeHtml(t.F || '{ }')}</div>
    `;
  }

  // ---- Transition Table ----

  function renderTransitionTable(preset) {
    transitionTableBody.innerHTML = '';
    const transitions = preset.transitions || [];
    if (transitionCountBadge) {
      transitionCountBadge.textContent = `${transitions.length} Rules`;
    }

    transitions.forEach(t => {
      const row = document.createElement('tr');
      row.id = `trans-row-${t.from}-${t.read}`;
      row.innerHTML = `
        <td><strong>${escapeHtml(t.from)}</strong></td>
        <td><code>${escapeHtml(t.read)}</code></td>
        <td><strong>${escapeHtml(t.to)}</strong></td>
        <td><code>${escapeHtml(t.write)}</code></td>
        <td><span class="badge-pill">${escapeHtml(t.move)}</span></td>
        <td>${escapeHtml(t.desc || '-')}</td>
      `;
      transitionTableBody.appendChild(row);
    });
  }

  // ---- Quick Preset Chips ----

  function renderQuickPresetChips(preset) {
    quickPresetsContainer.innerHTML = '';
    const items = preset.quickInputs || (preset.defaultTests || []).map(t => ({ val: t.input, label: t.input === '' ? 'ε' : t.input }));

    items.forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'quick-chip';
      chip.textContent = item.label || (item.val === '' ? 'ε' : item.val);
      chip.title = `Load "${item.val}"`;
      chip.addEventListener('click', () => {
        inputTapeString.value = item.val;
        inputValidationMsg.textContent = '';
        document.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        resetSimulation();
      });
      quickPresetsContainer.appendChild(chip);
    });
  }

  // ---- Simulation Controls ----

  function resetSimulation() {
    pauseSimulation();
    hasScrolledToDiagram = false;
    const str = inputTapeString.value.trim();
    tm.reset(str);
    updateUI();
    diagramRenderer.clearHighlights();
    clearTransitionTableRowHighlights();
    renderTraceLog();
  }

  function validateAndLoadInput() {
    const str = inputTapeString.value.trim();
    for (const char of str) {
      if (!tm.config.alphabet.includes(char)) {
        inputValidationMsg.textContent = `'${char}' is not in the alphabet {${tm.config.alphabet.join(', ')}}`;
        return;
      }
    }
    inputValidationMsg.textContent = '';
    resetSimulation();
  }

  function stepForward() {
    if (tm.isHalted()) return;

    const result = tm.stepForward();

    // Play tick
    if (window.tmAudio) {
      window.tmAudio.playTapeTick();
    }

    if (result.transition) {
      diagramRenderer.highlightState(tm.state, tm.status);
      diagramRenderer.highlightTransition(result.transition.from, result.transition.to);
      highlightTransitionTableRow(result.transition.from, result.transition.read);
    }

    if (result.done) {
      pauseSimulation();
      if (result.accepted) {
        if (window.tmAudio) window.tmAudio.playAcceptChime();
      } else {
        if (window.tmAudio) window.tmAudio.playRejectChime();
      }
    }

    updateUI();
    renderTraceLog();
  }

  function stepBack() {
    if (tm.history.length === 0) return;
    pauseSimulation();
    tm.stepBack();
    diagramRenderer.highlightState(tm.state, tm.status);
    if (tm.lastTransition) {
      diagramRenderer.highlightTransition(tm.lastTransition.from, tm.lastTransition.to);
      highlightTransitionTableRow(tm.lastTransition.from, tm.lastTransition.read);
    } else {
      diagramRenderer.clearHighlights();
      clearTransitionTableRowHighlights();
    }
    updateUI();
    renderTraceLog();
  }

  function togglePlayPause() {
    if (isRunning) {
      pauseSimulation();
    } else {
      if (tm.isHalted()) resetSimulation();
      startSimulation();
    }
  }

  function startSimulation() {
    isRunning = true;
    playPauseBtn.innerHTML = `${SVGS.pause}<span>Pause</span>`;

    if (!hasScrolledToDiagram) {
      const panel = document.querySelector('.main-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      hasScrolledToDiagram = true;
    }

    simulationTimer = setInterval(() => {
      if (!tm.isHalted()) {
        stepForward();
      } else {
        pauseSimulation();
      }
    }, stepIntervalMs);
  }

  function pauseSimulation() {
    isRunning = false;
    clearInterval(simulationTimer);
    simulationTimer = null;
    playPauseBtn.innerHTML = `${SVGS.play}<span>Run</span>`;
  }

  // ---- UI Update ----

  function updateUI() {
    stepCountDisplay.textContent = tm.stepCount;
    headIndexDisplay.textContent = tm.head;

    currentStateBadge.textContent = tm.state;
    currentStateBadge.className = 'state-tag';
    if (tm.status === 'ACCEPTED') currentStateBadge.classList.add('accept');
    if (tm.status === 'REJECTED') currentStateBadge.classList.add('reject');

    statusBadge.textContent = tm.status;
    statusBadge.className = `status-tag ${tm.status.toLowerCase()}`;

    // Instantaneous Description
    if (instantaneousDescriptionDisplay) {
      instantaneousDescriptionDisplay.innerHTML = tm.getFormattedID();
    }

    stepBackBtn.disabled = tm.history.length === 0;
    stepForwardBtn.disabled = tm.isHalted();

    renderTape();
  }

  function renderTape() {
    const radius = 12;
    const cells = tm.getVisibleCells(radius);

    tapeTrack.innerHTML = '';
    cells.forEach(c => {
      const el = document.createElement('div');
      el.className = `tape-cell${c.isHead ? ' active-head' : ''}`;
      el.innerHTML = `<span class="cell-index">${c.index}</span><span class="cell-symbol${c.isBlank ? ' blank' : ''}">${escapeHtml(c.symbol)}</span>`;
      
      // Allow user to click a cell to edit symbol when not running
      el.addEventListener('click', () => {
        if (isRunning) return;
        const currentSym = tm.read(c.index);
        const options = tm.config.tapeAlphabet || ['0', '1', '␣'];
        const nextIdx = (options.indexOf(currentSym) + 1) % options.length;
        const newSym = options[nextIdx];
        tm.write(newSym, c.index);
        renderTape();
        if (instantaneousDescriptionDisplay) {
          instantaneousDescriptionDisplay.innerHTML = tm.getFormattedID();
        }
      });

      tapeTrack.appendChild(el);
    });

    const cellWidth = 52; // 48 + 4 margin
    const offset = -(radius * cellWidth + 26);
    tapeTrack.style.transform = `translateX(${offset}px)`;
  }

  function highlightTransitionTableRow(fromState, readSym) {
    clearTransitionTableRowHighlights();
    const row = document.getElementById(`trans-row-${fromState}-${readSym}`);
    if (row) row.classList.add('active-transition');
  }

  function clearTransitionTableRowHighlights() {
    transitionTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('active-transition'));
  }

  // ---- Execution Trace Log ----

  function renderTraceLog() {
    if (!traceTableBody) return;
    traceTableBody.innerHTML = '';
    const log = tm.executionLog || [];

    if (traceLogCountBadge) {
      traceLogCountBadge.textContent = `${log.length} Step${log.length === 1 ? '' : 's'}`;
    }
    if (traceStatusLabel) {
      traceStatusLabel.textContent = log.length === 0 ? 'No transitions recorded yet.' : `${log.length} transition step(s) recorded.`;
    }

    if (log.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="8" style="text-align:center; color:var(--text-muted); padding:1rem;">Ready for simulation. Click Step or Run to record execution trace.</td>`;
      traceTableBody.appendChild(emptyRow);
      return;
    }

    log.forEach((entry, idx) => {
      const row = document.createElement('tr');
      const isLatest = idx === log.length - 1;
      row.className = `trace-row${isLatest ? ' active-step' : ''}`;
      row.innerHTML = `
        <td><strong>${entry.step}</strong></td>
        <td>${escapeHtml(entry.prevState)}</td>
        <td><code>${escapeHtml(entry.scannedSymbol)}</code></td>
        <td><strong>${escapeHtml(entry.nextState)}</strong></td>
        <td><code>${escapeHtml(entry.writtenSymbol)}</code></td>
        <td><span class="badge-pill">${escapeHtml(entry.moveDir)}</span></td>
        <td><code>${escapeHtml(entry.idString)}</code></td>
        <td>${escapeHtml(entry.desc || '-')}</td>
      `;
      traceTableBody.appendChild(row);
    });

    // Auto-scroll trace table container to bottom
    const container = traceTableBody.closest('.trace-table-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  function exportTraceCsv() {
    const log = tm.executionLog || [];
    if (log.length === 0) {
      alert('No execution trace steps to export yet. Run or step the simulation first!');
      return;
    }

    let csv = 'Step,Current State,Read Symbol,Next State,Write Symbol,Move Direction,Instantaneous Description,Description\n';
    log.forEach(e => {
      const cleanDesc = (e.desc || '').replace(/"/g, '""');
      const cleanId = (e.idString || '').replace(/"/g, '""');
      csv += `${e.step},"${e.prevState}","${e.scannedSymbol}","${e.nextState}","${e.writtenSymbol}","${e.moveDir}","${cleanId}","${cleanDesc}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tm.config.id}_execution_trace.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---- Automated Batch Test Suite ----

  function renderBatchTestTable() {
    if (!batchTestTableBody) return;
    batchTestTableBody.innerHTML = '';

    if (batchTestSummaryBadge) {
      batchTestSummaryBadge.textContent = `${currentTests.length} Tests`;
    }

    if (currentTests.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="7" style="text-align:center; color:var(--text-muted); padding:1rem;">No test cases defined for this machine. Click "+ Add Custom Test" to create one.</td>`;
      batchTestTableBody.appendChild(row);
      return;
    }

    currentTests.forEach((test, idx) => {
      const row = document.createElement('tr');
      const isPass = test.actual === test.expected;
      const statusBadge = test.actual ? (isPass ? `<span class="badge-pass">${SVGS.pass} PASS</span>` : `<span class="badge-fail">${SVGS.fail} FAIL</span>`) : '<span class="badge-pending">PENDING</span>';

      row.innerHTML = `
        <td><code>${test.input === '' ? 'ε (empty)' : escapeHtml(test.input)}</code></td>
        <td>${escapeHtml(test.label || '-')}</td>
        <td><strong>${escapeHtml(test.expected)}</strong></td>
        <td>${test.actual ? `<strong>${escapeHtml(test.actual)}</strong>` : '-'}</td>
        <td>${statusBadge}</td>
        <td>${test.steps !== undefined ? test.steps : '-'}</td>
        <td><button class="btn btn-xs load-test-btn" data-index="${idx}">Load</button></td>
      `;
      batchTestTableBody.appendChild(row);
    });

    // Wire Load test buttons
    batchTestTableBody.querySelectorAll('.load-test-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.target.dataset.index, 10);
        const test = currentTests[idx];
        if (test) {
          inputTapeString.value = test.input;
          inputValidationMsg.textContent = '';
          resetSimulation();
        }
      });
    });
  }

  function runAllBatchTests() {
    if (currentTests.length === 0) return;

    // Reveal accordion if collapsed
    if (batchTestWrapper && batchTestWrapper.classList.contains('hidden')) {
      batchTestWrapper.classList.remove('hidden');
      if (batchTestArrow) batchTestArrow.classList.remove('collapsed');
    }

    let passedCount = 0;
    const total = currentTests.length;

    currentTests.forEach(test => {
      const res = TuringMachine.evaluateString(tm.config, test.input);
      test.actual = res.status;
      test.steps = res.steps;
      if (test.actual === test.expected) {
        passedCount++;
      }
    });

    renderBatchTestTable();

    const allPassed = passedCount === total;
    testSuiteScore.textContent = `${passedCount}/${total} Passed (${Math.round((passedCount / total) * 100)}%)`;
    testSuiteScore.className = `test-score-text ${allPassed ? 'success' : 'fail'}`;

    if (window.tmAudio) {
      if (allPassed) {
        window.tmAudio.playAcceptChime();
      } else {
        window.tmAudio.playRejectChime();
      }
    }
  }

  function resetDefaultTests() {
    const preset = MACHINE_PRESETS[currentPresetKey];
    currentTests = preset && preset.defaultTests ? JSON.parse(JSON.stringify(preset.defaultTests)) : [];
    testSuiteScore.textContent = `${currentTests.length} tests ready`;
    testSuiteScore.className = 'test-score-text';
    renderBatchTestTable();
  }

  // ---- JFLAP Import (.jff) ----

  function handleJflapFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const xmlContent = e.target.result;
        const cleanName = file.name.replace(/\.jff$/i, '').replace(/[_-]/g, ' ');
        const importedConfig = JflapExporter.parseXml(xmlContent, cleanName);

        // Register into presets
        MACHINE_PRESETS[importedConfig.id] = importedConfig;

        // Add option to select
        const opt = document.createElement('option');
        opt.value = importedConfig.id;
        opt.textContent = `[Imported] ${importedConfig.title}`;
        opt.selected = true;
        machineSelect.appendChild(opt);

        loadMachinePreset(importedConfig.id);
        alert(`Successfully imported JFLAP machine "${cleanName}" with ${importedConfig.states.length} states and ${importedConfig.transitions.length} transitions!`);
      } catch (err) {
        alert('Failed to parse JFLAP file: ' + err.message);
      }
      jflapFileInput.value = '';
    };
    reader.readAsText(file);
  }

  // ---- Custom Machine Builder Modal ----

  function openCustomMachineModal() {
    customMachineError.textContent = '';
    const current = MACHINE_PRESETS[currentPresetKey] || MACHINE_PRESETS.even_ones;
    customMachineTitle.value = `${current.title} (Customized)`;
    customInitialState.value = current.initialState || 'q0';
    customAcceptStates.value = (current.acceptStates || []).join(', ');
    customRejectStates.value = (current.rejectStates || []).join(', ');

    // Extract minimal JSON representation
    const exportable = {
      states: current.states,
      transitions: current.transitions,
      alphabet: current.alphabet,
      tapeAlphabet: current.tapeAlphabet
    };
    customTransitionsJson.value = JSON.stringify(exportable, null, 2);

    customMachineModal.classList.remove('hidden');
  }

  function saveCustomMachine() {
    customMachineError.textContent = '';
    const title = customMachineTitle.value.trim() || 'Custom Turing Machine';
    const q0 = customInitialState.value.trim();
    const accList = customAcceptStates.value.split(',').map(s => s.trim()).filter(Boolean);
    const rejList = customRejectStates.value.split(',').map(s => s.trim()).filter(Boolean);

    if (!q0) {
      customMachineError.textContent = 'Please specify an initial state.';
      return;
    }
    if (accList.length === 0) {
      customMachineError.textContent = 'Please specify at least one accept state.';
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(customTransitionsJson.value);
    } catch (e) {
      customMachineError.textContent = 'Invalid JSON: ' + e.message;
      return;
    }

    if (!parsed.states || !Array.isArray(parsed.states) || !parsed.transitions || !Array.isArray(parsed.transitions)) {
      customMachineError.textContent = 'JSON must include "states" and "transitions" arrays.';
      return;
    }

    const customId = 'custom_' + Date.now();
    const customConfig = {
      id: customId,
      title: title,
      assignmentTopic: title,
      description: `Custom User-Defined Turing Machine with ${parsed.states.length} states.`,
      alphabet: parsed.alphabet || ['0', '1'],
      tapeAlphabet: parsed.tapeAlphabet || ['0', '1', '␣'],
      blankSymbol: '␣',
      initialState: q0,
      acceptStates: accList,
      rejectStates: rejList,
      viewBox: '0 0 840 540',
      states: parsed.states,
      transitions: parsed.transitions,
      formalTuple: {
        Q: `{ ${parsed.states.map(s => s.name || s.id).join(', ')} }`,
        Sigma: `{ ${(parsed.alphabet || ['0', '1']).join(', ')} }`,
        Gamma: `{ ${(parsed.tapeAlphabet || ['0', '1', '␣']).join(', ')} }`,
        q0: q0,
        B: '␣',
        F: `{ ${accList.join(', ')} }`
      },
      defaultTests: []
    };

    MACHINE_PRESETS[customId] = customConfig;

    const opt = document.createElement('option');
    opt.value = customId;
    opt.textContent = `[Custom] ${title}`;
    opt.selected = true;
    machineSelect.appendChild(opt);

    customMachineModal.classList.add('hidden');
    loadMachinePreset(customId);
  }

  function loadSampleTemplate() {
    const template = {
      states: [
        { id: 'q0', name: 'q0', subtitle: 'Start', isInitial: true, x: 260, y: 220, loopDir: 'top' },
        { id: 'q_accept', name: 'q_acc', subtitle: 'Accept', isAccept: true, x: 540, y: 220 }
      ],
      alphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', '␣'],
      transitions: [
        { from: 'q0', read: '0', to: 'q0', write: '1', move: 'R', desc: 'Invert 0 to 1' },
        { from: 'q0', read: '1', to: 'q0', write: '0', move: 'R', desc: 'Invert 1 to 0' },
        { from: 'q0', read: '␣', to: 'q_accept', write: '␣', move: 'S', desc: 'Halt on blank' }
      ]
    };
    customMachineTitle.value = 'Binary Inverter (0↔1)';
    customInitialState.value = 'q0';
    customAcceptStates.value = 'q_accept';
    customRejectStates.value = '';
    customTransitionsJson.value = JSON.stringify(template, null, 2);
  }

  // ---- Helper ----
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- Setup Event Listeners ----

  function setupEventListeners() {
    machineSelect.addEventListener('change', e => loadMachinePreset(e.target.value));

    loadTapeBtn.addEventListener('click', validateAndLoadInput);
    inputTapeString.addEventListener('keydown', e => { if (e.key === 'Enter') validateAndLoadInput(); });

    playPauseBtn.addEventListener('click', togglePlayPause);
    stepForwardBtn.addEventListener('click', stepForward);
    stepBackBtn.addEventListener('click', stepBack);
    resetBtn.addEventListener('click', resetSimulation);

    speedSlider.addEventListener('input', e => {
      stepIntervalMs = parseInt(e.target.value, 10);
      speedValueLabel.textContent = `${stepIntervalMs}ms`;
      if (isRunning) {
        clearInterval(simulationTimer);
        startSimulation();
      }
    });

    // Sound toggle
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', toggleSound);
    }

    // Theme toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Accordions
    if (toggleTransitionBtn) {
      toggleTransitionBtn.addEventListener('click', () => {
        const isHidden = transitionTableWrapper.classList.toggle('hidden');
        if (toggleArrow) toggleArrow.classList.toggle('collapsed', isHidden);
      });
    }

    if (toggleBatchTestBtn) {
      toggleBatchTestBtn.addEventListener('click', () => {
        const isHidden = batchTestWrapper.classList.toggle('hidden');
        if (batchTestArrow) batchTestArrow.classList.toggle('collapsed', isHidden);
      });
    }

    if (toggleTraceLogBtn) {
      toggleTraceLogBtn.addEventListener('click', () => {
        const isHidden = traceLogWrapper.classList.toggle('hidden');
        if (traceLogArrow) traceLogArrow.classList.toggle('collapsed', isHidden);
      });
    }

    // Batch Test Suite actions
    if (runAllTestsBtn) runAllTestsBtn.addEventListener('click', runAllBatchTests);
    if (resetDefaultTestsBtn) resetDefaultTestsBtn.addEventListener('click', resetDefaultTests);

    // Custom Test Modal
    if (addCustomTestBtn) addCustomTestBtn.addEventListener('click', () => addTestModal.classList.remove('hidden'));
    if (closeAddTestBtn) closeAddTestBtn.addEventListener('click', () => addTestModal.classList.add('hidden'));
    if (cancelAddTestBtn) cancelAddTestBtn.addEventListener('click', () => addTestModal.classList.add('hidden'));
    if (saveCustomTestBtn) {
      saveCustomTestBtn.addEventListener('click', () => {
        const inputVal = customTestInput.value.trim();
        const expVal = customTestExpected.value;
        const lblVal = customTestLabel.value.trim() || `Custom test: "${inputVal}"`;
        currentTests.push({ input: inputVal, expected: expVal, label: lblVal });
        addTestModal.classList.add('hidden');
        customTestInput.value = '';
        customTestLabel.value = '';
        renderBatchTestTable();
      });
    }

    // Trace Log actions
    if (exportTraceCsvBtn) exportTraceCsvBtn.addEventListener('click', exportTraceCsv);
    if (clearTraceLogBtn) clearTraceLogBtn.addEventListener('click', () => {
      tm.executionLog = [];
      renderTraceLog();
    });

    // JFLAP Export Modal
    downloadJflapBtn.addEventListener('click', () => {
      jflapXmlContent.textContent = JflapExporter.generateXml(tm.config);
      jflapModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => jflapModal.classList.add('hidden'));
    jflapModal.addEventListener('click', e => { if (e.target === jflapModal) jflapModal.classList.add('hidden'); });
    downloadXmlFileBtn.addEventListener('click', () => JflapExporter.downloadFile(tm.config));
    copyXmlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(jflapXmlContent.textContent).then(() => {
        copyXmlBtn.innerHTML = `${SVGS.pass}<span>Copied</span>`;
        setTimeout(() => { copyXmlBtn.textContent = 'Copy XML'; }, 1500);
      });
    });

    // JFLAP Import
    if (importJflapBtn) importJflapBtn.addEventListener('click', () => jflapFileInput.click());
    if (jflapFileInput) jflapFileInput.addEventListener('change', handleJflapFileSelect);

    // Custom Machine Builder Modal
    if (customMachineBtn) customMachineBtn.addEventListener('click', openCustomMachineModal);
    if (closeCustomModalBtn) closeCustomModalBtn.addEventListener('click', () => customMachineModal.classList.add('hidden'));
    if (cancelCustomBtn) cancelCustomBtn.addEventListener('click', () => customMachineModal.classList.add('hidden'));
    if (saveCustomMachineBtn) saveCustomMachineBtn.addEventListener('click', saveCustomMachine);
    if (loadSampleTemplateBtn) loadSampleTemplateBtn.addEventListener('click', loadSampleTemplate);

    // Keyboard shortcuts (when not in text input)
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlayPause(); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); stepForward(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); stepBack(); }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); resetSimulation(); }
      else if (e.key.toLowerCase() === 't') { e.preventDefault(); runAllBatchTests(); }
      else if (e.key.toLowerCase() === 'm') { e.preventDefault(); toggleSound(); }
    });
  }

  // ---- Bootstrap ----

  function initApp() {
    initTheme();
    updateSoundButton();
    loadMachinePreset(currentPresetKey);
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
