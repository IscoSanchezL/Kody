import { azar } from './azar';

/**
 * Escenarios de Kody dibujados en SVG, con aspecto de imagen: capas con perspectiva atmosférica
 * (lo lejano se ve más claro y borroso), luz coherente, texturas de ruido y un poco de grano.
 * Cada escenario mide 480×360 lógicos y se rasteriza a 960×720. Todo es propio, sin archivos externos.
 */

const n1 = (n: number) => Number(n.toFixed(1));

/** Envuelve un escenario. */
const lienzo = (defs: string, cuerpo: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 480 360"><defs>${defs}</defs>${cuerpo}</svg>`;

type Parada = [number, string, number?];
const paradas = (p: Parada[]) =>
  p
    .map(
      ([o, c, a]) =>
        `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`,
    )
    .join('');
/** Degradado vertical (arriba → abajo). */
const vert = (id: string, ...p: Parada[]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${paradas(p)}</linearGradient>`;
/** Degradado de izquierda a derecha. */
const horiz = (id: string, ...p: Parada[]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">${paradas(p)}</linearGradient>`;
const radial = (id: string, cx: number, cy: number, r: number, ...p: Parada[]) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${paradas(p)}</radialGradient>`;
const borroso = (id: string, d: number) =>
  `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${d}"/></filter>`;

/** Grano fino de película y viñeta suave: dan aspecto de fotografía. */
const EFECTOS = `
  <filter id="grano" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.3 -.4"/></filter>
  <radialGradient id="vig" cx=".5" cy=".5" r=".78"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient>`;
const acabado = (grano = 0.09, vigneta = 1) =>
  `<rect width="480" height="360" fill="url(#vig)" opacity="${vigneta}"/><rect width="480" height="360" filter="url(#grano)" opacity="${grano}"/>`;

/** Nubes de ruido fractal: blancas arriba y con la panza gris azulada. */
const nubes = (id: string, semilla: number, freq = '.006 .016', alto = 5.2, sombra = '#8ea9cc') =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${semilla}" result="r"/>
    <feColorMatrix in="r" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 11 -${alto}" result="m"/>
    <feGaussianBlur in="m" stdDeviation="1.3" result="mb"/>
    <feOffset in="mb" dx="0" dy="5" result="of"/>
    <feFlood flood-color="${sombra}" flood-opacity=".8"/>
    <feComposite in2="of" operator="in" result="sombra"/>
    <feMerge><feMergeNode in="sombra"/><feMergeNode in="mb"/></feMerge>
  </filter>`;

// ====================================================================== Pradera

export function pradera() {
  const r = azar(11);
  const defs =
    EFECTOS +
    vert(
      'cielo',
      [0, '#2b78c9'],
      [0.3, '#4f9fe3'],
      [0.55, '#9bd0f0'],
      [0.8, '#e4f0e6'],
      [1, '#fff1c9'],
    ) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#fffbe6', 0.95], [0.3, '#fff0ad', 0.5], [1, '#ffe08a', 0]) +
    vert('lejos', [0, '#a8c6de'], [1, '#d4e4ea']) +
    vert('colina2', [0, '#8fbf86'], [1, '#6da568']) +
    vert('colina3', [0, '#6eae4e'], [1, '#4f9136']) +
    vert('prado', [0, '#8cc455'], [0.35, '#66a63c'], [1, '#3f7f2a']) +
    vert('camino', [0, '#d7b985'], [1, '#a98253']) +
    vert('degMascara', [0, '#fff'], [0.55, '#fff', 0.7], [1, '#000']) +
    nubes('nube', 12, '.006 .017', 5.4) +
    borroso('b05', 0.5) +
    borroso('b1', 1) +
    borroso('b3', 3) +
    `<mask id="mascaraCielo"><rect width="480" height="270" fill="url(#degMascara)"/></mask>
     <filter id="hierba" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .7" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .26  0 0 0 0 .06  0 0 0 1.9 -.75"/></filter>`;

  // Árboles sobre una colina: copas de varias esferas con luz arriba a la derecha (el sol).
  const arbol = (x: number, y: number, s: number, oscuro: string, claro: string) => `
    <ellipse cx="${n1(x + 3 * s)}" cy="${n1(y + 1)}" rx="${n1(11 * s)}" ry="${n1(2.6 * s)}" fill="#1f4a24" opacity=".35"/>
    <rect x="${n1(x - 1 * s)}" y="${n1(y - 8 * s)}" width="${n1(2 * s)}" height="${n1(9 * s)}" fill="#4a3320"/>
    <circle cx="${n1(x)}" cy="${n1(y - 14 * s)}" r="${n1(9 * s)}" fill="${oscuro}"/>
    <circle cx="${n1(x - 5 * s)}" cy="${n1(y - 10 * s)}" r="${n1(6.5 * s)}" fill="${oscuro}"/>
    <circle cx="${n1(x + 5 * s)}" cy="${n1(y - 11 * s)}" r="${n1(6.5 * s)}" fill="${oscuro}"/>
    <circle cx="${n1(x + 2.5 * s)}" cy="${n1(y - 17 * s)}" r="${n1(6 * s)}" fill="${claro}" opacity=".85"/>
    <circle cx="${n1(x + 4 * s)}" cy="${n1(y - 19 * s)}" r="${n1(3.2 * s)}" fill="#cfe99a" opacity=".6"/>`;

  const lejanos = Array.from({ length: 34 }, () => {
    const x = r() * 480;
    const y = 233 + Math.sin(x / 38) * 3 + r() * 4;
    return `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(3 + r() * 3)}" ry="${n1(2.4 + r() * 2)}" fill="#4f8656" opacity=".9"/>`;
  }).join('');
  const medios = [34, 96, 150, 214, 300, 352, 410, 458].map((x, i) =>
    arbol(x, 248 + Math.sin(x / 30) * 3 + (i % 2) * 2, 0.7 + (i % 3) * 0.12, '#2f6d34', '#4f9145'),
  );
  const cerca = [
    arbol(436, 286, 1.7, '#255f2b', '#47883f'),
    arbol(54, 292, 1.45, '#255f2b', '#47883f'),
  ];

  const hojasFondo = Array.from({ length: 120 }, () => {
    const x = r() * 480;
    const alto = 7 + r() * 16;
    const dx = (r() - 0.5) * 9;
    const c = ['#2f6a24', '#3f8030', '#4f9a3a', '#244f1c'][Math.floor(r() * 4)];
    return `<path d="M${n1(x)} 362 Q${n1(x + dx * 0.3)} ${n1(362 - alto * 0.6)} ${n1(x + dx)} ${n1(362 - alto)}" stroke="${c}" stroke-width="${n1(1 + r() * 1.5)}" fill="none" stroke-linecap="round"/>`;
  }).join('');
  const hojasBorrosas = Array.from({ length: 14 }, () => {
    const x = r() * 480;
    const alto = 28 + r() * 22;
    const dx = (r() - 0.5) * 22;
    return `<path d="M${n1(x)} 366 Q${n1(x + dx * 0.4)} ${n1(366 - alto * 0.6)} ${n1(x + dx)} ${n1(366 - alto)}" stroke="#1f4a1a" stroke-width="${n1(3 + r() * 3)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }).join('');
  const flores = Array.from({ length: 55 }, () => {
    const x = r() * 480;
    const y = 262 + r() * 92;
    const t = 0.7 + ((y - 262) / 92) * 1.5;
    const c = ['#ffffff', '#ffe066', '#ff8fb1', '#c8a2ff', '#ffb347'][Math.floor(r() * 5)];
    return `<line x1="${n1(x)}" y1="${n1(y)}" x2="${n1(x)}" y2="${n1(y + 4 * t)}" stroke="#3a7a2a" stroke-width=".6"/><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(t)}" fill="${c}"/><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(t * 0.4)}" fill="#f6c21a"/>`;
  }).join('');
  const aves = [
    [96, 58, 1],
    [118, 48, 0.8],
    [150, 70, 0.7],
  ]
    .map(
      ([x, y, s]) =>
        `<path d="M${x - 6 * s} ${y} Q${x - 3 * s} ${y - 4 * s} ${x} ${y} Q${x + 3 * s} ${y - 4 * s} ${x + 6 * s} ${y}" stroke="#2c3a52" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>`,
    )
    .join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="270" fill="url(#cielo)"/>
    <circle cx="392" cy="84" r="170" fill="url(#solG)"/>
    <g filter="url(#b3)" opacity=".16" fill="#fff"><polygon points="392,84 250,0 300,0"/><polygon points="392,84 330,0 372,0"/><polygon points="392,84 120,250 220,270"/></g>
    <g mask="url(#mascaraCielo)"><rect width="480" height="270" filter="url(#nube)"/></g>
    <circle cx="392" cy="84" r="15" fill="#fffef0"/><circle cx="392" cy="84" r="22" fill="#fff6c4" opacity=".5" filter="url(#b1)"/>
    ${aves}
    <path d="M0 236 L34 222 L66 232 L116 204 L168 230 L226 210 L286 232 L350 206 L420 228 L480 214 V262 H0Z" fill="url(#lejos)" opacity=".75" filter="url(#b05)"/>
    <path d="M0 242 C60 226 112 230 172 240 S300 228 360 238 S450 232 480 240 V268 H0Z" fill="url(#colina2)" filter="url(#b05)"/>
    <g opacity=".9" filter="url(#b05)">${lejanos}</g>
    <path d="M0 252 C70 240 130 246 200 254 S330 244 400 252 S460 248 480 252 V280 H0Z" fill="url(#colina3)"/>
    ${medios.join('')}
    <path d="M0 256 C80 250 160 256 240 260 S400 254 480 258 V360 H0Z" fill="url(#prado)"/>
    <path d="M242 258 C226 286 196 312 128 362 L222 362 C258 322 268 288 254 258 Z" fill="url(#camino)" opacity=".7"/>
    <ellipse cx="150" cy="300" rx="120" ry="22" fill="#b6e07a" opacity=".22" filter="url(#b3)"/>
    <ellipse cx="390" cy="330" rx="130" ry="26" fill="#2c6b22" opacity=".22" filter="url(#b3)"/>
    <rect y="258" width="480" height="102" filter="url(#hierba)" opacity=".5"/>
    ${cerca.join('')}
    <g>${flores}</g>
    <g>${hojasFondo}</g>
    <g filter="url(#b1)">${hojasBorrosas}</g>
    <rect width="480" height="360" fill="#ffe9a6" opacity=".05"/>
    ${acabado(0.08)}`,
  );
}

