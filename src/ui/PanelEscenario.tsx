import { useEffect, useRef } from 'react';
import { CapaLapiz } from './CapaLapiz';
import { Monitores } from './Monitores';
import { PreguntaEscenario } from './PreguntaEscenario';
import { Escenario, type PuenteEscenario } from '../stage/Escenario';
import { clicEnActor, ratonAbajo, runtime } from '../store/controlador';
import { useProyecto } from '../store/proyecto';
import { disfrazActivo } from '../store/proyectoModelo';
import { useIdioma, useT } from '../i18n';
import { useApp } from '../store/useApp';
import { seleccionarActor } from '../store/controlador';

/** Lo que el escenario (2D o 3D) necesita de la aplicación. */
const crearPuente = (): PuenteEscenario => ({
  // Un clon se dibuja como su original: su id es `original~n`.
  disfrazDe: (id, indice) => {
    const actor = useProyecto.getState().actores.find((a) => a.id === id.split('~')[0]);
    return actor ? disfrazActivo(actor, indice) : { personaje: 'kody', variante: 0 };
  },
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

/** Escenario (4:3) donde PixiJS dibuja a los actores, con sus botones de ayuda. */
export function PanelEscenario() {
  const t = useT();
  const idioma = useIdioma((s) => s.idioma);
  const envoltorio = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const cuadricula = useApp((s) => s.cuadricula);
  const grande = useApp((s) => s.escenarioGrande);
  const puntero = useApp((s) => s.puntero);
  const modo3d = useApp((s) => s.modo3d);
  const setModo3d = useApp((s) => s.setModo3d);
  const alternarCuadricula = useApp((s) => s.alternarCuadricula);
  const alternarGrande = useApp((s) => s.alternarEscenarioGrande);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let motor: { destruir: () => void } | null = null;
    let cancelado = false;
    (async () => {
      try {
        if (modo3d) {
          // El 3D se carga bajo demanda: quien usa el 2D no descarga Three.js.
          const { Escenario3D } = await import('../stage/Escenario3D');
          if (cancelado) return;
          const e = new Escenario3D(crearPuente());
          motor = e;
          await e.montar(el, runtime);
        } else {
          const e = new Escenario(crearPuente());
          motor = e;
          await e.montar(el, runtime);
        }
      } catch {
        if (modo3d && !cancelado) {
          // Sin WebGL o con un equipo muy limitado: se vuelve al 2D sin romper nada.
          useApp.getState().setModo3d(false);
          useApp.getState().decir('escenario.sin3d');
        }
      }
    })();
    return () => {
      cancelado = true;
      motor?.destruir();
      el.replaceChildren();
    };
  }, [modo3d]);

  // La etiqueta del lienzo (que dibuja Pixi o Three) sigue el idioma sin rehacer el escenario.
  useEffect(() => {
    host.current
      ?.querySelector('canvas')
      ?.setAttribute('aria-label', t(modo3d ? 'escenario.aria3d' : 'escenario.aria'));
  }, [idioma, modo3d, t]);

  const pantallaCompleta = () => {
    const el = envoltorio.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  return (
    <div
      ref={envoltorio}
      className="escenario-wrap tarjeta relative w-full overflow-hidden"
      onPointerDown={() => ratonAbajo(true)}
      onPointerUp={() => ratonAbajo(false)}
      onPointerLeave={() => ratonAbajo(false)}
    >
      <div className="relative">
        <div
          ref={host}
          className="escenario-host relative w-full"
          style={{ aspectRatio: '4 / 3' }}
        />
        <CapaLapiz />
      </div>
      <Monitores />
      <PreguntaEscenario />
      <div className="absolute right-2 top-2 flex gap-1.5">
        <button
          type="button"
          className="btn-icono !w-auto px-2.5 text-sm font-extrabold"
          aria-pressed={modo3d}
          aria-label={t('escenario.cambiar3d')}
          title={modo3d ? t('escenario.ver2d') : t('escenario.ver3d')}
          onClick={() => setModo3d(!modo3d)}
        >
          {modo3d ? '3D' : '2D'}
        </button>
        <button
          type="button"
          className="btn-icono"
          aria-pressed={cuadricula}
          aria-label={t('escenario.cuadriculaAria')}
          title={t('escenario.cuadricula')}
          onClick={alternarCuadricula}
        >
          ▦
        </button>
        <button
          type="button"
          className="btn-icono"
          aria-pressed={grande}
          aria-label={t('escenario.grandeAria')}
          title={grande ? t('escenario.normal') : t('escenario.grande')}
          onClick={alternarGrande}
        >
          {grande ? '🗗' : '🗖'}
        </button>
        <button
          type="button"
          className="btn-icono"
          aria-label={t('escenario.pantallaCompleta')}
          title={t('escenario.pantallaCompleta')}
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
