/**
 * TuringMachine Engine & Presets
 * Theory of Computation - Module 5 Assignment
 * Author: Pair programmed with Antigravity
 */

const BLANK_SYMBOL = '␣'; // Representing blank symbol (JFLAP blank or 'B')

/**
 * Machine Definitions & Presets
 */
const MACHINE_PRESETS = {
  even_ones: {
    id: 'even_ones',
    title: 'Turing Machine for Binary Strings with an Even Number of 1s',
    assignmentTopic: 'Design and Simulation of a Turing Machine for Binary Strings with an Even Number of 1s',
    description: 'Language: L = { w ∈ {0, 1}* | |w|₁ mod 2 = 0 }. The machine begins in q0 (even parity). Reading a "1" flips the parity between q0 (even) and q1 (odd). Reading a "0" keeps parity unchanged. When the blank symbol ␣ is reached, if in q0, it enters q_accept; if in q1, it halts in q_reject.',
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', BLANK_SYMBOL],
    blankSymbol: BLANK_SYMBOL,
    initialState: 'q0',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    viewBox: '0 0 780 480',
    states: [
      { id: 'q0', name: 'q₀', subtitle: 'Even 1s', isInitial: true, isAccept: false, isReject: false, x: 220, y: 170, loopDir: 'top' },
      { id: 'q1', name: 'q₁', subtitle: 'Odd 1s', isInitial: false, isAccept: false, isReject: false, x: 560, y: 170, loopDir: 'top' },
      { id: 'q_accept', name: 'q_acc', subtitle: 'Accept', isInitial: false, isAccept: true, isReject: false, x: 220, y: 350 },
      { id: 'q_reject', name: 'q_rej', subtitle: 'Reject', isInitial: false, isAccept: false, isReject: true, x: 560, y: 350 }
    ],
    // Formal 7-Tuple details
    formalTuple: {
      Q: '{ q0, q1, q_accept, q_reject }',
      Sigma: '{ 0, 1 }',
      Gamma: '{ 0, 1, ␣ }',
      q0: 'q0',
      B: '␣ (Blank symbol)',
      F: '{ q_accept }'
    },
    // δ Transitions: [fromState, readSym, nextState, writeSym, moveDir, explanation]
    transitions: [
      { from: 'q0', read: '0', to: 'q0', write: '0', move: 'R', desc: 'Even count: Read 0, stay in q0, move right' },
      { from: 'q0', read: '1', to: 'q1', write: '1', move: 'R', desc: 'Even count: Read 1, flip to q1 (odd), move right' },
      { from: 'q0', read: BLANK_SYMBOL, to: 'q_accept', write: BLANK_SYMBOL, move: 'S', desc: 'End of string reached with even 1s -> ACCEPT' },
      { from: 'q1', read: '0', to: 'q1', write: '0', move: 'R', desc: 'Odd count: Read 0, stay in q1, move right' },
      { from: 'q1', read: '1', to: 'q0', write: '1', move: 'R', desc: 'Odd count: Read 1, flip to q0 (even), move right' },
      { from: 'q1', read: BLANK_SYMBOL, to: 'q_reject', write: BLANK_SYMBOL, move: 'S', desc: 'End of string reached with odd 1s -> REJECT' }
    ],
    // Default test cases
    defaultTests: [
      { input: '', expected: 'ACCEPT', label: 'Empty string ε (0 ones - even)' },
      { input: '0', expected: 'ACCEPT', label: 'Single 0 (0 ones - even)' },
      { input: '1', expected: 'REJECT', label: 'Single 1 (1 one - odd)' },
      { input: '11', expected: 'ACCEPT', label: 'Two 1s (even)' },
      { input: '111', expected: 'REJECT', label: 'Three 1s (odd)' },
      { input: '101', expected: 'ACCEPT', label: 'Two 1s with 0 in middle (even)' },
      { input: '0000', expected: 'ACCEPT', label: 'All 0s (0 ones - even)' },
      { input: '10101', expected: 'REJECT', label: 'Three 1s (odd)' },
      { input: '110011', expected: 'ACCEPT', label: 'Four 1s (even)' },
      { input: '1011001', expected: 'ACCEPT', label: 'Four 1s (even)' },
      { input: '0101010', expected: 'REJECT', label: 'Three 1s (odd)' },
      { input: '111111', expected: 'ACCEPT', label: 'Six 1s (even)' }
    ],
    quickInputs: [
      { val: '', label: 'ε (empty)' },
      { val: '1011001', label: '1011001 (even)' },
      { val: '10101', label: '10101 (odd)' }
    ]
  },

  equal_zeros_ones: {
    id: 'equal_zeros_ones',
    title: 'Turing Machine for 0ⁿ1ⁿ (Equal 0s and 1s)',
    assignmentTopic: 'Classic Non-Regular Language 0ⁿ1ⁿ Recognizer',
    description: 'Language: L = { 0ⁿ1ⁿ | n ≥ 0 }. Matches each "0" with a corresponding "1" by marking "0" as X and "1" as Y, traversing back and forth until all symbols are verified.',
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'X', 'Y', BLANK_SYMBOL],
    blankSymbol: BLANK_SYMBOL,
    initialState: 'q0',
    acceptStates: ['q4'],
    rejectStates: ['q_reject'],
    viewBox: '0 0 900 500',
    states: [
      { id: 'q0', name: 'q₀', subtitle: 'Start', isInitial: true, isAccept: false, isReject: false, x: 100, y: 180 },
      { id: 'q1', name: 'q₁', subtitle: 'Find 1', isInitial: false, isAccept: false, isReject: false, x: 320, y: 180, loopDir: 'top' },
      { id: 'q2', name: 'q₂', subtitle: 'Rewind', isInitial: false, isAccept: false, isReject: false, x: 540, y: 180, loopDir: 'top' },
      { id: 'q3', name: 'q₃', subtitle: 'Check Y', isInitial: false, isAccept: false, isReject: false, x: 320, y: 370, loopDir: 'bottom' },
      { id: 'q4', name: 'q_acc', subtitle: 'Accept', isInitial: false, isAccept: true, isReject: false, x: 540, y: 370 },
      { id: 'q_reject', name: 'q_rej', subtitle: 'Reject', isInitial: false, isAccept: false, isReject: true, x: 760, y: 180 }
    ],
    formalTuple: {
      Q: '{ q0, q1, q2, q3, q4, q_reject }',
      Sigma: '{ 0, 1 }',
      Gamma: '{ 0, 1, X, Y, ␣ }',
      q0: 'q0',
      B: '␣',
      F: '{ q4 }'
    },
    transitions: [
      { from: 'q0', read: '0', to: 'q1', write: 'X', move: 'R', desc: 'Mark 0 as X, search right for 1', labelOffset: { dx: 0, dy: -22 } },
      { from: 'q0', read: 'Y', to: 'q3', write: 'Y', move: 'R', desc: 'All 0s matched, verify remaining are Ys', labelOffset: { dx: -28, dy: 0 } },
      { from: 'q0', read: BLANK_SYMBOL, to: 'q4', write: BLANK_SYMBOL, move: 'S', desc: 'Empty string accepted', labelOffset: { dx: 20, dy: -20 } },
      { from: 'q1', read: '0', to: 'q1', write: '0', move: 'R', desc: 'Scan right past 0' },
      { from: 'q1', read: 'Y', to: 'q1', write: 'Y', move: 'R', desc: 'Scan right past Y' },
      { from: 'q1', read: '1', to: 'q2', write: 'Y', move: 'L', desc: 'Match 1 as Y, move left', labelOffset: { dx: 0, dy: -22 } },
      { from: 'q2', read: '0', to: 'q2', write: '0', move: 'L', desc: 'Scan left past 0' },
      { from: 'q2', read: 'Y', to: 'q2', write: 'Y', move: 'L', desc: 'Scan left past Y' },
      { from: 'q2', read: 'X', to: 'q0', write: 'X', move: 'R', desc: 'Found X boundary, step right to q0', labelOffset: { dx: 0, dy: 26 } },
      { from: 'q3', read: 'Y', to: 'q3', write: 'Y', move: 'R', desc: 'Scan right past Y' },
      { from: 'q3', read: BLANK_SYMBOL, to: 'q4', write: BLANK_SYMBOL, move: 'S', desc: 'All Ys verified -> ACCEPT', labelOffset: { dx: 0, dy: -22 } }
    ],
    defaultTests: [
      { input: '', expected: 'ACCEPT', label: 'Empty string ε (n=0)' },
      { input: '01', expected: 'ACCEPT', label: '01 (n=1)' },
      { input: '0011', expected: 'ACCEPT', label: '0011 (n=2)' },
      { input: '000111', expected: 'ACCEPT', label: '000111 (n=3)' },
      { input: '0', expected: 'REJECT', label: '0 without 1' },
      { input: '1', expected: 'REJECT', label: '1 without 0' },
      { input: '0101', expected: 'REJECT', label: '0101 (out of order)' },
      { input: '001', expected: 'REJECT', label: '001 (unequal count)' }
    ],
    quickInputs: [
      { val: '', label: 'ε (n=0)' },
      { val: '000111', label: '000111 (n=3)' },
      { val: '0101', label: '0101 (invalid)' }
    ]
  },

  palindrome: {
    id: 'palindrome',
    title: 'Turing Machine for Binary Palindromes (w = wᴿ)',
    assignmentTopic: 'Binary Palindrome Recognition on Single Tape',
    description: 'Language: L = { w ∈ {0, 1}* | w = wᴿ }. Matches the first symbol with the last symbol, blanks them out, and repeats inwardly until the tape is blank.',
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', BLANK_SYMBOL],
    blankSymbol: BLANK_SYMBOL,
    initialState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: ['q_rej'],
    viewBox: '0 0 860 580',
    states: [
      { id: 'q_acc', name: 'accept', subtitle: 'q_acc', color: '#ec4899', strokeColor: '#eab308', textColor: '#ffffff', isAccept: true, x: 430, y: 65 },
      { id: 'q1', name: 'haveA', subtitle: 'read 0', color: '#ea580c', textColor: '#ffffff', x: 160, y: 210, loopDir: 'top-left' },
      { id: 'q0', name: 'start', subtitle: 'q₀', color: '#2563eb', textColor: '#ffffff', isInitial: true, x: 430, y: 210 },
      { id: 'q2', name: 'haveB', subtitle: 'read 1', color: '#16a34a', textColor: '#ffffff', x: 700, y: 210, loopDir: 'top-right' },
      { id: 'q3', name: 'matchA', subtitle: 'match 0', color: '#dc2626', textColor: '#ffffff', x: 160, y: 385 },
      { id: 'q5', name: 'back', subtitle: 'rewind', color: '#78350f', textColor: '#ffffff', x: 430, y: 385, loopDir: 'right' },
      { id: 'q4', name: 'matchB', subtitle: 'match 1', color: '#9333ea', textColor: '#ffffff', x: 700, y: 385 },
      { id: 'q_rej', name: 'reject', subtitle: 'q_rej', color: '#52525b', textColor: '#ffffff', isReject: true, x: 430, y: 515 }
    ],
    formalTuple: {
      Q: '{ start, haveA, haveB, matchA, matchB, back, accept, reject }',
      Sigma: '{ 0, 1 }',
      Gamma: '{ 0, 1, ␣ }',
      q0: 'start',
      B: '␣',
      F: '{ accept }'
    },
    transitions: [
      { from: 'q0', read: '0', to: 'q1', write: BLANK_SYMBOL, move: 'R', desc: 'Read 0, erase with blank, search end', labelOffset: { dx: 0, dy: -22 } },
      { from: 'q0', read: '1', to: 'q2', write: BLANK_SYMBOL, move: 'R', desc: 'Read 1, erase with blank, search end', labelOffset: { dx: 0, dy: -22 } },
      { from: 'q0', read: BLANK_SYMBOL, to: 'q_acc', write: BLANK_SYMBOL, move: 'S', desc: 'Blank tape -> ACCEPT', labelOffset: { dx: 22, dy: 0 } },
      { from: 'q1', read: '0', to: 'q1', write: '0', move: 'R', desc: 'Move right past 0' },
      { from: 'q1', read: '1', to: 'q1', write: '1', move: 'R', desc: 'Move right past 1' },
      { from: 'q1', read: BLANK_SYMBOL, to: 'q3', write: BLANK_SYMBOL, move: 'L', desc: 'End reached, step left to verify', labelOffset: { dx: -26, dy: 0 } },
      { from: 'q2', read: '0', to: 'q2', write: '0', move: 'R', desc: 'Move right past 0' },
      { from: 'q2', read: '1', to: 'q2', write: '1', move: 'R', desc: 'Move right past 1' },
      { from: 'q2', read: BLANK_SYMBOL, to: 'q4', write: BLANK_SYMBOL, move: 'L', desc: 'End reached, step left to verify', labelOffset: { dx: 26, dy: 0 } },
      { from: 'q3', read: '0', to: 'q5', write: BLANK_SYMBOL, move: 'L', desc: 'Matched 0, erase with blank, rewind', labelOffset: { dx: 0, dy: -22 } },
      { from: 'q3', read: BLANK_SYMBOL, to: 'q_acc', write: BLANK_SYMBOL, move: 'S', desc: 'Single middle symbol matched -> ACCEPT', curve: -45, labelOffset: { dx: -26, dy: 0 } },
      { from: 'q3', read: '1', to: 'q_rej', write: '1', move: 'S', desc: 'Mismatch (expected 0, got 1) -> REJECT', labelOffset: { dx: -26, dy: 0 } },
      { from: 'q4', read: '1', to: 'q5', write: BLANK_SYMBOL, move: 'L', desc: 'Matched 1, erase with blank, rewind', labelOffset: { dx: 0, dy: -22 } },
      { from: 'q4', read: BLANK_SYMBOL, to: 'q_acc', write: BLANK_SYMBOL, move: 'S', desc: 'Single middle symbol matched -> ACCEPT', curve: 45, labelOffset: { dx: 26, dy: 0 } },
      { from: 'q4', read: '0', to: 'q_rej', write: '0', move: 'S', desc: 'Mismatch (expected 1, got 0) -> REJECT', labelOffset: { dx: 26, dy: 0 } },
      { from: 'q5', read: '0', to: 'q5', write: '0', move: 'L', desc: 'Rewind left past 0' },
      { from: 'q5', read: '1', to: 'q5', write: '1', move: 'L', desc: 'Rewind left past 1' },
      { from: 'q5', read: BLANK_SYMBOL, to: 'q0', write: BLANK_SYMBOL, move: 'R', desc: 'Rewound to start blank, restart', labelOffset: { dx: 0, dy: -22 } }
    ],
    defaultTests: [
      { input: '', expected: 'ACCEPT', label: 'Empty string ε' },
      { input: '0', expected: 'ACCEPT', label: 'Single 0' },
      { input: '1', expected: 'ACCEPT', label: 'Single 1' },
      { input: '11', expected: 'ACCEPT', label: '11' },
      { input: '101', expected: 'ACCEPT', label: '101' },
      { input: '1001', expected: 'ACCEPT', label: '1001' },
      { input: '10', expected: 'REJECT', label: '10 (not palindrome)' },
      { input: '110', expected: 'REJECT', label: '110 (not palindrome)' }
    ],
    quickInputs: [
      { val: '', label: 'ε (empty)' },
      { val: '1001', label: '1001 (pal)' },
      { val: '1110', label: '1110 (not pal)' }
    ]
  },

  binary_increment: {
    id: 'binary_increment',
    title: 'Turing Machine for Binary Incrementer (n + 1)',
    assignmentTopic: 'Transducer Turing Machine: Add 1 to Binary Number',
    description: 'Scans to the rightmost bit, adds 1 with carry propagation leftwards, and halts in accept state with the incremented binary number on tape.',
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', BLANK_SYMBOL],
    blankSymbol: BLANK_SYMBOL,
    initialState: 'q0',
    acceptStates: ['q_done'],
    rejectStates: [],
    viewBox: '0 0 780 380',
    states: [
      { id: 'q0', name: 'q₀', subtitle: 'Scan Right', isInitial: true, isAccept: false, isReject: false, x: 160, y: 190, loopDir: 'top' },
      { id: 'q1', name: 'q₁', subtitle: 'Add Carry', isInitial: false, isAccept: false, isReject: false, x: 400, y: 190, loopDir: 'top' },
      { id: 'q_done', name: 'q_done', subtitle: 'Halt', isInitial: false, isAccept: true, isReject: false, x: 640, y: 190 }
    ],
    formalTuple: {
      Q: '{ q0, q1, q_done }',
      Sigma: '{ 0, 1 }',
      Gamma: '{ 0, 1, ␣ }',
      q0: 'q0',
      B: '␣',
      F: '{ q_done }'
    },
    transitions: [
      { from: 'q0', read: '0', to: 'q0', write: '0', move: 'R', desc: 'Scan right past 0' },
      { from: 'q0', read: '1', to: 'q0', write: '1', move: 'R', desc: 'Scan right past 1' },
      { from: 'q0', read: BLANK_SYMBOL, to: 'q1', write: BLANK_SYMBOL, move: 'L', desc: 'Reached end, move left to LSB' },
      { from: 'q1', read: '0', to: 'q_done', write: '1', move: 'S', desc: '0 + 1 = 1 (no carry) -> HALT' },
      { from: 'q1', read: '1', to: 'q1', write: '0', move: 'L', desc: '1 + 1 = 0 (carry 1) -> move left' },
      { from: 'q1', read: BLANK_SYMBOL, to: 'q_done', write: '1', move: 'S', desc: 'Carry into new MSB (e.g. 11->100) -> HALT' }
    ],
    defaultTests: [
      { input: '0', expected: 'ACCEPT', label: '0 + 1 = 1' },
      { input: '1', expected: 'ACCEPT', label: '1 + 1 = 10' },
      { input: '10', expected: 'ACCEPT', label: '10 (2) + 1 = 11 (3)' },
      { input: '11', expected: 'ACCEPT', label: '11 (3) + 1 = 100 (4)' },
      { input: '101', expected: 'ACCEPT', label: '101 (5) + 1 = 110 (6)' }
    ],
    quickInputs: [
      { val: '0', label: '0 (+1=1)' },
      { val: '10', label: '10 (+1=11)' },
      { val: '11', label: '11 (+1=100)' }
    ]
  }
};

