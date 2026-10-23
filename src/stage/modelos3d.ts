import * as THREE from 'three';
import {
  TINTA,
  ALTO,
  material,
  PELO,
  BRILLANTE,
  elip,
  esfera,
  cono,
  cilindro,
  caja,
  arco,
  tubo,
  nuevo,
  ajustar,
  agrandar,
  brillo,
  ojoLateral,
  espejo,
  V,
  type Modelo3D,
  type Pos,
} from './piezas3d';
import { CONSTRUCTORES_EXTRA } from './modelos3d2';

export type { Modelo3D };

/**
 * Personajes 3D de Kody (Kody, Zorro, Gato, Dino, Cohete, Pez, Abeja y Estrella).
 * Cada uno se arma con las piezas de `piezas3d.ts`.
 */

// ----------------------------------------------------------------- Zorro
// Zorro de cuatro patas: cuerpo esbelto, cola larga con punta crema y una antenita en la cabeza.

function zorro(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const NAR = 0xec8a2e;
  const OSC = 0x4a2b17;
  const CREMA = 0xfff1dd;

  const torso = elip(31, 15.5, 14, NAR, [-8, -4, 0], PELO);
  const pecho = elip(15, 14.5, 12, CREMA, [14, -6, 0], PELO);
  const vientre = elip(24, 8, 11, CREMA, [-6, -13, 0], PELO);
  const cuello = tubo(
    [
      [18, 2, 0],
      [27, 14, 0],
      [34, 22, 0],
    ],
    [11.5, 9.5, 9.5],
    NAR,
    PELO,
  );
  const craneo = elip(13, 12, 11.5, NAR, [39, 26, 0], PELO);
  const hocico = tubo(
    [
      [44, 24, 0],
      [57, 21.5, 0],
    ],
    [8, 4],
    NAR,
    PELO,
  );
  const mandibula = tubo(
    [
      [43, 20, 0],
      [55, 19, 0],
    ],
    [6.6, 3.4],
    CREMA,
    PELO,
  );
  const nariz = elip(3.4, 2.7, 3.2, TINTA, [62.5, 22.4, 0], BRILLANTE);
  const mejillas = espejo((l) => elip(9, 6.5, 3.2, CREMA, [43.5, 20, l * 8.4], PELO));
  const orejas = espejo((l) => [
    cono(6.2, 19, NAR, [33, 41, l * 7], [l * 0.28, 0, 0.32], PELO),
    cono(3.4, 13, 0xf5b8b0, [33.8, 40, l * 7.8], [l * 0.28, 0, 0.32], PELO),
  ]);

  // Patas: las traseras más gruesas y dobladas; "calcetines" oscuros.
  const patas = [
    { x: 18, z: 7, trasera: false },
    { x: 18, z: -7, trasera: false },
    { x: -24, z: 8, trasera: true },
    { x: -24, z: -8, trasera: true },
  ].flatMap(({ x, z, trasera }) => {
    const superior: Pos[] = trasera
      ? [
          [x, -6, z],
          [x - 5, -24, z],
          [x - 2, -41, z],
        ]
      : [
          [x, -8, z],
          [x + 1, -26, z],
          [x + 1, -41, z],
        ];
    return [
      tubo(superior, trasera ? [8, 4.4, 3.2] : [5.8, 3.6, 3], NAR, PELO),
      tubo(
        [
          [superior[2][0], -32, z],
          [superior[2][0], -42.5, z],
        ],
        [3.6, 3.7],
        OSC,
        PELO,
      ),
      elip(5.2, 2.8, 3.8, OSC, [superior[2][0] + 2.4, -45, z], PELO),
    ];
  });

  const cola = tubo(
    [
      [-34, -2, 0],
      [-52, -6, 0],
      [-68, -1, 0],
      [-80, 10, 0],
    ],
    [5, 9.5, 12, 7],
    NAR,
    PELO,
  );
  const puntaCola = elip(9, 8.5, 8, CREMA, [-82, 11.5, 0], PELO);

  const antena = [
    cilindro(1.1, 10, 0x475569, [31, 47, 0]),
    esfera(3.6, 0x22d3ee, [31, 54, 0], { emissive: 0x0891b2, emissiveIntensity: 0.9 }),
  ];
  const mastilesAmarillo = esfera(3.6, 0xfacc15, [31, 54, 0], {
    emissive: 0xca8a04,
    emissiveIntensity: 0.9,
  });

  const cabezaK = 1.16;
  const centroK: Pos = [30, 20, 0];
  grupo.add(
    torso,
    vientre,
    pecho,
    cuello,
    ...patas,
    cola,
    puntaCola,
    agrandar(
      [craneo, hocico, mandibula, nariz, ...mejillas, ...orejas, antena[0]],
      centroK,
      cabezaK,
    ),
  );
  v0.add(
    agrandar([...espejo((l) => ojoLateral(46, 29.5, l * 9.6, 3.4)), antena[1]], centroK, cabezaK),
  );
  v1.add(
    agrandar(
      [...espejo((l) => arco(3.6, 1.1, TINTA, [46, 29.5, l * 9.6])), mastilesAmarillo],
      centroK,
      cabezaK,
    ),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil });
}

