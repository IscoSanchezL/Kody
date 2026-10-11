import { useEffect, useRef } from 'react';
import { Escenario } from '../stage/Escenario';
import { clicEnActor, runtime } from '../store/controlador';
import { useProyecto } from '../store/proyecto';
import { useApp } from '../store/useApp';
import { seleccionarActor } from '../store/controlador';

/** Escenario (4:3) donde PixiJS dibuja a los actores, con sus botones de ayuda. */
export function PanelEscenario() {
  const envoltorio = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const cuadricula = useApp((s) => s.cuadricula);
  const grande = useApp((s) => s.escenarioGrande);
  const puntero = useApp((s) => s.puntero);
  const alternarCuadricula = useApp((s) => s.alternarCuadricula);
  const alternarGrande = useApp((s) => s.alternarEscenarioGrande);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const escenario = new Escenario({
      personajeDe: (id) =>
        useProyecto.getState().actores.find((a) => a.id === id)?.personaje ?? 'kody',
      seleccionado: () => useProyecto.getState().seleccionado,
      cuadricula: () => useApp.getState().cuadricula,
      puedeArrastrar: () => runtime.modo === 'detenido',
      alMover: (id, x, y) => useProyecto.getState().editarActor(id, { x, y }),
      alSeleccionar: seleccionarActor,
      alClic: clicEnActor,
      alPuntero: (p) => {
        const actual = useApp.getState().puntero;
        if (p?.x !== actual?.x || p?.y !== actual?.y) useApp.getState().setPuntero(p);
      },
    });
    void escenario.montar(el, runtime);
    return () => escenario.destruir();
  }, []);

  const pantallaCompleta = () => {
    const el = envoltorio.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  return (
    <div ref={envoltorio} className="escenario-wrap tarjeta relative w-full overflow-hidden">
      <div ref={host} className="escenario-host relative w-full" style={{ aspectRatio: '4 / 3' }} />
      <div className="absolute right-2 top-2 flex gap-1.5">
        <button
          type="button"
          className="btn-icono"
          aria-pressed={cuadricula}
          aria-label="Mostrar u ocultar la cuadrícula de coordenadas"
          title="Cuadrícula de coordenadas"
          onClick={alternarCuadricula}
        >
          ▦
        </button>
        <button
          type="button"
          className="btn-icono"
          aria-pressed={grande}
          aria-label="Hacer el escenario más grande o más pequeño"
          title={grande ? 'Escenario normal' : 'Escenario grande'}
          onClick={alternarGrande}
        >
          {grande ? '🗗' : '🗖'}
        </button>
        <button
          type="button"
          className="btn-icono"
          aria-label="Pantalla completa"
          title="Pantalla completa"
          onClick={pantallaCompleta}
        >
          ⛶
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-3 py-1 text-xs font-bold tabular-nums text-white">
        {puntero ? `x: ${puntero.x}   y: ${puntero.y}` : 'x: –   y: –'}
      </div>
    </div>
  );
}