/**
 * TuringMachine Class
 * Simulates a single-tape deterministic Turing Machine with history tracking and ID generation.
 */
class TuringMachine {
  constructor(presetConfig = MACHINE_PRESETS.even_ones) {
    this.config = presetConfig;
    this.reset();
  }

  /**
   * Set configuration preset
   */
  loadPreset(presetKey) {
    if (MACHINE_PRESETS[presetKey]) {
      this.config = MACHINE_PRESETS[presetKey];
      this.reset();
      return true;
    }
    return false;
  }

  /**
   * Reset the machine to initial state with blank tape
   */
  reset(inputString = '') {
    this.inputString = inputString;
    this.state = this.config.initialState;
    this.head = 0;
    this.stepCount = 0;
    this.status = 'READY'; // READY, RUNNING, ACCEPTED, REJECTED
    this.tape = new Map(); // Index -> Symbol
    this.history = []; // Array of snapshots for undo/rewind
    this.executionLog = []; // Step-by-step trace log
    this.lastTransition = null;

    // Initialize tape with inputString at indices 0, 1, 2...
    if (inputString && inputString.length > 0) {
      for (let i = 0; i < inputString.length; i++) {
        this.tape.set(i, inputString[i]);
      }
    }
  }

  /**
   * Read the symbol at a given tape index (defaults to head)
   */
  read(index = this.head) {
    if (this.tape.has(index)) {
      return this.tape.get(index);
    }
    return this.config.blankSymbol;
  }

