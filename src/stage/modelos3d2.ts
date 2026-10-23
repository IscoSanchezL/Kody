import * as THREE from 'three';
import {
  BRILLANTE,
  PELO,
  TINTA,
  agrandar,
  ajustar,
  arco,
  brillo,
  caja,
  cilindro,
  cono,
  elip,
  esfera,
  espejo,
  nuevo,
  tubo,
  type Modelo3D,
  type Pos,
} from './piezas3d';

/**
 * Más personajes 3D de Kody: perro, conejo, rana, pingüino, tortuga, búho, panda, mariposa,
 * pulpo, pelota, manzana y coche. Todos con 2 disfraces (ojos abiertos / ojos felices).
 * Los que miran de frente (z+) se giran un poco al caminar; tortuga y coche son de perfil.
 */

/** Ojos de frente, abiertos y con brillo. */
const ojosAbiertos = (sep: number, y: number, z: number, r = 3.6) =>
  espejo((l) => [
    elip(r * 0.85, r, r * 0.55, 0x14110f, [l * sep, y, z], BRILLANTE),
    brillo(l * sep + r * 0.3, y + r * 0.35, z + r * 0.4, r * 0.34),
  ]);

/** Ojos felices: dos arcos ∩. */
const ojosFelices = (sep: number, y: number, z: number, r = 3.6) =>
  espejo((l) => arco(r, 1.1, 0x14110f, [l * sep, y - r * 0.3, z]));

/** Mejillas rosadas. */
const rubor = (sep: number, y: number, z: number, r = 4) =>
  espejo((l) =>
    elip(r, r * 0.65, 1.6, 0xfb7185, [l * sep, y, z], { transparent: true, opacity: 0.55 }),
  );

/** Pone una pieza achatada sobre la superficie de una esfera, mirando hacia afuera. */
function sobreEsfera(
  radio: number,
  normal: Pos,
  rx: number,
  ry: number,
  rz: number,
  color: number,
  centro: Pos = [0, 0, 0],
) {
  const n = new THREE.Vector3(...normal).normalize();
  const m = elip(rx, ry, rz, color, [
    centro[0] + n.x * radio,
    centro[1] + n.y * radio,
    centro[2] + n.z * radio,
  ]);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  return m;
}

// ------------------------------------------------------------------- Perro

function perro(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const PEL = 0xc98a4b;
  const OSC = 0x8a5428;
  const CREMA = 0xf3e0c0;
  const cuerpo = elip(21, 25, 17, PEL, [0, -16, 0], PELO);
  const pecho = elip(12.5, 17, 10, CREMA, [0, -14, 9], PELO);
  const patasD = espejo((l) => [
    tubo(
      [
        [l * 8, -24, 10],
        [l * 8, -38, 12],
      ],
      [5.6, 5],
      PEL,
      PELO,
    ),
    elip(6.4, 3.4, 7.4, CREMA, [l * 8, -45, 14], PELO),
  ]);
  const patasT = espejo((l) => [
    elip(9, 7, 11, PEL, [l * 15, -38, 0], PELO),
    elip(6.4, 3.2, 8.4, CREMA, [l * 15, -45, 5], PELO),
  ]);
  const cola = tubo(
    [
      [0, -34, -13],
      [0, -30, -24],
      [0, -18, -29],
    ],
    [3.8, 3.2, 2],
    OSC,
    PELO,
  );
  const craneo = elip(21, 19, 19, PEL, [0, 19, 0], PELO);
  const hocico = elip(11, 8, 9, CREMA, [0, 11, 14], PELO);
  const nariz = elip(3.8, 2.8, 2.8, TINTA, [0, 14.5, 22.5], BRILLANTE);
  const mancha = elip(8, 9.5, 3, OSC, [-9, 24, 14.5], PELO);
  const orejas = espejo((l) => elip(6.6, 14, 4.6, OSC, [l * 19, 17, 2], PELO, [0, 0, l * 0.25]));
  const lengua = elip(3.4, 5, 1.6, 0xf0657a, [0, 5.4, 21], { roughness: 0.4 });
  const cabeza = agrandar([craneo, hocico, nariz, mancha, ...orejas], [0, 14, 0], 1.08);
  grupo.add(cuerpo, pecho, ...patasD, ...patasT, cola, cabeza);
  v0.add(...ojosAbiertos(8, 24, 17.5, 3.6), lengua);
  v1.add(...ojosFelices(8, 24, 17.5, 3.6), lengua, ...rubor(15, 14, 15, 4));
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 96, 100);
}

