/**
 * State Transition Diagram Renderer (SVG)
 * Optimized for large-format display, high readability,
 * clean dark mode contrast, custom node color schemes (matching user diagram),
 * custom loop orientations, and curved non-intersecting transition lines.
 */

class StateDiagramRenderer {
  constructor(svgElementId) {
    this.svg = document.getElementById(svgElementId);
    this.activeState = null;
    this.activeTransition = null;
    this.currentPreset = null;
    this.zoomLevel = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.baseViewBox = { x: 0, y: 0, w: 780, h: 480 };
  }

  parseViewBox(vbStr) {
    if (!vbStr) return { x: 0, y: 0, w: 780, h: 480 };
    const parts = vbStr.trim().split(/\s+/).map(Number);
    return {
      x: isNaN(parts[0]) ? 0 : parts[0],
      y: isNaN(parts[1]) ? 0 : parts[1],
      w: isNaN(parts[2]) ? 780 : parts[2],
      h: isNaN(parts[3]) ? 480 : parts[3]
    };
  }

  setZoom(newZoom, focalX = null, focalY = null) {
    const minZoom = 0.5;
    const maxZoom = 4.0;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

    if (focalX !== null && focalY !== null && this.svg) {
      const rect = this.svg.getBoundingClientRect();
      const clickRatioX = (focalX - rect.left) / (rect.width || 1);
      const clickRatioY = (focalY - rect.top) / (rect.height || 1);

      const oldW = this.baseViewBox.w / this.zoomLevel;
      const oldH = this.baseViewBox.h / this.zoomLevel;
      const newW = this.baseViewBox.w / clampedZoom;
      const newH = this.baseViewBox.h / clampedZoom;

      const pX = (this.baseViewBox.x + (this.baseViewBox.w - oldW) / 2 + this.panOffset.x) + clickRatioX * oldW;
      const pY = (this.baseViewBox.y + (this.baseViewBox.h - oldH) / 2 + this.panOffset.y) + clickRatioY * oldH;

      this.panOffset.x = pX - clickRatioX * newW - (this.baseViewBox.x + (this.baseViewBox.w - newW) / 2);
      this.panOffset.y = pY - clickRatioY * newH - (this.baseViewBox.y + (this.baseViewBox.h - newH) / 2);
    }

    this.zoomLevel = clampedZoom;
    this.applyTransform();
  }

  pan(dx, dy) {
    if (!this.svg) return;
    const rect = this.svg.getBoundingClientRect();
    const scaleX = (this.baseViewBox.w / this.zoomLevel) / (rect.width || 1);
    const scaleY = (this.baseViewBox.h / this.zoomLevel) / (rect.height || 1);
    this.panOffset.x -= dx * scaleX;
    this.panOffset.y -= dy * scaleY;
    this.applyTransform();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.applyTransform();
  }

  applyTransform() {
    if (!this.svg) return;
    const curW = this.baseViewBox.w / this.zoomLevel;
    const curH = this.baseViewBox.h / this.zoomLevel;
    const curX = this.baseViewBox.x + (this.baseViewBox.w - curW) / 2 + this.panOffset.x;
    const curY = this.baseViewBox.y + (this.baseViewBox.h - curH) / 2 + this.panOffset.y;

    this.svg.setAttribute('viewBox', `${curX} ${curY} ${curW} ${curH}`);

    const badge = document.getElementById('diagramZoomBadge');
    if (badge) {
      badge.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  setupInteractions(wrapElement) {
    if (!wrapElement || wrapElement._hasInteractions) return;
    wrapElement._hasInteractions = true;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialTouchDist = 0;
    let initialZoom = 1.0;

    // Mouse Drag
    wrapElement.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      wrapElement.classList.add('panning');
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      this.pan(dx, dy);
      startX = e.clientX;
      startY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        wrapElement.classList.remove('panning');
      }
    });