// ------------------------------------------------------------------- Kody
// Kody, el robot guía: humanoide esbelto, simétrico (se ven sus dos lados) con cabeza, cuello,
// torso, brazos articulados y piernas.

function kody(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const AZUL = 0x5b9cf0;
  const CLARO = 0xb6d4fb;
  const GRIS = 0x64748b;
  const cian = { emissive: 0x22d3ee, emissiveIntensity: 1.1 };

  const torso = caja(30, 34, 20, AZUL, [0, 4, 0], 8, { metalness: 0.25, roughness: 0.4 });
  const panel = caja(18, 11, 2, 0x0f172a, [0, 8, 10.4], 2);
  const luces = [0xfacc15, 0x4ade80, 0xf87171].map((c, i) =>
    esfera(2, c, [-6 + i * 6, 8, 11.6], { emissive: c, emissiveIntensity: 0.6 }),
  );
  const cintura = caja(24, 8, 17, GRIS, [0, -15, 0], 3, { metalness: 0.3 });
  const cuello = cilindro(4.2, 6, GRIS, [0, 24, 0]);
  const cabeza = caja(32, 25, 24, AZUL, [0, 36, 0], 9, { metalness: 0.25, roughness: 0.4 });
  const pantalla = caja(25, 16, 2, 0x0f172a, [0, 36, 12.1], 4);
  const oidos = espejo((l) => cilindro(4.6, 5, CLARO, [l * 17.4, 36, 0], [0, 0, Math.PI / 2]));
  const antena = [
    cilindro(1.1, 9, GRIS, [0, 53, 0]),
    esfera(3.6, 0xfacc15, [0, 59, 0], { emissive: 0xca8a04, emissiveIntensity: 0.9 }),
  ];
  const antena1 = esfera(3.6, 0xf472b6, [0, 59, 0], { emissive: 0xbe185d, emissiveIntensity: 0.9 });

  // Brazos: hombro, brazo, codo, antebrazo y mano (ligeramente separados del cuerpo).
  const brazos = espejo((l) => [
    esfera(5.4, CLARO, [l * 19, 17, 0], { metalness: 0.25 }),
    tubo(
      [
        [l * 19, 16, 0],
        [l * 25, 5, 1],
      ],
      [3.8, 3.4],
      AZUL,
      { metalness: 0.25, roughness: 0.4 },
    ),
    esfera(3.8, GRIS, [l * 25, 5, 1]),
    tubo(
      [
        [l * 25, 5, 1],
        [l * 26.5, -7, 4],
      ],
      [3.4, 3],
      CLARO,
      { metalness: 0.25 },
    ),
    esfera(4.2, 0xe2e8f0, [l * 26.8, -10, 4.5], { metalness: 0.25 }),
  ]);
  // Piernas: muslo, rodilla, pantorrilla y pie.
  const piernas = espejo((l) => [
    cilindro(4.4, 14, CLARO, [l * 8.5, -26, 0], [0, 0, 0], { metalness: 0.25 }),
    esfera(4.8, GRIS, [l * 8.5, -33, 0]),
    cilindro(3.9, 10, AZUL, [l * 8.5, -38, 0], [0, 0, 0], { metalness: 0.25 }),
    caja(11, 6, 18, 0x1d4ed8, [l * 8.5, -44.5, 3], 2.6, { metalness: 0.2 }),
  ]);
  const boca = (t: number) => arco(5, 1.2, 0x22d3ee, [0, 33.5 + t, 13.2], true, cian);

  const cabezaK = 1.14;
  const centroK: Pos = [0, 26, 0];
  grupo.add(
    torso,
    panel,
    ...luces,
    cintura,
    cuello,
    ...brazos.flat(),
    ...piernas.flat(),
    agrandar([cabeza, pantalla, ...oidos, antena[0]], centroK, cabezaK),
  );
  v0.add(
    agrandar(
      [
        elip(4.2, 4.2, 1.6, 0x22d3ee, [-6.5, 39, 13.3], cian),
        elip(4.2, 4.2, 1.6, 0x22d3ee, [6.5, 39, 13.3], cian),
        boca(0),
        antena[1],
      ],
      centroK,
      cabezaK,
    ),
  );
  v1.add(
    agrandar(
      [
        arco(4.2, 1.2, 0x22d3ee, [-6.5, 37.5, 13.3], false, cian),
        arco(4.2, 1.2, 0x22d3ee, [6.5, 37.5, 13.3], false, cian),
        boca(0),
        antena1,
      ],
      centroK,
      cabezaK,
    ),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil });
}