// ------------------------------------------------------------------ Conejo

function conejo(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const BLANCO = 0xf4f1ee;
  const ROSA = 0xf9a8c0;
  const cuerpo = elip(19, 22, 16, BLANCO, [0, -18, 0], PELO);
  const patas = espejo((l) => [
    elip(6, 9, 6.4, BLANCO, [l * 9, -36, 10], PELO),
    elip(6.4, 3.4, 8.6, BLANCO, [l * 9, -44, 14], PELO),
    elip(9, 8, 12, BLANCO, [l * 16, -38, 0], PELO),
  ]);
  const cola = esfera(6.5, 0xffffff, [0, -26, -16], PELO);
  const cabeza = elip(17, 15.5, 15, BLANCO, [0, 14, 0], PELO);
  const orejas = espejo((l) => [
    elip(5.2, 20, 3.8, BLANCO, [l * 7.5, 40, 0], PELO, [0, 0, l * -0.14]),
    elip(2.9, 15, 2, ROSA, [l * 7.3, 40, 2.4], PELO, [0, 0, l * -0.14]),
  ]);
  const mejillas = espejo((l) => elip(7.4, 5.4, 5, 0xfdfcfb, [l * 5, 8, 11], PELO));
  const nariz = elip(2.6, 2, 2, ROSA, [0, 11, 15], BRILLANTE);
  const dientes = caja(4.4, 4.2, 1.4, 0xffffff, [0, 5, 15], 0.6);
  const boca = elip(0.5, 3, 0.5, 0xc08aa0, [0, 8, 15]);
  grupo.add(cuerpo, ...patas, cola, cabeza, ...orejas, ...mejillas, nariz, dientes, boca);
  v0.add(...ojosAbiertos(6.4, 17, 13.4, 3.2));
  v1.add(...ojosFelices(6.4, 17, 13.8, 3.2), ...rubor(11.5, 11, 12.4, 3.4));
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 98, 100);
}

// -------------------------------------------------------------------- Rana

function rana(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const VERDE = 0x4cae4c;
  const CLARO = 0xd8f0b0;
  const cuerpo = elip(25, 21, 21, VERDE, [0, -22, 0], { roughness: 0.4 });
  const vientre = elip(17, 15, 15, CLARO, [0, -24, 9], { roughness: 0.5 });
  const cabeza = elip(24, 13, 19, VERDE, [0, 2, 3], { roughness: 0.4 });
  const patasD = espejo((l) => [
    tubo(
      [
        [l * 16, -20, 12],
        [l * 18, -34, 17],
        [l * 16, -42, 22],
      ],
      [5, 4, 3.4],
      VERDE,
      { roughness: 0.45 },
    ),
    elip(8, 2.6, 7, VERDE, [l * 16, -45, 25], { roughness: 0.45 }),
  ]);
  const patasT = espejo((l) => [
    elip(10, 9, 15, VERDE, [l * 24, -36, -2], { roughness: 0.45 }),
    elip(9.4, 2.8, 12, VERDE, [l * 27, -45, 8], { roughness: 0.45 }),
  ]);
  const globos = espejo((l) => esfera(8.4, VERDE, [l * 13, 14, 6], { roughness: 0.4 }));
  const boca = arco(7, 1.3, 0x2b6a2b, [0, 1.5, 21.6], true);
  const manchas = [
    elip(4, 1.8, 3, 0x3b9440, [-10, -12, -12]),
    elip(5, 2, 3, 0x3b9440, [8, -14, -16]),
  ];
  const fosas = espejo((l) => elip(1, 0.8, 0.8, 0x2b6a2b, [l * 3, 6, 20]));
  grupo.add(cuerpo, vientre, cabeza, ...patasD, ...patasT, ...globos, boca, ...fosas, ...manchas);
  v0.add(
    ...espejo((l) => [
      esfera(5.8, 0xffffff, [l * 13.4, 15.4, 12.4], BRILLANTE),
      elip(3, 3.6, 1.8, 0x14110f, [l * 13.4, 15.4, 17.6], BRILLANTE),
      brillo(l * 13.4 + 1, 17, 19, 1),
    ]),
  );
  v1.add(...espejo((l) => arco(4.6, 1.3, 0x14110f, [l * 13.4, 14, 14.4])), ...rubor(20, -1, 17, 4));
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 90, 110);
}