  /**
   * Write a symbol at a given tape index (defaults to head)
   */
  write(symbol, index = this.head) {
    if (symbol === this.config.blankSymbol) {
      this.tape.delete(index);
    } else {
      this.tape.set(index, symbol);
    }
  }

  /**
   * Look up transition function δ(state, readSymbol)
   */
  findTransition(state, readSymbol) {
    return this.config.transitions.find(
      t => t.from === state && t.read === readSymbol
    ) || null;
  }

  /**
   * Save a snapshot of current configuration for Step Backward / Undo
   */
  saveSnapshot(lastTrans = null) {
    // Clone tape map
    const tapeClone = new Map(this.tape);
    this.history.push({
      state: this.state,
      head: this.head,
      stepCount: this.stepCount,
      status: this.status,
      tape: tapeClone,
      lastTransition: lastTrans
    });
  }

  /**
   * Step backward (undo previous transition)
   */
  stepBack() {
    if (this.history.length === 0) return false;

    const previous = this.history.pop();
    this.state = previous.state;
    this.head = previous.head;
    this.stepCount = previous.stepCount;
    this.status = previous.status;
    this.tape = previous.tape;
    this.lastTransition = previous.lastTransition;

    if (this.executionLog.length > 0) {
      this.executionLog.pop();
    }

    return true;
  }