// ------------------------------------------------------------------- Gato
// Gato atigrado de perfil: cuerpo ágil, cola larga en curva y bigotes.

function gato(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const PELO_C = 0xf0a050;
  const RAYA = 0xb4530f;
  const CREMA = 0xfff1e0;

  const torso = elip(29, 14.5, 12.5, PELO_C, [-6, -4, 0], PELO);
  const vientre = elip(23, 7, 10.5, CREMA, [-4, -12, 0], PELO);
  const pecho = elip(12, 12.5, 10.5, CREMA, [13, -6, 0], PELO);
  // Rayas del lomo (aros finos que envuelven el cuerpo).
  const rayas = [-24, -14, -4, 6].map((x) => {
    const r = elip(2.1, 14.8 * (1 - Math.abs(x + 6) / 70), 12.6, RAYA, [x, -3.2, 0], PELO);
    return r;
  });
  const cuello = tubo(
    [
      [17, 2, 0],
      [25, 13, 0],
      [31, 20, 0],
    ],
    [10, 8.6, 8.6],
    PELO_C,
    PELO,
  );
  const cabeza = elip(12.5, 11.5, 11, PELO_C, [36, 24, 0], PELO);
  const hocico = elip(6.6, 5, 7, CREMA, [45.5, 20.5, 0], PELO);
  const nariz = elip(2.2, 1.7, 2.6, 0xf9a8b8, [51, 22, 0], BRILLANTE);
  const orejas = espejo((l) => [
    cono(5.6, 14, PELO_C, [32, 37, l * 6.4], [l * 0.1, 0, 0.18], PELO),
    cono(3.2, 9, 0xf9a8b8, [32.8, 36.4, l * 7], [l * 0.1, 0, 0.18], PELO),
  ]);
  const frente = [-3.4, 0, 3.4].map((z) =>
    elip(0.9, 3.4 - Math.abs(z) * 0.18, 0.9, RAYA, [38, 34.2, z * 1.1], PELO, [z * 0.06, 0, 0]),
  );
  const bigotes = espejo((l) =>
    [-1, 0, 1].map((i) =>
      cilindro(
        0.34,
        15,
        0xf8fafc,
        [47.5, 18.8 + i * 1.6, l * 10.5],
        [i * 0.12, l * 0.2, Math.PI / 2 + i * 0.05],
      ),
    ),
  ).flat();

  const patas = [
    { x: 16, z: 6.5, trasera: false },
    { x: 16, z: -6.5, trasera: false },
    { x: -22, z: 7, trasera: true },
    { x: -22, z: -7, trasera: true },
  ].flatMap(({ x, z, trasera }) => {
    const pts: Pos[] = trasera
      ? [
          [x, -6, z],
          [x - 4, -24, z],
          [x - 1, -41, z],
        ]
      : [
          [x, -8, z],
          [x + 1, -26, z],
          [x + 1, -41, z],
        ];
    return [
      tubo(pts, trasera ? [6.6, 3.6, 2.8] : [5, 3.2, 2.7], PELO_C, PELO),
      tubo(
        [
          [pts[2][0], -33, z],
          [pts[2][0], -42.5, z],
        ],
        [3.2, 3.3],
        CREMA,
        PELO,
      ),
      elip(4.6, 2.6, 3.4, CREMA, [pts[2][0] + 1.8, -45, z], PELO),
    ];
  });

  const cola = tubo(
    [
      [-32, -2, 0],
      [-50, -8, 0],
      [-62, 4, 0],
      [-58, 24, 0],
      [-48, 36, 0],
    ],
    [4.6, 4.2, 3.8, 3.6, 3.2],
    PELO_C,
    PELO,
    30,
  );
  const anillosCola = [0.45, 0.6, 0.75, 0.88].map((t) => {
    const p = new THREE.CatmullRomCurve3(
      [
        [-32, -2, 0],
        [-50, -8, 0],
        [-62, 4, 0],
        [-58, 24, 0],
        [-48, 36, 0],
      ].map((q) => V(q as Pos)),
    ).getPointAt(t);
    return esfera(3.9, RAYA, [p.x, p.y, p.z], PELO);
  });
  const puntaCola = esfera(3.4, RAYA, [-48, 36.4, 0], PELO);

  const cabezaK = 1.18;
  const centroK: Pos = [28, 17, 0];
  grupo.add(
    torso,
    vientre,
    pecho,
    ...rayas,
    cuello,
    ...patas.flat(),
    cola,
    ...anillosCola,
    puntaCola,
    agrandar([cabeza, hocico, nariz, ...orejas, ...frente, ...bigotes], centroK, cabezaK),
  );
  const ojoVerde = (l: 1 | -1) => [
    elip(3.6, 4.2, 2.2, 0xbef264, [43.4, 27, l * 9], BRILLANTE),
    elip(1, 3.6, 1, TINTA, [44.7, 27, l * 10.3]),
    brillo(45.6, 29, l * 10.6, 0.9),
  ];
  v0.add(agrandar(espejo(ojoVerde), centroK, cabezaK));
  v1.add(
    agrandar(
      [
        ...espejo((l) => arco(3.6, 1.1, TINTA, [43.8, 26.6, l * 9.6])),
        elip(2, 1.2, 2.4, 0xf9a8b8, [49.6, 18.2, 0]),
      ],
      centroK,
      cabezaK,
    ),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil });
}

