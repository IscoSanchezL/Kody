import { useApp } from '../store/useApp';

const forma = (v: number | string) =>
  typeof v === 'number' ? String(Math.round(v * 100) / 100) : v;

/** Variables y listas que el programa mostró, sobre una esquina del escenario. */
export function Monitores() {
  const { variables, listas } = useApp((s) => s.monitores);
  if (!variables.length && !listas.length) return null;
  return (
    <div
      className="pointer-events-none absolute left-2 top-2 flex max-w-[55%] flex-col items-start gap-1.5"
      aria-live="polite"
    >
      {variables.map((v) => (
        <div
          key={v.nombre}
          className="flex overflow-hidden rounded-lg border border-white/30 bg-black/55 text-sm font-bold text-white backdrop-blur"
        >
          <span className="bg-[#dc2626] px-2 py-0.5">{v.nombre}</span>
          <span className="min-w-8 px-2 py-0.5 text-center tabular-nums">{forma(v.valor)}</span>
        </div>
      ))}
      {listas.map((l) => (
        <div
          key={l.nombre}
          className="w-40 overflow-hidden rounded-lg border border-white/30 bg-black/55 text-sm font-bold text-white backdrop-blur"
        >
          <div className="bg-[#be123c] px-2 py-0.5">
            {l.nombre} <span className="opacity-80">({l.valores.length})</span>
          </div>
          <ol className="m-0 max-h-28 list-none overflow-hidden p-1 text-xs tabular-nums">
            {l.valores.slice(0, 8).map((x, i) => (
              <li key={i} className="truncate">
                <span className="opacity-60">{i + 1}</span> {forma(x)}
              </li>
            ))}
            {l.valores.length > 8 && <li className="opacity-70">…</li>}
            {l.valores.length === 0 && <li className="opacity-70">(vacía)</li>}
          </ol>
        </div>
      ))}
    </div>
  );
}