  /**
   * Execute a single step forward
   * @returns {Object} { done: boolean, accepted: boolean, transition: Object }
   */
  stepForward() {
    // If already halted, stop
    if (this.isHalted()) {
      return { done: true, accepted: this.isAccepted(), transition: null };
    }

    const currentSymbol = this.read(this.head);
    const transition = this.findTransition(this.state, currentSymbol);

    // Save current configuration to history before executing
    this.saveSnapshot(this.lastTransition);

    if (!transition) {
      // No transition defined for this (state, symbol) pair -> Reject & Halt
      if (this.config.acceptStates.includes(this.state)) {
        this.status = 'ACCEPTED';
      } else {
        this.status = 'REJECTED';
      }
      return { done: true, accepted: this.isAccepted(), transition: null };
    }

    // Record the transition taken
    this.lastTransition = transition;

    // Instantaneous Description before write/move
    const idBefore = this.getInstantaneousDescription();

    // 1. Write symbol to tape
    this.write(transition.write, this.head);

    // 2. Move tape head
    if (transition.move === 'R') {
      this.head += 1;
    } else if (transition.move === 'L') {
      this.head -= 1;
    } // 'S' stays in place

    // 3. Update state
    const previousState = this.state;
    this.state = transition.to;
    this.stepCount += 1;

    // Check halting conditions
    let isHalt = false;
    if (this.config.acceptStates.includes(this.state)) {
      this.status = 'ACCEPTED';
      isHalt = true;
    } else if (this.config.rejectStates && this.config.rejectStates.includes(this.state)) {
      this.status = 'REJECTED';
      isHalt = true;
    } else {
      this.status = 'RUNNING';
    }

    // Add entry to execution trace log
    this.executionLog.push({
      step: this.stepCount,
      prevState: previousState,
      scannedSymbol: currentSymbol,
      writtenSymbol: transition.write,
      moveDir: transition.move,
      nextState: this.state,
      idString: idBefore,
      desc: transition.desc
    });

    return {
      done: isHalt,
      accepted: this.isAccepted(),
      transition: transition
    };
  }