// ------------------------------------------------------------------- Dino
// Dinosaurio amigable que camina en dos patas: cola larga, brazos cortos y púas en el lomo.

function dino(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const VERDE = 0x56c26a;
  const CLARO = 0xc3f0cc;
  const PUA = 0x2f8f47;

  const torso = elip(17, 21, 14, VERDE, [0, 4, 0], PELO, [0, 0, -0.45]);
  const vientre = elip(11, 17, 10.5, CLARO, [5, 1, 0], PELO, [0, 0, -0.45]);
  const cuello = tubo(
    [
      [8, 14, 0],
      [15, 27, 0],
    ],
    [10.5, 9],
    VERDE,
    PELO,
  );
  const craneo = elip(15.5, 12, 11, VERDE, [25, 36, 0], PELO);
  const hocico = tubo(
    [
      [31, 35, 0],
      [44, 33, 0],
    ],
    [8.6, 6.2],
    VERDE,
    PELO,
  );
  const mandibula = tubo(
    [
      [29, 30, 0],
      [43, 29.5, 0],
    ],
    [6.4, 4.6],
    CLARO,
    PELO,
  );
  const fosas = espejo((l) => esfera(1.2, 0x14532d, [48.8, 36.6, l * 2.6]));
  const cola = tubo(
    [
      [-8, -2, 0],
      [-28, -6, 0],
      [-48, -10, 0],
      [-68, -4, 0],
    ],
    [12, 9, 5, 1.6],
    VERDE,
    PELO,
  );
  const puas = [
    [10, 25.5, 0.8],
    [2, 23, 0.9],
    [-6, 19, 1],
    [-14, 12, 1],
    [-24, 4, 0.9],
    [-34, -1, 0.8],
    [-46, -4, 0.65],
    [-58, -4, 0.5],
  ].map(([x, y, s]) => cono(4.4 * s, 12 * s + 3, PUA, [x, y + 5 * s, 0], [0, 0, 0.18], PELO));
  const piernas = espejo((l) => [
    elip(10.5, 14.5, 8.2, VERDE, [-5, -14, l * 8.4], PELO, [0, 0, 0.25]),
    tubo(
      [
        [-3, -22, l * 8.4],
        [-1, -35, l * 8.4],
        [3, -43, l * 8.4],
      ],
      [6.2, 4.2, 3.6],
      VERDE,
      PELO,
    ),
    elip(9, 3, 4.6, VERDE, [10, -45, l * 8.4], PELO),
    ...[-1.6, 1.6].map((dz) =>
      cono(1.5, 5, 0xfef3c7, [17, -45, l * 8.4 + dz], [0, 0, -Math.PI / 2]),
    ),
  ]);
  const brazos = espejo((l) => [
    tubo(
      [
        [13, 9, l * 9.6],
        [19, 3, l * 10.6],
        [23, -1, l * 10.8],
      ],
      [3.2, 2.5, 2.2],
      VERDE,
      PELO,
    ),
    esfera(2.6, CLARO, [24, -2, l * 10.8], PELO),
  ]);
  const ojos = espejo((l) => [
    elip(5.2, 5.8, 3.2, 0xffffff, [31, 40.5, l * 8.4], BRILLANTE),
    elip(2.8, 3.6, 1.8, 0x14110f, [33.2, 40.4, l * 10.8], BRILLANTE),
    brillo(34, 42.2, l * 11.7, 0.95),
  ]);
  const sonrisa = (abierta: boolean) =>
    espejo((l) =>
      abierta
        ? [
            elip(8, 2.6, 1.2, 0x7f1d1d, [38.5, 30.6, l * 5.4], {}, [0, l * 0.25, 0]),
            elip(3.6, 1.1, 1, 0xfb7185, [36, 29.8, l * 6.2]),
          ]
        : [
            tubo(
              [
                [45, 31.6, l * 4.4],
                [38, 30, l * 6.4],
                [32, 31.4, l * 8],
              ],
              [0.7, 0.7, 0.7],
              0x14532d,
            ),
          ],
    );

  const cabezaK = 1.14;
  const centroK: Pos = [16, 28, 0];
  grupo.add(
    torso,
    vientre,
    cuello,
    cola,
    ...puas,
    ...piernas.flat(),
    ...brazos.flat(),
    agrandar([craneo, hocico, mandibula, ...fosas, ...ojos.flat()], centroK, cabezaK),
  );
  v0.add(agrandar(sonrisa(false).flat(), centroK, cabezaK));
  v1.add(agrandar(sonrisa(true).flat(), centroK, cabezaK));
  return ajustar({ grupo, variantes: [v0, v1], perfil });
}