// ---------------------------------------------------------------- Pingüino

function pinguino(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const NEGRO = 0x263447;
  const NARANJA = 0xf59e0b;
  const cuerpo = elip(21, 33, 18, NEGRO, [0, -8, 0], { roughness: 0.4 });
  const panza = elip(15, 27, 11, 0xfafafa, [0, -9, 8], { roughness: 0.6 });
  const cabeza = esfera(17, NEGRO, [0, 26, 0], { roughness: 0.4 });
  const cara = elip(12.5, 11, 6, 0xfafafa, [0, 24, 12], { roughness: 0.6 });
  const pico = cono(3.8, 9, NARANJA, [0, 21, 20], [Math.PI / 2 + 0.15, 0, 0], BRILLANTE);
  const aletas = espejo((l) =>
    elip(5, 19, 3.6, NEGRO, [l * 22, -6, 1], { roughness: 0.4 }, [0, 0, l * 0.28]),
  );
  const pies = espejo((l) => elip(8, 2.6, 10, NARANJA, [l * 9, -44, 8], BRILLANTE));
  const bufanda = [
    elip(17.5, 3.6, 17.5, 0xe8453c, [0, 10, 0], PELO),
    caja(5, 14, 3, 0xe8453c, [10, 2, 14], 1.4, PELO),
  ];
  grupo.add(cuerpo, panza, cabeza, cara, pico, ...aletas, ...pies, ...bufanda);
  v0.add(...ojosAbiertos(6.4, 27, 15.4, 3.2));
  v1.add(...ojosFelices(6.4, 27, 15.8, 3.2), ...rubor(10.5, 21, 16, 3.2));
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 98, 100);
}

// ----------------------------------------------------------------- Tortuga

function tortuga(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const VERDE = 0x8cc063;
  const CONCHA = 0x4a8a3a;
  const OSC = 0x2f6a2a;
  const caparazon = elip(33, 24, 27, CONCHA, [-2, -8, 0], { roughness: 0.5 });
  const placas = [
    elip(10, 3, 10, OSC, [-2, 15.4, 0], { roughness: 0.5 }),
    ...espejo((l) => [
      elip(9, 3, 8, OSC, [-2 + 15, 10, l * 8], { roughness: 0.5 }, [l * 0.5, 0, -0.4]),
      elip(9, 3, 8, OSC, [-2 - 15, 10, l * 8], { roughness: 0.5 }, [l * 0.5, 0, 0.4]),
      elip(8, 3, 7, OSC, [-2, 4, l * 18], { roughness: 0.5 }, [l * 1.0, 0, 0]),
    ]),
  ];
  const borde = elip(34, 6, 28, 0xd9c28a, [-2, -26, 0], { roughness: 0.6 });
  const cuello = tubo(
    [
      [26, -18, 0],
      [36, -12, 0],
      [42, -4, 0],
    ],
    [9, 7.4, 7.4],
    VERDE,
    { roughness: 0.6 },
  );
  const cabeza = elip(11.5, 10, 9.6, VERDE, [46, 0, 0], { roughness: 0.6 });
  const patas = [
    { x: 20, z: 17 },
    { x: 20, z: -17 },
    { x: -24, z: 16 },
    { x: -24, z: -16 },
  ].flatMap(({ x, z }) => [
    elip(8.4, 9.4, 7, VERDE, [x, -36, z], { roughness: 0.6 }),
    elip(9.4, 3, 8, VERDE, [x + 2, -44, z], { roughness: 0.6 }),
  ]);
  const cola = cono(4, 12, VERDE, [-38, -26, 0], [0, 0, Math.PI / 2 + 0.2], { roughness: 0.6 });
  const sonrisa = espejo((l) => arco(4.4, 0.9, 0x2b5a2b, [50, -1, l * 8.2], true));
  grupo.add(caparazon, ...placas, borde, cuello, cabeza, ...patas, cola);
  v0.add(
    ...espejo((l) => [
      elip(3, 3.6, 2.2, 0x14110f, [50, 4, l * 6.4], BRILLANTE),
      brillo(51, 5.4, l * 7.6, 1),
    ]),
    ...sonrisa,
  );
  v1.add(...espejo((l) => arco(3.2, 1, 0x14110f, [50, 3, l * 6.8])), ...sonrisa);
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 80, 120);
}

