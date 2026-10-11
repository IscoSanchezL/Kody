import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Personajes 3D de Kody, construidos con formas simples (esferas, conos, cajas redondeadas).
 * Sin archivos externos: pesan poco, mantienen un solo estilo y funcionan sin internet.
 * Cada modelo mide unas 96 unidades (igual que el actor 2D) y tiene 2 disfraces (variantes).
 */

export interface Modelo3D {
  grupo: THREE.Group;
  variantes: [THREE.Group, THREE.Group];
  /** Modelos de perfil (pez, abeja) miran a +X y se voltean al ir a la izquierda. */
  perfil: boolean;
  /** Piezas que se mueven solas (alas, llama). */
  animar?: (t: number) => void;
}

const TINTA = 0x1e1b4b;

function material(color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.04, ...extra });
}

type Pos = [number, number, number];

/** Esfera (o elipsoide con `escala`). */
function esfera(
  r: number,
  color: number,
  pos: Pos = [0, 0, 0],
  escala: Pos = [1, 1, 1],
  extra = {},
) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), material(color, extra));
  m.position.set(...pos);
  m.scale.set(...escala);
  return m;
}

function cono(
  r: number,
  h: number,
  color: number,
  pos: Pos,
  rot: Pos = [0, 0, 0],
  escala: Pos = [1, 1, 1],
) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 24), material(color));
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.scale.set(...escala);
  return m;
}

function cilindro(r: number, h: number, color: number, pos: Pos, rot: Pos = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), material(color));
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

function caja(w: number, h: number, d: number, color: number, pos: Pos, radio = 3, extra = {}) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, radio), material(color, extra));
  m.position.set(...pos);
  return m;
}

/** Arco (media dona): ∩ por defecto; con `sonrisa` queda ∪. */
function arco(r: number, grosor: number, color: number, pos: Pos, sonrisa = false, extra = {}) {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(r, grosor, 10, 24, Math.PI),
    material(color, extra),
  );
  m.position.set(...pos);
  if (sonrisa) m.rotation.z = Math.PI;
  return m;
}

/** Contorno de dibujo animado: la misma forma, más grande, vista "por dentro" y oscura. */
function contorno<T extends THREE.Mesh>(m: T, k = 1.07): T {
  const borde = new THREE.Mesh(
    m.geometry,
    new THREE.MeshBasicMaterial({ color: TINTA, side: THREE.BackSide }),
  );
  borde.scale.setScalar(k);
  m.add(borde);
  return m;
}

function nuevo(perfil = false) {
  const grupo = new THREE.Group();
  const v0 = new THREE.Group();
  const v1 = new THREE.Group();
  v1.visible = false;
  grupo.add(v0, v1);
  return { grupo, v0, v1, perfil };
}

const brillo = (x: number, y: number, z: number) => esfera(1.7, 0xffffff, [x, y, z]);

// ------------------------------------------------------------------- Kody

function kody(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const cabeza = contorno(esfera(34, 0xfb923c, [0, 0, 0], [1.12, 1, 0.95]));
  const orejaI = contorno(cono(12, 28, 0xfb923c, [-25, 35, 0], [0, 0, 0.38]));
  const orejaD = contorno(cono(12, 28, 0xfb923c, [25, 35, 0], [0, 0, -0.38]));
  const dentroI = cono(6, 16, 0xfde68a, [-25, 33, 5], [0, 0, 0.38]);
  const dentroD = cono(6, 16, 0xfde68a, [25, 33, 5], [0, 0, -0.38]);
  const hocico = esfera(18, 0xfff7ed, [0, -12, 22], [1.15, 0.8, 0.7]);
  const nariz = esfera(4.6, TINTA, [0, -5, 35.5], [1.2, 0.85, 0.8]);
  const mejillas = [-1, 1].map((l) =>
    esfera(5.5, 0xfb7185, [l * 24, -8, 26], [1, 0.8, 0.35], { transparent: true, opacity: 0.8 }),
  );
  const sonrisa = arco(6, 1.5, TINTA, [0, -9, 34.5], true);
  const mastil = cilindro(1.6, 12, 0x475569, [0, 42, 0]);
  grupo.add(cabeza, orejaI, orejaD, dentroI, dentroD, hocico, nariz, ...mejillas, sonrisa, mastil);

  // disfraz 0: ojos abiertos y antena celeste
  v0.add(
    esfera(5.4, TINTA, [-14, 6, 28.5]),
    esfera(5.4, TINTA, [14, 6, 28.5]),
    brillo(-12.4, 8.4, 32.5),
    brillo(15.6, 8.4, 32.5),
    esfera(5.8, 0x22d3ee, [0, 50, 0], [1, 1, 1], { emissive: 0x0891b2, emissiveIntensity: 0.9 }),
  );
  // disfraz 1: ojos felices y antena amarilla
  v1.add(
    arco(5, 1.7, TINTA, [-14, 4, 30]),
    arco(5, 1.7, TINTA, [14, 4, 30]),
    esfera(5.8, 0xfacc15, [0, 50, 0], [1, 1, 1], { emissive: 0xca8a04, emissiveIntensity: 0.9 }),
  );
  return { grupo, variantes: [v0, v1], perfil };
}

