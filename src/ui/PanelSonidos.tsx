import { useT } from '../i18n';
import { duracionSonido, sonidoPorId } from '../engine/sonidos';
import { tDinamica } from '../i18n';
import { useProyecto } from '../store/proyecto';
import { useApp } from '../store/useApp';
import { useSonando } from './useSonando';

/** Pestaña "Sonidos": los sonidos del actor elegido, con ▶ para escucharlos antes de usarlos. */
export function PanelSonidos() {
  const t = useT();
  const actor = useProyecto((s) => s.actores.find((a) => a.id === s.seleccionado) ?? s.actores[0]);
  const quitar = useProyecto((s) => s.quitarSonido);
  const abrir = useApp((s) => s.abrirSonidos);
  const { sonando, escuchar } = useSonando();
  if (!actor) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-xs font-bold text-[var(--texto-suave)]">{t('sonidos.ayuda')}</p>
      {actor.sonidos.length === 0 ? (
        <p className="m-0 rounded-2xl border border-dashed border-[var(--borde)] p-4 text-center text-sm font-bold">
          {t('sonidos.vacio')}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {actor.sonidos.map((id) => {
            const nombre = tDinamica(`sonido.${id}`);
            return (
              <li
                key={id}
                className="flex items-center gap-2 rounded-2xl border border-[var(--borde)] bg-[var(--fondo)]/50 p-1.5 pr-2"
              >
                <button
                  type="button"
                  className="btn !min-h-10 !min-w-10 !px-0"
                  aria-label={t('sonidos.escuchar', { nombre })}
                  title={t('sonidos.escuchar', { nombre })}
                  onClick={() => escuchar(id)}
                >
                  {sonando === id ? (
                    <span className="ecualizador" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    '▶'
                  )}
                </button>
                <span className="text-2xl" aria-hidden="true">
                  {sonidoPorId(id)?.emoji}
                </span>
                <span className="flex-1 truncate font-extrabold">{nombre}</span>
                <span className="text-xs font-bold tabular-nums text-[var(--texto-suave)]">
                  {t('sonidos.segundos', { n: duracionSonido(id).toFixed(1) })}
                </span>
                <button
                  type="button"
                  className="btn btn-suave !min-h-9 !min-w-9 !px-0 !text-base"
                  aria-label={t('sonidos.quitar', { nombre })}
                  title={t('sonidos.quitar', { nombre })}
                  onClick={() => quitar(actor.id, id)}
                >
                  🗑
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" className="btn btn-suave self-start" onClick={() => abrir(true)}>
        {t('sonidos.agregar')}
      </button>
    </div>
  );
}