// -------------------------------------------------------------------- Búho

function buho(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const CAFE = 0x8a5a34;
  const OSC = 0x5e3a1e;
  const CREMA = 0xe8cfa0;
  const cuerpo = elip(25, 32, 21, CAFE, [0, -10, 0], PELO);
  const vientre = elip(17.5, 25, 13, CREMA, [0, -11, 11], PELO);
  const plumas = [-14, -4, 6, -9, 1, 11].map((y, i) =>
    arco(4.4, 0.8, 0xb98a56, [((i % 3) - 1) * 8, y - 8, 22.6], true),
  );
  const cabeza = elip(26, 19, 20, CAFE, [0, 22, 0], PELO);
  const copetes = espejo((l) => cono(5.4, 14, OSC, [l * 18, 38, 0], [0, 0, l * -0.4], PELO));
  const discos = espejo((l) => elip(11, 11, 4, CREMA, [l * 10, 24, 15], PELO));
  const pico = cono(3.6, 9, 0xf59e0b, [0, 17.5, 21.6], [Math.PI / 2 + 0.3, 0, 0], BRILLANTE);
  const alas = espejo((l) => elip(6, 23, 13, OSC, [l * 26, -10, 0], PELO, [0, 0, l * -0.12]));
  const pies = espejo((l) => [
    elip(7, 2.8, 7, 0xf59e0b, [l * 8, -44, 12], BRILLANTE),
    ...[-3, 0, 3].map((d) => elip(1.6, 1.6, 5, 0xf59e0b, [l * 8 + d, -44, 18], BRILLANTE)),
  ]);
  grupo.add(cuerpo, vientre, ...plumas, cabeza, ...copetes, ...discos, pico, ...alas, ...pies);
  v0.add(
    ...espejo((l) => [
      esfera(6.6, 0xffffff, [l * 10, 25, 18.6], BRILLANTE),
      elip(3.6, 4, 2, 0x14110f, [l * 10, 25, 24.2], BRILLANTE),
      brillo(l * 10 + 1.2, 26.6, 25.6, 1.1),
    ]),
  );
  v1.add(
    ...espejo((l) => arco(5.4, 1.4, 0x14110f, [l * 10, 23, 19.6])),
    ...rubor(18, 17, 17.2, 3.6),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 98, 100);
}

// ------------------------------------------------------------------- Panda