// ====================================================================== Espacio

export function espacio() {
  const r = azar(7);
  const defs =
    EFECTOS +
    radial('fondoE', 0.5, 0.45, 0.8, [0, '#14103a'], [0.55, '#0a0724'], [1, '#03020f']) +
    radial(
      'cuerpoP',
      0.3,
      0.28,
      0.85,
      [0, '#ffdba8'],
      [0.3, '#eaa762'],
      [0.65, '#b3612b'],
      [1, '#52270f'],
    ) +
    radial(
      'sombraP',
      0.28,
      0.25,
      0.95,
      [0.45, '#05030f', 0],
      [0.78, '#05030f', 0.78],
      [1, '#05030f', 0.96],
    ) +
    radial('lunaG', 0.32, 0.3, 0.85, [0, '#f4f4fa'], [0.55, '#b8b9c8'], [1, '#575868']) +
    radial('lunaS', 0.3, 0.28, 0.95, [0.5, '#05030f', 0], [1, '#05030f', 0.8]) +
    radial(
      'galaxia',
      0.5,
      0.5,
      0.5,
      [0, '#fff4d6', 0.95],
      [0.25, '#e6b4ff', 0.55],
      [0.6, '#7c5cd6', 0.25],
      [1, '#3b2a99', 0],
    ) +
    horiz('anillo', [0, '#d9b98d'], [0.5, '#f4dcb2'], [1, '#9c7248']) +
    radial('brillo', 0.5, 0.5, 0.5, [0, '#ffffff', 0.9], [0.4, '#cfe3ff', 0.3], [1, '#9fc2ff', 0]) +
    borroso('b05', 0.5) +
    borroso('b1', 1) +
    borroso('b2', 2.4) +
    borroso('b6', 6) +
    `<filter id="neb1" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0045 .007" numOctaves="6" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 .62  0 0 0 0 .2  0 0 0 0 .9  0 0 0 2.7 -1.15"/><feGaussianBlur stdDeviation="1.2"/></filter>
     <filter id="neb2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .004" numOctaves="5" seed="19"/><feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .62  0 0 0 0 .8  0 0 0 2.6 -1.2"/><feGaussianBlur stdDeviation="1.4"/></filter>
     <filter id="neb3" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008 .006" numOctaves="4" seed="31"/><feColorMatrix type="matrix" values="0 0 0 0 .95  0 0 0 0 .3  0 0 0 0 .55  0 0 0 2.4 -1.2"/><feGaussianBlur stdDeviation="2"/></filter>
     <radialGradient id="mascE" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
     <mask id="mneb"><rect width="480" height="360" fill="url(#mascE)"/></mask>
     <clipPath id="clipP"><circle cx="372" cy="150" r="60"/></clipPath>
     <clipPath id="clipL"><circle cx="84" cy="92" r="24"/></clipPath>
     <g id="atras"></g>`;

  const estrellas = Array.from({ length: 260 }, () => {
    const x = r() * 480;
    const y = r() * 360;
    const t = r() ** 2.4;
    const c = ['#ffffff', '#cfe0ff', '#ffe7c2', '#ffd2d2'][Math.floor(r() * 4)];
    return `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(0.35 + t * 1.1)}" fill="${c}" opacity="${n1(0.35 + r() * 0.65)}"/>`;
  }).join('');
  const destellos = Array.from({ length: 22 }, () => {
    const x = r() * 480;
    const y = r() * 330;
    const t = 1 + r() * 1.3;
    return `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(t * 3.4)}" fill="url(#brillo)" opacity=".7"/><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(t * 0.9)}" fill="#fff"/>`;
  }).join('');
  const cruces = [
    [64, 36],
    [212, 64],
    [296, 30],
    [160, 236],
    [448, 52],
  ]
    .map(
      ([x, y]) =>
        `<g stroke="#e8f0ff" stroke-width=".5" opacity=".75"><line x1="${x - 7}" y1="${y}" x2="${x + 7}" y2="${y}"/><line x1="${x}" y1="${y - 7}" x2="${x}" y2="${y + 7}"/></g><circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`,
    )
    .join('');
  const craters = [
    [76, 84, 5],
    [92, 100, 3.6],
    [90, 78, 2.6],
    [74, 104, 2.4],
  ]
    .map(
      ([x, y, rr]) =>
        `<circle cx="${x}" cy="${y}" r="${rr}" fill="#5b5c6c" opacity=".55"/><circle cx="${x + 0.7}" cy="${y + 0.7}" r="${rr * 0.8}" fill="#454656" opacity=".5"/>`,
    )
    .join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#fondoE)"/>
    <g mask="url(#mneb)" opacity=".9"><rect width="480" height="360" filter="url(#neb1)"/><rect width="480" height="360" filter="url(#neb2)" opacity=".75"/><rect width="480" height="360" filter="url(#neb3)" opacity=".5"/></g>
    <g transform="rotate(-28 380 54)" opacity=".85"><ellipse cx="380" cy="54" rx="44" ry="11" fill="url(#galaxia)"/><ellipse cx="380" cy="54" rx="22" ry="5" fill="#fff6dc" opacity=".6" filter="url(#b1)"/></g>
    ${estrellas}
    <g>${destellos}</g>${cruces}
    <g transform="rotate(-18 372 150)"><clipPath id="atrasR"><rect x="240" y="80" width="260" height="70"/></clipPath><ellipse cx="372" cy="150" rx="104" ry="24" fill="none" stroke="url(#anillo)" stroke-width="13" opacity=".9" clip-path="url(#atrasR)"/><ellipse cx="372" cy="150" rx="104" ry="24" fill="none" stroke="#3a2418" stroke-width="2" opacity=".35" clip-path="url(#atrasR)"/></g>
    <circle cx="372" cy="150" r="64" fill="#ffb066" opacity=".18" filter="url(#b6)"/>
    <circle cx="372" cy="150" r="60" fill="url(#cuerpoP)"/>
    <g clip-path="url(#clipP)"><g transform="rotate(-14 372 150)" filter="url(#b05)">
      <rect x="300" y="108" width="150" height="9" fill="#8a3f1b" opacity=".35"/><rect x="300" y="124" width="150" height="6" fill="#ffe0b0" opacity=".3"/>
      <rect x="300" y="138" width="150" height="12" fill="#a24f22" opacity=".4"/><rect x="300" y="158" width="150" height="7" fill="#ffd9a0" opacity=".25"/>
      <rect x="300" y="172" width="150" height="10" fill="#7a3516" opacity=".4"/></g>
      <ellipse cx="392" cy="132" rx="9" ry="5" fill="#8a2a14" opacity=".6" filter="url(#b05)"/>
      <circle cx="372" cy="150" r="60" fill="url(#sombraP)"/></g>
    <circle cx="372" cy="150" r="60" fill="none" stroke="#ffd9a8" stroke-width="1.6" opacity=".35" filter="url(#b05)"/>
    <g transform="rotate(-18 372 150)"><clipPath id="frenteR"><rect x="240" y="150" width="260" height="70"/></clipPath><ellipse cx="372" cy="150" rx="104" ry="24" fill="none" stroke="url(#anillo)" stroke-width="13" clip-path="url(#frenteR)"/><ellipse cx="372" cy="150" rx="104" ry="24" fill="none" stroke="#3a2418" stroke-width="2" opacity=".35" clip-path="url(#frenteR)"/><ellipse cx="372" cy="150" rx="104" ry="24" fill="none" stroke="#fff3d6" stroke-width="1" opacity=".5" clip-path="url(#frenteR)" transform="translate(0 -4)"/></g>
    <circle cx="84" cy="92" r="30" fill="#cfd6ff" opacity=".12" filter="url(#b6)"/>
    <circle cx="84" cy="92" r="24" fill="url(#lunaG)"/><g clip-path="url(#clipL)">${craters}<circle cx="84" cy="92" r="24" fill="url(#lunaS)"/></g>
    <path d="M0 338 C60 322 120 342 190 332 S330 340 400 330 S470 338 480 333 V360 H0Z" fill="#0a0818"/>
    <path d="M0 338 C60 322 120 342 190 332 S330 340 400 330 S470 338 480 333" fill="none" stroke="#a37be0" stroke-width="1" opacity=".5" filter="url(#b05)"/>
    <ellipse cx="300" cy="336" rx="80" ry="6" fill="#ffb066" opacity=".12" filter="url(#b2)"/>
    ${acabado(0.07, 0.9)}`,
  );
}

// ====================================================================== Océano

export function oceano() {
  const r = azar(23);
  const defs =
    EFECTOS +
    vert('agua', [0, '#3fc0ee'], [0.28, '#1c93d0'], [0.6, '#0a5e99'], [1, '#03243f']) +
    vert('arena', [0, '#ead39b'], [0.5, '#cfa968'], [1, '#9c7640']) +
    vert('algaG', [0, '#7ad36a'], [1, '#1f7a3a']) +
    vert('rayo', [0, '#ffffff', 0.5], [1, '#ffffff', 0]) +
    vert('niebla', [0, '#0a5e99', 0], [1, '#0a5e99', 0.55]) +
    radial(
      'burbuja',
      0.35,
      0.3,
      0.7,
      [0, '#ffffff', 0.95],
      [0.4, '#d6f3ff', 0.35],
      [1, '#9fdcff', 0.18],
    ) +
    borroso('b05', 0.5) +
    borroso('b1', 1) +
    borroso('b2', 2.2) +
    borroso('b4', 4.5) +
    `<filter id="caust" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".013 .019" numOctaves="2" seed="8"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 .9  -16 0 0 0 2.5"/><feGaussianBlur stdDeviation=".7"/></filter>
     <filter id="arenaT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .16  0 0 0 1.6 -.55"/></filter>
     <linearGradient id="maskCaust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
     <mask id="mCaust"><rect width="480" height="300" fill="url(#maskCaust)"/></mask>
     <clipPath id="clipArena"><path d="M0 322 C60 306 130 318 200 312 S340 322 420 310 S470 318 480 314 V360 H0Z"/></clipPath>`;

  const rayos = [
    [60, 70, 110],
    [150, 130, 70],
    [250, 120, 90],
    [340, 190, 60],
    [420, 170, 80],
  ]
    .map(
      ([x, w, largo]) =>
        `<polygon points="${x},0 ${x + w * 0.6},0 ${x + w * 0.6 + largo * 0.9},300 ${x - w * 0.3 + largo * 0.9},300" fill="url(#rayo)" opacity="${n1(0.18 + (w % 5) * 0.03)}"/>`,
    )
    .join('');
  const particulas = Array.from({ length: 70 }, () => {
    const t = r();
    return `<circle cx="${n1(r() * 480)}" cy="${n1(r() * 300)}" r="${n1(0.4 + t * 1.2)}" fill="#d8f4ff" opacity="${n1(0.15 + r() * 0.4)}"/>`;
  }).join('');
  // Algas: cintas ondulantes con degradado, en tres planos de profundidad.
  const alga = (x: number, alto: number, ancho: number, fase: number, plano: number) => {
    const pts: string[] = [];
    const pts2: string[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const y = 336 - alto * t;
      const ond = Math.sin(t * 5 + fase) * (6 + 10 * t);
      const w = ancho * (1 - t * 0.75);
      pts.push(`${n1(x + ond - w / 2)} ${n1(y)}`);
      pts2.push(`${n1(x + ond + w / 2)} ${n1(y)}`);
    }
    const tinte = plano === 0 ? '' : ` opacity="${plano === 1 ? 0.72 : 0.5}"`;
    return `<polygon points="${pts.join(' ')} ${pts2.reverse().join(' ')}" fill="url(#algaG)"${tinte}/>`;
  };
  const algasLejos = [30, 70, 150, 330, 400, 450]
    .map((x, i) => alga(x, 70 + (i % 3) * 22, 5, i * 1.3, 2))
    .join('');
  const algasMedio = [18, 118, 372, 444]
    .map((x, i) => alga(x, 120 + i * 14, 9, i * 0.9 + 1, 1))
    .join('');
  const algasCerca = [8, 46, 424, 468]
    .map((x, i) => alga(x, 150 + i * 16, 12, i * 1.7, 0))
    .join('');
  const rocaLejos = `<path d="M0 312 C40 284 80 278 120 300 S190 312 240 298 S330 280 380 300 S450 290 480 300 V340 H0Z" fill="#0a4a7a" opacity=".55" filter="url(#b1)"/><path d="M0 320 C30 296 60 290 96 308 S150 318 190 312 S280 296 330 312 S420 296 480 306 V340 H0Z" fill="#0c4f80" opacity=".8"/>`;
  const coral = (x: number, y: number, s: number, c1: string, c2: string) => {
    const ramas = Array.from({ length: 6 }, (_, i) => {
      const a = -Math.PI / 2 + (i - 2.5) * 0.42;
      const l = (22 + (i % 3) * 7) * s;
      const mx = x + Math.cos(a) * l * 0.55;
      const my = y + Math.sin(a) * l * 0.55;
      const ex = x + Math.cos(a) * l;
      const ey = y + Math.sin(a) * l;
      return `<path d="M${n1(x)} ${n1(y)} Q${n1(mx + 2)} ${n1(my)} ${n1(ex)} ${n1(ey)}" stroke="${c1}" stroke-width="${n1(4.2 * s)}" fill="none" stroke-linecap="round"/><circle cx="${n1(ex)}" cy="${n1(ey)}" r="${n1(3 * s)}" fill="${c2}"/>`;
    }).join('');
    return ramas;
  };
  const burbujas = Array.from({ length: 22 }, () => {
    const rr = 1.2 + r() ** 2 * 6.5;
    return `<circle cx="${n1(r() * 480)}" cy="${n1(20 + r() * 270)}" r="${n1(rr)}" fill="url(#burbuja)" stroke="#e6f8ff" stroke-width=".4" stroke-opacity=".6"/><circle cx="${n1(r() * 0)}" cy="0" r="0"/>`;
  }).join('');
  const peces = Array.from({ length: 16 }, (_, i) => {
    const x = 270 + (i % 8) * 11 + r() * 8;
    const y = 130 + Math.floor(i / 8) * 14 + r() * 10;
    return `<path d="M${n1(x)} ${n1(y)} q4 -2.4 8 0 q-4 2.4 -8 0 M${n1(x + 8)} ${n1(y)} l3 -2 v4z" fill="#07406c" opacity=".35"/>`;
  }).join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#agua)"/>
    <rect width="480" height="70" fill="#bdf0ff" opacity=".22" filter="url(#b4)"/>
    <g filter="url(#b2)">${rayos}</g>
    <g mask="url(#mCaust)" opacity=".4"><rect width="480" height="300" filter="url(#caust)"/></g>
    <path d="M0 18 C40 8 80 24 120 14 S200 22 240 12 S320 24 360 14 S440 22 480 12" fill="none" stroke="#f0fcff" stroke-width="2.4" opacity=".5" filter="url(#b05)"/>
    <g>${particulas}</g>
    <g filter="url(#b1)">${peces}</g>
    ${rocaLejos}
    <g filter="url(#b1)" opacity=".8">${algasLejos}</g>
    <rect y="200" width="480" height="160" fill="url(#niebla)"/>
    <path d="M0 322 C60 306 130 318 200 312 S340 322 420 310 S470 318 480 314 V360 H0Z" fill="url(#arena)"/>
    <path d="M0 322 C60 306 130 318 200 312 S340 322 420 310 S470 318 480 314 V330 H0Z" fill="#fff4cf" opacity=".18"/>
    <path d="M0 340 Q60 332 120 340 T240 340 T360 340 T480 340" fill="none" stroke="#fff0c2" stroke-width=".9" opacity=".35"/>
    <path d="M0 348 Q60 340 120 348 T240 348 T360 348 T480 348" fill="none" stroke="#7a5a2c" stroke-width=".9" opacity=".3"/>
    <g clip-path="url(#clipArena)"><rect y="300" width="480" height="60" filter="url(#arenaT)" opacity=".5"/><g opacity=".55"><rect y="300" width="480" height="60" filter="url(#caust)"/></g></g>
    <g>${coral(214, 330, 1, '#ff6f8e', '#ffd0dc')}${coral(236, 334, 0.78, '#ff9a4a', '#ffe0b8')}</g>
    <ellipse cx="330" cy="340" rx="12" ry="5" fill="#f6b7c4"/><path d="M324 338 q6 -8 12 0" stroke="#e48aa0" stroke-width="1.2" fill="none"/>
    <g opacity=".9">${algasMedio}</g>
    <path d="M404 340 q26 -34 62 -10 v18 h-62z" fill="#3b4e63"/><path d="M404 340 q26 -34 62 -10" fill="none" stroke="#7dd3fc" stroke-width="1" opacity=".5"/>
    <g>${coral(432, 338, 0.9, '#ffb347', '#ffe8b0')}</g>
    <g filter="url(#b05)">${algasCerca}</g>
    <g>${burbujas}</g>
    <rect y="0" width="480" height="360" fill="#022a4a" opacity=".12"/>
    ${acabado(0.07, 1)}`,
  );
}

