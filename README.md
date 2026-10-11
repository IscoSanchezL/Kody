# Kody 🦊

Plataforma web de **programación por bloques** para estudiantes de grado 4 (9–10 años), en español. Mascota guía: **Kody**, un zorro robot.

> Estado: **Fase 1** (layout, tema visual, Blockly personalizado, escenario con 1 actor, bloques de movimiento/apariencia/control ejecutándose). Ver [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

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

## Qué incluye la Fase 1

- Editor de bloques con **Blockly** (renderer `zelos`, redondeado como Scratch 3) y tema propio.
- Categorías: Eventos, Movimiento, Apariencia, Control, Operadores (19 bloques).
- **Escenario PixiJS** con fondo ilustrado y actor Kody (2 disfraces SVG propios), globos de "decir/pensar".
- **Intérprete propio** con hilos cooperativos (generadores), sin `eval`: ejecutar, detener, **paso a paso** con el bloque activo resaltado, y vigilante contra bucles infinitos con aviso amable.
- Mascota Kody que da mensajes; panel del actor con x, y, dirección y tamaño en vivo.
- Temas claro / oscuro / alto contraste, tamaño de letra A− / A+, foco visible, botones táctiles grandes.
- Sonidos de encaje y éxito sintetizados con Web Audio (sin archivos externos).
- Autoguardado cada 10 s (localStorage en esta fase; IndexedDB llega en la Fase 3).

## Próximas fases

2. Intérprete completo: eventos de teclado/clic, mensajes, clones.
3. Editor de disfraces/sonidos, variables, "Mis bloques", lápiz.
4. Modo Aventura (2 mundos), motor de niveles, estrellas.
5. Mundos 3–6, modo docente, PWA offline, accesibilidad, Playwright e2e.