function panda(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const NEGRO = 0x20222a;
  const BLANCO = 0xf6f6f4;
  const cuerpo = elip(24, 25, 20, BLANCO, [0, -16, 0], PELO);
  const brazos = espejo((l) => elip(7.4, 16, 7.4, NEGRO, [l * 25, -12, 6], PELO, [0, 0, l * 0.4]));
  const piernas = espejo((l) => [
    elip(10, 10, 11, NEGRO, [l * 13, -38, 6], PELO),
    elip(8, 3.4, 8, NEGRO, [l * 13, -46, 11], PELO),
  ]);
  const cabeza = elip(22, 19, 18.4, BLANCO, [0, 18, 0], PELO);
  const orejas = espejo((l) => esfera(7.6, NEGRO, [l * 16.5, 33, 0], PELO));
  const ojeras = espejo((l) =>
    elip(5.6, 7.4, 2.4, NEGRO, [l * 8.6, 19, 15.6], PELO, [0, 0, l * -0.4]),
  );
  const hocico = elip(8.6, 6, 5, 0xeeeeea, [0, 12, 16], PELO);
  const nariz = elip(3.6, 2.6, 2.4, NEGRO, [0, 14.6, 20], BRILLANTE);
  const boca = arco(3.6, 0.8, NEGRO, [0, 11.5, 20.6], true);
  grupo.add(cuerpo, ...brazos, ...piernas, cabeza, ...orejas, ...ojeras, hocico, nariz, boca);
  v0.add(
    ...espejo((l) => [
      elip(2.6, 3.2, 1.6, 0xffffff, [l * 9, 20, 17.4], BRILLANTE),
      elip(1.5, 1.9, 1.2, 0x000000, [l * 9, 20, 18.4], BRILLANTE),
    ]),
  );
  v1.add(
    ...espejo((l) => arco(2.8, 0.9, 0xffffff, [l * 9, 18.6, 17.8])),
    ...rubor(14, 11, 16.2, 3.6),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 98, 100);
}

// -------------------------------------------------------------- Mariposa

function mariposa(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const A = 0xf97316;
  const B = 0xfacc15;
  const cuerpo = elip(4.4, 22, 4.4, 0x3b2a20, [0, -8, 0], PELO);
  const cabeza = esfera(6.4, 0x3b2a20, [0, 17, 0], PELO);
  const antenas = espejo((l) => [
    tubo(
      [
        [l * 2, 21, 0],
        [l * 6, 32, 0],
        [l * 11, 38, 0],
      ],
      [0.9, 0.8, 0.8],
      0x3b2a20,
    ),
    esfera(2, 0x3b2a20, [l * 11, 38.4, 0]),
  ]);
  const alasSup = espejo((l) => {
    const g = new THREE.Group();
    g.add(
      elip(24, 19, 1.8, A, [l * 21, 12, 0], { roughness: 0.4 }, [0, 0, l * 0.5]),
      elip(8, 6.6, 2.1, 0xffffff, [l * 28, 17, 0.4], { roughness: 0.4 }),
      elip(4.2, 3.6, 2.3, 0x3b2a20, [l * 17, 6, 0.6]),
    );
    g.userData.lado = l;
    return g;
  });
  const alasInf = espejo((l) => {
    const g = new THREE.Group();
    g.add(
      elip(15, 14, 1.8, B, [l * 14, -12, 0], { roughness: 0.4 }, [0, 0, l * -0.3]),
      elip(5.4, 5, 2.2, 0xef4444, [l * 15, -14, 0.4], { roughness: 0.4 }),
    );
    g.userData.lado = l;
    return g;
  });
  const alas = [...alasSup, ...alasInf] as THREE.Group[];
  grupo.add(cuerpo, cabeza, ...antenas, ...alas);
  v0.add(...ojosAbiertos(2.8, 18, 5.2, 1.8));
  v1.add(...ojosFelices(2.8, 18, 5.4, 1.8));
  const m = ajustar({ grupo, variantes: [v0, v1], perfil }, 96, 110);
  m.animar = (t) => {
    const k = Math.sin(t * 9) * 0.5;
    for (const a of alas) a.rotation.y = -(a.userData.lado as number) * k * 0.6;
  };
  return m;
}

// ------------------------------------------------------------------- Pulpo