// ----------------------------------------------------------------- Cohete

function cohete(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const BLANCO = 0xf1f5f9;
  const ROJO = 0xe5484d;

  // Fuselaje de una sola pieza (perfil de revolución) y nariz roja.
  const cuerpoPerfil = [
    [0, -38],
    [9, -38],
    [15, -34],
    [18, -22],
    [18.8, -4],
    [18.4, 14],
    [16.8, 26],
    [14, 33],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cuerpo = new THREE.Mesh(
    new THREE.LatheGeometry(cuerpoPerfil, 40),
    material(BLANCO, { roughness: 0.3, metalness: 0.2 }),
  );
  const narizPerfil = [
    [14.2, 32.6],
    [12.4, 38],
    [9, 44],
    [5, 49],
    [0, 53],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const nariz = new THREE.Mesh(
    new THREE.LatheGeometry(narizPerfil, 40),
    material(ROJO, { roughness: 0.35, metalness: 0.15 }),
  );
  const banda = new THREE.Mesh(
    new THREE.TorusGeometry(18.7, 1.4, 12, 48),
    material(ROJO, { roughness: 0.35 }),
  );
  banda.rotation.x = Math.PI / 2;
  banda.position.y = -14;
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(8.6, 2.2, 14, 40),
    material(0x94a3b8, { metalness: 0.6, roughness: 0.3 }),
  );
  aro.position.set(0, 8, 17.6);
  const vidrio = elip(8, 8, 2.6, 0x38bdf8, [0, 8, 17.2], {
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.15,
  });
  const reflejo = esfera(2.2, 0xffffff, [-3, 11.5, 19.6]);

  // Tres aletas a 120° (extruidas de un perfil inclinado).
  const forma = new THREE.Shape();
  forma.moveTo(0, 8);
  forma.lineTo(15, -14);
  forma.lineTo(15, -36);
  forma.lineTo(0, -26);
  forma.closePath();
  const geoAleta = new THREE.ExtrudeGeometry(forma, {
    depth: 2.6,
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.8,
    bevelSegments: 2,
  });
  geoAleta.translate(0, 0, -1.3);
  const aletas = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => {
    const base = new THREE.Group();
    const m = new THREE.Mesh(geoAleta, material(ROJO, { roughness: 0.4 }));
    m.position.x = 16.4;
    base.add(m);
    base.rotation.y = a + Math.PI / 2;
    return base;
  });
  const boquilla = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [6, -38],
        [7.4, -42],
        [10, -47],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      32,
    ),
    material(0x475569, { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }),
  );

  const llama = new THREE.Group();
  llama.position.set(0, -47, 0);
  llama.add(
    cono(9.5, 30, 0xfb923c, [0, -14, 0], [Math.PI, 0, 0], {
      emissive: 0xea580c,
      emissiveIntensity: 0.5,
    }),
    cono(5.4, 20, 0xfde047, [0, -10, 0.2], [Math.PI, 0, 0], {
      emissive: 0xfacc15,
      emissiveIntensity: 0.7,
    }),
  );
  const llama1 = llama.clone();
  llama1.scale.set(1.15, 1.45, 1.15);

  grupo.add(cuerpo, nariz, banda, aro, vidrio, reflejo, ...aletas, boquilla);
  v0.add(llama);
  v1.add(arco(4.6, 1.2, TINTA, [0, -4, 18.4], true), llama1);
  const animar = (t: number) => {
    const k = 1 + Math.sin(t * 18) * 0.1;
    llama.scale.set(1, k, 1);
    llama1.scale.set(1.15, 1.45 * k, 1.15);
  };
  return ajustar({ grupo, variantes: [v0, v1], perfil, animar });
}