// ------------------------------------------------------------------- Robo

function robo(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const cuerpo = contorno(caja(64, 60, 52, 0x60a5fa, [0, -2, 0], 14), 1.05);
  const pantalla = caja(46, 32, 6, 0x0f172a, [0, 3, 26], 4);
  const oidos = [-1, 1].map((l) => cilindro(7, 12, 0x93c5fd, [l * 35, 0, 0], [0, 0, Math.PI / 2]));
  const mastil = cilindro(1.8, 14, 0x475569, [0, 36, 0]);
  const luces = [
    esfera(3.6, 0xfacc15, [-12, -22, 26], [1, 1, 0.5], {
      emissive: 0xca8a04,
      emissiveIntensity: 0.6,
    }),
    esfera(3.6, 0x4ade80, [0, -22, 26], [1, 1, 0.5], {
      emissive: 0x16a34a,
      emissiveIntensity: 0.6,
    }),
    esfera(3.6, 0xf87171, [12, -22, 26], [1, 1, 0.5], {
      emissive: 0xdc2626,
      emissiveIntensity: 0.6,
    }),
  ];
  const pies = [-1, 1].map((l) => caja(18, 9, 22, 0x1d4ed8, [l * 16, -36, 4], 3));
  const cyan = { emissive: 0x22d3ee, emissiveIntensity: 1.1 };
  const boca = arco(6, 1.3, 0x22d3ee, [0, -3, 29.5], true, cyan);
  grupo.add(cuerpo, pantalla, ...oidos, mastil, ...luces, ...pies, boca);
  v0.add(
    esfera(5.2, 0x22d3ee, [-11, 6, 29.5], [1, 1, 0.5], cyan),
    esfera(5.2, 0x22d3ee, [11, 6, 29.5], [1, 1, 0.5], cyan),
    esfera(6, 0xfacc15, [0, 43, 0], [1, 1, 1], { emissive: 0xca8a04, emissiveIntensity: 0.9 }),
  );
  v1.add(
    arco(5, 1.5, 0x22d3ee, [-11, 4, 29.5], false, cyan),
    arco(5, 1.5, 0x22d3ee, [11, 4, 29.5], false, cyan),
    esfera(6, 0xf472b6, [0, 43, 0], [1, 1, 1], { emissive: 0xbe185d, emissiveIntensity: 0.9 }),
  );
  return { grupo, variantes: [v0, v1], perfil };
}

// ------------------------------------------------------------------- Gato