function pulpo(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const COLOR = 0xc65bd6;
  const CLARO = 0xe6a0ee;
  const brillante = { roughness: 0.32, metalness: 0.04 };
  const cabeza = elip(26, 27, 23, COLOR, [0, 14, 0], brillante);
  const base = elip(24, 12, 21, COLOR, [0, -6, 0], brillante);
  const tentaculos = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const rizo = i % 2 ? 1 : -1;
    return tubo(
      [
        [c * 12, -8, s * 11],
        [c * 24, -26, s * 21],
        [c * 33 + rizo * s * 4, -40, s * 29 - rizo * c * 4],
        [c * 38 + rizo * s * 8, -45, s * 33 - rizo * c * 8],
      ],
      [7.4, 5.8, 3.8, 2.4],
      COLOR,
      brillante,
    );
  });
  const ventosas = [0, 2, 4, 6].map((i) => {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    return esfera(1.5, CLARO, [Math.cos(a) * 26, -27, Math.sin(a) * 22]);
  });
  const manchas = [
    elip(3.4, 2, 3, 0xa843b8, [-12, 34, 8]),
    elip(2.6, 1.6, 2.4, 0xa843b8, [10, 36, 10]),
    elip(2.2, 1.4, 2, 0xa843b8, [4, 38, -6]),
  ];
  grupo.add(cabeza, base, ...tentaculos, ...ventosas, ...manchas);
  v0.add(
    ...espejo((l) => [
      esfera(6.8, 0xffffff, [l * 10, 16, 19.4], BRILLANTE),
      elip(3.4, 3.8, 2, 0x14110f, [l * 10, 16, 25], BRILLANTE),
      brillo(l * 10 + 1.2, 17.6, 26, 1.1),
    ]),
    arco(6, 1.1, 0x6a1b78, [0, 1, 22], true),
  );
  v1.add(
    ...espejo((l) => arco(5.2, 1.4, 0x14110f, [l * 10, 14.6, 20.6])),
    arco(7, 1.2, 0x6a1b78, [0, 1.6, 22], true),
    ...rubor(18, 7, 19, 4.4),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 94, 100);
}

// ------------------------------------------------------------------ Pelota

function pelota(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const R = 40;
  const balon = esfera(R, 0xfafafa, [0, 0, 0], { roughness: 0.35, metalness: 0.02 });
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices: Pos[] = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      vertices.push([0, a, b * phi], [a, b * phi, 0], [b * phi, 0, a]);
    }
  const parches = vertices
    .filter((v) => v[2] / Math.hypot(...v) < 0.8)
    .map((v) => sobreEsfera(R - 0.4, v, 11, 11, 2.4, 0x1f2937));
  grupo.add(balon, ...parches);
  // La cara va en el hueco blanco que queda de frente (z+).
  v0.add(...ojosAbiertos(11, 8, R - 1.4, 4.4), arco(9, 1.4, 0xb91c1c, [0, -10, R - 1.2], true));
  v1.add(
    ...ojosFelices(11, 8, R - 1.2, 4.6),
    arco(10, 1.5, 0xb91c1c, [0, -9, R - 1.2], true),
    ...rubor(21, -4, R - 6, 5.4),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 88, 90);
}

// ----------------------------------------------------------------- Manzana

