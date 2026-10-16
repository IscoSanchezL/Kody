import { useEffect, useRef } from 'react';
import type { EventoLapiz } from '../engine/tipos';
import { ESCENARIO, RADIO_ACTOR } from '../engine/tipos';
import { capaLapiz, imagenDeActor, runtime } from '../store/controlador';

/** Resolución interna: el doble del escenario lógico, para que las líneas se vean nítidas. */
const K = 2;
const imagenes = new Map<string, HTMLImageElement>();

/** Capa transparente sobre el escenario (2D o 3D) donde dibuja el lápiz. */
export function CapaLapiz() {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = lienzo.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    const px = (x: number) => (x + ESCENARIO.mitadX) * K;
    const py = (y: number) => (ESCENARIO.mitadY - y) * K;

    capaLapiz.dibujar = (e: EventoLapiz) => {
      if (e.t === 'borrar') return g.clearRect(0, 0, c.width, c.height);
      if (e.t === 'linea') {
        g.strokeStyle = e.color;
        g.lineWidth = e.grosor * K;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(px(e.x1), py(e.y1));
        g.lineTo(px(e.x2), py(e.y2));
        g.stroke();
        return;
      }
      // Sello: una copia del actor, con su tamaño y su disfraz de ese momento.
      const a = runtime.actores.get(e.actorId);
      if (!a || !a.visible) return;
      const url = imagenDeActor(e.actorId, a.disfrazActual);
      const lado = RADIO_ACTOR * 2 * (a.tamano / 100) * K;
      const [x, y] = [px(a.x), py(a.y)];
      const pintar = (img: HTMLImageElement) =>
        g.drawImage(img, x - lado / 2, y - lado / 2, lado, lado);
      let img = imagenes.get(url);
      if (!img) {
        img = new Image();
        img.src = url;
        imagenes.set(url, img);
      }
      if (img.complete) pintar(img);
      else img.addEventListener('load', () => img && pintar(img), { once: true });
    };
    return () => {
      capaLapiz.dibujar = null;
    };
  }, []);

  return (
    <canvas
      ref={lienzo}
      width={ESCENARIO.ancho * K}
      height={ESCENARIO.alto * K}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