    // Mouse Wheel Zoom
    wrapElement.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.setZoom(this.zoomLevel * factor, e.clientX, e.clientY);
    }, { passive: false });

    // Touch Drag & Pinch Zoom (Mobile Phones & Tablets)
    wrapElement.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        wrapElement.classList.add('panning');
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialTouchDist = Math.hypot(dx, dy);
        initialZoom = this.zoomLevel;
      }
    }, { passive: true });

    wrapElement.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        this.pan(dx, dy);
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault();
      } else if (e.touches.length === 2 && initialTouchDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / initialTouchDist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.setZoom(initialZoom * factor, midX, midY);
        e.preventDefault();
      }
    }, { passive: false });

    wrapElement.addEventListener('touchend', e => {
      if (e.touches.length === 0) {
        isDragging = false;
        initialTouchDist = 0;
        wrapElement.classList.remove('panning');
      } else if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    });

    // Double click / Double tap to toggle quick zoom
    let lastTap = 0;
    wrapElement.addEventListener('click', e => {
      const now = Date.now();
      if (now - lastTap < 300) {
        if (Math.abs(this.zoomLevel - 1.0) < 0.15) {
          this.setZoom(1.65, e.clientX, e.clientY);
        } else {
          this.resetZoom();
        }
      }
      lastTap = now;
    });
  }

  /** Return color palette matching current theme */
  colors() {
    const dark = document.body.classList.contains('dark');
    return {
      nodeFill:        dark ? '#1e212b' : '#ffffff',
      nodeStroke:      dark ? '#9ba3b4' : '#64748b',
      nodeText:        dark ? '#f3f4f6' : '#0f172a',
      nodeSubtitle:    dark ? '#a0a6b4' : '#64748b',
      edgeStroke:      dark ? '#64748b' : '#94a3b8',
      edgeLabel:       dark ? '#f8fafc' : '#0f172a',
      pillBg:          dark ? '#11141d' : '#f8fafc',
      pillBorder:      dark ? '#3b4252' : '#cbd5e1',
      pillActiveBg:    dark ? '#1a2744' : '#eff6ff',
      pillActiveBorder:dark ? '#60a5fa' : '#3b82f6',
      arrowFill:       dark ? '#7e889b' : '#94a3b8',
      accent:          dark ? '#60a5fa' : '#2563eb',
      accentFill:      dark ? '#1e2d4a' : '#dbeafe',
      green:           dark ? '#4ade80' : '#16a34a',
      greenFill:       dark ? '#143826' : '#dcfce7',
      red:             dark ? '#f87171' : '#dc2626',
      redFill:         dark ? '#3d1c1c' : '#fee2e2',
      startLabel:      dark ? '#60a5fa' : '#2563eb',
    };
  }

  render(preset) {
    if (!this.svg || !preset) return;
    this.currentPreset = preset;
    this.svg.innerHTML = '';

    this.baseViewBox = this.parseViewBox(preset.viewBox || '0 0 780 480');
    this.resetZoom();

    this.createSvgDefs();

    const groupedTransitions = this.groupTransitions(preset.transitions);

    // Render edges first so they sit underneath nodes
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('id', 'edgesGroup');
    for (const group of groupedTransitions) {
      const el = this.createEdgeElement(group, preset.states);
      if (el) edgesGroup.appendChild(el);
    }
    this.svg.appendChild(edgesGroup);

    // Render nodes (states)
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('id', 'nodesGroup');
    for (const state of preset.states) {
      nodesGroup.appendChild(this.createNodeElement(state));
    }
    this.svg.appendChild(nodesGroup);

    if (this.activeState) this.highlightState(this.activeState);
    this.applyTransform();
  }

  createSvgDefs() {
    const c = this.colors();
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="31" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${c.arrowFill}" />
      </marker>
      <marker id="arrow-active" viewBox="0 0 10 10" refX="31" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${c.accent}" />
      </marker>
      <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
    this.svg.appendChild(defs);
  }

  groupTransitions(transitions) {
    const map = new Map();
    for (const t of transitions) {
      const key = `${t.from}->${t.to}`;
      if (!map.has(key)) map.set(key, { from: t.from, to: t.to, items: [] });
      map.get(key).items.push(t);
    }
    return Array.from(map.values());
  }

  createNodeElement(state) {
    const c = this.colors();
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'state-node');
    g.setAttribute('id', `node-${state.id}`);
    g.setAttribute('transform', `translate(${state.x}, ${state.y})`);

    const r = 32; // Generous node radius so state names like 'accept', 'matchA', 'haveA' fit comfortably

    // Start arrow indicator for initial state
    if (state.isInitial) {
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrow.setAttribute('d', 'M -68 0 L -35 0');
      arrow.setAttribute('stroke', c.accent);
      arrow.setAttribute('stroke-width', '2.5');
      arrow.setAttribute('marker-end', 'url(#arrow-active)');
      g.appendChild(arrow);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '-58');
      label.setAttribute('y', '-11');
      label.setAttribute('fill', c.startLabel);
      label.setAttribute('font-size', '11');
      label.setAttribute('font-weight', '700');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = 'START';
      g.appendChild(label);
    }

    // Outer circle (supports custom state.color matching user diagram)
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', r);
    circle.setAttribute('class', 'node-circle');

    const fillCol = state.color || c.nodeFill;
    const strokeCol = state.strokeColor || (state.isAccept ? c.green : state.isReject ? c.red : (state.color || c.nodeStroke));

    circle.setAttribute('fill', fillCol);
    circle.setAttribute('stroke', strokeCol);
    circle.setAttribute('stroke-width', state.strokeColor ? '3.5' : '2.5');
    g.appendChild(circle);

    // Double circle for accepting state (TOC standard: double ring, e.g. yellow ring around accept)
    if (state.isAccept) {
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      inner.setAttribute('r', r - 6);
      inner.setAttribute('fill', 'none');
      inner.setAttribute('stroke', state.strokeColor || c.green);
      inner.setAttribute('stroke-width', '2');
      g.appendChild(inner);
    }

    // Main state label inside the circle
    const mainLabel = state.name || state.id;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', state.textColor || (state.color ? '#ffffff' : c.nodeText));
    text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    text.setAttribute('font-size', mainLabel.length > 5 ? '12' : '13.5');
    text.setAttribute('font-weight', '700');
    text.textContent = mainLabel;
    g.appendChild(text);

    // Subtitle label positioned neatly BELOW the circle (e.g. "seen 0", "q0", etc.)
    const subText = state.subtitle || (state.label && state.label.includes('(') ? state.label.match(/\((.*?)\)/)?.[1] : null);
    if (subText) {
      const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sub.setAttribute('x', '0');
      sub.setAttribute('y', r + 18);
      sub.setAttribute('text-anchor', 'middle');
      sub.setAttribute('dominant-baseline', 'central');
      sub.setAttribute('fill', c.nodeSubtitle);
      sub.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      sub.setAttribute('font-size', '11.5');
      sub.setAttribute('font-weight', '600');
      sub.textContent = subText;
      g.appendChild(sub);
    }

    return g;
  }

  createEdgeElement(group, states) {
    const c = this.colors();
    const from = states.find(s => s.id === group.from);
    const to = states.find(s => s.id === group.to);
    if (!from || !to) return null;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'transition-edge');
    g.setAttribute('id', `edge-${group.from}-${group.to}`);

    // Self-loop (handles custom loopDir: 'top', 'top-left', 'top-right', 'right', 'bottom')
    if (group.from === group.to) {
      const x = from.x, y = from.y;
      const loopDir = from.loopDir || 'top';
      let d = '';
      let labelX = x, labelY = y - 95;

      if (loopDir === 'top-left') {
        d = `M ${x - 24} ${y - 20} C ${x - 90} ${y - 85}, ${x - 20} ${y - 100}, ${x - 5} ${y - 32}`;
        labelX = x - 60;
        labelY = y - 95;
      } else if (loopDir === 'top-right') {
        d = `M ${x + 5} ${y - 32} C ${x + 20} ${y - 100}, ${x + 90} ${y - 85}, ${x + 24} ${y - 20}`;
        labelX = x + 60;
        labelY = y - 95;
      } else if (loopDir === 'right') {
        d = `M ${x + 30} ${y - 14} C ${x + 105} ${y - 40}, ${x + 105} ${y + 40}, ${x + 30} ${y + 14}`;
        labelX = x + 115;
        labelY = y;
      } else if (loopDir === 'bottom') {
        d = `M ${x - 16} ${y + 30} C ${x - 42} ${y + 100}, ${x + 42} ${y + 100}, ${x + 16} ${y + 30}`;
        labelX = x;
        labelY = y + 105;
      } else {
        // default 'top'
        d = `M ${x - 16} ${y - 30} C ${x - 42} ${y - 100}, ${x + 42} ${y - 100}, ${x + 16} ${y - 30}`;
        labelX = x;
        labelY = y - 105;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'edge-path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', c.edgeStroke);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#arrow)');
      g.appendChild(path);

      const labelEl = this.createStackedLabel(group.items, labelX, labelY, c);
      g.appendChild(labelEl);
    } else {
      // Transition between two distinct states
      const x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
      const hasReverse = this.currentPreset.transitions.some(t => t.from === group.to && t.to === group.from);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const norm = Math.max(1, Math.sqrt(dx * dx + dy * dy));

      // Check if explicit curvature defined on transitions in preset
      const explicitCurve = group.items.find(t => t.curve !== undefined)?.curve;
      let curvature = 0;
      if (explicitCurve !== undefined) {
        curvature = explicitCurve;
      } else if (hasReverse) {
        curvature = 38;
      }

      let d = '';
      let textX = (x1 + x2) / 2;
      let textY = (y1 + y2) / 2;

      if (curvature !== 0) {
        const cx = (x1 + x2) / 2 - (dy / norm) * curvature;
        const cy = (y1 + y2) / 2 + (dx / norm) * curvature;
        d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        textX = cx - (dy / norm) * 16;
        textY = cy + (dx / norm) * 16;
      } else {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
        // Slight perpendicular offset so label doesn't sit directly on line
        textX -= (dy / norm) * 16;
        textY += (dx / norm) * 16;
      }

      // Apply per-transition labelOffset if provided (shifts label further from arrow)
      const lo = group.items.find(t => t.labelOffset)?.labelOffset;
      if (lo) {
        textX += lo.dx || 0;
        textY += lo.dy || 0;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'edge-path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', c.edgeStroke);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#arrow)');
      g.appendChild(path);

      const labelEl = this.createStackedLabel(group.items, textX, textY, c);
      g.appendChild(labelEl);
    }

    return g;
  }

  /**
   * Creates stacked transition text with pill background to prevent overlap
   */
  createStackedLabel(items, centerX, centerY, c) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'label-pill-group');

    const lineHeight = 16;
    const totalLines = items.length;
    const paddingX = 8;
    const paddingY = 5;

    // Format lines: e.g. "0 → 0, R"
    const lines = items.map(t => `${t.read} → ${t.write}, ${t.move}`);

    // Estimate box width based on longest line
    const maxChars = Math.max(...lines.map(l => l.length));
    const boxWidth = maxChars * 8.5 + paddingX * 2;
    const boxHeight = totalLines * lineHeight + paddingY * 2;

    const startY = centerY - (totalLines - 1) * (lineHeight / 2);

    // Pill background rect
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'label-pill-bg');
    rect.setAttribute('x', centerX - boxWidth / 2);
    rect.setAttribute('y', centerY - boxHeight / 2);
    rect.setAttribute('width', boxWidth);
    rect.setAttribute('height', boxHeight);
    rect.setAttribute('rx', '5');
    rect.setAttribute('ry', '5');
    rect.setAttribute('fill', c.pillBg);
    rect.setAttribute('stroke', c.pillBorder);
    rect.setAttribute('stroke-width', '1.2');
    g.appendChild(rect);

    // Text lines stacked vertically
    lines.forEach((lineStr, idx) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', centerX);
      text.setAttribute('y', startY + idx * lineHeight);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', 'edge-label-text');
      text.setAttribute('fill', c.edgeLabel);
      text.setAttribute('font-family', 'IBM Plex Mono, Fira Code, monospace');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '700');
      text.textContent = lineStr;
      g.appendChild(text);
    });

    return g;
  }

  highlightState(stateId, status = 'RUNNING') {
    this.activeState = stateId;
    const c = this.colors();

    this.svg.querySelectorAll('.state-node').forEach(n => {
      const circle = n.querySelector('.node-circle');
      if (!circle) return;
      const id = n.id.replace('node-', '');
      const s = this.currentPreset?.states.find(st => st.id === id);

      const defaultFill = s?.color || c.nodeFill;
      const defaultStroke = s?.strokeColor || (s?.isAccept ? c.green : s?.isReject ? c.red : (s?.color || c.nodeStroke));

      circle.removeAttribute('filter');
      circle.setAttribute('stroke-width', s?.strokeColor ? '3.5' : '2.5');
      circle.setAttribute('fill', defaultFill);
      circle.setAttribute('stroke', defaultStroke);
    });

    const node = this.svg.getElementById(`node-${stateId}`);
    if (node) {
      const circle = node.querySelector('.node-circle');
      if (circle) {
        circle.setAttribute('filter', 'url(#nodeGlow)');
        if (status === 'ACCEPTED') {
          circle.setAttribute('stroke', c.green);
          circle.setAttribute('stroke-width', '5');
          if (!this.currentPreset?.states.find(st => st.id === stateId)?.color) {
            circle.setAttribute('fill', c.greenFill);
          }
        } else if (status === 'REJECTED') {
          circle.setAttribute('stroke', c.red);
          circle.setAttribute('stroke-width', '5');
          if (!this.currentPreset?.states.find(st => st.id === stateId)?.color) {
            circle.setAttribute('fill', c.redFill);
          }
        } else {
          circle.setAttribute('stroke', c.accent);
          circle.setAttribute('stroke-width', '4.5');
          if (!this.currentPreset?.states.find(st => st.id === stateId)?.color) {
            circle.setAttribute('fill', c.accentFill);
          }
        }
      }
    }
  }

  highlightTransition(fromState, toState) {
    const c = this.colors();

    // Reset all transitions
    this.svg.querySelectorAll('.transition-edge').forEach(e => {
      const p = e.querySelector('.edge-path');
      const rect = e.querySelector('.label-pill-bg');
      const texts = e.querySelectorAll('.edge-label-text');
      if (p) {
        p.setAttribute('stroke', c.edgeStroke);
        p.setAttribute('stroke-width', '2');
        p.setAttribute('marker-end', 'url(#arrow)');
      }
      if (rect) {
        rect.setAttribute('fill', c.pillBg);
        rect.setAttribute('stroke', c.pillBorder);
        rect.setAttribute('stroke-width', '1.2');
      }
      texts.forEach(t => t.setAttribute('fill', c.edgeLabel));
    });

    if (!fromState || !toState) return;

    // Highlight active transition
    const edge = this.svg.getElementById(`edge-${fromState}-${toState}`);
    if (edge) {
      const p = edge.querySelector('.edge-path');
      const rect = edge.querySelector('.label-pill-bg');
      const texts = edge.querySelectorAll('.edge-label-text');
      if (p) {
        p.setAttribute('stroke', c.accent);
        p.setAttribute('stroke-width', '3.5');
        p.setAttribute('marker-end', 'url(#arrow-active)');
      }
      if (rect) {
        rect.setAttribute('fill', c.pillActiveBg);
        rect.setAttribute('stroke', c.pillActiveBorder);
        rect.setAttribute('stroke-width', '2');
      }
      texts.forEach(t => t.setAttribute('fill', c.accent));
    }
  }

  clearHighlights() {
    this.highlightState(this.currentPreset?.initialState);
    const c = this.colors();
    this.svg.querySelectorAll('.transition-edge').forEach(e => {
      const p = e.querySelector('.edge-path');
      const rect = e.querySelector('.label-pill-bg');
      const texts = e.querySelectorAll('.edge-label-text');
      if (p) {
        p.setAttribute('stroke', c.edgeStroke);
        p.setAttribute('stroke-width', '2');
        p.setAttribute('marker-end', 'url(#arrow)');
      }
      if (rect) {
        rect.setAttribute('fill', c.pillBg);
        rect.setAttribute('stroke', c.pillBorder);
        rect.setAttribute('stroke-width', '1.2');
      }
      texts.forEach(t => t.setAttribute('fill', c.edgeLabel));
    });
  }
}

if (typeof window !== 'undefined') {
  window.StateDiagramRenderer = StateDiagramRenderer;
}
