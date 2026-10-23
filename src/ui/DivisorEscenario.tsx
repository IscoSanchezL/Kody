import { useRef } from 'react';
import { useT } from '../i18n';
import { ANCHO_NORMAL, PASO_ANCHO, limitarAncho } from '../store/disposicion';
import { useApp } from '../store/useApp';

/**
 * Asa entre el editor de bloques y el escenario: arrastrándola se agranda o se achica el
 * escenario. También se maneja con las flechas del teclado, y con doble clic vuelve al tamaño normal.
 */
export function DivisorEscenario({ ancho }: { ancho: number }) {
  const t = useT();
  const setAncho = useApp((s) => s.setAnchoPanel);
  const asa = useRef<HTMLDivElement>(null);

  const contenedor = () => asa.current?.parentElement?.getBoundingClientRect();

  return (
    <div
      ref={asa}
      role="separator"
      aria-orientation="vertical"
      aria-label={t('divisor.aria')}
      aria-valuenow={ancho}
      tabIndex={0}
      title={t('divisor.titulo')}
      className="group absolute bottom-3 top-3 z-20 hidden w-3 cursor-col-resize touch-none items-center justify-center rounded-full outline-offset-2 lg:flex"
      style={{ right: 'calc(0.75rem + var(--ancho-panel))' }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const c = contenedor();
        if (!c) return;
        // El asa queda en el centro del espacio entre columnas: 12 px de margen + 6 px de medio espacio.
        setAncho(limitarAncho(c.right - 18 - e.clientX, c.width));
      }}
      onDoubleClick={() => setAncho(null)}
      onKeyDown={(e) => {
        const c = contenedor();
        if (!c) return;
        if (e.key === 'ArrowLeft') setAncho(limitarAncho(ancho + PASO_ANCHO, c.width));
        else if (e.key === 'ArrowRight') setAncho(limitarAncho(ancho - PASO_ANCHO, c.width));
        else if (e.key === 'Home') setAncho(ANCHO_NORMAL);
        else return;
        e.preventDefault();
      }}
    >
      <span className="h-16 w-1.5 rounded-full bg-[var(--borde)] opacity-70 transition group-hover:bg-[var(--primario)] group-hover:opacity-100 group-focus-visible:bg-[var(--primario)]" />
    </div>
  );
}
