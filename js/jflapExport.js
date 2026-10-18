/**
 * JFLAP (.jff) XML Exporter & Importer
 * Full bidirectional compatibility with JFLAP 7.x & 8.x
 * Theory of Computation — Turing Machine Simulator
 * Author: Vishal Kumar Gupta
 */

class JflapExporter {
  /**
   * Convert TuringMachine preset into standard JFLAP .jff XML string
   * @param {Object} preset 
   * @returns {string} XML string
   */
  static generateXml(preset) {
    if (!preset) return '';

    // Create state ID mapping (JFLAP uses integer ids 0, 1, 2...)
    const stateIdMap = new Map();
    preset.states.forEach((s, idx) => {
      stateIdMap.set(s.id, idx);
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!-- Created for Module 5 - Turing Machine Simulator (JFLAP Compatible) -->\n`;
    xml += `<!-- Topic: ${this.escapeXml(preset.assignmentTopic || preset.title)} -->\n`;
    xml += `<structure>\n`;
    xml += `\t<type>turing</type>\n`;
    xml += `\t<automaton>\n`;
    xml += `\t\t<!-- The list of states. -->\n`;

    // States
    for (const state of preset.states) {
      const numericId = stateIdMap.get(state.id);
      xml += `\t\t<state id="${numericId}" name="${this.escapeXml(state.name || state.id)}">\n`;
      xml += `\t\t\t<x>${(state.x * 1.2).toFixed(1)}</x>\n`;
      xml += `\t\t\t<y>${(state.y * 1.2).toFixed(1)}</y>\n`;
      if (state.isInitial) {
        xml += `\t\t\t<initial/>\n`;
      }
      if (state.isAccept) {
        xml += `\t\t\t<final/>\n`;
      }
      xml += `\t\t</state>\n`;
    }

    xml += `\t\t<!-- The list of transitions. -->\n`;

    // Transitions
    for (const t of preset.transitions) {
      const fromId = stateIdMap.get(t.from);
      const toId = stateIdMap.get(t.to);

      xml += `\t\t<transition>\n`;
      xml += `\t\t\t<from>${fromId !== undefined ? fromId : t.from}</from>\n`;
      xml += `\t\t\t<to>${toId !== undefined ? toId : t.to}</to>\n`;

      // Read symbol (blank symbol is empty in JFLAP)
      if (t.read === preset.blankSymbol || t.read === '␣' || t.read === '') {
        xml += `\t\t\t<read/>\n`;
      } else {
        xml += `\t\t\t<read>${this.escapeXml(t.read)}</read>\n`;
      }

      // Write symbol (blank symbol is empty in JFLAP)
      if (t.write === preset.blankSymbol || t.write === '␣' || t.write === '') {
        xml += `\t\t\t<write/>\n`;
      } else {
        xml += `\t\t\t<write>${this.escapeXml(t.write)}</write>\n`;
      }

      // Move direction (R, L, S)
      xml += `\t\t\t<move>${t.move || 'R'}</move>\n`;
      xml += `\t\t</transition>\n`;
    }

    xml += `\t</automaton>\n`;
    xml += `</structure>\n`;

    return xml;
  }

  /**
   * Parse a JFLAP .jff XML string into a TuringMachine preset configuration
   * @param {string} xmlString 
   * @param {string} [customName]
   * @returns {Object} Preset configuration object
   */
  static parseXml(xmlString, customName = 'Imported Machine') {
    if (!xmlString || typeof xmlString !== 'string') {
      throw new Error('Empty or invalid XML string provided.');
    }

    let xmlDoc;
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML Parse Error: ' + parserError.textContent.trim());
      }
    } else {
      throw new Error('DOMParser is not supported in this environment.');
    }

    // Verify type
    const typeTag = xmlDoc.querySelector('type');
    if (!typeTag || typeTag.textContent.trim().toLowerCase() !== 'turing') {
      throw new Error('Invalid JFLAP file: <type> must be "turing" (Multi-tape or other automata are not supported).');
    }

    const stateElements = Array.from(xmlDoc.querySelectorAll('automaton > state, state'));
    if (stateElements.length === 0) {
      throw new Error('No states found in the JFLAP file.');
    }

    // Map JFLAP numeric state ID -> unique State object
    const idToState = new Map();
    let initialFound = false;

    // First pass: find min/max coords to auto-fit viewBox
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    stateElements.forEach(el => {
      const id = el.getAttribute('id');
      const name = el.getAttribute('name') || `q${id}`;
      const xVal = parseFloat(el.querySelector('x')?.textContent || '200');
      const yVal = parseFloat(el.querySelector('y')?.textContent || '200');
      if (!isNaN(xVal)) { minX = Math.min(minX, xVal); maxX = Math.max(maxX, xVal); }
      if (!isNaN(yVal)) { minY = Math.min(minY, yVal); maxY = Math.max(maxY, yVal); }
    });

    if (minX === Infinity) { minX = 100; maxX = 700; minY = 100; maxY = 500; }
    const spanX = Math.max(maxX - minX, 300);
    const spanY = Math.max(maxY - minY, 200);

    // Target diagram area: roughly 800 x 500 with padding
    const targetWidth = 840;
    const targetHeight = 520;
    const pad = 90;

    const scaleX = (targetWidth - 2 * pad) / spanX;
    const scaleY = (targetHeight - 2 * pad) / spanY;
    const scale = Math.min(scaleX, scaleY, 1.2); // avoid over-stretching

    const states = [];
    const acceptStates = [];
    let initialStateId = null;

    stateElements.forEach((el, index) => {
      const rawId = el.getAttribute('id');
      const name = el.getAttribute('name') || `q${rawId}`;
      const isInitial = el.querySelector('initial') !== null;
      const isAccept = el.querySelector('final') !== null;

      const rawX = parseFloat(el.querySelector('x')?.textContent || '200');
      const rawY = parseFloat(el.querySelector('y')?.textContent || '200');

      const x = Math.round(pad + (rawX - minX) * scale);
      const y = Math.round(pad + (rawY - minY) * scale);

      // State ID in simulator
      const stateId = `q${rawId}`;
      if (isInitial && !initialFound) {
        initialStateId = stateId;
        initialFound = true;
      }
      if (isAccept) {
        acceptStates.push(stateId);
      }

      const stateObj = {
        id: stateId,
        rawId: rawId,
        name: name,
        subtitle: isAccept ? 'Accept' : (isInitial ? 'Start' : ''),
        isInitial: isInitial,
        isAccept: isAccept,
        isReject: false,
        x: x,
        y: y
      };

      idToState.set(rawId, stateObj);
      states.push(stateObj);
    });

    // If no explicit initial state, designate first state
    if (!initialStateId && states.length > 0) {
      initialStateId = states[0].id;
      states[0].isInitial = true;
    }

    // Transitions
    const transElements = Array.from(xmlDoc.querySelectorAll('automaton > transition, transition'));
    const transitions = [];
    const alphabetSet = new Set();
    const tapeAlphabetSet = new Set(['␣']);

    transElements.forEach(el => {
      const fromRaw = el.querySelector('from')?.textContent.trim();
      const toRaw = el.querySelector('to')?.textContent.trim();

      const fromState = idToState.get(fromRaw);
      const toState = idToState.get(toRaw);

      if (!fromState || !toState) return;

      let read = el.querySelector('read')?.textContent || '';
      let write = el.querySelector('write')?.textContent || '';
      let move = el.querySelector('move')?.textContent.trim().toUpperCase() || 'R';

      // Normalize blank symbol: empty, '□', '~', or '␣' -> '␣'
      if (read === '' || read === '□' || read === '~') read = '␣';
      if (write === '' || write === '□' || write === '~') write = '␣';

      if (move !== 'R' && move !== 'L' && move !== 'S') {
        move = move.startsWith('L') ? 'L' : (move.startsWith('S') ? 'S' : 'R');
      }

      if (read !== '␣') alphabetSet.add(read);
      if (write !== '␣') alphabetSet.add(write);
      tapeAlphabetSet.add(read);
      tapeAlphabetSet.add(write);

      transitions.push({
        from: fromState.id,
        read: read,
        to: toState.id,
        write: write,
        move: move,
        desc: `Transition from ${fromState.name} on '${read}' -> write '${write}', move ${move}, to ${toState.name}`
      });
    });

    const alphabet = Array.from(alphabetSet);
    if (alphabet.length === 0) {
      alphabet.push('0', '1');
    }
    const tapeAlphabet = Array.from(tapeAlphabetSet);

    // Build formal tuple
    const formalTuple = {
      Q: `{ ${states.map(s => s.name).join(', ')} }`,
      Sigma: `{ ${alphabet.join(', ')} }`,
      Gamma: `{ ${tapeAlphabet.join(', ')} }`,
      q0: idToState.get(states.find(s => s.isInitial)?.rawId)?.name || initialStateId,
      B: '␣',
      F: `{ ${acceptStates.map(id => states.find(s => s.id === id)?.name || id).join(', ')} }`
    };

    const presetId = 'imported_' + Date.now();
    return {
      id: presetId,
      title: customName,
      assignmentTopic: `Imported JFLAP Turing Machine: ${customName}`,
      description: `Imported JFLAP Machine with ${states.length} states and ${transitions.length} transitions.`,
      alphabet: alphabet,
      tapeAlphabet: tapeAlphabet,
      blankSymbol: '␣',
      initialState: initialStateId,
      acceptStates: acceptStates,
      rejectStates: [],
      viewBox: `0 0 ${targetWidth} ${targetHeight}`,
      states: states,
      transitions: transitions,
      formalTuple: formalTuple,
      defaultTests: []
    };
  }

  /**
   * Helper to escape XML special characters
   */
  static escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Trigger browser file download of .jff
   */
  static downloadFile(preset) {
    const xml = this.generateXml(preset);
    const filename = `${preset.id}_turing_machine.jff`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export for browser and node testing
if (typeof window !== 'undefined') {
  window.JflapExporter = JflapExporter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JflapExporter;
}