function gato(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const pelo = 0xfdba74;
  const cabeza = contorno(esfera(33, pelo, [0, 0, 0], [1.15, 1, 0.95]));
  const orejaI = contorno(cono(12, 25, pelo, [-24, 31, 0], [0, 0, 0.28]));
  const orejaD = contorno(cono(12, 25, pelo, [24, 31, 0], [0, 0, -0.28]));
  const dentroI = cono(6.5, 15, 0xfda4af, [-24, 29, 5], [0, 0, 0.28]);
  const dentroD = cono(6.5, 15, 0xfda4af, [24, 29, 5], [0, 0, -0.28]);
  const hocico = esfera(15, 0xfff7ed, [0, -12, 23], [1.25, 0.8, 0.7]);
  const nariz = esfera(3.6, 0xfb7185, [0, -5.5, 33.5], [1.3, 0.8, 0.8]);
  const rayas = [
    caja(3.4, 11, 2, 0xc2410c, [0, 27, 29], 1),
    caja(3.4, 9, 2, 0xc2410c, [-9, 26, 28], 1),
    caja(3.4, 9, 2, 0xc2410c, [9, 26, 28], 1),
  ];
  rayas[1].rotation.z = 0.35;
  rayas[2].rotation.z = -0.35;
  const bigotes = [-1, 1].flatMap((l) => [
    cilindro(0.6, 26, TINTA, [l * 33, -9, 24], [0, 0, Math.PI / 2 + l * 0.12]),
    cilindro(0.6, 26, TINTA, [l * 33, -14, 24], [0, 0, Math.PI / 2 - l * 0.12]),
  ]);
  const boca = [
    arco(3.4, 0.9, TINTA, [-3.4, -10, 33], true),
    arco(3.4, 0.9, TINTA, [3.4, -10, 33], true),
  ];
  grupo.add(cabeza, orejaI, orejaD, dentroI, dentroD, hocico, nariz, ...rayas, ...bigotes, ...boca);
  v0.add(
    esfera(6.6, 0xbef264, [-14, 4, 28], [1, 1.1, 0.6]),
    esfera(6.6, 0xbef264, [14, 4, 28], [1, 1.1, 0.6]),
    esfera(2.3, TINTA, [-14, 4, 31.5], [1, 2.6, 0.6]),
    esfera(2.3, TINTA, [14, 4, 31.5], [1, 2.6, 0.6]),
    brillo(-12, 8, 32.5),
    brillo(16, 8, 32.5),
  );
  v1.add(
    arco(5.5, 1.6, TINTA, [-14, 2, 30]),
    arco(5.5, 1.6, TINTA, [14, 2, 30]),
    esfera(4.2, 0xfb7185, [0, -17, 31], [1.2, 0.8, 0.5]),
  );
  return { grupo, variantes: [v0, v1], perfil };
}

// ------------------------------------------------------------------- Dino

function dino(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const verde = 0x4ade80;
  const cabeza = contorno(esfera(34, verde, [0, 0, 0], [1.15, 1, 1]));
  const puas = [-24, -12, 0, 12, 24].map((x, i) => {
    const alto = 15 - Math.abs(x) * 0.18;
    return contorno(
      cono(6.2, alto, 0x16a34a, [x, 34 + (2 - Math.abs(i - 2)) * 2.2, -3], [0, 0, -x * 0.012]),
      1.12,
    );
  });
  const hocico = esfera(19, 0x86efac, [0, -10, 24], [1.2, 0.8, 0.8]);
  const fosas = [-1, 1].map((l) => esfera(2.1, 0x14532d, [l * 7, -3, 37]));
  const ojos = [-1, 1].flatMap((l) => [
    esfera(9.5, 0xffffff, [l * 17, 11, 24], [1, 1, 0.7]),
    esfera(4.8, TINTA, [l * 17, 11, 31]),
    brillo(l * 17 + 1.6, 13, 34.5),
  ]);
  const mejillas = [-1, 1].map((l) =>
    esfera(5.2, 0xfb7185, [l * 29, -10, 20], [1, 0.8, 0.4], { transparent: true, opacity: 0.7 }),
  );
  grupo.add(cabeza, ...puas, hocico, ...fosas, ...ojos, ...mejillas);
  v0.add(arco(11, 1.6, 0x14532d, [0, -8, 33.5], true));
  v1.add(
    esfera(11.5, 0x7f1d1d, [0, -16, 32], [1.25, 0.8, 0.5]),
    esfera(6, 0xfb7185, [0, -20, 34], [1.4, 0.6, 0.5]),
    caja(3.4, 4.6, 2, 0xffffff, [-7, -11, 36], 0.8),
    caja(3.4, 4.6, 2, 0xffffff, [7, -11, 36], 0.8),
  );
  return { grupo, variantes: [v0, v1], perfil };
}

// ----------------------------------------------------------------- Cohete