function manzana(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const ROJO = 0xdc2f2f;
  const brillante = { roughness: 0.28, metalness: 0.03 };
  const cuerpo = [
    elip(22, 29, 28, ROJO, [-12, -8, 0], brillante),
    elip(22, 29, 28, ROJO, [12, -8, 0], brillante),
    elip(26, 30, 29, ROJO, [0, -8, 0], brillante),
  ];
  const hoyo = elip(9, 4, 9, 0x8f1d1d, [0, 20.8, 0], brillante);
  const tallo = tubo(
    [
      [0, 20, 0],
      [1, 29, 0],
      [5, 36, 0],
    ],
    [2.4, 2, 1.8],
    0x6b4423,
  );
  const hoja = elip(12, 4.4, 6, 0x4cae4c, [14, 33, 0], { roughness: 0.4 }, [0, 0, 0.5]);
  const reflejo = elip(
    4.4,
    10,
    2,
    0xffffff,
    [-20, 6, 22],
    { transparent: true, opacity: 0.45 },
    [0, 0.5, 0.3],
  );
  grupo.add(...cuerpo, hoyo, tallo, hoja, reflejo);
  v0.add(...ojosAbiertos(10, 0, 27, 4), arco(7, 1.3, 0x7f1d1d, [0, -12, 27.4], true));
  v1.add(
    ...ojosFelices(10, 0, 27.6, 4.2),
    arco(8, 1.4, 0x7f1d1d, [0, -11, 27.6], true),
    ...rubor(19, -8, 24.4, 4.4),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 92, 94);
}

// ------------------------------------------------------------------- Coche

function coche(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const ROJO = 0xe8453c;
  const brillante = { roughness: 0.22, metalness: 0.25 };
  const carroceria = caja(86, 22, 42, ROJO, [0, -24, 0], 8, brillante);
  const cabina = caja(44, 22, 36, ROJO, [-8, -6, 0], 9, brillante);
  const vidrios = caja(38, 13, 37.6, 0xbfe3f5, [-8, -5, 0], 4, { roughness: 0.1, metalness: 0.3 });
  const marco = caja(1.6, 15, 36, ROJO, [-8, -5, 0], 0.6, brillante);
  const franja = caja(86.4, 3.4, 42.4, 0xffffff, [0, -22, 0], 1.4, brillante);
  const ruedas = [
    { x: 26, z: 21 },
    { x: 26, z: -21 },
    { x: -26, z: 21 },
    { x: -26, z: -21 },
  ].flatMap(({ x, z }) => [
    cilindro(11, 8, 0x1f2937, [x, -37, z], [Math.PI / 2, 0, 0], { roughness: 0.8 }),
    cilindro(5.4, 8.6, 0xd1d5db, [x, -37, z], [Math.PI / 2, 0, 0], {
      roughness: 0.3,
      metalness: 0.5,
    }),
  ]);
  const faros = espejo((l) => [
    esfera(4.4, 0xfef08a, [43, -24, l * 13], { emissive: 0xfacc15, emissiveIntensity: 0.85 }),
    esfera(2.6, 0xef4444, [-43, -22, l * 14], { emissive: 0xdc2626, emissiveIntensity: 0.6 }),
  ]);
  const parachoques = caja(4, 5, 40, 0xcbd5e1, [43.6, -33, 0], 1.6, {
    roughness: 0.3,
    metalness: 0.5,
  });
  const antena = [
    cilindro(0.7, 12, 0x475569, [-24, 10, -12]),
    esfera(1.8, 0xfacc15, [-24, 16.5, -12]),
  ];
  grupo.add(
    carroceria,
    cabina,
    vidrios,
    marco,
    franja,
    ...ruedas,
    ...faros,
    parachoques,
    ...antena,
  );
  // Ojos sobre el parabrisas: abiertos / guiño feliz.
  v0.add(
    ...espejo((l) => [
      esfera(4.4, 0xffffff, [4, -4, l * 19.6], BRILLANTE),
      elip(2.6, 3, 1.8, 0x14110f, [6.6, -4, l * 23.4], BRILLANTE),
    ]),
    arco(5, 1.1, 0x7f1d1d, [43.4, -25, 0], true),
  );
  v1.add(
    ...espejo((l) => arco(4, 1.3, 0x14110f, [5, -3, l * 19.6])),
    arco(6, 1.2, 0x7f1d1d, [43.4, -25, 0], true),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 70, 130);
}

export const CONSTRUCTORES_EXTRA: Record<string, () => Modelo3D> = {
  perro,
  conejo,
  rana,
  pinguino,
  tortuga,
  buho,
  panda,
  mariposa,
  pulpo,
  pelota,
  manzana,
  coche,
};
