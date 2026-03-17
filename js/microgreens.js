/* ═══════════════════════════════════════════════════════════
   Pea Microgreens 3D Scene  –  photo-realistic SVG animation
   Eifel Greens  ·  based on real pea microgreen appearance
   ═══════════════════════════════════════════════════════════ */
;(function () {
  'use strict';

  const target = document.querySelector('.micro-scene');
  if (!target) return;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 440, H = 580;

  /* ─── PLANT DEFINITIONS ───────────────────────────────────────
     x      = base x of stem
     h      = total plant height in SVG units
     dx     = stem lean (horizontal offset at tip)
     ls     = leaf size (controls cotyledon diameter)
     nt     = number of tendrils  (2–4)
     ly     = layer  0=back  1=mid  2=front
     d      = sway animation delay (s)
     t      = sway animation duration (s)
     alt    = alternate sway direction
  ─────────────────────────────────────────────────────────────── */
  const PLANTS = [
    // Back
    { x:  22, h: 205, dx: -12, ls: 40, nt: 2, ly: 0, d: 0.2, t: 4.4, alt: 0 },
    { x: 408, h: 218, dx:  14, ls: 42, nt: 2, ly: 0, d: 1.0, t: 3.9, alt: 1 },
    // Mid
    { x: 108, h: 262, dx:  16, ls: 51, nt: 3, ly: 1, d: 0.7, t: 4.1, alt: 0 },
    { x: 324, h: 275, dx: -14, ls: 53, nt: 3, ly: 1, d: 1.4, t: 3.7, alt: 1 },
    // Front
    { x: 205, h: 315, dx: -10, ls: 63, nt: 4, ly: 2, d: 0.5, t: 4.3, alt: 0 },
    { x: 370, h: 298, dx:  18, ls: 60, nt: 3, ly: 2, d: 1.2, t: 4.0, alt: 1 },
  ];

  /* ─── LAYER PALETTE ───────────────────────────────────────── */
  const LAYERS = [
    { // 0 – back: muted, smaller
      stemBot: '#cfe4a4', stemTop: '#5e9018',
      leafHi: '#2c6e0e', leafLo: '#1b4a08',
      tendril: '#5a9020',
      op: 0.44, sw: 7, blur: 0.9
    },
    { // 1 – mid
      stemBot: '#dff2b8', stemTop: '#80b828',
      leafHi: '#3c8e14', leafLo: '#266009',
      tendril: '#74aa26',
      op: 0.80, sw: 9.5, blur: 0
    },
    { // 2 – front: vivid, full detail
      stemBot: '#ecf8cc', stemTop: '#9cca38',
      leafHi: '#52b21c', leafLo: '#38820e',
      tendril: '#8cc030',
      op: 1.00, sw: 12, blur: 0
    },
  ];

  /* ─── BUILD SVG ────────────────────────────────────────────── */
  const svg = e('svg', {
    viewBox: `0 0 ${W} ${H}`,
    xmlns: NS,
    'aria-hidden': 'true'
  });
  svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible;';

  /* ─── DEFS ─────────────────────────────────────────────────── */
  const defs = e('defs');

  LAYERS.forEach((lay, li) => {
    // Stem gradient (bottom pale → top green)
    const sg = e('linearGradient', { id: `sg${li}`, x1: '0', y1: '0', x2: '0', y2: '1' });
    addStop(sg, '0%',  lay.stemTop);
    addStop(sg, '65%', lay.stemBot);
    addStop(sg, '100%','#f5fce8');
    defs.appendChild(sg);

    // Leaf radial gradients (light centre → dark edge for 3D roundness)
    const llg = e('radialGradient', { id: `llg${li}`, cx: '38%', cy: '30%', r: '65%' });
    addStop(llg, '0%',  lay.leafHi);
    addStop(llg, '100%', lay.leafLo);
    defs.appendChild(llg);

    const rlg = e('radialGradient', { id: `rlg${li}`, cx: '62%', cy: '30%', r: '65%' });
    addStop(rlg, '0%',  lay.leafHi);
    addStop(rlg, '100%', lay.leafLo);
    defs.appendChild(rlg);
  });

  // Drop shadow for front plants
  const flt = e('filter', { id: 'ps', x: '-25%', y: '-25%', width: '150%', height: '150%' });
  const ds  = e('feDropShadow', { dx: '0', dy: '4', stdDeviation: '5',
                                   'flood-color': '#091a03', 'flood-opacity': '0.45' });
  flt.appendChild(ds);
  defs.appendChild(flt);

  svg.appendChild(defs);

  /* ─── GROUND STRIP ─────────────────────────────────────────── */
  const groundG = e('linearGradient', { id: 'gg', x1: '0', y1: '0', x2: '0', y2: '1' });
  addStop(groundG, '0%', '#1c3e0a'); addStop(groundG, '100%', '#0a1e04');
  defs.appendChild(groundG);
  const ground = e('rect', { x: 0, y: H - 18, width: W, height: 18, fill: 'url(#gg)' });
  svg.appendChild(ground);

  /* ─── DRAW PLANTS (back → front) ─────────────────────────── */
  [...PLANTS].sort((a, b) => a.ly - b.ly).forEach((p) => {
    const lay   = LAYERS[p.ly];
    const baseY = H - 18;
    const tipX  = p.x + p.dx;
    const tipY  = baseY - p.h;

    const g = e('g', { class: 'mc-plant' + (p.alt ? ' mc-alt' : '') });
    g.style.cssText = `--d:${p.d}s;--t:${p.t}s;transform-origin:${p.x}px ${baseY}px;opacity:${lay.op};`;
    if (lay.blur > 0) g.style.filter = `blur(${lay.blur}px)`;

    /* ── Stem (cubic bezier, natural gentle lean) */
    const c1x = p.x + p.dx * 0.12, c1y = baseY - p.h * 0.28;
    const c2x = p.x + p.dx * 0.60, c2y = baseY - p.h * 0.62;
    g.appendChild(e('path', {
      d: `M ${p.x},${baseY} C ${c1x},${c1y} ${c2x},${c2y} ${tipX},${tipY}`,
      stroke: `url(#sg${p.ly})`,
      'stroke-width': lay.sw,
      fill: 'none',
      'stroke-linecap': 'round'
    }));

    /* ── Cotyledon leaves  (spread like butterfly wings) */
    const ls = p.ls;
    const aly = tipY + ls * 0.22; // attachment y (slightly below stem tip)

    g.appendChild(peaLeaf(tipX, aly, ls, -1, `url(#llg${p.ly})`, lay, p.ly >= 1));
    g.appendChild(peaLeaf(tipX, aly, ls,  1, `url(#rlg${p.ly})`, lay, p.ly >= 1));

    /* ── Apical bud (tiny shoot between the leaves) */
    g.appendChild(e('ellipse', {
      cx: tipX, cy: tipY - ls * 0.08,
      rx: ls * 0.17, ry: ls * 0.30,
      fill: lay.stemTop, opacity: 0.92
    }));

    /* ── Tendrils */
    tendrilDefs(p, tipX, tipY, aly, ls)
      .slice(0, p.nt)
      .forEach((td, i) => {
        const path = e('path', {
          d: tendrilPath(td.x, td.y, td.len, td.angle, td.curl, td.cdir),
          stroke: lay.tendril,
          'stroke-width': p.ly === 0 ? 1.3 : p.ly === 1 ? 1.8 : 2.2,
          fill: 'none',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          opacity: 0.92
        });
        path.classList.add('mc-tendril');
        // Each tendril rotates gently from its own base
        path.style.cssText =
          `--td:${(p.d + i * 0.35).toFixed(2)}s;` +
          `--tt:${(p.t * 0.65).toFixed(2)}s;` +
          `transform-box:fill-box;transform-origin:0% 100%;`;
        g.appendChild(path);
      });

    if (p.ly === 2) g.setAttribute('filter', 'url(#ps)');

    svg.appendChild(g);
  });

  target.innerHTML = '';
  target.appendChild(svg);

  /* ═══════════════════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════════════════ */

  /** Pea cotyledon leaf – custom path for realistic kidney/oval shape */
  function peaLeaf(ax, ay, ls, side, fill, lay, showVein) {
    const s   = side;         // -1=left, +1=right
    const rw  = ls * 1.04;    // horizontal reach
    const rh  = ls * 0.92;    // vertical reach

    // The leaf attaches at the stem centre and spreads outward.
    // Inner edge near stem is a concave notch; outer edge is fully rounded.
    const d = `
      M ${ax + s*ls*0.04},${ay + rh*0.28}
      C ${ax + s*rw*0.30},${ay + rh*0.68}
        ${ax + s*rw*0.68},${ay + rh*0.90}
        ${ax + s*rw*1.04},${ay + rh*0.72}
      C ${ax + s*rw*1.44},${ay + rh*0.52}
        ${ax + s*rw*1.62},${ay + rh*0.10}
        ${ax + s*rw*1.56},${ay - rh*0.32}
      C ${ax + s*rw*1.48},${ay - rh*0.72}
        ${ax + s*rw*1.16},${ay - rh*1.02}
        ${ax + s*rw*0.72},${ay - rh*0.90}
      C ${ax + s*rw*0.32},${ay - rh*0.78}
        ${ax + s*rw*0.04},${ay - rh*0.48}
        ${ax + s*rw*0.04},${ay + rh*0.28}
      Z`.replace(/\s+/g, ' ').trim();

    const grp = e('g');
    grp.appendChild(e('path', { d, fill }));

    if (showVein) {
      // Midrib: from petiole attachment diagonally to leaf tip
      const vx1 = ax + s * ls * 0.08, vy1 = ay + rh * 0.20;
      const vx2 = ax + s * rw * 1.48, vy2 = ay - rh * 0.60;
      grp.appendChild(e('line', {
        x1: vx1, y1: vy1, x2: vx2, y2: vy2,
        stroke: lay.leafLo,
        'stroke-width': '1.1',
        opacity: '0.50',
        'stroke-linecap': 'round'
      }));
    }
    return grp;
  }

  /** Tendril anchor points for a plant */
  function tendrilDefs(p, tipX, tipY, aly, ls) {
    // Shuffle in a deterministic way per plant using p.x as seed
    const seed = p.x;
    return [
      // Centre-right – tall curl
      { x: tipX + ls * 0.12, y: tipY - ls * 0.06,
        len: ls * 2.10, angle: -0.30, curl: 4.2, cdir:  1 },
      // Centre-left – medium curl
      { x: tipX - ls * 0.14, y: tipY + ls * 0.08,
        len: ls * 1.80, angle:  0.25, curl: 3.8, cdir: -1 },
      // Outer right leaf node
      { x: tipX + ls * 1.52, y: aly - ls * 0.38,
        len: ls * 1.60, angle: -0.55, curl: 4.0, cdir:  1 },
      // Outer left leaf node
      { x: tipX - ls * 1.50, y: aly - ls * 0.35,
        len: ls * 1.45, angle:  0.52, curl: 3.6, cdir: -1 },
      // Extra – tall left
      { x: tipX - ls * 0.08, y: tipY - ls * 0.18,
        len: ls * 2.45, angle: -0.15, curl: 5.2, cdir: -1 },
    ];
  }

  /**
   * Build a tendril SVG path.
   * Starts at (x0,y0), extends by `len` with initial `angle` deviation from
   * straight-up, then increasingly curls by `curlAmt` radians total, and
   * finishes with a tight spiral coil.
   */
  function tendrilPath(x0, y0, len, initAngle, curlAmt, curlDir) {
    const SEG = 28;
    const segL = len / SEG;
    let x = x0, y = y0, angle = initAngle;
    const pts = [[x, y]];

    for (let i = 0; i < SEG; i++) {
      const t = i / SEG;
      // Curl accelerates toward the tip
      angle += (curlAmt / SEG) * Math.pow(t, 0.7);
      const sl = segL * (1 - t * 0.22); // very slightly shorter per step
      x += Math.sin(angle) * sl;
      y -= Math.cos(angle) * sl;
      pts.push([+x.toFixed(1), +y.toFixed(1)]);
    }

    // Tight coil at the tip (1.5 turns, shrinking radius)
    const coilR  = Math.max(4, len * 0.06);
    const COIL   = 20;
    for (let i = 0; i < COIL; i++) {
      const frac = i / COIL;
      const a    = angle + curlDir * frac * Math.PI * 3.0;
      const r    = coilR * (1 - frac * 0.65);
      x += Math.cos(a) * r * (Math.PI * 3.0 / COIL) * 0.38;
      y += Math.sin(a) * r * (Math.PI * 3.0 / COIL) * 0.38;
      pts.push([+x.toFixed(1), +y.toFixed(1)]);
    }

    // Convert to smooth polyline (enough points that it looks like curves)
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i][0]},${pts[i][1]}`;
    }
    return d;
  }

  /* ─── SVG element factory ────────────────────────────────── */
  function e(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }
  function addStop(grad, offset, color) {
    grad.appendChild(e('stop', { offset, 'stop-color': color }));
  }

})();