function cohete(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const perfilCuerpo = [
    [0, -42],
    [18, -42],
    [24, -26],
    [26, 0],
    [24, 18],
    [19, 30],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cuerpo = contorno(
    new THREE.Mesh(new THREE.LatheGeometry(perfilCuerpo, 32), material(0xf8fafc)),
    1.05,
  );
  const punta = contorno(cono(19.5, 34, 0xef4444, [0, 44, 0]), 1.07);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(10, 2.6, 12, 32), material(0x64748b));
  aro.position.set(0, 6, 24);
  const vidrio = esfera(9.6, 0x38bdf8, [0, 6, 23], [1, 1, 0.4], {
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
  });
  const brilloV = esfera(2.6, 0xffffff, [-3.5, 10, 26]);
  const aletas = [-1, 1].map((l) => {
    const a = contorno(caja(7, 32, 24, 0xef4444, [l * 28, -26, 0], 2.5), 1.07);
    a.rotation.z = -l * 0.42;
    return a;
  });
  const aletaFondo = contorno(caja(24, 32, 7, 0xef4444, [0, -28, -22], 2.5), 1.07);
  grupo.add(
    cuerpo,
    punta,
    aro,
    vidrio,
    brilloV,
    ...aletas,
    aletaFondo,
    cilindro(10, 8, 0x475569, [0, -44, 0]),
  );

  const llama = new THREE.Group();
  llama.position.set(0, -52, 0);
  const fuego = cono(14, 34, 0xfb923c, [0, -14, 0], [Math.PI, 0, 0]);
  const centro = cono(8, 24, 0xfde047, [0, -10, 0.5], [Math.PI, 0, 0]);
  llama.add(fuego, centro);
  v0.add(llama);
  v1.add(arco(5, 1.4, TINTA, [0, 3, 29.5], true));
  const llama1 = llama.clone();
  llama1.scale.set(1.2, 1.5, 1.2);
  v1.add(llama1);
  const animar = (t: number) => {
    const k = 1 + Math.sin(t * 18) * 0.1;
    llama.scale.set(1, k, 1);
    llama1.scale.set(1.2, 1.5 * k, 1.2);
  };
  return { grupo, variantes: [v0, v1], perfil, animar };
}

// -------------------------------------------------------------------- Pez

function pez(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const cuerpo = contorno(esfera(30, 0xfb923c, [4, 0, 0], [1.4, 1, 0.78]));
  const vientre = esfera(22, 0xfed7aa, [10, -13, 5], [1.25, 0.55, 0.6]);
  const dorsal = contorno(cono(10, 18, 0xfdba74, [4, 29, 0], [0, 0, 0], [1, 1, 0.4]), 1.1);
  const lateral = contorno(cono(7, 18, 0xfdba74, [10, -6, 17], [0.2, 0, -1.9], [1, 1, 0.4]), 1.1);
  const ojo = [
    esfera(7.4, 0xffffff, [28, 7, 17], [1, 1, 0.6]),
    esfera(3.8, TINTA, [31, 7, 21.5]),
    brillo(32.5, 9, 24),
  ];
  const mejilla = esfera(4.6, 0xfb7185, [22, -6, 19], [1, 0.8, 0.4], {
    transparent: true,
    opacity: 0.7,
  });
  const franjas = [-6, 10].map((x) => esfera(1, 0xffffff, [x, 0, 0], [3.2, 29, 20]));
  const cola = contorno(
    cono(19, 30, 0xfb923c, [-50, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.4]),
    1.06,
  );
  grupo.add(cuerpo, vientre, dorsal, lateral, ...ojo, mejilla, ...franjas, cola);
  v0.add(arco(5.5, 1.5, TINTA, [38, -8, 14], true));
  const burbujas = [
    esfera(3.4, 0xbae6fd, [48, 24, 6], [1, 1, 1], { transparent: true, opacity: 0.7 }),
    esfera(2.4, 0xbae6fd, [42, 38, 4], [1, 1, 1], { transparent: true, opacity: 0.7 }),
  ];
  v1.add(arco(7, 1.5, TINTA, [37, -8, 14], true), ...burbujas);
  const animar = (t: number) => {
    cola.rotation.y = Math.sin(t * 7) * 0.5;
  };
  return { grupo, variantes: [v0, v1], perfil, animar };
}

// ----------------------------------------------------------------- Abeja

