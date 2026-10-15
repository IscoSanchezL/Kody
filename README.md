# Kody 🦊

Plataforma web de **programación por bloques** para estudiantes de grado 4 (9–10 años), en español. Mascota guía: **Kody**, un zorro robot.

> Estado: **Fase 2** (varios actores y escenarios, eventos, sensores, sonido, interfaz renovada). La Fase 1 sentó las bases (layout, tema, Blockly, escenario, intérprete). Ver [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Cuentas y guardado en la nube

Los estudiantes pueden **entrar** (código de clase + PIN, o con Google) y **guardar sus proyectos en la nube**, con autoguardado y "Mis proyectos". Sin cuenta todo sigue funcionando en el navegador. Cómo activar Google, seguridad y roles: [docs/ACCESO.md](docs/ACCESO.md).

## Versión web

Kody se publica solo en **GitHub Pages**: https://iscosanchezl.github.io/Kody/

Cada vez que se sube código a `main`, el flujo `.github/workflows/pages.yml` ejecuta las pruebas, compila y publica. Si no abre, revisa que en el repositorio esté activado **Settings → Pages → Source: GitHub Actions**.

## Requisitos

- **Node.js 20.19 o superior** (recomendado 22 LTS; el repo trae `.nvmrc`). Con Node 18 fallan `npm run dev` y `npm run build:local`.
- En Mac: `brew install node@22` o `nvm install 22 && nvm use`.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas del motor (Vitest)
npm run build      # compilación de producción
npm run build:local  # versión de un solo archivo: dist-local/index.html
```

### ¿Pantalla en blanco?

Kody **no se puede abrir haciendo doble clic en `index.html`** de la carpeta del proyecto ni de `dist/`: el navegador bloquea los scripts de módulos desde archivos locales. Usa una de estas opciones:

1. `npm run dev` y abre http://localhost:5173 (para desarrollar).
2. `npm run build:local` y abre `dist-local/index.html` con doble clic (versión de un solo archivo; mantén junta la carpeta `dist-local`).

## Qué incluye la Fase 2

- **Varios actores** (hasta 8), cada uno con su propio programa; se elige a quién programar en el panel de actores.
- **Biblioteca de 8 personajes** con 2 disfraces (Kody, Robo, Gato, Dino, Cohete, Pez, Abeja, Estrella) y **8 escenarios** (pradera, espacio, océano, ciudad de noche, desierto, montañas con nieve, cuadrícula, en blanco). Se pueden cambiar en cualquier momento, también desde los bloques.
- **Arrastrar actores** en el escenario para posicionarlos, cuadrícula de coordenadas, escenario grande y pantalla completa.
- **Eventos:** al presionar una tecla, al hacer clic en el actor, enviar y recibir mensajes entre actores.
- **Control y lógica:** si / si no, repetir hasta que, esperar hasta que, detener todo; sensores (tecla, borde, tocando a otro actor, posición) y operadores (+ − × ÷, > < =, y / o / no, al azar).
- **Sonido:** 6 efectos y notas musicales, sintetizados con Web Audio.
- Propiedades del actor (nombre, posición, dirección, tamaño, visibilidad, disfraz, personaje), deshacer / rehacer, y **guardar / abrir proyectos** como archivo `.kody.json` (con validación de archivos dañados).
- Pendiente de esta fase: clones de actores.

### Escenario 3D

El escenario se puede ver en **3D** (por defecto) o en 2D con el botón `3D / 2D` del escenario. En 3D los actores son modelos construidos con formas simples (Three.js, sin descargar archivos) que respiran, se inclinan al moverse y giran hacia donde miran; el fondo pintado queda detrás como en un teatro de títeres, y la cámara se balancea suavemente con el puntero (se desactiva si el sistema pide reducir movimiento). Las coordenadas `x` e `y` significan lo mismo que en 2D. Si el equipo no puede mostrar 3D, Kody vuelve solo al 2D.

## Qué incluía la Fase 1

- Editor de bloques con **Blockly** (renderer `zelos`, redondeado como Scratch 3) y tema propio.
- Categorías: Eventos, Movimiento, Apariencia, Control, Operadores (19 bloques).
- **Escenario PixiJS** con fondo ilustrado y actor Kody (2 disfraces SVG propios), globos de "decir/pensar".
- **Intérprete propio** con hilos cooperativos (generadores), sin `eval`: ejecutar, detener, **paso a paso** con el bloque activo resaltado, y vigilante contra bucles infinitos con aviso amable.
- Mascota Kody que da mensajes; panel del actor con x, y, dirección y tamaño en vivo.
- Temas claro / oscuro / alto contraste, tamaño de letra A− / A+, foco visible, botones táctiles grandes.
- Sonidos de encaje y éxito sintetizados con Web Audio (sin archivos externos).
- Autoguardado cada 10 s (localStorage en esta fase; IndexedDB llega en la Fase 3).

## Próximas fases

2. ✅ Eventos de teclado/clic, mensajes, condicionales, sensores, sonido, varios actores (clones pendientes).
3. Editor de disfraces/sonidos, variables, "Mis bloques", lápiz.
4. Modo Aventura (2 mundos), motor de niveles, estrellas.
5. Mundos 3–6, modo docente, PWA offline, accesibilidad, Playwright e2e.
