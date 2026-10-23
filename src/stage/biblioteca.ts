import { tDinamica } from '../i18n';
import { kodySVG, zorroSVG } from './disfraces';
import { desierto, espacio, nieve, noche, oceano, pradera } from './escenarios';
import { aula, bosque, carretera, castillo, cielo, ciudad, granja, playa } from './escenarios2';

/**
 * Biblioteca de Kody: personajes (2 disfraces cada uno) y escenarios, todos en SVG propio.
 * Un solo origen de dibujos: los usa el escenario (Pixi) y las miniaturas de la interfaz.
 */

export type CategoriaPersonaje = 'personajes' | 'animales' | 'vehiculos' | 'objetos';
export const CATEGORIAS_PERSONAJE: CategoriaPersonaje[] = [
  'personajes',
  'animales',
  'vehiculos',
  'objetos',
];

export interface Personaje {
  id: string;
  /** Nombre en el idioma actual (se calcula al leerlo). */
  readonly nombre: string;
  categoria: CategoriaPersonaje;
  /** Dibuja el disfraz 0 o 1. */
  svg: (disfraz: 0 | 1) => string;
}

export interface Fondo {
  id: string;
  /** Nombre en el idioma actual (se calcula al leerlo). */
  readonly nombre: string;
  svg: string;
}

const TINTA = '#1e1b4b';

/** Envuelve el dibujo de un personaje (lienzo 120×120, se rasteriza al doble). */
const personaje = (contenido: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120">${contenido}</svg>`;

// ---------------------------------------------------------------- Personajes

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

/** Dibujo plano de respaldo (mientras se genera el 3D): un emoji grande; el 2.º disfraz lo inclina. */
const emoji = (e: string, v: 0 | 1) =>
  personaje(
    `<text x="60" y="88" font-size="84" text-anchor="middle"${v ? ' transform="rotate(-8 60 60)"' : ''}>${e}</text>`,
  );

const nuevoPersonaje = (
  id: string,
  categoria: CategoriaPersonaje,
  svg: Personaje['svg'],
): Personaje => ({
  id,
  categoria,
  get nombre() {
    return tDinamica(`personaje.${id}`);
  },
  svg,
});

const nuevoFondo = (id: string, svg: string): Fondo => ({
  id,
  get nombre() {
    return tDinamica(`fondo.${id}`);
  },
  svg,
});

export const PERSONAJES: Personaje[] = [
  nuevoPersonaje('kody', 'personajes', (v) => kodySVG(v)),
  nuevoPersonaje('zorro', 'animales', (v) => zorroSVG(v)),
  nuevoPersonaje('gato', 'animales', gato),
  nuevoPersonaje('dino', 'animales', dino),
  nuevoPersonaje('cohete', 'vehiculos', cohete),
  nuevoPersonaje('pez', 'animales', pez),
  nuevoPersonaje('abeja', 'animales', abeja),
  nuevoPersonaje('estrella', 'objetos', estrella),
  nuevoPersonaje('perro', 'animales', (v) => emoji('🐶', v)),
  nuevoPersonaje('conejo', 'animales', (v) => emoji('🐰', v)),
  nuevoPersonaje('rana', 'animales', (v) => emoji('🐸', v)),
  nuevoPersonaje('pinguino', 'animales', (v) => emoji('🐧', v)),
  nuevoPersonaje('tortuga', 'animales', (v) => emoji('🐢', v)),
  nuevoPersonaje('buho', 'animales', (v) => emoji('🦉', v)),
  nuevoPersonaje('panda', 'animales', (v) => emoji('🐼', v)),
  nuevoPersonaje('mariposa', 'animales', (v) => emoji('🦋', v)),
  nuevoPersonaje('pulpo', 'animales', (v) => emoji('🐙', v)),
  nuevoPersonaje('pelota', 'objetos', (v) => emoji('⚽', v)),
  nuevoPersonaje('manzana', 'objetos', (v) => emoji('🍎', v)),
  nuevoPersonaje('coche', 'vehiculos', (v) => emoji('🚗', v)),
];

export const personajePorId = (id: string): Personaje =>
  PERSONAJES.find((p) => p.id === id) ?? PERSONAJES[0];

// ----------------------------------------------------------------- Escenarios

/** Envuelve un escenario (480×360 lógicos, 960×720 al rasterizar). */
const escenario = (contenido: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 480 360">${contenido}</svg>`;

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
  nuevoFondo('pradera', pradera()),
  nuevoFondo('espacio', espacio()),
  nuevoFondo('oceano', oceano()),
  nuevoFondo('noche', noche()),
  nuevoFondo('desierto', desierto()),
  nuevoFondo('nieve', nieve()),
  nuevoFondo('playa', playa()),
  nuevoFondo('bosque', bosque()),
  nuevoFondo('granja', granja()),
  nuevoFondo('ciudad', ciudad()),
  nuevoFondo('castillo', castillo()),
  nuevoFondo('aula', aula()),
  nuevoFondo('carretera', carretera()),
  nuevoFondo('cielo', cielo()),
  nuevoFondo('cuadricula', cuadricula()),
  nuevoFondo('blanco', blanco),
];

export const fondoPorId = (id: string): Fondo => FONDOS.find((f) => f.id === id) ?? FONDOS[0];
