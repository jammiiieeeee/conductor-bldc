/* Conductor — exploded outrunner, rendered in 3D. */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- control state ---------- */
  const range = document.getElementById('explode');
  const pct = document.getElementById('pct');
  const toggle = document.getElementById('toggle');
  const readout = document.getElementById('readout');
  const tbody = document.getElementById('tbody');
  const railButtons = [...document.querySelectorAll('.rail button')];

  const startParam = new URLSearchParams(location.search).get('explode');
  let target = startParam === null ? 1 : Math.max(0, Math.min(1, Number(startParam) || 0));
  let cur = target;
  let vel = 0;

  /* ---------- selection & readout ---------- */
  const rows = [...tbody.rows];
  const swapEl = readout.querySelector('.r-swap');
  const introHTML = swapEl.innerHTML;
  let sel = null;

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function paint() {
    for (const b of railButtons) b.setAttribute('aria-pressed', String(b.dataset.part === sel));

    if (!sel) {
      swapEl.innerHTML = introHTML;
    } else {
      const cells = [...rows[Number(sel) - 1].cells].map((c) => c.textContent.trim());
      swapEl.innerHTML = `
        <span class="r-num">${esc(cells[0])} / 09</span>
        <h2 class="r-name">${esc(cells[1])}</h2>
        <div class="r-body">
          <div class="r-row"><span class="r-k">Material</span><p>${esc(cells[2])}</p></div>
          <div class="r-row"><span class="r-k">Does</span><p>${esc(cells[3])}</p></div>
          <div class="r-row"><span class="r-k">Fails</span><p>${esc(cells[4])}</p></div>
        </div>`;
    }
    readout.classList.remove('swap');
    void readout.offsetWidth;
    readout.classList.add('swap');
    if (model) model.select(sel);
  }

  function pick(n) {
    const v = String(n);
    sel = v === sel ? null : v;
    paint();
  }

  for (const b of railButtons) {
    b.addEventListener('click', () => pick(Number(b.dataset.part)));
    b.addEventListener('mouseenter', () => model && model.hover(b.dataset.part));
    b.addEventListener('mouseleave', () => model && model.hover(null));
    b.addEventListener('focus', () => model && model.hover(b.dataset.part));
    b.addEventListener('blur', () => model && model.hover(null));
  }

  /* ---------- explode control ---------- */
  function sync() {
    range.style.setProperty('--v', target);
    pct.textContent = String(Math.round(target * 100)).padStart(3, '0');
    toggle.textContent = target > 0.9 ? 'Reassemble' : 'Explode all';
  }

  range.addEventListener('input', () => {
    target = range.value / 100;
    sync();
  });

  toggle.addEventListener('click', () => {
    target = target > 0.9 ? 0 : 1;
    range.value = String(Math.round(target * 100));
    sync();
  });

  /* ---------- 3d ---------- */

  /* procedural textures: drawn to a canvas at load, no image files */
  function makeTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  }

  const TEX = {
    brushed: makeTex(512, 512, (x, w, h) => {
      x.fillStyle = '#9b9b9b';
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) {
        const s = Math.random();
        x.strokeStyle = s > 0.5 ? `rgba(255,255,255,${0.02 + s * 0.09})` : `rgba(0,0,0,${0.02 + (1 - s) * 0.09})`;
        x.lineWidth = 0.4 + Math.random() * 0.9;
        const y = Math.random() * h;
        const x0 = Math.random() * w;
        x.beginPath();
        x.moveTo(x0, y);
        x.lineTo(x0 + 30 + Math.random() * 340, y);
        x.stroke();
      }
    }),
    copper: makeTex(256, 256, (x, w, h) => {
      x.fillStyle = '#8e8e8e';
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 96; i++) {
        const y = (i / 96) * h + Math.random() * 2;
        x.strokeStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.32})`;
        x.lineWidth = 0.7 + Math.random();
        x.beginPath();
        x.moveTo(0, y);
        x.lineTo(w, y);
        x.stroke();
      }
    }),
    pcb: makeTex(256, 256, (x, w, h) => {
      x.fillStyle = '#15503a';
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i++) {
        x.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`;
        x.fillRect(Math.random() * w, Math.random() * h, 5, 5);
      }
      x.strokeStyle = '#c9a95c';
      x.lineWidth = 2.2;
      for (let i = 0; i < 8; i++) {
        const y = 26 + i * 24;
        x.beginPath();
        x.moveTo(0, y);
        x.lineTo(w * 0.38, y);
        x.lineTo(w * 0.5, y + 14);
        x.lineTo(w, y + 14);
        x.stroke();
      }
      for (let i = 0; i < 14; i++) {
        x.beginPath();
        x.fillStyle = '#d9bd6d';
        x.arc(24 + i * 16, 218, 4, 0, Math.PI * 2);
        x.fill();
      }
    }),
    grain: makeTex(256, 256, (x, w, h) => {
      x.fillStyle = '#b4b4b4';
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) {
        const g = 120 + Math.random() * 90;
        x.fillStyle = `rgb(${g},${g},${g})`;
        x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    }),
  };
  TEX.brushed.repeat.set(5, 3);
  TEX.copper.repeat.set(2, 6);
  TEX.grain.repeat.set(4, 2);

  const PAL = {
    bell: new THREE.MeshStandardMaterial({ color: 0x2b3134, metalness: 0.7, roughness: 1, roughnessMap: TEX.brushed, envMapIntensity: 0.9 }),
    base: new THREE.MeshStandardMaterial({ color: 0x353b3d, metalness: 0.62, roughness: 1, roughnessMap: TEX.grain, envMapIntensity: 0.8 }),
    stator: new THREE.MeshStandardMaterial({ color: 0x8f979a, metalness: 0.78, roughness: 0.44, envMapIntensity: 0.8 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xa8501f, metalness: 0.8, roughness: 1, roughnessMap: TEX.copper, envMapIntensity: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xccd3d4, metalness: 0.92, roughness: 0.18, envMapIntensity: 0.9 }),
    ball: new THREE.MeshStandardMaterial({ color: 0xe9eded, metalness: 0.95, roughness: 0.1, envMapIntensity: 0.9 }),
    seal: new THREE.MeshStandardMaterial({ color: 0x2f4d6b, metalness: 0.15, roughness: 0.72, envMapIntensity: 0.5 }),
    magN: new THREE.MeshStandardMaterial({ color: 0x7a1a0e, metalness: 0.0, roughness: 0.74, envMapIntensity: 0.12 }),
    magS: new THREE.MeshStandardMaterial({ color: 0x122c4c, metalness: 0.0, roughness: 0.74, envMapIntensity: 0.12 }),
    pcb: new THREE.MeshStandardMaterial({ map: TEX.pcb, metalness: 0.08, roughness: 0.78, envMapIntensity: 0.5 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x171c1d, metalness: 0.3, roughness: 0.55 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x14181a, metalness: 0.4, roughness: 0.6 }),
  };

  const mat = (color, metalness, roughness) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity: 0.6 });

  function buildBell() {
    const g = new THREE.Group();
    const profile = [
      [0, 20.4], [15.6, 20.4], [15.6, 0], [18.6, 0], [18.6, 22],
      [20, 22], [20, 23], [5.2, 23], [5.2, 25.4], [0, 25.4],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 72).rotateZ(-Math.PI / 2), PAL.bell);
    g.add(shell);

    // six balancing holes in the top face read as rotation when the rotor turns
    const holeGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.5, 20).rotateZ(-Math.PI / 2);
    const holeMat = PAL.dark;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      const h = new THREE.Mesh(holeGeo, holeMat);
      h.position.set(23.2, 12.6 * Math.cos(a), 12.6 * Math.sin(a));
      g.add(h);
    }
    return { g, span: [-0.5, 25.4] };
  }

  function arcSector(rO, rI, a0, a1) {
    const s = new THREE.Shape();
    s.absarc(0, 0, rO, a0, a1, false);
    s.absarc(0, 0, rI, a1, a0, true);
    s.closePath();
    return s;
  }

  function buildMagnets() {
    const g = new THREE.Group();
    const n = 14;
    const pitch = (Math.PI * 2) / n;
    const gap = pitch * 0.09;
    const geo = new THREE.ExtrudeGeometry(
      arcSector(18.4, 15.4, gap / 2, pitch - gap / 2),
      { depth: 20, bevelEnabled: false, curveSegments: 10 }
    ).rotateY(Math.PI / 2);
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, i % 2 ? PAL.magS : PAL.magN);
      m.rotation.x = i * pitch;
      g.add(m);
    }
    return { g, span: [0, 20] };
  }

  function buildStator() {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 14.5, 0, Math.PI * 2, false);

    const hole = new THREE.Path();
    const n = 12;
    const pitch = (Math.PI * 2) / n;
    const half = 0.1047;
    for (let i = 0; i < n; i++) {
      const a = i * pitch;
      hole.absarc(0, 0, 9.6, a - half, a + half, false);
      hole.absarc(0, 0, 6.3, a + half, a + pitch - half, false);
    }
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.05, bevelEnabled: false, curveSegments: 8 }).rotateY(Math.PI / 2);
    const layers = 14;
    for (let i = 0; i < layers; i++) {
      const m = new THREE.Mesh(geo, PAL.stator);
      m.position.x = i * 1.14;
      m.userData.noEdge = i !== 0 && i !== layers - 1;
      g.add(m);
    }
    return { g, span: [0, 16] };
  }

  function buildWindings() {
    const g = new THREE.Group();
    const n = 12;
    const pitch = (Math.PI * 2) / n;
    const geo = new THREE.TorusGeometry(3.5, 1.05, 12, 28);
    for (let i = 0; i < n; i++) {
      const a = i * pitch;
      const m = new THREE.Mesh(geo, PAL.copper);
      m.rotation.x = a;
      m.scale.set(2.3, 1, 1);
      m.position.set(8.9, 10.6 * Math.cos(a), 10.6 * Math.sin(a));
      g.add(m);
    }
    return { g, span: [-9.4, 9.4] };
  }

  function buildShaft() {
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(2.5, 2.5, 36, 32).rotateZ(-Math.PI / 2);
    g.add(new THREE.Mesh(geo, PAL.steel));
    return { g, span: [-18, 18] };
  }

  function buildBearing() {
    const g = new THREE.Group();
    const inner = [[2.5, 0], [3.2, 0], [3.2, 4], [2.5, 4]].map(([x, y]) => new THREE.Vector2(x, y));
    const outer = [[4.4, 0], [5, 0], [5, 4], [4.4, 4]].map(([x, y]) => new THREE.Vector2(x, y));
    const raceMat = PAL.steel;
    g.add(new THREE.Mesh(new THREE.LatheGeometry(inner, 32).rotateZ(-Math.PI / 2), raceMat));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(outer, 32).rotateZ(-Math.PI / 2), raceMat));
    const ballGeo = new THREE.SphereGeometry(0.62, 12, 10);
    const ballMat = PAL.ball;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const b = new THREE.Mesh(ballGeo, ballMat);
      b.position.set(2, 3.8 * Math.cos(a), 3.8 * Math.sin(a));
      g.add(b);
    }
    // rubber lip seal sits behind the ball cage, so the balls read against it
    const seal = new THREE.Mesh(new THREE.RingGeometry(3.0, 4.36, 40), PAL.seal);
    seal.rotation.y = Math.PI / 2;
    seal.position.x = 0.55;
    g.add(seal);
    return { g, span: [0, 4] };
  }

  function buildHall() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 0.8, 56).rotateZ(-Math.PI / 2), PAL.pcb));
    const chipGeo = new THREE.BoxGeometry(1.3, 1.6, 2.6);
    const chipMat = PAL.chip;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const c = new THREE.Mesh(chipGeo, chipMat);
      c.position.set(0.7, 9.6 * Math.cos(a), 9.6 * Math.sin(a));
      g.add(c);
    }
    return { g, span: [0, 0.8] };
  }

  function buildBase() {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 19, 0, Math.PI * 2, false);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const h = new THREE.Path();
      h.absarc(14.6 * Math.cos(a), 14.6 * Math.sin(a), 1.8, 0, Math.PI * 2, true);
      shape.holes.push(h);
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 3, bevelEnabled: true, bevelSize: 0.35, bevelThickness: 0.35, bevelSegments: 2, curveSegments: 24 }).rotateY(Math.PI / 2);
    g.add(new THREE.Mesh(geo, PAL.base));
    return { g, span: [0, 3] };
  }

  function init3D() {
    const stage = document.getElementById('stage3d');
    const canvas = document.getElementById('scene');
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 2000);

    /* studio environment so the metal reads as metal */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color(0xe9edee);
    const panel = (color, power, pos, rot) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
      );
      m.material.color.multiplyScalar(power);
      m.position.set(...pos);
      m.rotation.set(...rot);
      env.add(m);
    };
    panel(0xffffff, 1.5, [0, 12, 0], [-Math.PI / 2, 0, 0]);
    panel(0xdce9f2, 0.8, [-12, 3, 6], [0, Math.PI / 2, 0]);
    panel(0xffe9d4, 0.6, [12, 5, 0], [0, -Math.PI / 2, 0]);
    panel(0x9aa5a7, 0.3, [0, -10, 0], [Math.PI / 2, 0, 0]);
    scene.environment = pmrem.fromScene(env, 0.05).texture;

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(60, 110, 80);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -170;
    key.shadow.camera.right = 170;
    key.shadow.camera.top = 170;
    key.shadow.camera.bottom = -170;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 460;
    key.shadow.bias = -0.0012;
    key.shadow.radius = 3;
    key.target.position.set(70, 0, 0);
    scene.add(key.target);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd7e4ea, 0.28);
    fill.position.set(-70, 30, -50);
    scene.add(fill);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c3c4, 0.16));

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShadowMaterial({ opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -27;
    floor.receiveShadow = true;
    scene.add(floor);

    /* parts */
    const rotor = new THREE.Group();
    const build = [
      ['1', buildBell],
      ['2', buildMagnets],
      ['3', buildBearing],
      ['4', buildShaft],
      ['5', buildWindings],
      ['6', buildStator],
      ['7', buildHall],
      ['8', buildBearing],
      ['9', buildBase],
    ];

    const parts = [];
    const meshes = [];
    const grey = new THREE.Color(0xd3d9d9);

    for (const [id, factory] of build) {
      const built = factory();
      const group = new THREE.Group();
      group.add(built.g);
      group.position.x = 0;
      group.userData.part = id;
      rotor.add(group);

      const mats = new Set();
      const local = new Map();
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x2f383a, transparent: true, opacity: 0.55 });
      built.g.traverse((o) => {
        if (!o.isMesh) return;
        if (!local.has(o.material)) local.set(o.material, o.material.clone());
        o.material = local.get(o.material);
        o.castShadow = true;
        o.receiveShadow = true;
        o.material.polygonOffset = true;
        o.material.polygonOffsetFactor = 1;
        o.material.polygonOffsetUnits = 1;
        mats.add(o.material);
        o.userData.part = id;
        meshes.push(o);
        if (
          !o.userData.noEdge &&
          o.geometry.type !== 'SphereGeometry' &&
          o.geometry.type !== 'BoxGeometry' &&
          o.geometry.type !== 'TorusGeometry' &&
          o.geometry.type !== 'RingGeometry'
        ) {
          o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 26), edgeMat));
        }
      });
      for (const m of mats) m.userData.base = m.color.clone();

      parts.push({ id, group, mats: [...mats], dim: 0, baseX: 0, x1: 0 });
    }
    scene.add(rotor);

    // assembled x positions (mm along the motor axis), then explode stations
    const assembled = { 1: 6, 2: 8, 3: 26, 4: 15, 5: 7, 6: 8, 7: 7, 8: 3, 9: 0 };
    const stations = { 9: 0, 8: 11, 7: 23, 6: 32, 5: 64, 2: 88, 1: 116, 3: 150, 4: 178 };
    for (const p of parts) {
      p.baseX = assembled[p.id];
      p.x1 = stations[p.id];
      p.group.position.x = p.baseX;
    }
    const spinning = new Set(['1', '2', '3', '4']);
    let spin = 0;

    /* interaction */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let selected = null;
    let hovered = null;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let theta = -0.46;
    let phi = 0.38;
    let zoom = 1;
    let idleUntil = 0;

    function hit(ev) {
      const r = canvas.getBoundingClientRect();
      ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(meshes, false);
      return hits.length ? hits[0].object.userData.part : null;
    }

    canvas.addEventListener('pointerdown', (ev) => {
      dragging = true;
      moved = 0;
      lastX = ev.clientX;
      lastY = ev.clientY;
      canvas.setPointerCapture(ev.pointerId);
      stage.classList.add('dragging');
    });

    canvas.addEventListener('pointermove', (ev) => {
      if (dragging) {
        const dx = ev.clientX - lastX;
        const dy = ev.clientY - lastY;
        lastX = ev.clientX;
        lastY = ev.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        theta += dx * 0.0065;
        phi = Math.max(0.04, Math.min(1.25, phi - dy * 0.005));
        idleUntil = performance.now() + 2600;
      } else {
        const id = hit(ev);
        if (id !== hovered) hovered = id;
      }
    });

    canvas.addEventListener('pointerup', (ev) => {
      dragging = false;
      stage.classList.remove('dragging');
      if (moved < 5) {
        const id = hit(ev);
        pick(id ? Number(id) : null);
      }
    });

    canvas.addEventListener('pointerleave', () => {
      hovered = null;
    });

    canvas.addEventListener(
      'wheel',
      (ev) => {
        ev.preventDefault();
        zoom = Math.max(0.55, Math.min(1.9, zoom * (1 + Math.sign(ev.deltaY) * 0.09)));
      },
      { passive: false }
    );

    const dir = new THREE.Vector3();
    const look = new THREE.Vector3();

    function frame(dt) {
      const e = cur;
      for (const p of parts) {
        p.group.position.x = p.baseX + (p.x1 - p.baseX) * e;
        p.lift = (p.lift || 0) + ((p.id === selected ? 2.6 : 0) - (p.lift || 0)) * 0.14;
        p.group.position.y = p.lift;
      }
      // the rotor turns only while it is closed together
      if (!reduce && e < 0.1) spin += dt * 0.55;
      for (const p of parts) if (spinning.has(p.id)) p.group.rotation.x = spin;

      // camera
      if (!reduce && !dragging && performance.now() > idleUntil && !selected) theta += dt * 0.05;
      const d = (112 + 148 * e) * zoom;
      look.set(15 + 74 * e, 0, 0);
      dir.set(Math.sin(theta) * Math.cos(phi), Math.sin(phi), Math.cos(theta) * Math.cos(phi));
      camera.position.copy(look).addScaledVector(dir, d);
      camera.lookAt(look);

      // dimming
      const focus = selected || hovered;
      for (const p of parts) {
        const on = !focus || p.id === focus;
        p.dim += ((on ? 0 : 0.86) - p.dim) * 0.18;
      }
    }

    function applyDim() {
      for (const p of parts) {
        for (const m of p.mats) {
          m.color.copy(m.userData.base).lerp(grey, p.dim);
          m.emissive.setHex(p.id === selected ? 0x1d0b02 : 0x000000);
          m.emissiveIntensity = p.id === selected ? 1 : 0;
        }
      }
    }

    /* resize */
    function resize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    /* loop */
    let last = performance.now();
    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 }).observe(stage);

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) {
        if (reduce) {
          cur = target;
          vel = 0;
        } else {
          vel = (vel + (target - cur) * 0.14) * 0.76;
          cur += vel;
          if (Math.abs(target - cur) < 0.0005 && Math.abs(vel) < 0.0005) {
            cur = target;
            vel = 0;
          }
        }
        frame(dt);
        applyDim();
        renderer.render(scene, camera);
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    return {
      select(id) {
        selected = id ? String(id) : null;
        idleUntil = performance.now() + 2600;
      },
      hover(id) {
        hovered = id ? String(id) : null;
      },
      resize,
    };
  }

  let model = null;
  const nogl = document.getElementById('nogl');
  if (window.THREE) {
    model = init3D();
  }
  if (!model) {
    nogl.hidden = false;
    document.getElementById('scene').style.display = 'none';
  }

  /* ---------- commutation figure ---------- */
  const poleEls = [...document.querySelectorAll('.pole')];
  const rotorEl = document.getElementById('rotor');
  const stepBtns = [...document.querySelectorAll('#steps button')];
  const playBtn = document.getElementById('play');
  const playLabel = document.getElementById('play-label');
  const phaseAngle = { 0: 0, 1: 60, 2: 120 };

  let step = 0;
  let rotDeg = 0;
  let timer = 0;

  function drawStep() {
    const phase = step % 3;
    const positive = step < 3;
    for (const p of poleEls) {
      const mine = Number(p.dataset.phase) === phase;
      const isPositivePole = Number(p.dataset.angle) === phaseAngle[p.dataset.phase];
      const north = mine && (positive ? isPositivePole : !isPositivePole);
      p.classList.toggle('on', north);
      p.classList.toggle('neg', mine && !north);
    }
    rotorEl.style.transform = `rotate(${rotDeg}deg)`;
    stepBtns.forEach((b, i) => {
      if (i === step) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
  }

  function goTo(n) {
    const delta = ((n - step) + 6) % 6;
    rotDeg += delta * 60;
    step = n;
    drawStep();
  }

  function pause() {
    clearInterval(timer);
    timer = 0;
    playBtn.dataset.playing = 'false';
    playLabel.textContent = 'Play';
  }

  function play() {
    if (timer || reduce) return;
    timer = setInterval(() => goTo((step + 1) % 6), 1150);
    playBtn.dataset.playing = 'true';
    playLabel.textContent = 'Pause';
  }

  playBtn.addEventListener('click', () => (timer ? pause() : play()));
  for (const b of stepBtns) {
    b.addEventListener('click', () => {
      pause();
      goTo(Number(b.dataset.step));
    });
  }

  if ('IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.35 }
    ).observe(document.getElementById('field'));
  } else {
    pause();
  }

  /* ---------- start ---------- */
  if (reduce) {
    target = cur;
    range.value = String(Math.round(cur * 100));
  }
  range.value = String(Math.round(cur * 100));
  sync();
  drawStep();
})();
