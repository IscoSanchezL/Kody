import { azar } from './azar';
import { EFECTOS, acabado, borroso, horiz, lienzo, n1, nubes, radial, vert } from './escenarios';

/**
 * Más escenarios de Kody (mismo estilo que los primeros): capas con perspectiva atmosférica,
 * luz coherente y grano. Cada uno mide 480×360 lógicos. Todo es dibujo propio en SVG.
 */

// ====================================================================== Playa

export function playa() {
  const r = azar(21);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#2f8fe0'], [0.45, '#7cc7f2'], [0.75, '#cdeaf6'], [1, '#fff0d0']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#fffbe6', 0.95], [0.3, '#fff0ad', 0.5], [1, '#ffe08a', 0]) +
    vert('mar', [0, '#0f7fb8'], [0.35, '#1da3cc'], [1, '#58d0d4']) +
    vert('espuma', [0, '#ffffff', 0.9], [1, '#ffffff', 0]) +
    vert('arena', [0, '#f4dfa8'], [0.5, '#ecd08e'], [1, '#d9b46c']) +
    vert('arenaMojada', [0, '#c9a766'], [1, '#e2c88a']) +
    horiz('tronco', [0, '#6b4a2a'], [0.5, '#9a7040'], [1, '#5d3f22']) +
    horiz('hoja', [0, '#1f6e3a'], [0.5, '#46a653'], [1, '#1f6e3a']) +
    nubes('nube', 31, '.007 .02', 5.4, '#a9c6e0') +
    borroso('b05', 0.5) +
    borroso('b2', 2.2) +
    `<filter id="granos" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .6  0 0 0 0 .45  0 0 0 0 .2  0 0 0 1.6 -.6"/></filter>
     <linearGradient id="mC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
     <mask id="mCielo"><rect width="480" height="170" fill="url(#mC)"/></mask>`;

  const palmera = (x: number, y: number, s: number, inclina: number) => {
    const t = (v: number) => n1(v * s);
    const topX = x + inclina * s;
    const topY = y - 118 * s;
    const hojas = Array.from({ length: 7 }, (_, i) => {
      const a = (-170 + i * 28) * (Math.PI / 180);
      const l = 58 * s * (0.85 + (i % 2) * 0.2);
      const ex = topX + Math.cos(a) * l;
      const ey = topY + Math.sin(a) * l * 0.55 + l * 0.38 * Math.abs(Math.cos(a));
      const cx = topX + Math.cos(a) * l * 0.5;
      const cy = topY + Math.sin(a) * l * 0.9 - 8 * s;
      return `<path d="M${n1(topX)} ${n1(topY)} Q${n1(cx)} ${n1(cy)} ${n1(ex)} ${n1(ey)} Q${n1(cx)} ${n1(cy + 9 * s)} ${n1(topX)} ${n1(topY + 3 * s)}Z" fill="url(#hoja)"/>`;
    }).join('');
    return `
      <ellipse cx="${n1(x + 14 * s)}" cy="${n1(y + 2)}" rx="${t(34)}" ry="${t(4)}" fill="#6b4a1a" opacity=".3"/>
      <path d="M${t(0) + x - 5 * s} ${y} Q${n1(x + inclina * 0.4 * s)} ${n1(y - 60 * s)} ${n1(topX - 3 * s)} ${n1(topY)} L${n1(topX + 3 * s)} ${n1(topY)} Q${n1(x + inclina * 0.4 * s + 8 * s)} ${n1(y - 60 * s)} ${n1(x + 5 * s)} ${y}Z" fill="url(#tronco)"/>
      <g stroke="#3d2814" stroke-width=".7" opacity=".4">${Array.from({ length: 8 }, (_, i) => `<path d="M${n1(x - 5 * s + i * inclina * 0.05 * s)} ${n1(y - i * 14 * s)} h${t(10)}"/>`).join('')}</g>
      ${hojas}
      <circle cx="${n1(topX - 3 * s)}" cy="${n1(topY + 4 * s)}" r="${t(4)}" fill="#5b3a1a"/><circle cx="${n1(topX + 4 * s)}" cy="${n1(topY + 5 * s)}" r="${t(4)}" fill="#6b4a2a"/>`;
  };

  const ola = (y: number, op: number, amp: number) =>
    `<path d="M0 ${y} q40 ${-amp} 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 V${y + 14} H0Z" fill="url(#espuma)" opacity="${op}"/>`;
  const conchas = Array.from({ length: 6 }, () => {
    const x = 20 + r() * 440;
    const y = 292 + r() * 60;
    return `<ellipse cx="${n1(x)}" cy="${n1(y + 1.5)}" rx="4" ry="1.2" fill="#8a6a2a" opacity=".3"/><path d="M${n1(x - 3.5)} ${n1(y)} q3.5 -6 7 0z" fill="${['#f8a8b8', '#fff2e0', '#f6c58a'][Math.floor(r() * 3)]}"/>`;
  }).join('');
  const velero = `<g opacity=".8" filter="url(#b05)"><path d="M356 198 L356 168 L376 196Z" fill="#fff"/><path d="M354 198 L354 176 L340 196Z" fill="#f5f5f5"/><path d="M340 200 H378 L372 205 H346Z" fill="#7a4a2a"/></g>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <circle cx="380" cy="86" r="150" fill="url(#solG)"/><circle cx="380" cy="86" r="24" fill="#fffdf0"/>
    <g mask="url(#mCielo)" opacity=".85"><rect width="480" height="170" filter="url(#nube)"/></g>
    <rect y="176" width="480" height="82" fill="url(#mar)"/>
    <g opacity=".5">${Array.from({ length: 22 }, () => `<path d="M${n1(r() * 480)} ${n1(184 + r() * 70)} h${n1(8 + r() * 22)}" stroke="#fff" stroke-width=".8" opacity="${n1(0.25 + r() * 0.4)}"/>`).join('')}</g>
    <path d="M300 176 H480 V182 H300Z" fill="#fff" opacity=".35" filter="url(#b05)"/>
    <rect y="174" width="480" height="3" fill="#bfe6f6" opacity=".8"/>
    ${velero}
    ${ola(250, 0.9, 5)}
    <path d="M0 262 Q120 248 250 262 T480 256 V360 H0Z" fill="url(#arenaMojada)"/>
    <path d="M0 270 Q120 256 250 270 T480 264 V360 H0Z" fill="url(#arena)"/>
    <path d="M0 262 Q120 248 250 262 T480 256" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>
    <rect y="266" width="480" height="94" filter="url(#granos)" opacity=".5"/>
    ${palmera(70, 322, 1.25, 26)}${palmera(420, 300, 0.9, -22)}
    ${conchas}
    <g transform="translate(250 332)"><ellipse cx="0" cy="3" rx="30" ry="5" fill="#6b4a1a" opacity=".25"/><path d="M-26 0 A26 26 0 0 1 26 0Z" fill="#ef4444"/><path d="M-26 0 A26 26 0 0 1 -9 -24 L-4 0Z" fill="#fff"/><path d="M9 -24 A26 26 0 0 1 26 0 L4 0Z" fill="#fff"/><rect x="-1.2" y="-34" width="2.4" height="38" fill="#7a4a2a"/></g>
    <rect width="480" height="360" fill="#ffe2a8" opacity=".05"/>
    ${acabado(0.08, 1)}`,
  );
}