// -------------------------------------------------------------------- Pez
// Pez payaso de perfil: cuerpo hidrodinámico con franjas, aletas y cola bifurcada.

function pez(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const NAR = 0xf57c28;
  const BLANCO = 0xfafafa;

  // Perfil (radio por posición a lo largo del cuerpo, de la cola x=-34 a la boca x=36).
  const perfilPuntos: [number, number][] = [
    [-34, 3],
    [-26, 7],
    [-14, 13],
    [0, 17.5],
    [12, 18.5],
    [24, 15],
    [32, 9],
    [36, 3.5],
  ];
  const radioEn = (x: number) => {
    for (let i = 0; i < perfilPuntos.length - 1; i++) {
      const [x0, r0] = perfilPuntos[i];
      const [x1, r1] = perfilPuntos[i + 1];
      if (x >= x0 && x <= x1) return r0 + ((r1 - r0) * (x - x0)) / (x1 - x0);
    }
    return 3;
  };
  const cuerpo = new THREE.Mesh(
    new THREE.LatheGeometry(
      perfilPuntos.map(([x, r]) => new THREE.Vector2(r, x)),
      36,
    ),
    material(NAR, { roughness: 0.35, metalness: 0.05 }),
  );
  cuerpo.rotation.z = -Math.PI / 2;
  cuerpo.scale.set(1, 1, 0.66);
  const vientre = elip(24, 8, 9, 0xffd9b0, [4, -11, 0], { roughness: 0.4 });

  // Franjas blancas con borde oscuro, un poco más grandes que el cuerpo en ese punto.
  const franja = (x: number) => {
    const r = radioEn(x);
    return [
      elip(1.7, r + 0.35, r * 0.66 + 0.35, BLANCO, [x, 0, 0], { roughness: 0.4 }),
      elip(0.5, r + 0.4, r * 0.66 + 0.4, 0x1f2937, [x - 2.1, 0, 0], { roughness: 0.5 }),
      elip(0.5, r + 0.4, r * 0.66 + 0.4, 0x1f2937, [x + 2.1, 0, 0], { roughness: 0.5 }),
    ];
  };
  const franjas = [-12, 14].flatMap(franja);

  const aleta = (puntos: [number, number][], grosor = 1.4) => {
    const f = new THREE.Shape();
    puntos.forEach(([x, y], i) => (i ? f.lineTo(x, y) : f.moveTo(x, y)));
    f.closePath();
    const g = new THREE.ExtrudeGeometry(f, {
      depth: grosor,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.4,
      bevelSegments: 2,
    });
    g.translate(0, 0, -grosor / 2);
    return new THREE.Mesh(g, material(NAR, { roughness: 0.45, side: THREE.DoubleSide }));
  };
  const dorsal = aleta([
    [-10, 12],
    [-4, 25],
    [6, 28],
    [16, 22],
    [20, 13],
  ]);
  const cola = new THREE.Group();
  cola.position.set(-33, 0, 0);
  cola.add(
    aleta([
      [0, 0],
      [-14, 17],
      [-17, 11],
      [-10, 0],
      [-17, -11],
      [-14, -17],
    ]),
  );
  const pectorales = espejo((l) => {
    const a = aleta(
      [
        [0, 0],
        [-7, -5],
        [-3, -11],
        [3, -4],
      ],
      1,
    );
    a.position.set(10, -4, l * 11.2);
    a.rotation.y = l * 0.35;
    return a;
  });
  const ojos = espejo((l) => [
    elip(5.6, 5.6, 3.4, BLANCO, [22.5, 6, l * 9.6], BRILLANTE),
    elip(3, 3, 2, 0x111827, [24.6, 6, l * 11.6], BRILLANTE),
    brillo(25.6, 7.6, l * 12.4, 0.9),
  ]);
  const branquia = espejo((l) =>
    tubo(
      [
        [14, 6, l * 11.6],
        [16, -1, l * 11.9],
        [14, -8, l * 11.2],
      ],
      [0.5, 0.5, 0.5],
      0xc2410c,
    ),
  );

  grupo.add(cuerpo, vientre, ...franjas, dorsal, cola, ...pectorales, ...ojos.flat(), ...branquia);
  v0.add(...espejo((l) => arco(3.4, 0.9, 0x7c2d12, [33.4, -3, l * 3.6], true)));
  v1.add(
    elip(2, 2.4, 1.6, 0x7f1d1d, [34.4, -3, 0]),
    ...[
      [20, 24, 6],
      [24, 34, 4],
      [30, 40, 5],
    ].map(([x, y, r]) =>
      esfera(r * 0.55, 0xbae6fd, [x - 4, y, 0], {
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      }),
    ),
  );
  const animar = (t: number) => {
    cola.rotation.y = Math.sin(t * 7) * 0.45;
  };
  return ajustar({ grupo, variantes: [v0, v1], perfil, animar }, ALTO, 104);
}