// ================================================================ Ciudad de noche

export function noche() {
  const r = azar(21);
  const defs =
    EFECTOS +
    vert(
      'cielo',
      [0, '#060a22'],
      [0.35, '#161c52'],
      [0.62, '#4a3480'],
      [0.82, '#b8527a'],
      [1, '#f08a68'],
    ) +
    radial('lunaG', 0.5, 0.5, 0.5, [0, '#fff8dc', 0.95], [0.3, '#fff0b8', 0.4], [1, '#ffe49a', 0]) +
    radial('horizonte', 0.5, 1, 0.8, [0, '#ffb070', 0.7], [1, '#ffb070', 0]) +
    vert('calle', [0, '#262640'], [1, '#0a0a16']) +
    vert('reflejo', [0, '#ffd37a', 0.6], [1, '#ffd37a', 0]) +
    radial(
      'farola',
      0.5,
      0.5,
      0.5,
      [0, '#ffe9b0', 0.95],
      [0.4, '#ffc66a', 0.35],
      [1, '#ff9d3a', 0],
    ) +
    borroso('b05', 0.5) +
    borroso('b1', 1.1) +
    borroso('b2', 2.4) +
    borroso('b5', 5) +
    nubes('veta', 41, '.004 .03', 5.8, '#2a2f66');

  const estrellas = Array.from({ length: 70 }, () => {
    const y = r() ** 1.6 * 190;
    return `<circle cx="${n1(r() * 480)}" cy="${n1(y)}" r="${n1(0.3 + r() * 0.8)}" fill="#fff" opacity="${n1(0.3 + r() * 0.6)}"/>`;
  }).join('');

  // Capas de edificios: la lejana es más clara y con menos contraste (perspectiva atmosférica).
  const capa = (
    semilla: number,
    base: number,
    hmin: number,
    hmax: number,
    color: string,
    ventanas: number,
    vcolor: string[],
    brillo: boolean,
  ) => {
    const q = azar(semilla);
    let x = -14;
    let cuerpo = '';
    let luces = '';
    while (x < 490) {
      const w = 26 + Math.floor(q() * 34);
      const h = hmin + q() * (hmax - hmin);
      const y = base - h;
      cuerpo += `<rect x="${n1(x)}" y="${n1(y)}" width="${w}" height="${n1(h + 4)}" fill="${color}"/>`;
      if (q() > 0.55)
        cuerpo += `<rect x="${n1(x + w * 0.3)}" y="${n1(y - 7)}" width="${n1(w * 0.4)}" height="8" fill="${color}"/>`;
      if (q() > 0.7)
        cuerpo += `<line x1="${n1(x + w * 0.5)}" y1="${n1(y - 7)}" x2="${n1(x + w * 0.5)}" y2="${n1(y - 17)}" stroke="${color}" stroke-width="1"/><circle cx="${n1(x + w * 0.5)}" cy="${n1(y - 17)}" r="1" fill="#ff4d4d"/>`;
      cuerpo += `<rect x="${n1(x + w - 1.4)}" y="${n1(y)}" width="1.4" height="${n1(h + 4)}" fill="#fff" opacity=".07"/>`;
      for (let wy = y + 7; wy < base - 4; wy += 9) {
        for (let wx = x + 4; wx < x + w - 6; wx += 7) {
          if (q() < ventanas) {
            const c = vcolor[Math.floor(q() * vcolor.length)];
            luces += `<rect x="${n1(wx)}" y="${n1(wy)}" width="3.4" height="4.6" fill="${c}" opacity="${n1(0.55 + q() * 0.45)}"/>`;
          }
        }
      }
      x += w + 1 + Math.floor(q() * 3);
    }
    return `<g>${cuerpo}</g><g>${luces}</g>${brillo ? `<g filter="url(#b1)" opacity=".7">${luces}</g>` : ''}`;
  };
  const farolas = [58, 198, 338, 452]
    .map(
      (x) =>
        `<circle cx="${x}" cy="318" r="22" fill="url(#farola)"/><rect x="${x - 0.7}" y="318" width="1.4" height="22" fill="#11111f"/><circle cx="${x}" cy="318" r="2" fill="#fff6d6"/><rect x="${x - 4}" y="342" width="8" height="16" fill="url(#reflejo)" filter="url(#b1)" opacity=".7"/>`,
    )
    .join('');
  const reflejos = Array.from({ length: 16 }, () => {
    const x = r() * 480;
    return `<rect x="${n1(x)}" y="344" width="${n1(1.6 + r() * 2.4)}" height="${n1(8 + r() * 12)}" fill="url(#reflejo)" opacity="${n1(0.35 + r() * 0.4)}" filter="url(#b05)"/>`;
  }).join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <rect width="480" height="360" fill="url(#horizonte)"/>
    ${estrellas}
    <circle cx="378" cy="70" r="70" fill="url(#lunaG)"/>
    <circle cx="378" cy="70" r="27" fill="#fff6d8"/>
    <circle cx="368" cy="76" r="4" fill="#d9c58f" opacity=".5"/><circle cx="386" cy="80" r="3" fill="#d9c58f" opacity=".45"/><circle cx="372" cy="58" r="2.6" fill="#d9c58f" opacity=".4"/>
    <g opacity=".5"><rect y="40" width="480" height="120" filter="url(#veta)"/></g>
    <g filter="url(#b05)" opacity=".92">${capa(5, 300, 70, 150, '#5d467f', 0.16, ['#ffd9a0', '#ffe9c4'], false)}</g>
    <rect y="200" width="480" height="110" fill="#b8527a" opacity=".22" filter="url(#b5)"/>
    <g>${capa(9, 322, 70, 160, '#26204f', 0.34, ['#ffd37a', '#ffeaa8', '#ffb454', '#a8dcff'], true)}</g>
    <g>${capa(13, 342, 60, 110, '#120f2e', 0.4, ['#ffd37a', '#ffeaa8', '#ffb454'], true)}</g>
    <rect y="338" width="480" height="22" fill="url(#calle)"/>
    <rect y="338" width="480" height="2.4" fill="#4b4b78" opacity=".7"/>
    <rect y="342" width="480" height="1" fill="#fff" opacity=".07"/>
    <g>${reflejos}</g>
    ${farolas}
    <ellipse cx="240" cy="346" rx="240" ry="10" fill="#f08a68" opacity=".08" filter="url(#b2)"/>
    ${acabado(0.09, 1)}`,
  );
}

// ====================================================================== Desierto

export function desierto() {
  const r = azar(33);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#3f86d6'], [0.38, '#8ec4ec'], [0.72, '#f9e3c0'], [1, '#ffd9a0']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#fffbe8', 0.95], [0.3, '#ffeab0', 0.5], [1, '#ffc973', 0]) +
    vert('mesa', [0, '#d99a78'], [0.5, '#c27a62'], [1, '#e8c4a0']) +
    vert('duna1', [0, '#f3c887'], [1, '#e2a95e']) +
    vert('duna2', [0, '#efbb6e'], [1, '#d79445']) +
    vert('duna3', [0, '#e6a455'], [1, '#bd7a34']) +
    vert('niebla', [0, '#ffe2b8', 0], [1, '#ffe2b8', 0.55]) +
    horiz('cactus', [0, '#255b34'], [0.35, '#3f8f4c'], [0.6, '#56a65c'], [1, '#2a6a3a']) +
    borroso('b05', 0.5) +
    borroso('b1', 1.1) +
    borroso('b3', 3) +
    nubes('cirro', 6, '.004 .045', 6.2, '#ffe2c4') +
    `<filter id="arena" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .32  0 0 0 0 .1  0 0 0 1.5 -.5"/></filter>
     <linearGradient id="mCir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
     <mask id="mCirro"><rect width="480" height="230" fill="url(#mCir)"/></mask>`;

  const mesas = `
    <g opacity=".72" filter="url(#b05)">
      <path d="M204 248 V218 L212 210 L224 208 H262 L270 214 L276 248Z" fill="url(#mesa)"/><path d="M252 208 H262 L270 214 L276 248 H256Z" fill="#8a4a38" opacity=".4"/>
      <path d="M296 248 V228 L306 222 H352 L362 228 V248Z" fill="url(#mesa)"/><path d="M344 222 H352 L362 228 V248 H346Z" fill="#8a4a38" opacity=".4"/>
      <path d="M112 248 V230 L124 224 H152 L160 232 V248Z" fill="url(#mesa)"/><path d="M146 224 H152 L160 232 V248 H148Z" fill="#8a4a38" opacity=".4"/>
      <path d="M398 248 V234 L410 228 H452 L464 236 V248Z" fill="url(#mesa)"/><path d="M444 228 H452 L464 236 V248 H446Z" fill="#8a4a38" opacity=".4"/>
      <g stroke="#7a3f2c" stroke-width=".6" opacity=".35"><line x1="206" y1="224" x2="272" y2="224"/><line x1="206" y1="234" x2="274" y2="234"/><line x1="298" y1="234" x2="360" y2="234"/><line x1="400" y1="240" x2="462" y2="240"/></g>
    </g>`;

  const saguaro = (x: number, y: number, s: number) => {
    const t = (v: number) => n1(v * s);
    return `
      <ellipse cx="${n1(x + 6 * s)}" cy="${n1(y + 1)}" rx="${t(26)}" ry="${t(4)}" fill="#7a3f12" opacity=".3"/>
      <g stroke-linecap="round" fill="none">
        <path d="M${x} ${y} V${n1(y - 72 * s)}" stroke="#255b34" stroke-width="${t(15)}"/>
        <path d="M${n1(x - 12 * s)} ${n1(y - 26 * s)} V${n1(y - 40 * s)} Q${n1(x - 12 * s)} ${n1(y - 48 * s)} ${n1(x - 20 * s)} ${n1(y - 48 * s)} V${n1(y - 58 * s)}" stroke="#255b34" stroke-width="${t(9)}" stroke-linejoin="round"/>
        <path d="M${n1(x + 12 * s)} ${n1(y - 34 * s)} V${n1(y - 50 * s)} Q${n1(x + 12 * s)} ${n1(y - 58 * s)} ${n1(x + 20 * s)} ${n1(y - 58 * s)} V${n1(y - 68 * s)}" stroke="#255b34" stroke-width="${t(9)}" stroke-linejoin="round"/>
        <path d="M${n1(x - 2 * s)} ${n1(y - 2)} V${n1(y - 72 * s)}" stroke="#4a9a55" stroke-width="${t(7)}" opacity=".85"/>
        <path d="M${n1(x - 13 * s)} ${n1(y - 28 * s)} V${n1(y - 40 * s)} Q${n1(x - 13 * s)} ${n1(y - 47 * s)} ${n1(x - 20.5 * s)} ${n1(y - 47 * s)} V${n1(y - 58 * s)}" stroke="#4a9a55" stroke-width="${t(3.4)}" opacity=".8" stroke-linejoin="round"/>
        <path d="M${n1(x + 11 * s)} ${n1(y - 36 * s)} V${n1(y - 50 * s)} Q${n1(x + 11 * s)} ${n1(y - 57 * s)} ${n1(x + 19.5 * s)} ${n1(y - 57 * s)} V${n1(y - 68 * s)}" stroke="#4a9a55" stroke-width="${t(3.4)}" opacity=".8" stroke-linejoin="round"/>
        <path d="M${n1(x + 2 * s)} ${n1(y - 4)} V${n1(y - 70 * s)}" stroke="#1b4526" stroke-width="${t(1)}" opacity=".6"/>
        <path d="M${n1(x - 4 * s)} ${n1(y - 4)} V${n1(y - 70 * s)}" stroke="#1b4526" stroke-width="${t(0.8)}" opacity=".45"/>
      </g>
      <circle cx="${n1(x - 20 * s)}" cy="${n1(y - 60 * s)}" r="${t(2.2)}" fill="#ff8fb1"/><circle cx="${n1(x + 20 * s)}" cy="${n1(y - 70 * s)}" r="${t(2.2)}" fill="#ff8fb1"/><circle cx="${n1(x)}" cy="${n1(y - 74 * s)}" r="${t(2.4)}" fill="#ffd166"/>`;
  };
  const roca = (x: number, y: number, s: number) =>
    `<ellipse cx="${n1(x + 3 * s)}" cy="${n1(y + 1)}" rx="${n1(13 * s)}" ry="${n1(2.6 * s)}" fill="#6e3a12" opacity=".28"/><path d="M${n1(x - 11 * s)} ${y} L${n1(x - 7 * s)} ${n1(y - 8 * s)} L${n1(x + 2 * s)} ${n1(y - 11 * s)} L${n1(x + 10 * s)} ${n1(y - 5 * s)} L${n1(x + 12 * s)} ${y}Z" fill="#a8744a"/><path d="M${n1(x - 7 * s)} ${n1(y - 8 * s)} L${n1(x + 2 * s)} ${n1(y - 11 * s)} L${n1(x + 3 * s)} ${n1(y - 3 * s)} L${n1(x - 8 * s)} ${y}Z" fill="#d1a070" opacity=".85"/>`;
  const ondas = Array.from({ length: 34 }, () => {
    const x = r() * 480;
    const y = 292 + r() * 64;
    const l = 8 + r() * 24 * (1 + (y - 292) / 64);
    return `<path d="M${n1(x)} ${n1(y)} q${n1(l / 2)} ${n1(-1.6)} ${n1(l)} 0" stroke="#fff1cf" stroke-width=".8" fill="none" opacity="${n1(0.18 + r() * 0.25)}"/><path d="M${n1(x)} ${n1(y + 1.4)} q${n1(l / 2)} ${n1(-1.6)} ${n1(l)} 0" stroke="#9c5f22" stroke-width=".7" fill="none" opacity=".2"/>`;
  }).join('');
  const matorral = (x: number, y: number) =>
    `<g stroke="#8a6a3a" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".85">${Array.from({ length: 9 }, (_, i) => `<path d="M${x} ${y} q${n1((i - 4) * 2.4)} -8 ${n1((i - 4) * 4)} -${n1(10 + (i % 3) * 3)}"/>`).join('')}</g>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <circle cx="110" cy="112" r="150" fill="url(#solG)"/>
    <circle cx="110" cy="112" r="26" fill="#fffdf0"/><circle cx="110" cy="112" r="36" fill="#fff3c8" opacity=".45" filter="url(#b1)"/>
    <g mask="url(#mCirro)" opacity=".7"><rect width="480" height="230" filter="url(#cirro)"/></g>
    <rect y="196" width="480" height="60" fill="url(#niebla)"/>
    <path d="M0 238 L40 226 L84 236 L140 220 L196 234 L260 218 L330 236 L400 222 L450 232 L480 226 V250 H0Z" fill="#b9a2b6" opacity=".55" filter="url(#b05)"/>
    ${mesas}
    <path d="M0 252 Q70 226 150 246 T300 240 T480 236 V270 H0Z" fill="url(#duna1)" opacity=".85" filter="url(#b05)"/>
    <path d="M0 252 Q70 226 150 246 T300 240 T480 236" fill="none" stroke="#fff0c4" stroke-width="1.2" opacity=".6" filter="url(#b05)"/>
    <path d="M0 268 Q100 236 210 262 T420 252 T480 258 V300 H0Z" fill="url(#duna2)"/>
    <path d="M200 264 Q320 274 420 252 T480 258 V300 H300Z" fill="#8a4a14" opacity=".34" filter="url(#b3)"/>
    <path d="M0 268 Q100 236 210 262 T420 252 T480 258" fill="none" stroke="#fff0c4" stroke-width="1.4" opacity=".55"/>
    <path d="M0 294 Q120 262 250 290 T480 280 V360 H0Z" fill="url(#duna3)"/>
    <path d="M240 292 Q380 302 480 280 V360 H320Z" fill="#7a3f10" opacity=".34" filter="url(#b3)"/>
    <path d="M0 294 Q120 262 250 290 T480 280" fill="none" stroke="#ffe7b0" stroke-width="1.6" opacity=".6"/>
    <rect y="262" width="480" height="98" filter="url(#arena)" opacity=".6"/>
    ${ondas}
    ${saguaro(372, 296, 1)}${saguaro(84, 310, 0.78)}
    ${roca(232, 322, 1.2)}${roca(300, 338, 0.8)}${roca(150, 340, 0.9)}
    ${matorral(196, 336)}${matorral(430, 342)}
    <rect width="480" height="360" fill="#ffb86b" opacity=".06"/>
    ${acabado(0.08, 1)}`,
  );
}

// ================================================================ Montañas con nieve

export function nieve() {
  const r = azar(5);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#4f95dc'], [0.4, '#99c8ee'], [0.78, '#dcecf8'], [1, '#f2f8fc']) +
    vert('rocaL', [0, '#8aa0bd'], [1, '#5f7899']) +
    vert('rocaS', [0, '#5d7396'], [1, '#3d526f']) +
    vert('nieveL', [0, '#ffffff'], [1, '#e4eefa']) +
    vert('nieveS', [0, '#bcd0ea'], [1, '#9db5d6']) +
    vert('niebla', [0, '#eaf4fb', 0], [1, '#eaf4fb', 0.85]) +
    vert('suelo', [0, '#f6fbff'], [0.5, '#e0edf9'], [1, '#c6daee']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#ffffff', 0.9], [0.4, '#fff6d6', 0.3], [1, '#fff6d6', 0]) +
    vert('mCielo', [0, '#fff'], [1, '#000']) +
    borroso('b05', 0.5) +
    borroso('b1', 1.2) +
    borroso('b2', 2.6) +
    borroso('b4', 5) +
    nubes('nube', 17, '.006 .02', 5.6, '#a7c0de') +
    `<mask id="mNubes"><rect width="480" height="190" fill="url(#mCielo)"/></mask>`;

  /** Montaña con dos caras: la iluminada (izquierda, mira al sol) y la sombreada (derecha). */
  const montana = (
    cx: number,
    base: number,
    ancho: number,
    alto: number,
    semilla: number,
    nieveFrac: number,
    op = 1,
    filtro = '',
  ) => {
    const q = azar(semilla);
    const picoX = cx + (q() - 0.5) * ancho * 0.12;
    const picoY = base - alto;
    const lado = (dir: -1 | 1) => {
      const pts: [number, number][] = [];
      const n = 7;
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const x = picoX + dir * ancho * 0.5 * t * (0.9 + q() * 0.2);
        const y = picoY + alto * Math.pow(t, 0.82) + (q() - 0.5) * alto * 0.08 * (1 - t * 0.4);
        pts.push([x, y]);
      }
      pts.push([cx + dir * ancho * 0.52, base]);
      return pts;
    };
    const izq = lado(-1);
    const der = lado(1);
    const poli = (pts: [number, number][]) => pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ');
    const lineaNieve = (pts: [number, number][]) =>
      pts.filter((_, i) => i < Math.ceil(pts.length * nieveFrac));
    const nz = lineaNieve(izq);
    const nd = lineaNieve(der);
    // Borde irregular de la nieve: baja en picos hacia la roca.
    const dientes = (pts: [number, number][], dir: -1 | 1) => {
      const salida: [number, number][] = [];
      pts.forEach(([x, y], i) => {
        salida.push([x, y]);
        if (i < pts.length - 1) salida.push([x - dir * 3, y + 7 + q() * 9]);
      });
      return salida;
    };
    const fin = (pts: [number, number][]) => pts[pts.length - 1];
    const nieveL = [[picoX, picoY], ...dientes(nz, -1), [fin(nz)[0] + 8, fin(nz)[1] - 6]] as [
      number,
      number,
    ][];
    const nieveD = [[picoX, picoY], ...dientes(nd, 1), [fin(nd)[0] - 8, fin(nd)[1] - 6]] as [
      number,
      number,
    ][];
    return `<g opacity="${op}"${filtro ? ` filter="url(#${filtro})"` : ''}>
      <polygon points="${picoX},${picoY} ${poli(izq)} ${picoX},${base}" fill="url(#rocaL)"/>
      <polygon points="${picoX},${picoY} ${poli(der)} ${picoX},${base}" fill="url(#rocaS)"/>
      <polygon points="${poli(nieveL)} ${picoX},${n1(fin(nz)[1])}" fill="url(#nieveL)"/>
      <polygon points="${poli(nieveD)} ${picoX},${n1(fin(nd)[1])}" fill="url(#nieveS)"/>
    </g>`;
  };

  const pino = (x: number, y: number, s: number, c1: string, c2: string, nieveSobre = true) => {
    const piso = (dy: number, w: number, h: number) =>
      `<polygon points="${n1(x)},${n1(y - dy - h)} ${n1(x - w)},${n1(y - dy)} ${n1(x + w)},${n1(y - dy)}" fill="${c1}"/><polygon points="${n1(x)},${n1(y - dy - h)} ${n1(x + w)},${n1(y - dy)} ${n1(x + w * 0.1)},${n1(y - dy)}" fill="${c2}"/>${
        nieveSobre
          ? `<polygon points="${n1(x)},${n1(y - dy - h)} ${n1(x - w * 0.5)},${n1(y - dy - h * 0.45)} ${n1(x + w * 0.5)},${n1(y - dy - h * 0.45)}" fill="#fff" opacity=".9"/>`
          : ''
      }`;
    return `<rect x="${n1(x - 1.2 * s)}" y="${n1(y - 4 * s)}" width="${n1(2.4 * s)}" height="${n1(5 * s)}" fill="#4a3426"/>
      ${piso(2 * s, 11 * s, 18 * s)}${piso(13 * s, 9 * s, 16 * s)}${piso(24 * s, 6.6 * s, 14 * s)}`;
  };
  const bosqueLejano = Array.from({ length: 44 }, (_, i) =>
    pino(i * 11.5 + r() * 6, 252 + r() * 5, 0.55 + r() * 0.2, '#6f8fa6', '#5d7c95', false),
  ).join('');
  const bosqueMedio = Array.from({ length: 22 }, (_, i) =>
    pino(i * 23 + r() * 10, 268 + r() * 8, 0.95 + r() * 0.35, '#2f5e57', '#244a45'),
  ).join('');
  const pinosCerca = [
    pino(34, 312, 2.1, '#1f4a44', '#173a36'),
    pino(452, 318, 2.4, '#1f4a44', '#173a36'),
    pino(398, 332, 1.6, '#255650', '#1b423d'),
  ].join('');
  const copos = Array.from({ length: 110 }, () => {
    const t = r() ** 1.5;
    const rr = 0.5 + t * 2.1;
    return `<circle cx="${n1(r() * 480)}" cy="${n1(r() * 360)}" r="${n1(rr)}" fill="#fff" opacity="${n1(0.4 + r() * 0.5)}"${rr > 1.7 ? ' filter="url(#b05)"' : ''}/>`;
  }).join('');
  const brillos = Array.from(
    { length: 26 },
    () =>
      `<circle cx="${n1(r() * 480)}" cy="${n1(280 + r() * 80)}" r="${n1(0.5 + r() * 0.7)}" fill="#fff" opacity="${n1(0.5 + r() * 0.5)}"/>`,
  ).join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <circle cx="96" cy="66" r="120" fill="url(#solG)"/><circle cx="96" cy="66" r="14" fill="#fffef6"/>
    <g mask="url(#mNubes)" opacity=".95"><rect width="480" height="190" filter="url(#nube)"/></g>
    ${montana(380, 262, 280, 170, 3, 0.55, 0.85, 'b05')}
    ${montana(130, 262, 300, 190, 9, 0.6, 0.92, 'b05')}
    <rect y="170" width="480" height="100" fill="url(#niebla)" opacity=".55"/>
    ${montana(250, 266, 240, 96, 14, 0.5, 1)}
    <rect y="214" width="480" height="60" fill="url(#niebla)" opacity=".7"/>
    <g opacity=".85" filter="url(#b05)">${bosqueLejano}</g>
    <rect y="236" width="480" height="60" fill="url(#niebla)" opacity=".65"/>
    <path d="M0 262 C80 252 160 262 250 258 S400 250 480 260 V300 H0Z" fill="#f4f9fd"/>
    ${bosqueMedio}
    <path d="M0 282 C70 268 150 284 240 278 S400 268 480 280 V360 H0Z" fill="url(#suelo)"/>
    <path d="M0 308 C90 294 180 314 270 304 S420 296 480 306 V360 H0Z" fill="#fff" opacity=".85"/>
    <path d="M0 308 C90 294 180 314 270 304 S420 296 480 306" fill="none" stroke="#b9cfe6" stroke-width="2" opacity=".6" filter="url(#b05)"/>
    <path d="M0 330 C100 318 200 338 300 328 S440 322 480 330 V360 H0Z" fill="#dbe9f7" opacity=".7"/>
    <path d="M0 330 C100 318 200 338 300 328 S440 322 480 330" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>
    <ellipse cx="170" cy="336" rx="150" ry="14" fill="#9db8d8" opacity=".25" filter="url(#b2)"/>
    ${pinosCerca}
    <g>${brillos}</g>
    <g>${copos}</g>
    <rect width="480" height="360" fill="#cfe3ff" opacity=".05"/>
    ${acabado(0.06, 0.8)}`,
  );
}