function abeja(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const cuerpo = contorno(esfera(26, 0xfacc15, [-6, 0, 0], [1.4, 1, 1]));
  const rayas = [-24, -8, 8].map((x) => esfera(26.5, TINTA, [x, 0, 0], [0.16, 1.002, 1.002]));
  const cabeza = contorno(esfera(19, 0xfde047, [32, 3, 0]));
  const aguijon = cono(4.4, 14, TINTA, [-44, 0, 0], [0, 0, Math.PI / 2]);
  // Ojos y mejillas sobre la superficie de la cabeza (centro 32,3,0 · radio 19).
  const ojos = [-1, 1].flatMap((l) => [
    esfera(4.8, TINTA, [42.2, 8, l * 12]),
    brillo(44.6, 10.4, l * 12 + l * 1.4),
  ]);
  const mejillas = [-1, 1].map((l) =>
    esfera(4, 0xfb7185, [44, -3, l * 11], [0.5, 0.8, 0.8], { transparent: true, opacity: 0.75 }),
  );
  const antenas = [-1, 1].flatMap((l) => [
    cilindro(1, 18, TINTA, [38, 24, l * 6], [l * 0.25, 0, -0.5]),
    esfera(3, TINTA, [45, 32, l * 8]),
  ]);
  const alas = [-1, 1].map((l) => {
    const pivote = new THREE.Group();
    pivote.position.set(-4, 24, l * 8);
    const ala = esfera(15, 0xbae6fd, [0, 14, 0], [0.9, 1.5, 0.18], {
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
    });
    pivote.add(ala);
    pivote.userData.lado = l;
    return pivote;
  });
  grupo.add(cuerpo, ...rayas, cabeza, aguijon, ...ojos, ...mejillas, ...antenas, ...alas);
  const sonrisaAbeja = (y: number) => {
    const a = arco(5.2, 1.4, TINTA, [47.5, y, 6.5], true);
    a.rotation.y = 1.1;
    return a;
  };
  v0.add(sonrisaAbeja(-2));
  v1.add(sonrisaAbeja(-1), esfera(2.6, 0xfb7185, [47.5, -6, 6.5], [0.6, 1, 1]));
  const animar = (t: number) => {
    for (const a of alas) a.rotation.x = a.userData.lado * (0.45 + Math.sin(t * 38) * 0.45);
  };
  return { grupo, variantes: [v0, v1], perfil, animar };
}

// -------------------------------------------------------------- Estrella

function estrella(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const forma = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 48 : 22;
    const ang = Math.PI / 2 + (i * Math.PI) / 5;
    const x = r * Math.cos(ang);
    const y = r * Math.sin(ang);
    if (i === 0) forma.moveTo(x, y);
    else forma.lineTo(x, y);
  }
  forma.closePath();
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: 12,
    bevelEnabled: true,
    bevelThickness: 6,
    bevelSize: 5,
    bevelSegments: 4,
  });
  geo.center();
  const cuerpo = contorno(
    new THREE.Mesh(geo, material(0xfde047, { emissive: 0xca8a04, emissiveIntensity: 0.18 })),
    1.045,
  );
  cuerpo.position.y = -2;
  const sonrisa = arco(7, 1.7, TINTA, [0, -14, 15], true);
  const mejillas = [-1, 1].map((l) =>
    esfera(5, 0xfb7185, [l * 19, -9, 14], [1, 0.8, 0.35], { transparent: true, opacity: 0.8 }),
  );
  grupo.add(cuerpo, sonrisa, ...mejillas);
  v0.add(
    esfera(4.8, TINTA, [-11, 0, 15.5]),
    esfera(4.8, TINTA, [11, 0, 15.5]),
    brillo(-9.6, 2.3, 19),
    brillo(12.4, 2.3, 19),
  );
  v1.add(esfera(4.8, TINTA, [-11, 0, 15.5]), arco(5, 1.7, TINTA, [11, -2, 16]));
  return { grupo, variantes: [v0, v1], perfil };
}

const CONSTRUCTORES: Record<string, () => Modelo3D> = {
  kody,
  robo,
  gato,
  dino,
  cohete,
  pez,
  abeja,
  estrella,
};

/** Crea el modelo 3D de un personaje de la biblioteca (Kody si no existe). */
export function crearModelo3D(personaje: string): Modelo3D {
  return (CONSTRUCTORES[personaje] ?? kody)();
}