// ====================================================================== Bosque

export function bosque() {
  const r = azar(41);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#9ed0e6'], [1, '#f6f0c8']) +
    vert('suelo', [0, '#4f8a35'], [0.5, '#3d7029'], [1, '#2a5420']) +
    vert('lejos', [0, '#9fc2a8'], [1, '#c4dcc4']) +
    horiz('tronco', [0, '#4a3220'], [0.45, '#7a5434'], [1, '#3a2616']) +
    horiz('troncoL', [0, '#5a3d26'], [0.5, '#8a6340'], [1, '#463020']) +
    radial('rayo', 0.5, 0.5, 0.5, [0, '#fffbd0', 0.55], [1, '#fffbd0', 0]) +
    vert('hojaA', [0, '#4c9a3c'], [1, '#2f6f2a']) +
    vert('hojaB', [0, '#3a8034'], [1, '#235a26']) +
    vert('hojaC', [0, '#2e6a2e'], [1, '#1c4a22']) +
    vert('niebla', [0, '#d8ecd0', 0], [1, '#d8ecd0', 0.6]) +
    borroso('b05', 0.6) +
    borroso('b2', 2.4) +
    borroso('b4', 4.5) +
    `<filter id="pasto" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".04 .6" numOctaves="2" seed="8"/><feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .22  0 0 0 0 .06  0 0 0 1.8 -.7"/></filter>`;

  const pino = (x: number, y: number, h: number, fondo: 'A' | 'B' | 'C', op = 1, filtro = '') => {
    const w = h * 0.34;
    let capas = '';
    for (let i = 0; i < 5; i++) {
      const ty = y - h * (0.28 + i * 0.17);
      const ww = w * (1 - i * 0.17);
      capas += `<path d="M${n1(x - ww)} ${n1(ty + h * 0.2)} L${n1(x)} ${n1(ty - h * 0.1)} L${n1(x + ww)} ${n1(ty + h * 0.2)} Q${n1(x)} ${n1(ty + h * 0.14)} ${n1(x - ww)} ${n1(ty + h * 0.2)}Z" fill="url(#hoja${fondo})"/><path d="M${n1(x)} ${n1(ty - h * 0.1)} L${n1(x + ww)} ${n1(ty + h * 0.2)} Q${n1(x + ww * 0.3)} ${n1(ty + h * 0.12)} ${n1(x)} ${n1(ty + h * 0.14)}Z" fill="#0c2c10" opacity=".3"/>`;
    }
    return `<g opacity="${op}" ${filtro ? `filter="url(#${filtro})"` : ''}><ellipse cx="${n1(x + w * 0.4)}" cy="${y}" rx="${n1(w * 0.9)}" ry="${n1(h * 0.04)}" fill="#0e2a10" opacity=".28"/><rect x="${n1(x - h * 0.025)}" y="${n1(y - h * 0.3)}" width="${n1(h * 0.05)}" height="${n1(h * 0.3)}" fill="url(#tronco)"/>${capas}</g>`;
  };
  const arbolGrande = (x: number, ancho: number) =>
    `<g><rect x="${x}" y="-10" width="${ancho}" height="380" fill="url(#tronco)"/><rect x="${x}" y="-10" width="${n1(ancho * 0.22)}" height="380" fill="#a67c52" opacity=".28"/><g stroke="#2a1a0c" stroke-width=".8" opacity=".35">${Array.from({ length: 10 }, (_, i) => `<path d="M${n1(x + 4 + ((i * 7) % (ancho - 8)))} 0 v360"/>`).join('')}</g></g>`;
  const hongo = (x: number, y: number, s: number) =>
    `<ellipse cx="${x}" cy="${y + 1}" rx="${n1(7 * s)}" ry="${n1(1.8 * s)}" fill="#0e2a10" opacity=".3"/><rect x="${n1(x - 2 * s)}" y="${n1(y - 7 * s)}" width="${n1(4 * s)}" height="${n1(7 * s)}" rx="${n1(1.5 * s)}" fill="#f1e6d0"/><path d="M${n1(x - 8 * s)} ${n1(y - 6 * s)} Q${x} ${n1(y - 20 * s)} ${n1(x + 8 * s)} ${n1(y - 6 * s)}Z" fill="#d6372f"/><circle cx="${n1(x - 2.5 * s)}" cy="${n1(y - 11 * s)}" r="${n1(1.3 * s)}" fill="#fff"/><circle cx="${n1(x + 3 * s)}" cy="${n1(y - 9.5 * s)}" r="${n1(1.1 * s)}" fill="#fff"/>`;
  const flor = (x: number, y: number, c: string) =>
    `<path d="M${x} ${y} v-7" stroke="#2f6f2a" stroke-width="1"/><circle cx="${x}" cy="${y - 8}" r="2.4" fill="${c}"/><circle cx="${x}" cy="${y - 8}" r=".9" fill="#ffd54a"/>`;
  const pastos = Array.from({ length: 70 }, () => {
    const x = r() * 480;
    const y = 270 + r() * 90;
    const h = 5 + (y - 270) * 0.1;
    return `<path d="M${n1(x)} ${n1(y)} q${n1((r() - 0.5) * 4)} ${n1(-h / 2)} ${n1((r() - 0.5) * 6)} ${n1(-h)}" stroke="${r() > 0.5 ? '#6db04a' : '#2f6f2a'}" stroke-width="1" fill="none" opacity=".8"/>`;
  }).join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <g filter="url(#b2)" opacity=".85">${[40, 90, 150, 200, 255, 310, 370, 430, 470].map((x, i) => pino(x, 262, 120 + (i % 3) * 16, 'C', 0.55)).join('')}</g>
    <rect y="170" width="480" height="100" fill="url(#niebla)"/>
    <g filter="url(#b05)">${[20, 110, 190, 285, 345, 455].map((x, i) => pino(x, 280 + (i % 2) * 6, 150 + (i % 3) * 18, 'B', 0.92)).join('')}</g>
    <path d="M0 270 Q120 258 250 268 T480 262 V360 H0Z" fill="url(#suelo)"/>
    <rect y="266" width="480" height="94" filter="url(#pasto)" opacity=".55"/>
    <path d="M150 360 Q210 300 250 270 L290 270 Q280 310 330 360Z" fill="#c8a870" opacity=".55"/>
    ${pastos}
    ${pino(60, 326, 230, 'A')}${pino(410, 320, 210, 'A')}
    ${arbolGrande(-8, 38)}${arbolGrande(452, 44)}
    <polygon points="90,0 150,0 250,300 160,300" fill="url(#rayo)" opacity=".5"/>
    <polygon points="230,0 270,0 360,300 300,300" fill="url(#rayo)" opacity=".35"/>
    ${hongo(210, 338, 1.3)}${hongo(228, 346, 0.9)}${hongo(350, 330, 1)}
    ${flor(120, 340, '#ff8fb1')}${flor(140, 350, '#ffd54a')}${flor(380, 346, '#ffffff')}${flor(300, 352, '#ff8fb1')}
    ${acabado(0.09, 1)}`,
  );
}

// ====================================================================== Granja

export function granja() {
  const r = azar(51);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#3b8fe0'], [0.5, '#8ccaf2'], [1, '#e9f3e6']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#fffbe6', 0.9], [0.3, '#fff0ad', 0.45], [1, '#ffe08a', 0]) +
    vert('colinaL', [0, '#a2cf74'], [1, '#7db452']) +
    vert('campo', [0, '#8cc455'], [1, '#5e9a35']) +
    vert('arado', [0, '#7a5a3a'], [1, '#5a3f26']) +
    vert('trigo', [0, '#e9c85a'], [1, '#c99a2e']) +
    horiz('granero', [0, '#a52a22'], [0.5, '#cf3b30'], [1, '#8d221c']) +
    horiz('silo', [0, '#aeb7bf'], [0.4, '#e6ebef'], [1, '#8b959e']) +
    vert('techo', [0, '#6d4a3a'], [1, '#4a3024']) +
    nubes('nube', 14, '.008 .022', 5.6, '#9db9d6') +
    borroso('b05', 0.5) +
    borroso('b2', 2) +
    `<linearGradient id="mC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="mCielo"><rect width="480" height="190" fill="url(#mC)"/></mask>
     <filter id="cesped" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .65" numOctaves="2" seed="6"/><feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .3  0 0 0 0 .05  0 0 0 1.8 -.7"/></filter>`;

  const surcos = Array.from({ length: 9 }, (_, i) => {
    const y = 262 + i * 11;
    return `<path d="M${n1(-10 + i * 6)} ${y} Q240 ${n1(y - 14 - i)} 490 ${n1(y - 4)}" stroke="#3a281a" stroke-width="${n1(1.4 + i * 0.25)}" fill="none" opacity=".55"/><path d="M${n1(-10 + i * 6)} ${y + 2} Q240 ${n1(y - 12 - i)} 490 ${n1(y - 2)}" stroke="#9a7a52" stroke-width=".7" fill="none" opacity=".4"/>`;
  }).join('');
  const granero = `
    <g transform="translate(300 268)">
      <ellipse cx="46" cy="4" rx="78" ry="8" fill="#1e3a10" opacity=".3" filter="url(#b05)"/>
      <rect x="0" y="-70" width="92" height="70" fill="url(#granero)"/>
      <path d="M-6 -68 L46 -112 L98 -68Z" fill="url(#techo)"/><path d="M46 -112 L98 -68 L90 -66 L46 -104Z" fill="#2a1a12" opacity=".4"/>
      <g stroke="#7a1a14" stroke-width="1.2" opacity=".5">${Array.from({ length: 11 }, (_, i) => `<path d="M${4 + i * 8} -68 v68"/>`).join('')}</g>
      <rect x="28" y="-42" width="36" height="42" fill="#7a1a14"/><path d="M28 -42 L64 0 M64 -42 L28 0" stroke="#f1e6d0" stroke-width="3"/><rect x="28" y="-42" width="36" height="42" fill="none" stroke="#f1e6d0" stroke-width="3"/>
      <circle cx="46" cy="-80" r="7" fill="#f1e6d0"/><circle cx="46" cy="-80" r="4" fill="#3a2a1c"/>
    </g>
    <g transform="translate(398 268)"><ellipse cx="14" cy="3" rx="26" ry="4" fill="#1e3a10" opacity=".3"/><rect x="0" y="-68" width="28" height="68" fill="url(#silo)"/><path d="M-2 -68 Q14 -90 30 -68Z" fill="#9aa6b0"/><g stroke="#7a838c" stroke-width=".8" opacity=".5"><path d="M0 -50 h28 M0 -32 h28 M0 -14 h28"/></g></g>`;
  const cerca = (x0: number, x1: number, y: number) => {
    let s = `<path d="M${x0} ${y - 14} H${x1} M${x0} ${y - 6} H${x1}" stroke="#d9c7a2" stroke-width="2" opacity=".9"/>`;
    for (let x = x0; x <= x1; x += 22)
      s += `<rect x="${x}" y="${y - 20}" width="4" height="22" fill="#bda57a"/><rect x="${x}" y="${y - 20}" width="1.4" height="22" fill="#e6d6b4"/>`;
    return s;
  };
  const arbol = (x: number, y: number, s: number) =>
    `<ellipse cx="${n1(x + 8 * s)}" cy="${y}" rx="${n1(28 * s)}" ry="${n1(4 * s)}" fill="#1e3a10" opacity=".3"/><rect x="${n1(x - 3 * s)}" y="${n1(y - 26 * s)}" width="${n1(6 * s)}" height="${n1(26 * s)}" fill="#6b4a2a"/><circle cx="${x}" cy="${n1(y - 38 * s)}" r="${n1(22 * s)}" fill="#3f8a3a"/><circle cx="${n1(x - 9 * s)}" cy="${n1(y - 34 * s)}" r="${n1(14 * s)}" fill="#55a64a"/><circle cx="${n1(x + 10 * s)}" cy="${n1(y - 44 * s)}" r="${n1(12 * s)}" fill="#2f7430"/><circle cx="${n1(x - 6 * s)}" cy="${n1(y - 46 * s)}" r="${n1(6 * s)}" fill="#7bc263" opacity=".6"/>`;
  const trigo = Array.from({ length: 80 }, () => {
    const x = 20 + r() * 220;
    const y = 296 + r() * 60;
    return `<path d="M${n1(x)} ${n1(y)} v-12" stroke="#b8862a" stroke-width=".9"/><ellipse cx="${n1(x)}" cy="${n1(y - 14)}" rx="1.6" ry="3.6" fill="#f0cf64"/>`;
  }).join('');
  const molino = `<g transform="translate(70 262)" opacity=".92"><path d="M-8 0 L-4 -34 H4 L8 0Z" fill="#e6dccb"/><g transform="translate(0 -36)" stroke="#8a6a3a" stroke-width="1.4"><g><path d="M0 0 L0 -24 M0 0 L24 0 M0 0 L0 24 M0 0 L-24 0" /><path d="M0 -24 h5 v-10 h-5z M24 0 v5 h10 v-5z M0 24 h-5 v10 h5z M-24 0 v-5 h-10 v5z" fill="#fff" stroke="#c9b690" stroke-width=".6"/></g></g></g>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <circle cx="90" cy="70" r="150" fill="url(#solG)"/><circle cx="90" cy="70" r="22" fill="#fffdf0"/>
    <g mask="url(#mCielo)" opacity=".85"><rect width="480" height="190" filter="url(#nube)"/></g>
    <path d="M0 214 Q100 184 210 204 T480 196 V260 H0Z" fill="url(#colinaL)" filter="url(#b05)"/>
    <path d="M0 236 Q140 206 300 232 T480 224 V270 H0Z" fill="url(#campo)"/>
    <rect y="214" width="480" height="60" filter="url(#cesped)" opacity=".4"/>
    ${molino}
    ${arbol(36, 262, 1.1)}${arbol(450, 250, 0.8)}
    ${granero}
    <path d="M-10 262 Q240 246 490 258 V360 H-10Z" fill="url(#arado)"/>
    ${surcos}
    <path d="M0 300 Q110 280 230 300 T480 306 V360 H0Z" fill="url(#trigo)" opacity=".95"/>
    ${trigo}
    ${cerca(240, 470, 268)}
    <g transform="translate(120 300)"><path d="M0 0 C-8 -14 -6 -30 0 -36 C4 -28 12 -20 12 -8 Z" fill="none"/></g>
    <rect width="480" height="360" fill="#ffe2a8" opacity=".05"/>
    ${acabado(0.08, 1)}`,
  );
}

// ==================================================================== Ciudad

export function ciudad() {
  const r = azar(61);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#4a9be8'], [0.55, '#a9d6f4'], [1, '#f2f1e6']) +
    vert('lejos', [0, '#9db6cf'], [1, '#c3d3e2']) +
    vert('medio', [0, '#7e97b4'], [1, '#a6bbd0']) +
    vert('vidrio', [0, '#7fb6d8'], [1, '#3d78a6']) +
    vert('acera', [0, '#cfcfcf'], [1, '#a9a9ab']) +
    vert('calle', [0, '#59595f'], [1, '#3a3a40']) +
    vert('ladrillo', [0, '#b5553a'], [1, '#8f3f2a']) +
    vert('crema', [0, '#ead9b4'], [1, '#c9b384']) +
    vert('gris', [0, '#bfc6cd'], [1, '#8d97a1']) +
    nubes('nube', 22, '.007 .02', 5.4, '#a4bdd8') +
    borroso('b05', 0.5) +
    borroso('b2', 2) +
    `<linearGradient id="mC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="mCielo"><rect width="480" height="170" fill="url(#mC)"/></mask>`;

  const edificio = (
    x: number,
    base: number,
    w: number,
    h: number,
    relleno: string,
    ventana: string,
    filas: number,
    cols: number,
    antena = false,
  ) => {
    let v = '';
    const mw = (w - 8) / cols;
    const mh = (h - 14) / filas;
    for (let i = 0; i < filas; i++)
      for (let j = 0; j < cols; j++) {
        const luz = r() > 0.78;
        v += `<rect x="${n1(x + 4 + j * mw + mw * 0.15)}" y="${n1(base - h + 8 + i * mh + mh * 0.15)}" width="${n1(mw * 0.7)}" height="${n1(mh * 0.62)}" fill="${luz ? '#ffe9a0' : ventana}" opacity="${luz ? 0.95 : 0.8}"/>`;
      }
    return `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="url(#${relleno})"/><rect x="${x}" y="${base - h}" width="${n1(w * 0.12)}" height="${h}" fill="#fff" opacity=".12"/><rect x="${n1(x + w * 0.88)}" y="${base - h}" width="${n1(w * 0.12)}" height="${h}" fill="#000" opacity=".12"/><rect x="${x - 1}" y="${base - h - 3}" width="${w + 2}" height="4" fill="#000" opacity=".2"/>${v}${antena ? `<path d="M${n1(x + w / 2)} ${base - h - 3} v-16" stroke="#555" stroke-width="1.4"/><circle cx="${n1(x + w / 2)}" cy="${base - h - 20}" r="1.6" fill="#ef4444"/>` : ''}`;
  };
  const lejos = [
    [0, 60, 90],
    [50, 44, 120],
    [92, 56, 76],
    [146, 40, 134],
    [184, 62, 98],
    [244, 46, 112],
    [288, 58, 84],
    [344, 40, 126],
    [382, 62, 100],
    [442, 46, 80],
  ]
    .map(
      ([x, w, h]) =>
        `<rect x="${x}" y="${250 - h}" width="${w}" height="${h}" fill="url(#lejos)"/>`,
    )
    .join('');
  const medio = [
    [10, 50, 100],
    [70, 40, 140],
    [118, 54, 90],
    [180, 44, 150],
    [232, 60, 110],
    [300, 42, 130],
    [350, 56, 96],
    [416, 50, 120],
  ]
    .map(
      ([x, w, h]) =>
        `<rect x="${x}" y="${252 - h}" width="${w}" height="${h}" fill="url(#medio)"/>`,
    )
    .join('');
  const farola = (x: number) =>
    `<rect x="${x}" y="226" width="3" height="46" fill="#3a3a40"/><path d="M${x + 1.5} 226 q0 -8 -8 -8" stroke="#3a3a40" stroke-width="2.4" fill="none"/><ellipse cx="${x - 8}" cy="219" rx="5" ry="2.4" fill="#ffe9a0"/>`;
  const arbolito = (x: number) =>
    `<rect x="${x - 1.5}" y="252" width="3" height="20" fill="#6b4a2a"/><circle cx="${x}" cy="246" r="12" fill="#3f8a3a"/><circle cx="${x - 5}" cy="248" r="7" fill="#55a64a"/>`;
  const carro = (x: number, y: number, color: string, dir: number) =>
    `<g transform="translate(${x} ${y}) scale(${dir} 1)"><ellipse cx="0" cy="2" rx="24" ry="3" fill="#000" opacity=".3"/><path d="M-22 -4 q0 -8 6 -9 l6 -8 h18 l8 8 q8 1 8 9z" fill="${color}"/><path d="M-9 -13 l4 -6 h12 l5 6z" fill="#cfe8f6"/><circle cx="-12" cy="-1" r="5" fill="#222"/><circle cx="12" cy="-1" r="5" fill="#222"/><circle cx="-12" cy="-1" r="2" fill="#bbb"/><circle cx="12" cy="-1" r="2" fill="#bbb"/></g>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <g mask="url(#mCielo)" opacity=".85"><rect width="480" height="170" filter="url(#nube)"/></g>
    <g filter="url(#b2)" opacity=".9">${lejos}</g>
    <g filter="url(#b05)" opacity=".95">${medio}</g>
    ${edificio(0, 262, 70, 150, 'ladrillo', '#f6e6c0', 7, 4)}
    ${edificio(74, 262, 56, 196, 'vidrio', '#d7efff', 10, 3, true)}
    ${edificio(134, 262, 68, 128, 'crema', '#6a8aa6', 6, 4)}
    ${edificio(206, 262, 64, 176, 'gris', '#5f7f9c', 9, 4, true)}
    ${edificio(274, 262, 72, 138, 'ladrillo', '#f6e6c0', 7, 4)}
    ${edificio(350, 262, 58, 190, 'vidrio', '#d7efff', 10, 3)}
    ${edificio(412, 262, 76, 120, 'crema', '#6a8aa6', 6, 4)}
    <rect y="262" width="480" height="18" fill="url(#acera)"/><rect y="278" width="480" height="3" fill="#000" opacity=".2"/>
    <rect y="281" width="480" height="79" fill="url(#calle)"/>
    <g stroke="#f4d03f" stroke-width="3" opacity=".9">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 64 + 10} 322 h34"/>`).join('')}</g>
    <rect y="284" width="480" height="2" fill="#fff" opacity=".5"/><rect y="354" width="480" height="2" fill="#fff" opacity=".3"/>
    ${farola(60)}${farola(236)}${farola(410)}${arbolito(30)}${arbolito(180)}${arbolito(330)}${arbolito(455)}
    ${carro(130, 342, '#e8453c', 1)}${carro(360, 306, '#2f7fe0', -1)}
    <rect width="480" height="360" fill="#ffe2a8" opacity=".04"/>
    ${acabado(0.08, 1)}`,
  );
}

// =================================================================== Castillo

export function castillo() {
  const r = azar(71);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#5a7fd8'], [0.5, '#b3a8e0'], [0.85, '#f6c9b0'], [1, '#ffe0a8']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#fff6d8', 0.9], [0.3, '#ffd9a0', 0.5], [1, '#ffb878', 0]) +
    horiz('piedra', [0, '#a8a29a'], [0.5, '#d8d2c6'], [1, '#8a847c']) +
    vert('piedraS', [0, '#8f8a82'], [1, '#6c675f']) +
    vert('techo', [0, '#b8473a'], [1, '#7a2a24']) +
    vert('colina', [0, '#6aa84a'], [1, '#3f7a2e']) +
    vert('lejos', [0, '#8fa3c8'], [1, '#b9bfdc']) +
    vert('foso', [0, '#3b8fc0'], [1, '#2a6a96']) +
    nubes('nube', 25, '.007 .02', 5.5, '#c9a8c0') +
    borroso('b05', 0.5) +
    borroso('b2', 2.2) +
    `<linearGradient id="mC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="mCielo"><rect width="480" height="190" fill="url(#mC)"/></mask>`;

  const torre = (
    x: number,
    base: number,
    w: number,
    h: number,
    techoH: number,
    banderaC: string,
  ) => {
    let almenas = '';
    let ladrillos = '';
    for (let i = 0; i < h / 10; i++)
      ladrillos += `<path d="M${x} ${base - i * 10} h${w}" stroke="#6c675f" stroke-width=".6" opacity=".35"/>${Array.from({ length: 4 }, (_, j) => `<path d="M${n1(x + ((j * w) / 3.5 + (i % 2) * 5))} ${base - i * 10} v-10" stroke="#6c675f" stroke-width=".5" opacity=".3"/>`).join('')}`;
    return `<g>
      <rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="url(#piedra)"/>${ladrillos}
      <rect x="${n1(x + w * 0.85)}" y="${base - h}" width="${n1(w * 0.15)}" height="${h}" fill="#000" opacity=".18"/>
      <path d="M${x - 4} ${base - h} H${x + w + 4} V${base - h + 6} H${x - 4}Z" fill="url(#piedraS)"/>${almenas}
      <path d="M${x - 5} ${base - h} L${n1(x + w / 2)} ${base - h - techoH} L${x + w + 5} ${base - h}Z" fill="url(#techo)"/><path d="M${n1(x + w / 2)} ${base - h - techoH} L${x + w + 5} ${base - h} L${n1(x + w / 2 + 3)} ${base - h}Z" fill="#000" opacity=".2"/>
      <path d="M${n1(x + w / 2)} ${base - h - techoH} v-14" stroke="#4a3a2a" stroke-width="1.2"/><path d="M${n1(x + w / 2)} ${base - h - techoH - 14} l14 4 l-14 5z" fill="${banderaC}"/>
      <path d="M${n1(x + w / 2 - 3)} ${base - h * 0.55} v-14 a3 3 0 0 1 6 0 v14z" fill="#2a2a3a"/><path d="M${n1(x + w / 2 - 3)} ${base - h * 0.85} v-12 a3 3 0 0 1 6 0 v12z" fill="#2a2a3a"/>
    </g>`;
  };
  const muro = (x0: number, x1: number, base: number, h: number) => {
    let a = '';
    for (let x = x0; x < x1 - 6; x += 12)
      a += `<rect x="${x}" y="${base - h - 7}" width="7" height="8" fill="url(#piedra)"/>`;
    return `<rect x="${x0}" y="${base - h}" width="${x1 - x0}" height="${h}" fill="url(#piedra)"/>${a}<rect x="${x0}" y="${base - h}" width="${x1 - x0}" height="3" fill="#000" opacity=".16"/>`;
  };
  const estrellas = Array.from(
    { length: 16 },
    () =>
      `<circle cx="${n1(r() * 480)}" cy="${n1(r() * 80)}" r="${n1(0.4 + r() * 0.8)}" fill="#fff" opacity="${n1(0.4 + r() * 0.5)}"/>`,
  ).join('');

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>${estrellas}
    <circle cx="300" cy="190" r="170" fill="url(#solG)"/>
    <g mask="url(#mCielo)" opacity=".8"><rect width="480" height="190" filter="url(#nube)"/></g>
    <path d="M0 232 L60 200 L110 226 L170 190 L230 224 L300 196 L370 228 L430 204 L480 224 V280 H0Z" fill="url(#lejos)" filter="url(#b2)" opacity=".8"/>
    <path d="M0 252 Q120 220 250 244 T480 236 V300 H0Z" fill="url(#colina)" opacity=".75" filter="url(#b05)"/>
    <g>
      ${torre(150, 270, 38, 110, 44, '#e8453c')}${torre(292, 270, 38, 110, 44, '#e8453c')}
      ${muro(186, 294, 270, 74)}
      ${torre(212, 270, 56, 150, 60, '#f4c430')}
      <g><path d="M229 270 v-36 a11 11 0 0 1 22 0 v36z" fill="#3a2418"/><path d="M240 232 v38" stroke="#241408" stroke-width="1.4"/><circle cx="244" cy="256" r="1.2" fill="#d4a017"/></g>
      ${muro(100, 152, 270, 60)}${muro(330, 392, 270, 60)}
      ${torre(78, 274, 30, 80, 32, '#2f7fe0')}${torre(392, 274, 30, 80, 32, '#2f7fe0')}
    </g>
    <rect y="266" width="480" height="14" fill="url(#foso)" opacity=".9"/><path d="M0 270 q30 -3 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#bfe6f6" stroke-width="1" fill="none" opacity=".6"/>
    <path d="M0 280 Q120 266 250 278 T480 272 V360 H0Z" fill="url(#colina)"/>
    <path d="M200 280 Q240 276 280 280 L330 360 H150Z" fill="#c8a870" opacity=".7"/>
    <g fill="#7a4a2a"><rect x="232" y="270" width="16" height="10"/></g><g stroke="#4a2a14" stroke-width="1"><path d="M232 275 h16"/></g>
    ${Array.from({ length: 40 }, () => `<path d="M${n1(r() * 480)} ${n1(300 + r() * 56)} q1 -4 2 -7" stroke="#8cc455" stroke-width="1" opacity=".7"/>`).join('')}
    <rect width="480" height="360" fill="#ffb878" opacity=".06"/>
    ${acabado(0.09, 1)}`,
  );
}

// ====================================================================== Aula

export function aula() {
  const defs =
    EFECTOS +
    vert('pared', [0, '#f1e4c4'], [1, '#e2d0a6']) +
    vert('piso', [0, '#c89a62'], [1, '#9a6e3e']) +
    vert('pizarra', [0, '#2f5d4a'], [1, '#234838']) +
    vert('cielo', [0, '#8fcdf2'], [1, '#e2f3fb']) +
    horiz('madera', [0, '#9a6a3a'], [0.5, '#c58e52'], [1, '#8a5c30']) +
    radial('luz', 0.5, 0.5, 0.5, [0, '#fff7d0', 0.6], [1, '#fff7d0', 0]) +
    borroso('b05', 0.5) +
    borroso('b2', 2) +
    `<filter id="vetas" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .5" numOctaves="3" seed="12"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .08  0 0 0 1.4 -.5"/></filter>`;

  const pupitre = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="4" rx="34" ry="5" fill="#000" opacity=".25"/><path d="M-30 -22 H30 L26 -10 H-26Z" fill="url(#madera)"/><path d="M-30 -22 H30 V-24 H-30Z" fill="#e0b27a"/><rect x="-24" y="-10" width="3" height="14" fill="#6a6a70"/><rect x="21" y="-10" width="3" height="14" fill="#6a6a70"/><rect x="-20" y="-44" width="40" height="18" rx="3" fill="#e8453c"/><rect x="-20" y="-44" width="40" height="5" fill="#fff" opacity=".2"/></g>`;
  const libro = (x: number, y: number, c: string) =>
    `<rect x="${x}" y="${y}" width="5" height="22" fill="${c}"/><rect x="${x}" y="${y}" width="1.4" height="22" fill="#fff" opacity=".3"/>`;
  const mapa = `<g transform="translate(36 70)"><rect width="76" height="52" fill="#8fd0f0" stroke="#7a4a2a" stroke-width="3"/><path d="M8 18 q12 -10 22 -2 t18 6 q8 8 -2 16 t-26 6 q-12 -6 -12 -26z" fill="#6fbf5a"/><path d="M50 8 q10 -2 14 6 t-4 12 t-12 -4z" fill="#8fd06a"/><path d="M36 38 q14 -4 26 4 t-4 6 t-22 -2z" fill="#6fbf5a"/></g>`;
  const marcas = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<path d="M${n1(Math.sin(a) * 15)} ${n1(-Math.cos(a) * 15)} L${n1(Math.sin(a) * 17.5)} ${n1(-Math.cos(a) * 17.5)}"/>`;
  }).join('');
  const reloj = `<g transform="translate(400 32)"><circle r="20" fill="#fff" stroke="#6b4a2a" stroke-width="4"/><g stroke="#333" stroke-width="1.2">${marcas}</g><path d="M0 0 L-6 -8" stroke="#222" stroke-width="2.2" stroke-linecap="round"/><path d="M0 0 L9 -12" stroke="#222" stroke-width="1.6" stroke-linecap="round"/><circle r="1.6" fill="#e8453c"/></g>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#pared)"/>
    <rect y="206" width="480" height="8" fill="#b88a52"/><rect y="204" width="480" height="3" fill="#e6c897"/>
    <rect y="214" width="480" height="146" fill="url(#piso)"/><rect y="214" width="480" height="146" filter="url(#vetas)" opacity=".45"/>
    <g stroke="#6a4624" stroke-width=".9" opacity=".35">${Array.from({ length: 9 }, (_, i) => `<path d="M${-40 + i * 70} 360 L${i * 60 + 10} 214"/>`).join('')}</g>
    <g><rect x="318" y="62" width="130" height="100" fill="url(#cielo)" stroke="#fff" stroke-width="6"/><rect x="318" y="62" width="130" height="100" fill="none" stroke="#c8b48a" stroke-width="2"/><path d="M383 62 V162 M318 112 H448" stroke="#fff" stroke-width="5"/>
      <path d="M326 150 q14 -26 32 -8 q14 -16 28 4 q22 -10 42 6z" fill="#fff" opacity=".7"/></g>
    <polygon points="318,162 448,162 470,330 290,330" fill="url(#luz)" opacity=".55" transform="translate(-8 -4)"/>
    <g><rect x="130" y="44" width="170" height="100" fill="url(#pizarra)" stroke="#8a5c30" stroke-width="6"/><rect x="130" y="44" width="170" height="100" fill="none" stroke="#c8a070" stroke-width="1.5"/>
      <g stroke="#e8f1ec" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"><path d="M146 66 q6 -10 12 0 q6 10 12 0"/><path d="M180 64 h30 M180 76 h44"/><path d="M146 96 l8 -12 l8 12 z" /><circle cx="196" cy="94" r="8"/><path d="M216 86 h16 v16 h-16z"/><path d="M248 70 l20 20 M268 70 l-20 20"/></g>
      <rect x="130" y="144" width="170" height="6" fill="#8a5c30"/><rect x="150" y="141" width="14" height="3" fill="#fff"/><rect x="170" y="141" width="10" height="3" fill="#f4c430"/></g>
    ${mapa}${reloj}
    <g transform="translate(20 130)"><rect width="70" height="76" fill="#a9703c" stroke="#7a4a2a" stroke-width="2"/><rect y="36" width="70" height="3" fill="#7a4a2a"/>${libro(6, 12, '#2f7fe0')}${libro(12, 8, '#e8453c')}${libro(18, 14, '#f4c430')}${libro(24, 10, '#6fbf5a')}${libro(30, 12, '#8e5cd0')}${libro(8, 52, '#e8453c')}${libro(14, 56, '#2f7fe0')}${libro(20, 50, '#f4c430')}${libro(26, 54, '#6fbf5a')}</g>
    ${pupitre(150, 270, 1.2)}${pupitre(330, 262, 1.1)}${pupitre(240, 316, 1.35)}${pupitre(80, 330, 1.2)}${pupitre(410, 326, 1.2)}
    <g transform="translate(250 228)"><rect x="-44" y="-2" width="88" height="22" fill="url(#madera)"/><rect x="-44" y="-4" width="88" height="4" fill="#e0b27a"/><rect x="-40" y="20" width="5" height="24" fill="#7a4a2a"/><rect x="35" y="20" width="5" height="24" fill="#7a4a2a"/></g>
    <g transform="translate(238 218)"><path d="M0 0 q8 -14 16 0z" fill="#e8453c"/><rect x="-1" y="-1" width="18" height="3" fill="#fff"/></g>
    ${acabado(0.07, 0.8)}`,
  );
}

// =================================================================== Carretera

export function carretera() {
  const r = azar(91);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#3d8ee6'], [0.5, '#9fd2f2'], [1, '#fbf0d2']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#fffbe6', 0.95], [0.3, '#fff0ad', 0.45], [1, '#ffe08a', 0]) +
    vert('montL', [0, '#9fb6cf'], [1, '#c9d8e2']) +
    vert('montM', [0, '#7f9a86'], [1, '#a9bfa6']) +
    vert('pasto', [0, '#86be52'], [1, '#4d8a30']) +
    vert('asfalto', [0, '#5e5e64'], [1, '#34343a']) +
    nubes('nube', 36, '.006 .017', 5.3, '#a4bdd8') +
    borroso('b05', 0.5) +
    borroso('b2', 2.2) +
    `<linearGradient id="mC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="mCielo"><rect width="480" height="180" fill="url(#mC)"/></mask>
     <filter id="pastoF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .6" numOctaves="2" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .25  0 0 0 0 .05  0 0 0 1.8 -.7"/></filter>`;

  // Camino en perspectiva: horizonte en y=200, punto de fuga en x=240.
  const franjas = Array.from({ length: 9 }, (_, i) => {
    const t0 = Math.pow(i / 9, 2.1);
    const t1 = Math.pow((i + 0.5) / 9, 2.1);
    const y0 = 200 + t0 * 160;
    const y1 = 200 + t1 * 160;
    const a0 = 0.5 + t0 * 3.2;
    const a1 = 0.5 + t1 * 3.2;
    return `<path d="M${n1(240 - a0)} ${n1(y0)} L${n1(240 + a0)} ${n1(y0)} L${n1(240 + a1)} ${n1(y1)} L${n1(240 - a1)} ${n1(y1)}Z" fill="#f4d03f" opacity=".95"/>`;
  }).join('');
  const poste = (t: number, lado: number) => {
    const tt = Math.pow(t, 2.1);
    const y = 200 + tt * 160;
    const x = 240 + lado * (2 + tt * 52 + 8 + tt * 60);
    const h = 10 + tt * 120;
    return `<rect x="${n1(x - 0.8 - tt * 2)}" y="${n1(y - h)}" width="${n1(1.6 + tt * 4)}" height="${n1(h)}" fill="#8a6a4a"/><path d="M${n1(x - 6 - tt * 14)} ${n1(y - h)} h${n1(12 + tt * 28)}" stroke="#8a6a4a" stroke-width="${n1(1 + tt * 2)}"/>`;
  };
  const arbol = (x: number, y: number, s: number) =>
    `<ellipse cx="${n1(x + 4 * s)}" cy="${y}" rx="${n1(16 * s)}" ry="${n1(2.6 * s)}" fill="#1e3a10" opacity=".3"/><rect x="${n1(x - 2 * s)}" y="${n1(y - 16 * s)}" width="${n1(4 * s)}" height="${n1(16 * s)}" fill="#6b4a2a"/><circle cx="${x}" cy="${n1(y - 26 * s)}" r="${n1(15 * s)}" fill="#3f8a3a"/><circle cx="${n1(x - 5 * s)}" cy="${n1(y - 24 * s)}" r="${n1(9 * s)}" fill="#55a64a"/><circle cx="${n1(x + 6 * s)}" cy="${n1(y - 30 * s)}" r="${n1(8 * s)}" fill="#2f7430"/>`;
  const senal = `<g transform="translate(120 286)"><rect x="-1.5" y="-4" width="3" height="46" fill="#777"/><path d="M0 -34 L18 -4 H-18Z" fill="#f4d03f" stroke="#c0392b" stroke-width="3" stroke-linejoin="round"/><path d="M0 -26 V-14 M0 -9 v1" stroke="#222" stroke-width="3" stroke-linecap="round"/></g>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <circle cx="380" cy="120" r="140" fill="url(#solG)"/><circle cx="380" cy="120" r="20" fill="#fffdf0"/>
    <g mask="url(#mCielo)" opacity=".85"><rect width="480" height="180" filter="url(#nube)"/></g>
    <path d="M0 204 L50 150 L96 186 L160 128 L220 190 L280 156 L340 196 L410 140 L480 192 V210 H0Z" fill="url(#montL)" filter="url(#b2)" opacity=".85"/>
    <path d="M0 210 Q80 176 170 200 T340 194 T480 204 V216 H0Z" fill="url(#montM)" filter="url(#b05)"/>
    <rect y="200" width="480" height="160" fill="url(#pasto)"/><rect y="200" width="480" height="160" filter="url(#pastoF)" opacity=".5"/>
    <path d="M238 200 L242 200 L296 360 L184 360Z" fill="url(#asfalto)"/>
    <path d="M238 200 L184 360 H176Z" fill="#e9e3d0" opacity=".9"/><path d="M242 200 L296 360 H304Z" fill="#e9e3d0" opacity=".9"/>
    <path d="M238 200 L184 360" stroke="#fff" stroke-width="1" opacity=".5"/>
    ${franjas}
    ${[0.18, 0.4, 0.7].map((t) => poste(t, -1)).join('')}${[0.28, 0.55, 0.9].map((t) => poste(t, 1)).join('')}
    ${arbol(60, 250, 0.9)}${arbol(110, 232, 0.6)}${arbol(420, 246, 0.9)}${arbol(380, 228, 0.55)}${arbol(32, 316, 1.5)}${arbol(450, 330, 1.6)}
    ${senal}
    ${Array.from({ length: 34 }, () => `<path d="M${n1(r() * 480)} ${n1(300 + r() * 56)} q1 -4 2 -7" stroke="#6fae45" stroke-width="1" opacity=".7"/>`).join('')}
    <rect width="480" height="360" fill="#ffe2a8" opacity=".04"/>
    ${acabado(0.08, 1)}`,
  );
}

// ======================================================================= Cielo

export function cielo() {
  const r = azar(101);
  const defs =
    EFECTOS +
    vert('cielo', [0, '#1f6fd0'], [0.35, '#3f9ae6'], [0.7, '#8ccdf4'], [1, '#e8f6fc']) +
    radial('solG', 0.5, 0.5, 0.5, [0, '#ffffff', 0.9], [0.25, '#fff6c8', 0.5], [1, '#fff2b0', 0]) +
    vert('nubeA', [0, '#ffffff'], [1, '#dbe9f6']) +
    vert('nubeB', [0, '#f4f9fd'], [1, '#bfd3e8']) +
    horiz(
      'arco',
      [0, '#ff4d4d'],
      [0.2, '#ffa94d'],
      [0.4, '#ffe14d'],
      [0.6, '#5fd068'],
      [0.8, '#4d9aff'],
      [1, '#a05cf0'],
    ) +
    borroso('b05', 0.5) +
    borroso('b2', 2.4) +
    borroso('b5', 6) +
    nubes('cirro', 44, '.004 .05', 5.8, '#bcd2ea');

  const nube = (x: number, y: number, s: number, fondo: 'A' | 'B', op = 1) => {
    const t = (v: number) => n1(v * s);
    return `<g opacity="${op}"><ellipse cx="${n1(x + 6 * s)}" cy="${n1(y + 10 * s)}" rx="${t(60)}" ry="${t(8)}" fill="#7a9cc0" opacity=".25" filter="url(#b2)"/><g fill="url(#nube${fondo})"><circle cx="${n1(x - 30 * s)}" cy="${y}" r="${t(20)}"/><circle cx="${n1(x - 6 * s)}" cy="${n1(y - 14 * s)}" r="${t(26)}"/><circle cx="${n1(x + 22 * s)}" cy="${n1(y - 6 * s)}" r="${t(23)}"/><circle cx="${n1(x + 46 * s)}" cy="${n1(y + 3 * s)}" r="${t(17)}"/><rect x="${n1(x - 48 * s)}" y="${n1(y)}" width="${t(112)}" height="${t(18)}" rx="${t(9)}"/></g><ellipse cx="${n1(x - 8 * s)}" cy="${n1(y - 20 * s)}" rx="${t(14)}" ry="${t(7)}" fill="#fff" opacity=".7" filter="url(#b05)"/></g>`;
  };
  const pajaro = (x: number, y: number, s: number) =>
    `<path d="M${x} ${y} q${n1(4 * s)} ${n1(-5 * s)} ${n1(8 * s)} 0 q${n1(4 * s)} ${n1(-5 * s)} ${n1(8 * s)} 0" stroke="#2a3a52" stroke-width="${n1(1.3 * s)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
  const globo = (x: number, y: number, c1: string, c2: string, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -34 C-22 -34 -26 -8 -8 16 H8 C26 -8 22 -34 0 -34Z" fill="${c1}"/><path d="M0 -34 C-9 -34 -12 -8 -3 16 H3 C12 -8 9 -34 0 -34Z" fill="${c2}"/><path d="M-8 16 L-5 26 H5 L8 16Z" fill="#7a4a2a"/><rect x="-6" y="26" width="12" height="8" fill="#a9703c"/><path d="M-8 16 L-5 26 M8 16 L5 26" stroke="#4a2a14" stroke-width=".8"/><path d="M-12 -22 C-16 -10 -12 4 -8 12" stroke="#fff" stroke-width="1.6" fill="none" opacity=".4"/></g>`;
  const avion = `<g transform="translate(120 96) rotate(-8)" opacity=".92"><ellipse cx="0" cy="0" rx="22" ry="5" fill="#f4f6f8"/><path d="M-4 0 L10 -16 L14 -16 L8 0Z" fill="#c9d3dc"/><path d="M-4 0 L10 16 L14 16 L8 0Z" fill="#b3bfca"/><path d="M-20 0 L-26 -10 L-22 -10 L-14 -2Z" fill="#e8453c"/><ellipse cx="14" cy="-1" rx="6" ry="2.4" fill="#7fb6d8"/></g>
    <path d="M100 100 Q40 112 -10 120" stroke="#fff" stroke-width="3" fill="none" opacity=".6" filter="url(#b05)"/>`;

  return lienzo(
    defs,
    `
    <rect width="480" height="360" fill="url(#cielo)"/>
    <circle cx="400" cy="70" r="150" fill="url(#solG)"/><circle cx="400" cy="70" r="24" fill="#fffef2"/>
    <rect width="480" height="260" filter="url(#cirro)" opacity=".5"/>
    <g opacity=".85" filter="url(#b05)"><path d="M70 300 Q200 40 340 300" stroke="url(#arco)" stroke-width="16" fill="none" opacity=".55" filter="url(#b2)"/></g>
    ${nube(80, 70, 0.8, 'B', 0.7)}${nube(300, 120, 0.7, 'B', 0.7)}
    ${avion}
    ${pajaro(250, 60, 1.2)}${pajaro(270, 52, 1)}${pajaro(232, 50, 0.9)}
    ${globo(330, 150, '#e8453c', '#f4c430', 0.8)}${globo(60, 190, '#2f7fe0', '#fff', 0.55)}
    ${nube(380, 200, 1.1, 'A')}${nube(120, 236, 1.3, 'A')}
    ${nube(260, 290, 1.7, 'A')}${nube(30, 330, 1.5, 'A')}${nube(450, 320, 1.4, 'A')}
    <rect y="300" width="480" height="60" fill="#fff" opacity=".35" filter="url(#b5)"/>
    ${Array.from({ length: 10 }, () => `<circle cx="${n1(r() * 480)}" cy="${n1(r() * 300)}" r="${n1(0.6 + r())}" fill="#fff" opacity=".25"/>`).join('')}
    ${acabado(0.06, 0.8)}`,
  );
}
