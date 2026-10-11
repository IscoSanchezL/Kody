import { useEffect, useState } from 'react';
import { ACTOR_INICIAL, runtime } from '../store/controlador';
import { alDataUri, kodySVG } from '../stage/disfraces';

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: number }) => (
  <div className="rounded-xl bg-[var(--fondo)] px-3 py-1 text-center">
    <div className="text-xs font-bold text-[var(--texto-suave)]">{etiqueta}</div>
    <div className="titulo text-lg font-extrabold tabular-nums">{Math.round(valor)}</div>
  </div>
);

/** Tarjeta del actor con su posición en vivo (ayuda a entender x, y y dirección). */
export function PanelActor() {
  const [, repintar] = useState(0);
  useEffect(() => {
    const t = setInterval(() => repintar((n) => n + 1), 100);
    return () => clearInterval(t);
  }, []);
  const a = runtime.actores.get(ACTOR_INICIAL.id) ?? ACTOR_INICIAL;

  return (
    <section className="tarjeta p-3" aria-label="Actor">
      <h2 className="titulo m-0 mb-2 text-lg font-extrabold">Mi actor</h2>
      <div className="flex items-center gap-3">
        <img
          src={alDataUri(kodySVG((a.disfrazActual % 2) as 0 | 1))}
          alt=""
          width={64}
          height={64}
          className="rounded-2xl border-[3px] border-[var(--primario)] bg-[var(--fondo)]"
        />
        <div className="grid flex-1 grid-cols-4 gap-2">
          <Dato etiqueta="x" valor={a.x} />
          <Dato etiqueta="y" valor={a.y} />
          <Dato etiqueta="dirección" valor={a.direccion} />
          <Dato etiqueta="tamaño" valor={a.tamano} />
        </div>
      </div>
      <p className="m-0 mt-2 text-sm font-bold">{a.nombre}</p>
    </section>
  );
}
