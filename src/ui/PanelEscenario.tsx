import { useEffect, useRef } from 'react';
import { Escenario } from '../stage/Escenario';
import { runtime } from '../store/controlador';

/** Contenedor del escenario (4:3) donde PixiJS dibuja a los actores. */
export function PanelEscenario() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const escenario = new Escenario();
    void escenario.montar(el, runtime);
    return () => escenario.destruir();
  }, []);

  return (
    <div
      ref={host}
      className="tarjeta relative w-full overflow-hidden"
      style={{ aspectRatio: '4 / 3' }}
    />
  );
}