  /**
   * Run simulation to completion (with step safety limit)
   */
  runToCompletion(maxSteps = 5000) {
    let steps = 0;
    while (!this.isHalted() && steps < maxSteps) {
      this.stepForward();
      steps++;
    }
    return {
      halted: this.isHalted(),
      accepted: this.isAccepted(),
      steps: this.stepCount,
      exceededLimit: steps >= maxSteps
    };
  }

  /**
   * Fast evaluation for test suite without UI overhead
   */
  static evaluateString(presetConfig, testString, maxSteps = 4000) {
    const tm = new TuringMachine(presetConfig);
    tm.reset(testString);
    const result = tm.runToCompletion(maxSteps);
    return {
      input: testString,
      accepted: result.accepted,
      status: result.accepted ? 'ACCEPT' : 'REJECT',
      steps: result.steps,
      exceededLimit: result.exceededLimit
    };
  }

  isHalted() {
    return this.status === 'ACCEPTED' || this.status === 'REJECTED';
  }

  isAccepted() {
    return this.status === 'ACCEPTED';
  }

  /**
   * Count occurrences of '1' currently on the tape
   */
  countOnes() {
    let count = 0;
    for (const [_, val] of this.tape.entries()) {
      if (val === '1') count++;
    }
    return count;
  }

