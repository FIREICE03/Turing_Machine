# Turing Machine Simulator & Interactive TOC Visualizer
### Module 5: Design and Simulation of a Turing Machine for Binary Strings with an Even Number of 1s

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![JFLAP Compatible](https://img.shields.io/badge/JFLAP-7.x%20%26%208.x%20Compatible-brightgreen)](#)
[![Automated Tests](https://img.shields.io/badge/Automated%20Tests-33%2F33%20Passing-success)](#)

A high-performance, dependency-free interactive **Turing Machine Simulator** engineered in modern Vanilla JavaScript, HTML5, and CSS3. Designed for academic demonstration, visual automata exploration, discrete mathematics verification, and full bidirectional compatibility with **JFLAP**.

---

## Project Overview
This project fulfills the **Theory of Computation (Module 5)** assignment:
- **Topic**: *Design and Simulation of a Turing Machine for Binary Strings with an Even Number of 1s*
- **Language**:
  $$\mathcal{L} = \{ w \in \{0, 1\}^* \mid |w|_1 \equiv 0 \pmod 2 \}$$
- **Key Characteristics**:
  - Recognizes binary strings where the total count of symbol `1` is even ($0, 2, 4, 6, \dots$).
  - Correctly accepts the empty string $\epsilon$ (since $0$ is an even number).
  - Correctly accepts strings with only `0`s (e.g., `0000`).
  - Correctly rejects strings with an odd count of `1`s (e.g., `1`, `111`, `10101`).

---

## Formal 7-Tuple Mathematical Definition
A Deterministic Turing Machine (DTM) is formally defined as:
$$M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)$$

Where:
1. **$Q$ (Finite Set of States)**:
   $$Q = \{ q_0, q_1, q_{accept}, q_{reject} \}$$
   - $q_0$: State indicating an **even** number of `1`s have been encountered so far (also initial state).
   - $q_1$: State indicating an **odd** number of `1`s have been encountered so far.
   - $q_{accept}$: Halting accepting state.
   - $q_{reject}$: Halting rejecting state.

2. **$\Sigma$ (Input Alphabet)**:
   $$\Sigma = \{ 0, 1 \}$$

3. **$\Gamma$ (Tape Alphabet)**:
   $$\Gamma = \{ 0, 1, \sqcup \}$$ *(where $\sqcup$ denotes the Blank symbol)*

4. **$q_0$ (Initial State)**:
   $$q_0 \in Q$$

5. **$B$ (Blank Symbol)**:
   $$B = \sqcup \in \Gamma \setminus \Sigma$$

6. **$F$ (Set of Final / Accepting States)**:
   $$F = \{ q_{accept} \}$$

7. **$\delta$ (Transition Function)**:
   $$\delta : Q \times \Gamma \to Q \times \Gamma \times \{ L, R, S \}$$

---

## Transition Function Table ($\delta$)

| Current State ($q$) | Scanned Symbol ($\sigma$) | Next State ($q'$) | Written Symbol ($\sigma'$) | Move ($D$) | Formal Semantic Description |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **$q_0$** (Even) | `0` | **$q_0$** | `0` | **R** | Scan past `0`; parity of `1`s remains even. |
| **$q_0$** (Even) | `1` | **$q_1$** | `1` | **R** | `1` detected; parity toggles from even to odd. |
| **$q_0$** (Even) | $\sqcup$ | **$q_{accept}$** | $\sqcup$ | **S** | End of string reached with even `1`s; **ACCEPT**. |
| **$q_1$** (Odd) | `0` | **$q_1$** | `0` | **R** | Scan past `0`; parity of `1`s remains odd. |
| **$q_1$** (Odd) | `1` | **$q_0$** | `1` | **R** | `1` detected; parity toggles from odd to even. |
| **$q_1$** (Odd) | $\sqcup$ | **$q_{reject}$** | $\sqcup$ | **S** | End of string reached with odd `1`s; **REJECT**. |

---

## Instantaneous Description (ID) Configurations

The configuration of a Turing Machine at any moment is written as $u \, (q) \, v$:
- $u$: String on tape to the left of the head.
- $q$: Current state of the machine.
- $v$: Scanned symbol followed by the rest of the tape.

### Example 1: String `101` (Two `1`s $\to$ Even $\to$ Accept)
$$q_0 101\sqcup \vdash 1 q_1 01\sqcup \vdash 10 q_1 1\sqcup \vdash 101 q_0 \sqcup \vdash 101 (q_{accept}) \sqcup \quad \text{[ACCEPTED]}$$

### Example 2: String `111` (Three `1`s $\to$ Odd $\to$ Reject)
$$q_0 111\sqcup \vdash 1 q_1 11\sqcup \vdash 11 q_0 1\sqcup \vdash 111 q_1 \sqcup \vdash 111 (q_{reject}) \sqcup \quad \text{[REJECTED]}$$

### Example 3: Empty String $\epsilon$ (Zero `1`s $\to$ Even $\to$ Accept)
$$q_0 \sqcup \vdash (q_{accept}) \sqcup \quad \text{[ACCEPTED]}$$

---

## Features & Architecture

1. **Interactive Infinite Tape Visualizer**:
   - Dynamic sliding tape track centered directly underneath an animated tape head pointer.
   - Negative and positive tape indices ($\dots, -2, -1, 0, 1, 2, \dots$).
   - **Cell symbol editing**: Click any cell when paused to modify symbols in place.

2. **Dynamic SVG State Transition Diagram**:
   - Clean vector graph layout with curved transitions, self-loops, and start/accept indicators.
   - **Real-time Live Glow**: Active state node and transition edge glow dynamically with theme accents.

3. **Live Instantaneous Description (ID) Bar**:
   - Real-time syntax-highlighted display of $u \, (q) \, v$ at every step.
   - Auto-expanding box layout for long inputs without scrollbars or sliders.

4. **Automated Batch Test Suite**:
   - 1-click test suite running all standard, edge-case, and corner-case inputs in milliseconds.
   - Pass/Fail verification badges with step counts.
   - Add custom test strings and expected outcomes directly from the UI.

5. **Step Execution Trace Log**:
   - Complete historical ledger of every step: Current State, Scanned Symbol, Written Symbol, Move Direction, Next State, and Resulting ID.
   - **1-Click CSV Export** for lab assignments and reports.

6. **Web Audio API Synthesizer (Zero external files)**:
   - Subtle mechanical relay click synthesized on tape head movement.
   - Harmonic ascending chime on **ACCEPT**.
   - Alert dual-tone chime on **REJECT**.
   - Mute / Unmute audio toggle persisted via `localStorage`.

7. **Bidirectional JFLAP (.jff) Compatibility**:
   - **Export**: Generate official JFLAP 7.x / 8.x XML files (`.jff`) with coordinates and transitions.
   - **Import**: Upload any single-tape JFLAP `.jff` file to instantly simulate it in the browser with auto-scaled SVG diagrams!

8. **Custom Machine Builder**:
   - Design custom Turing Machines with user-defined states, alphabet, and transition rules.
   - Built-in sample templates (e.g. Binary Inverter).

9. **Multi-Machine Presets**:
   - Preset 1: **Even Number of 1s** (Module 5 Focus)
   - Preset 2: **$0^n 1^n$** (Equal 0s and 1s)
   - Preset 3: **Binary Palindrome Checker** ($w = w^R$)
   - Preset 4: **Binary Incrementer** ($n + 1$)

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause automatic simulation |
| `→` (Right Arrow) | Step forward 1 transition |
| `←` (Left Arrow) | Step backward / Undo previous transition |
| `R` | Reset simulation to initial state |
| `T` | Run Automated Batch Test Suite |
| `M` | Toggle audio sound effects (Mute / Unmute) |

---

## How to Run

### Option 1: Direct Browser Launch (No server or build required)
Simply double-click `index.html` or open it with Google Chrome, Firefox, Safari, or Microsoft Edge.

### Option 2: Using Local Dev Server
```bash
# Using Python:
python -m http.server 8000

# Using Node.js:
npx serve .
```
Visit `http://localhost:8000`.

### Option 3: Running Automated Unit Tests
```bash
# Using npm:
npm test

# Or directly with Node:
node test/verify.js
```
Executes 33 automated unit tests across all 4 deterministic Turing Machine presets, validating state transitions, tape boundaries, instantaneous descriptions, and acceptance criteria with 100% pass rate.

---

## Deploying to GitHub Pages (Live Demo in 30 Seconds)

1. Push this repository to GitHub.
2. Go to your repository **Settings** $\to$ **Pages** (left sidebar).
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Your live simulator will be online at:  
   `https://<your-username>.github.io/<repository-name>/`

---

## Repository Structure
```
Turing Machine/
├── index.html              # Main HTML5 UI and application structure
├── package.json            # Project metadata, keywords & npm test script
├── LICENSE                 # MIT License (Vishal Kumar Gupta)
├── .gitignore              # Standard web gitignore
├── README.md               # Documentation and academic specification
├── css/
│   └── style.css           # Modern design system, themes, tape animation, modals
├── js/
│   ├── app.js              # UI controller, audio integration, test runner
│   ├── audio.js            # Web Audio API mechanical click & chime synthesizer
│   ├── diagram.js          # SVG dynamic graph renderer & active state glow
│   ├── jflapExport.js      # JFLAP .jff XML generator & parser (import/export)
│   └── turingMachine.js    # Core TM engine, presets, 7-tuples & ID generator
├── examples/               # Sample JFLAP 7.x/8.x .jff files
│   ├── even_ones_turing_machine.jff
│   ├── equal_zeros_ones_turing_machine.jff
│   ├── palindrome_turing_machine.jff
│   └── binary_increment_turing_machine.jff
└── test/
    └── verify.js           # Automated test suite (33 test cases, 100% passing)
```

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).  
Copyright © 2026 **Vishal Kumar Gupta**.
