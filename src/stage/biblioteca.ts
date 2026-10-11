import { kodySVG } from './disfraces';

/**
 * Biblioteca de Kody: personajes (2 disfraces cada uno) y escenarios, todos en SVG propio.
 * Un solo origen de dibujos: los usa el escenario (Pixi) y las miniaturas de la interfaz.
 */

export interface Personaje {
  id: string;
  nombre: string;
  /** Dibuja el disfraz 0 o 1. */
  svg: (disfraz: 0 | 1) => string;
}

export interface Fondo {
  id: string;
  nombre: string;
  svg: string;
}

const TINTA = '#1e1b4b';

/** Envuelve el dibujo de un personaje (lienzo 120×120, se rasteriza al doble). */
const personaje = (contenido: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120">${contenido}</svg>`;

/** Generador pseudoaleatorio con semilla (dibujos estables). */
function azar(semilla: number) {
  let t = semilla;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- Personajes

const robo = (v: 0 | 1) =>
  personaje(`
  <line x1="60" y1="30" x2="60" y2="16" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="13" r="6" fill="${v ? '#f472b6' : '#facc15'}" stroke="#fff" stroke-width="2"/>
  <rect x="14" y="54" width="12" height="26" rx="6" fill="#93c5fd" stroke="#1e3a8a" stroke-width="3"/>
  <rect x="94" y="54" width="12" height="26" rx="6" fill="#93c5fd" stroke="#1e3a8a" stroke-width="3"/>
  <rect x="24" y="30" width="72" height="72" rx="20" fill="#60a5fa" stroke="#1e3a8a" stroke-width="3.5"/>
  <rect x="34" y="42" width="52" height="38" rx="13" fill="#0f172a"/>
  ${
    v
      ? `<path d="M40 62q7-11 14 0M66 62q7-11 14 0" stroke="#22d3ee" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : `<circle cx="47" cy="60" r="7" fill="#22d3ee"/><circle cx="73" cy="60" r="7" fill="#22d3ee"/><circle cx="49" cy="57" r="2.5" fill="#fff"/><circle cx="75" cy="57" r="2.5" fill="#fff"/>`
  }
  <path d="M50 72q10 7 20 0" stroke="#22d3ee" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="92" r="4" fill="#facc15"/><circle cx="60" cy="92" r="4" fill="#4ade80"/><circle cx="76" cy="92" r="4" fill="#f87171"/>`);

const gato = (v: 0 | 1) =>
  personaje(`
  <path d="M20 54 L22 16 L48 34 Z" fill="#fdba74" stroke="#9a3412" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M100 54 L98 16 L72 34 Z" fill="#fdba74" stroke="#9a3412" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M25 44 L26 26 L38 36 Z" fill="#fda4af"/><path d="M95 44 L94 26 L82 36 Z" fill="#fda4af"/>
  <ellipse cx="60" cy="68" rx="42" ry="38" fill="#fdba74" stroke="#9a3412" stroke-width="3.5"/>
  <path d="M60 32v12M50 34l2 10M70 34l-2 10" stroke="#c2410c" stroke-width="3.5" stroke-linecap="round"/>
  <ellipse cx="60" cy="84" rx="20" ry="14" fill="#fff7ed"/>
  ${
    v
      ? `<path d="M31 66q7-9 14 0M75 66q7-9 14 0" stroke="${TINTA}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="38" cy="66" rx="8" ry="9" fill="#bef264" stroke="${TINTA}" stroke-width="2.5"/><ellipse cx="82" cy="66" rx="8" ry="9" fill="#bef264" stroke="${TINTA}" stroke-width="2.5"/><ellipse cx="38" cy="66" rx="2.6" ry="7" fill="${TINTA}"/><ellipse cx="82" cy="66" rx="2.6" ry="7" fill="${TINTA}"/>`
  }
  <path d="M55 77 L65 77 L60 83 Z" fill="#fb7185" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 83 q-4 7 -10 4 M60 83 q4 7 10 4" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${v ? `<path d="M54 90 q6 10 12 0 Z" fill="#fb7185"/>` : ''}
  <path d="M12 74h18M12 84l18-4M108 74H90M108 84l-18-4" stroke="${TINTA}" stroke-width="2.5" stroke-linecap="round"/>`);

const dino = (v: 0 | 1) =>
  personaje(`
  <path d="M38 30 L46 10 L54 28 L62 6 L70 28 L78 10 L84 30 Z" fill="#16a34a" stroke="#14532d" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 62 Q16 26 60 26 Q104 26 104 62 L104 80 Q104 106 60 106 Q16 106 16 80 Z" fill="#4ade80" stroke="#14532d" stroke-width="3.5"/>
  <circle cx="42" cy="52" r="11" fill="#fff" stroke="${TINTA}" stroke-width="2.5"/><circle cx="78" cy="52" r="11" fill="#fff" stroke="${TINTA}" stroke-width="2.5"/>
  <circle cx="44" cy="54" r="5" fill="${TINTA}"/><circle cx="76" cy="54" r="5" fill="${TINTA}"/>
  <circle cx="46" cy="52" r="1.8" fill="#fff"/><circle cx="78" cy="52" r="1.8" fill="#fff"/>
  <circle cx="53" cy="70" r="2.6" fill="#14532d"/><circle cx="67" cy="70" r="2.6" fill="#14532d"/>
  ${
    v
      ? `<path d="M32 78 Q60 112 88 78 Q60 84 32 78 Z" fill="#7f1d1d" stroke="#14532d" stroke-width="3" stroke-linejoin="round"/><path d="M40 80l4 8 4-8M56 83l4 8 4-8M72 80l4 8 4-8" fill="#fff" stroke="#fff" stroke-width="1"/><ellipse cx="60" cy="97" rx="12" ry="6" fill="#fb7185"/>`
      : `<path d="M36 82 Q60 100 84 82" stroke="#14532d" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M44 86l3 5 3-4M70 86l3-4 3 5" fill="#fff" stroke="#14532d" stroke-width="1.5"/>`
  }
  <circle cx="26" cy="76" r="5" fill="#fb7185" opacity=".5"/><circle cx="94" cy="76" r="5" fill="#fb7185" opacity=".5"/>`);

const cohete = (v: 0 | 1) =>
  personaje(`
  <path d="M42 94 Q60 ${v ? 132 : 120} 78 94 Z" fill="#fb923c"/>
  <path d="M50 94 Q60 ${v ? 120 : 112} 70 94 Z" fill="#fde047"/>
  <path d="M42 66 L22 96 L42 90 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round"/>
  <path d="M78 66 L98 96 L78 90 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 6 C86 26 90 64 80 96 L40 96 C30 64 34 26 60 6 Z" fill="#f8fafc" stroke="#475569" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M60 6 C72 15 78 24 80 36 L40 36 C42 24 48 15 60 6 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="60" cy="58" r="14" fill="#38bdf8" stroke="#475569" stroke-width="3.5"/>
  <circle cx="55" cy="53" r="4" fill="#fff" opacity=".8"/>
  ${v ? `<path d="M54 62q6 6 12 0" stroke="${TINTA}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : ''}
  <rect x="38" y="82" width="44" height="8" fill="#cbd5e1" opacity=".7"/>`);

const pez = (v: 0 | 1) =>
  personaje(`
  <path d="M30 60 L6 ${v ? 34 : 40} L6 ${v ? 90 : 80} Z" fill="#fb923c" stroke="#9a3412" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M56 32 Q64 14 82 30 Z" fill="#fdba74" stroke="#9a3412" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="66" cy="62" rx="42" ry="30" fill="#fb923c" stroke="#9a3412" stroke-width="3.5"/>
  <path d="M52 36 Q44 62 52 88" stroke="#fff" stroke-width="7" fill="none" opacity=".75" stroke-linecap="round"/>
  <path d="M70 34 Q62 62 70 90" stroke="#fff" stroke-width="7" fill="none" opacity=".75" stroke-linecap="round"/>
  <ellipse cx="66" cy="70" rx="30" ry="14" fill="#fed7aa" opacity=".55"/>
  <circle cx="90" cy="54" r="9" fill="#fff" stroke="${TINTA}" stroke-width="2.5"/>
  <circle cx="92" cy="55" r="4.5" fill="${TINTA}"/><circle cx="93.5" cy="53.5" r="1.6" fill="#fff"/>
  <path d="M96 74 Q106 80 112 72" stroke="${TINTA}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  ${v ? `<circle cx="110" cy="44" r="4" fill="none" stroke="#7dd3fc" stroke-width="2.5"/><circle cx="104" cy="32" r="3" fill="none" stroke="#7dd3fc" stroke-width="2.5"/>` : ''}`);

const abeja = (v: 0 | 1) =>
  personaje(`
  <ellipse cx="46" cy="${v ? 32 : 40}" rx="16" ry="24" transform="rotate(${v ? -20 : -30} 46 ${v ? 32 : 40})" fill="#bae6fd" stroke="#0369a1" stroke-width="3" opacity=".85"/>
  <ellipse cx="74" cy="${v ? 32 : 40}" rx="16" ry="24" transform="rotate(${v ? 20 : 30} 74 ${v ? 32 : 40})" fill="#bae6fd" stroke="#0369a1" stroke-width="3" opacity=".85"/>
  <path d="M104 74 L118 78 L104 82 Z" fill="${TINTA}"/>
  <ellipse cx="60" cy="72" rx="44" ry="30" fill="#facc15" stroke="${TINTA}" stroke-width="3.5"/>
  <path d="M52 44 Q44 72 52 100 M72 44 Q64 72 72 100 M90 52 Q84 72 90 94" stroke="${TINTA}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <circle cx="30" cy="68" r="22" fill="#fde047" stroke="${TINTA}" stroke-width="3.5"/>
  <path d="M22 46 Q14 32 8 34 M36 46 Q38 30 46 28" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="8" cy="34" r="3.5" fill="${TINTA}"/><circle cx="46" cy="28" r="3.5" fill="${TINTA}"/>
  ${
    v
      ? `<path d="M18 66q5-8 10 0M32 66q5-8 10 0" stroke="${TINTA}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
      : `<circle cx="23" cy="65" r="5" fill="${TINTA}"/><circle cx="38" cy="65" r="5" fill="${TINTA}"/><circle cx="24.5" cy="63.5" r="1.7" fill="#fff"/><circle cx="39.5" cy="63.5" r="1.7" fill="#fff"/>`
  }
  <path d="M24 78q6 6 12 0" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="16" cy="76" r="4" fill="#fb7185" opacity=".6"/>`);

/** Puntos de una estrella de 5 puntas centrada en (cx, cy). */
function puntosEstrella(cx: number, cy: number, r1: number, r2: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const ang = (-90 + i * 36) * (Math.PI / 180);
    pts.push(`${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const estrella = (v: 0 | 1) =>
  personaje(`
  <polygon points="${puntosEstrella(60, 64, 54, 26)}" fill="#fde047" stroke="#ca8a04" stroke-width="4" stroke-linejoin="round"/>
  <polygon points="${puntosEstrella(60, 64, 40, 19)}" fill="#fef08a" opacity=".7"/>
  ${
    v
      ? `<circle cx="47" cy="64" r="4.5" fill="${TINTA}"/><path d="M66 64q6-9 12 0" stroke="${TINTA}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<circle cx="47" cy="64" r="4.5" fill="${TINTA}"/><circle cx="73" cy="64" r="4.5" fill="${TINTA}"/><circle cx="48.5" cy="62.5" r="1.5" fill="#fff"/><circle cx="74.5" cy="62.5" r="1.5" fill="#fff"/>`
  }
  <path d="M51 76q9 9 18 0" stroke="${TINTA}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="39" cy="74" r="4.5" fill="#fb7185" opacity=".55"/><circle cx="81" cy="74" r="4.5" fill="#fb7185" opacity=".55"/>`);

export const PERSONAJES: Personaje[] = [
  { id: 'kody', nombre: 'Kody', svg: (v) => kodySVG(v) },
  { id: 'robo', nombre: 'Robo', svg: robo },
  { id: 'gato', nombre: 'Gato', svg: gato },
  { id: 'dino', nombre: 'Dino', svg: dino },
  { id: 'cohete', nombre: 'Cohete', svg: cohete },
  { id: 'pez', nombre: 'Pez', svg: pez },
  { id: 'abeja', nombre: 'Abeja', svg: abeja },
  { id: 'estrella', nombre: 'Estrella', svg: estrella },
];

export const personajePorId = (id: string): Personaje =>
  PERSONAJES.find((p) => p.id === id) ?? PERSONAJES[0];

// ----------------------------------------------------------------- Escenarios

/** Envuelve un escenario (480×360 lógicos, 960×720 al rasterizar). */
const escenario = (contenido: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 480 360">${contenido}</svg>`;

const degradado = (id: string, ...paradas: [number, string][]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${paradas
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;

const pradera = escenario(`
  <defs>${degradado('c', [0, '#7dd3fc'], [1, '#e0f2fe'])}</defs>
  <rect width="480" height="360" fill="url(#c)"/>
  <circle cx="400" cy="70" r="46" fill="#fde047" opacity=".3"/><circle cx="400" cy="70" r="34" fill="#fde047"/>
  <g fill="#fff" opacity=".92">
    <circle cx="90" cy="60" r="20"/><circle cx="112" cy="64" r="16"/><circle cx="68" cy="66" r="14"/>
    <circle cx="250" cy="35" r="16"/><circle cx="268" cy="39" r="13"/><circle cx="234" cy="41" r="11"/>
    <circle cx="340" cy="100" r="12"/><circle cx="356" cy="103" r="10"/><circle cx="326" cy="104" r="8"/>
  </g>
  <ellipse cx="110" cy="250" rx="190" ry="80" fill="#86efac"/>
  <ellipse cx="390" cy="265" rx="200" ry="85" fill="#4ade80"/>
  <rect y="240" width="480" height="120" fill="#22c55e"/><rect y="240" width="480" height="8" fill="#16a34a" opacity=".6"/>
  <g fill="#fff"><circle cx="60" cy="300" r="4"/><circle cx="200" cy="320" r="4"/><circle cx="380" cy="310" r="4"/></g>
  <g fill="#fde047"><circle cx="60" cy="300" r="1.8"/><circle cx="200" cy="320" r="1.8"/><circle cx="380" cy="310" r="1.8"/></g>`);

function espacioExterior() {
  const r = azar(7);
  const estrellas = Array.from({ length: 70 }, () => {
    const x = (r() * 480).toFixed(0);
    const y = (r() * 360).toFixed(0);
    const t = (0.6 + r() * 1.6).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${t}" fill="#fff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  }).join('');
  return escenario(`
  <defs>${degradado('e', [0, '#0b0830'], [1, '#3730a3'])}</defs>
  <rect width="480" height="360" fill="url(#e)"/>
  <ellipse cx="120" cy="260" rx="170" ry="70" fill="#a855f7" opacity=".12"/>
  <ellipse cx="380" cy="80" rx="130" ry="50" fill="#38bdf8" opacity=".1"/>
  ${estrellas}
  <ellipse cx="370" cy="120" rx="78" ry="14" transform="rotate(-18 370 120)" fill="none" stroke="#fde68a" stroke-width="6" opacity=".7"/>
  <circle cx="370" cy="120" r="46" fill="#fb923c"/><circle cx="356" cy="104" r="46" fill="#fdba74" opacity=".35"/>
  <path d="M326 124 Q370 138 414 118" stroke="#c2410c" stroke-width="5" fill="none" opacity=".45"/>
  <path d="M296 120 A78 14 -18 0 1 440 106" fill="none" stroke="#fde68a" stroke-width="6"/>
  <circle cx="90" cy="86" r="26" fill="#cbd5e1"/><circle cx="80" cy="78" r="6" fill="#94a3b8"/><circle cx="100" cy="96" r="4" fill="#94a3b8"/><circle cx="96" cy="76" r="3" fill="#94a3b8"/>
  <ellipse cx="240" cy="360" rx="300" ry="50" fill="#1e1b4b"/>`);
}

const oceano = escenario(`
  <defs>${degradado('o', [0, '#7dd3fc'], [0.5, '#0ea5e9'], [1, '#0c4a6e'])}</defs>
  <rect width="480" height="360" fill="url(#o)"/>
  <g fill="#fff" opacity=".12"><polygon points="90,0 150,0 230,360 150,360"/><polygon points="250,0 290,0 360,360 300,360"/><polygon points="380,0 410,0 450,360 410,360"/></g>
  <path d="M0 24 Q30 12 60 24 T120 24 T180 24 T240 24 T300 24 T360 24 T420 24 T480 24" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
  <g fill="none" stroke="#fff" stroke-width="2.5" opacity=".7">
    <circle cx="70" cy="200" r="7"/><circle cx="84" cy="168" r="5"/><circle cx="60" cy="140" r="9"/>
    <circle cx="400" cy="230" r="8"/><circle cx="412" cy="190" r="5"/><circle cx="330" cy="120" r="6"/>
  </g>
  <path d="M0 300 Q120 270 240 300 T480 295 L480 360 L0 360 Z" fill="#fcd34d"/>
  <path d="M0 325 Q120 305 240 325 T480 322 L480 360 L0 360 Z" fill="#fbbf24"/>
  <g fill="none" stroke="#16a34a" stroke-width="8" stroke-linecap="round">
    <path d="M60 310 Q44 280 60 255 Q76 232 60 210"/><path d="M82 312 Q98 286 82 264"/>
    <path d="M410 308 Q394 280 410 252 Q426 228 410 204"/><path d="M432 312 Q448 288 432 266"/>
  </g>
  <path d="M200 312 Q214 270 228 312 Z" fill="#fb7185"/><path d="M230 312 Q248 256 266 312 Z" fill="#f43f5e"/>
  <circle cx="320" cy="316" r="9" fill="#fda4af"/><circle cx="130" cy="322" r="7" fill="#fda4af"/>`);

function noche() {
  const r = azar(21);
  let edificios = '';
  let x = -10;
  while (x < 490) {
    const w = 44 + Math.floor(r() * 30);
    const h = 90 + Math.floor(r() * 130);
    const y = 360 - h;
    edificios += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1e1b4b"/>`;
    for (let wy = y + 10; wy < 350; wy += 18) {
      for (let wx = x + 7; wx < x + w - 10; wx += 14) {
        if (r() > 0.42)
          edificios += `<rect x="${wx}" y="${wy}" width="7" height="9" fill="#fde047" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
      }
    }
    x += w + 4;
  }
  const estrellas = Array.from(
    { length: 28 },
    () =>
      `<circle cx="${(r() * 480).toFixed(0)}" cy="${(r() * 150).toFixed(0)}" r="${(0.6 + r()).toFixed(1)}" fill="#fff" opacity=".8"/>`,
  ).join('');
  return escenario(`
  <defs>${degradado('n', [0, '#1e1b4b'], [0.65, '#7c3aed'], [1, '#fb7185'])}</defs>
  <rect width="480" height="360" fill="url(#n)"/>${estrellas}
  <circle cx="380" cy="64" r="30" fill="#fef9c3"/><circle cx="392" cy="56" r="26" fill="#7c3aed" opacity=".35"/>
  ${edificios}
  <rect y="344" width="480" height="16" fill="#0f0a3c"/>`);
}

const desierto = escenario(`
  <defs>${degradado('d', [0, '#fef3c7'], [0.6, '#fdba74'], [1, '#fb923c'])}</defs>
  <rect width="480" height="360" fill="url(#d)"/>
  <circle cx="110" cy="96" r="56" fill="#fde047" opacity=".35"/><circle cx="110" cy="96" r="40" fill="#fef08a"/>
  <path d="M0 250 Q110 190 240 240 T480 225 L480 360 L0 360 Z" fill="#fbbf24"/>
  <path d="M0 290 Q140 245 280 290 T480 280 L480 360 L0 360 Z" fill="#f59e0b"/>
  <path d="M0 330 Q160 300 320 335 T480 325 L480 360 L0 360 Z" fill="#d97706"/>
  <g fill="#15803d" stroke="#14532d" stroke-width="3" stroke-linejoin="round">
    <rect x="360" y="210" width="20" height="82" rx="10"/><rect x="336" y="232" width="14" height="38" rx="7"/><rect x="390" y="224" width="14" height="32" rx="7"/>
    <rect x="336" y="256" width="30" height="12" rx="6"/><rect x="376" y="244" width="30" height="12" rx="6"/>
  </g>
  <g fill="#15803d" stroke="#14532d" stroke-width="2.5"><rect x="80" y="262" width="14" height="52" rx="7"/><rect x="62" y="276" width="10" height="24" rx="5"/><rect x="62" y="290" width="26" height="9" rx="4.5"/></g>
  <ellipse cx="240" cy="330" rx="20" ry="6" fill="#92400e" opacity=".3"/>`);

function nieve() {
  const r = azar(5);
  const copos = Array.from(
    { length: 40 },
    () =>
      `<circle cx="${(r() * 480).toFixed(0)}" cy="${(r() * 360).toFixed(0)}" r="${(1 + r() * 2).toFixed(1)}" fill="#fff"/>`,
  ).join('');
  const pino = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="0" width="8" height="16" fill="#78350f"/><polygon points="0,-60 -26,-14 26,-14" fill="#166534"/><polygon points="0,-40 -32,6 32,6" fill="#15803d"/><polygon points="0,-60 -10,-44 10,-44" fill="#fff"/></g>`;
  return escenario(`
  <defs>${degradado('s', [0, '#bae6fd'], [1, '#f0f9ff'])}</defs>
  <rect width="480" height="360" fill="url(#s)"/>
  <polygon points="-20,250 120,70 260,250" fill="#94a3b8"/><polygon points="120,70 90,120 120,110 140,128 160,112" fill="#fff"/>
  <polygon points="180,250 340,40 500,250" fill="#64748b"/><polygon points="340,40 300,106 330,96 346,118 372,98 380,106" fill="#fff"/>
  <path d="M0 250 Q120 232 240 252 T480 244 L480 360 L0 360 Z" fill="#fff"/>
  <path d="M0 300 Q160 282 320 304 T480 296 L480 360 L0 360 Z" fill="#e0f2fe"/>
  ${pino(60, 258, 0.9)}${pino(110, 270, 0.7)}${pino(420, 262, 1)}${pino(368, 276, 0.7)}
  ${copos}`);
}

function cuadricula() {
  let lineas = '';
  let etiquetas = '';
  for (let u = -240; u <= 240; u += 40) {
    const px = u + 240;
    lineas += `<line x1="${px}" y1="0" x2="${px}" y2="360" stroke="#c7d2fe" stroke-width="${u === 0 ? 0 : 1}"/>`;
    if (u !== 0 && u > -240 && u < 240)
      etiquetas += `<text x="${px}" y="192" text-anchor="middle">${u}</text>`;
  }
  for (let v = -160; v <= 160; v += 40) {
    const py = 180 - v;
    lineas += `<line x1="0" y1="${py}" x2="480" y2="${py}" stroke="#c7d2fe" stroke-width="${v === 0 ? 0 : 1}"/>`;
    if (v !== 0) etiquetas += `<text x="246" y="${py + 4}">${v}</text>`;
  }
  return escenario(`
  <rect width="480" height="360" fill="#f8fafc"/>${lineas}
  <line x1="0" y1="180" x2="480" y2="180" stroke="#4f46e5" stroke-width="2.5"/>
  <line x1="240" y1="0" x2="240" y2="360" stroke="#4f46e5" stroke-width="2.5"/>
  <polygon points="480,180 468,174 468,186" fill="#4f46e5"/><polygon points="240,0 234,12 246,12" fill="#4f46e5"/>
  <g font-family="Nunito, Arial, sans-serif" font-size="10" font-weight="700" fill="#4338ca">${etiquetas}
  <text x="232" y="192" text-anchor="end">0</text><text x="466" y="168" text-anchor="end" font-size="12">x</text><text x="250" y="14" font-size="12">y</text></g>`);
}

const blanco = escenario(`<rect width="480" height="360" fill="#ffffff"/>
  <rect x="2" y="2" width="476" height="356" fill="none" stroke="#e0e7ff" stroke-width="2"/>`);

export const FONDOS: Fondo[] = [
  { id: 'pradera', nombre: 'Pradera', svg: pradera },
  { id: 'espacio', nombre: 'Espacio', svg: espacioExterior() },
  { id: 'oceano', nombre: 'Océano', svg: oceano },
  { id: 'noche', nombre: 'Ciudad de noche', svg: noche() },
  { id: 'desierto', nombre: 'Desierto', svg: desierto },
  { id: 'nieve', nombre: 'Montañas con nieve', svg: nieve() },
  { id: 'cuadricula', nombre: 'Cuadrícula', svg: cuadricula() },
  { id: 'blanco', nombre: 'En blanco', svg: blanco },
];

export const fondoPorId = (id: string): Fondo => FONDOS.find((f) => f.id === id) ?? FONDOS[0];