  /**
   * Generate formal Instantaneous Description (ID): u (q) v
   * e.g., "10 (q0) 110" where head is pointing at the first '1' of '110'.
   */
  getInstantaneousDescription() {
    // Find min and max non-blank indices
    let minIdx = Math.min(0, this.head);
    let maxIdx = Math.max(this.inputString.length - 1, this.head);

    for (const k of this.tape.keys()) {
      if (k < minIdx) minIdx = k;
      if (k > maxIdx) maxIdx = k;
    }

    let left = '';
    for (let i = minIdx; i < this.head; i++) {
      left += this.read(i);
    }

    let headSym = this.read(this.head);

    let right = '';
    for (let i = this.head + 1; i <= maxIdx; i++) {
      right += this.read(i);
    }

    // Clean up excessive blank symbols on edges
    left = left.replace(/^␣+/, '');
    right = right.replace(/␣+$/, '');

    const leftPart = left.length > 0 ? left : 'ε';
    return `${leftPart} (${this.state}) ${headSym}${right}`;
  }

  /**
   * HTML-formatted Instantaneous Description with badge styling
   */
  getFormattedID() {
    let minIdx = Math.min(0, this.head);
    let maxIdx = Math.max(this.inputString.length - 1, this.head);

    for (const k of this.tape.keys()) {
      if (k < minIdx) minIdx = k;
      if (k > maxIdx) maxIdx = k;
    }

    let left = '';
    for (let i = minIdx; i < this.head; i++) {
      left += this.read(i);
    }

    let headSym = this.read(this.head);

    let right = '';
    for (let i = this.head + 1; i <= maxIdx; i++) {
      right += this.read(i);
    }

    left = left.replace(/^␣+/, '');
    right = right.replace(/␣+$/, '');

    const leftSpan = left ? `<span class="id-str">${this.escapeHtml(left)}</span>` : `<span class="id-eps">ε</span>`;
    const stateSpan = `<span class="id-state ${this.status.toLowerCase()}">${this.escapeHtml(this.state)}</span>`;
    const headSpan = `<span class="id-head-sym">${this.escapeHtml(headSym)}</span>`;
    const rightSpan = right ? `<span class="id-str">${this.escapeHtml(right)}</span>` : '';

    return `${leftSpan} ${stateSpan} ${headSpan}${rightSpan}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Get an array of visible tape cells around the head for UI rendering
   */
  getVisibleCells(radius = 12) {
    const cells = [];
    for (let i = this.head - radius; i <= this.head + radius; i++) {
      cells.push({
        index: i,
        symbol: this.read(i),
        isHead: i === this.head,
        isBlank: this.read(i) === this.config.blankSymbol
      });
    }
    return cells;
  }
}

// Export for browser and node
if (typeof window !== 'undefined') {
  window.BLANK_SYMBOL = BLANK_SYMBOL;
  window.MACHINE_PRESETS = MACHINE_PRESETS;
  window.TuringMachine = TuringMachine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TuringMachine, MACHINE_PRESETS, BLANK_SYMBOL };
}
