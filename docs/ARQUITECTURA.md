# Kody · Plan de arquitectura

Kody es una plataforma web de programación por bloques para estudiantes de grado 4 (9–10 años, hispanohablantes). La mascota es **Kody**, un zorro robot que guía, da pistas y celebra.

## Decisiones técnicas

| Tema         | Decisión                                                              | Motivo                                        |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------- |
| Lenguaje     | TypeScript estricto                                                   | Seguridad de tipos en motor e intérprete      |
| UI           | React 18 + Vite + Tailwind v4 + Framer Motion                         | Rápido, componentes simples, microanimaciones |
| Bloques      | Blockly con renderer `zelos` (redondeado, tipo Scratch) y tema propio | Motor probado (Scratch, Code.org, MakeCode)   |
| Escenario    | PixiJS v8 (WebGL)                                                     | 60 fps con muchos actores                     |
| Estado       | Zustand                                                               | Simple y sin boilerplate                      |
| Persistencia | localStorage (Fase 1) → IndexedDB (`idb`) en Fase 3                   | Funciona offline                              |
| Ejecución    | Intérprete propio con generadores (hilos cooperativos)                | Sin `eval`; pausa, paso a paso y detener      |
| Pruebas      | Vitest + Testing Library + Playwright                                 | Motor testeable sin navegador                 |

## Diagrama (texto)

```
┌────────────────────────── Navegador ──────────────────────────┐
│  React UI (src/ui)                                            │
│   ├─ TopBar  ▶ Ejecutar · ■ Detener · 👣 Paso · tema · A−/A+  │
│   ├─ BlocklyEditor ──► src/blocks (definiciones, tema, toolbox)│
│   ├─ StagePanel ────► src/stage (PixiJS)                      │
│   └─ ActorPanel · Mascota Kody                                │
│                │                                              │
│        Zustand (src/store): proyecto, ajustes, ejecución      │
│                │                                              │
│  Compilador: workspace Blockly ──► AST (src/engine/compilar)   │
│  Intérprete: AST ──► hilos (generadores) (src/engine/runtime) │
│                │ comandos tipados (mover, decir, ...)         │
│                ▼                                              │
│  StageRenderer (Pixi) lee el estado de los actores            │
└───────────────────────────────────────────────────────────────┘
```

Regla de oro: **el motor no conoce Pixi ni React**. Solo modifica el estado de los actores (`EstadoActor`); el escenario lo dibuja. Así el motor se prueba con Vitest.

## Estructura de carpetas

```
src/
  blocks/    definiciones de bloques, categorías, tema Blockly, toolbox
  engine/    tipos, compilador (Blockly→AST), runtime e hilos
  stage/     StageRenderer (Pixi), disfraces SVG
  ui/        componentes React
  levels/    niveles de la Aventura (JSON) — Fase 4
  store/     Zustand
  assets/    íconos, fuentes, sonidos
tests/       pruebas unitarias del motor
docs/        documentación
```

## Modelos de datos

```ts
type Proyecto = {
  version: 1;
  id: string;
  nombre: string;
  actores: Actor[];
  fondo: string;
  espacioTrabajo: object; // JSON de Blockly (serialización oficial)
  creadoEn: number;
  actualizadoEn: number;
};

type Actor = {
  id: string;
  nombre: string;
  disfraces: { id: string; nombre: string; svg: string }[];
  disfrazActual: number;
  x: number;
  y: number; // -240..240 / -180..180
  direccion: number; // grados, 90 = derecha
  tamano: number; // porcentaje
  visible: boolean;
};

type Nivel = {
  id: string; // "m1-n1"
  mundo: number;
  titulo: string;
  historia: string; // 2 líneas
  objetivo: { tipo: 'llegar' | 'dibujar' | 'recoger' | 'libre'; datos: object };
  bloquesPermitidos: string[]; // toolbox limitado
  bloquesIniciales?: object; // JSON Blockly
  solucionOptima: number; // nº de bloques para 3 estrellas
  pistas: [string, string, string];
};
```

## Formato JSON de nivel (ejemplo)

```json
{
  "id": "m1-n1",
  "mundo": 1,
  "titulo": "El primer paso",
  "historia": "Kody perdió su batería. ¡Ayúdalo a llegar hasta ella!",
  "objetivo": { "tipo": "llegar", "datos": { "meta": [3, 0], "inicio": [0, 0] } },
  "bloquesPermitidos": ["evento_al_ejecutar", "mov_mover"],
  "solucionOptima": 2,
  "pistas": [
    "Empieza con el bloque amarillo.",
    "Necesitas un bloque azul de Mover.",
    "Mueve 3 pasos hacia la batería."
  ]
}
```

## Intérprete

1. `compilar(espacio)` recorre los bloques y produce un AST por cada sombrero (`evento_al_ejecutar`, etc.).
2. Cada AST se ejecuta como un **hilo**: una función generadora que hace `yield` en esperas, en cada vuelta de bucle y en cada bloque cuando está en modo paso a paso.
3. El `Runtime` reparte un "tick" por fotograma: avanza todos los hilos hasta su próximo `yield`.
4. **Watchdog**: un bucle sin `yield` o con demasiados pasos por tick se corta con un aviso amable.
5. **Paso a paso**: cada tick solo avanza un bloque y resalta el bloque activo.

## Escenario 2D y 3D

El motor no cambia: `Runtime` solo guarda el estado de los actores. Dos dibujantes lo muestran con la misma interfaz (`montar`, `destruir`, `PuenteEscenario`):

- `stage/Escenario.ts`: PixiJS (2D).
- `stage/Escenario3D.ts` + `stage/modelos3d.ts`: Three.js, "teatro de títeres". Fondo pintado en z = -90 y actores 3D en z = 0, de modo que x e y se mantienen. Los modelos se construyen en código (sin archivos), cargan bajo demanda y tienen 2 disfraces.
- Los SVG se rasterizan a lienzos de tamaño fijo (`stage/rasterizar.ts`) para que Chrome, Edge y Safari den el mismo resultado.

## Plan por fases

| Fase | Contenido                                                                                                 | Estado     |
| ---- | --------------------------------------------------------------------------------------------------------- | ---------- |
| 1    | Layout, tema, Blockly personalizado, escenario con 1 actor, bloques de movimiento/apariencia ejecutándose | Completada |
| 2    | Intérprete completo (eventos, clones, mensajes), paso a paso                                              | Pendiente  |
| 3    | Editor de disfraces/sonidos, variables, Mis bloques, lápiz                                                | Pendiente  |
| 4    | Aventura: 2 mundos, motor de niveles, mascota, estrellas                                                  | Pendiente  |
| 5    | Mundos 3–6, modo docente, PWA offline, accesibilidad, pruebas                                             | Pendiente  |

## Decisiones tomadas sin preguntar

- Nombre de plataforma y mascota: **Kody**.
- Renderer `zelos` de Blockly como base (el más parecido a Scratch 3) con tema propio más grande y redondeado.
- Tailwind v4 con tokens definidos como variables CSS (permiten modo claro/oscuro/alto contraste).
- Fuentes Nunito, Baloo 2 y Atkinson Hyperlegible vía `@fontsource` (funcionan offline).