// ----------------------------------------------------------------- Abeja

function abeja(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo(true);
  const AMARILLO = 0xfbbf24;
  const NEGRO = 0x2a2118;

  // Abdomen en 5 anillos alternados amarillo/negro que siguen una silueta ovalada.
  const abdomen = [0, 1, 2, 3, 4].map((i) => {
    const x = -40 + i * 8;
    const r = 14.5 * Math.sqrt(Math.max(0.2, 1 - Math.pow((x + 20) / 23, 2)));
    return elip(5.6, r, r * 0.96, i % 2 === 0 ? AMARILLO : NEGRO, [x, -1, 0], PELO);
  });
  const aguijon = cono(2.6, 9, NEGRO, [-47, -1, 0], [0, 0, Math.PI / 2]);
  const torax = elip(11.5, 12, 11, 0xf6b23a, [-2, 1, 0], PELO);
  const pelusa = elip(8, 3, 9, NEGRO, [-3, 11.4, 0], PELO);
  const cabeza = elip(10.5, 11, 10.5, AMARILLO, [20, 2, 0], PELO);
  const ojos = espejo((l) => [
    elip(3.6, 5, 3, 0x111827, [25, 5, l * 7.6], BRILLANTE),
    brillo(26.4, 7.2, l * 9.4, 1),
  ]);
  const antenas = espejo((l) => [
    tubo(
      [
        [22, 11, l * 3],
        [29, 19, l * 5],
        [34, 22, l * 7],
      ],
      [0.9, 0.8, 0.7],
      NEGRO,
    ),
    esfera(2, NEGRO, [34.5, 22.5, l * 7.2]),
  ]);
  const patas = [4, -5, -14].flatMap((x) =>
    espejo((l) =>
      tubo(
        [
          [x, -8, l * 5],
          [x + 3, -17, l * 8.4],
          [x - 1, -25, l * 9.6],
        ],
        [1.4, 1.1, 0.9],
        NEGRO,
      ),
    ),
  );
  const alas = espejo((l) => {
    const pivote = new THREE.Group();
    pivote.position.set(-4, 11, l * 6);
    const grande = elip(8, 20, 0.6, 0xe0f2fe, [-1, 17, 0], {
      transparent: true,
      opacity: 0.62,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    grande.rotation.z = 0.35;
    const chica = elip(6, 13, 0.6, 0xe0f2fe, [-9, 10, 0], {
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    chica.rotation.z = 0.7;
    pivote.add(grande, chica);
    pivote.userData.lado = l;
    return pivote;
  });
  const sonrisaAbeja = (y: number, abierta = false) => {
    const piezas: THREE.Object3D[] = [];
    const a = arco(3.8, 1, NEGRO, [29.4, y, 3.6], true);
    a.rotation.y = 1.2;
    piezas.push(a);
    if (abierta) piezas.push(elip(1.4, 2, 1.6, 0x7f1d1d, [30.2, y - 1.6, 1.2]));
    return piezas;
  };

  grupo.add(
    ...abdomen,
    aguijon,
    torax,
    pelusa,
    cabeza,
    ...ojos.flat(),
    ...antenas.flat(),
    ...patas,
    ...alas,
  );
  v0.add(...sonrisaAbeja(-3));
  v1.add(...sonrisaAbeja(-3, true));
  const animar = (t: number) => {
    for (const a of alas) a.rotation.x = a.userData.lado * (0.4 + Math.sin(t * 38) * 0.4);
  };
  return ajustar({ grupo, variantes: [v0, v1], perfil, animar }, ALTO, 108);
}

// -------------------------------------------------------------- Estrella
// Estrella dorada de puntas redondeadas y poco grosor, con relieve suave.

function estrella(): Modelo3D {
  const { grupo, v0, v1, perfil } = nuevo();
  const puntas = 5;
  const R = 48;
  const r = 24;
  const punto = (i: number, radio: number): [number, number] => {
    const ang = Math.PI / 2 + (i * Math.PI) / puntas;
    return [radio * Math.cos(ang), radio * Math.sin(ang)];
  };
  const forma = new THREE.Shape();
  // Cada punta se redondea con una curva que parte un poco antes y termina un poco después.
  for (let i = 0; i < puntas * 2; i += 2) {
    const [px, py] = punto(i, R);
    const [ax, ay] = punto(i - 1, r);
    const [bx, by] = punto(i + 1, r);
    const k = 0.2;
    const desde: [number, number] = [px + (ax - px) * k, py + (ay - py) * k];
    const hasta: [number, number] = [px + (bx - px) * k, py + (by - py) * k];
    if (i === 0) forma.moveTo(...desde);
    else forma.lineTo(...desde);
    forma.quadraticCurveTo(px, py, ...hasta);
    forma.lineTo(bx, by);
  }
  forma.closePath();
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: 7,
    bevelEnabled: true,
    bevelThickness: 4.5,
    bevelSize: 4,
    bevelSegments: 6,
    curveSegments: 10,
  });
  geo.center();
  const cuerpo = new THREE.Mesh(
    geo,
    material(0xfcd34d, {
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.16,
    }),
  );
  cuerpo.position.y = -2;
  const sonrisa = arco(6, 1.3, 0x7c2d12, [0, -12, 11.4], true);
  grupo.add(cuerpo, sonrisa);
  v0.add(
    ...espejo((l) => [
      elip(3.4, 4.4, 1.6, 0x1f2937, [l * 9.5, 0.5, 11.6], BRILLANTE),
      brillo(l * 9.5 + 1.1, 2.4, 12.6, 1),
    ]),
  );
  v1.add(
    elip(3.4, 4.4, 1.6, 0x1f2937, [-9.5, 0.5, 11.6], BRILLANTE),
    arco(4, 1.3, 0x1f2937, [9.5, -1, 11.8]),
  );
  return ajustar({ grupo, variantes: [v0, v1], perfil }, 96, 100);
}

const CONSTRUCTORES: Record<string, () => Modelo3D> = {
  ...CONSTRUCTORES_EXTRA,
  kody,
  zorro,
  gato,
  dino,
  cohete,
  pez,
  abeja,
  estrella,
};

/** Crea el modelo 3D de un personaje de la biblioteca (Kody, el robot, si no existe). */
export function crearModelo3D(personaje: string): Modelo3D {
  return (CONSTRUCTORES[personaje] ?? kody)();
}
