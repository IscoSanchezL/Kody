import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIAS_SONIDO, MAX_SONIDOS, SONIDOS, type CategoriaSonido } from '../engine/sonidos';
import { sonidoEncaje } from '../audio';
import { t as traducir, tDinamica, useT } from '../i18n';
import { useProyecto } from '../store/proyecto';
import { useApp } from '../store/useApp';
import { useSonando } from './useSonando';

/** Biblioteca de sonidos: se escucha cada uno con ▶ antes de agregarlo al actor elegido. */
export function BibliotecaSonidos() {
  const t = useT();
  const abierta = useApp((s) => s.sonidosAbierto);
  const abrir = useApp((s) => s.abrirSonidos);
  const decir = useApp((s) => s.decir);
  const actor = useProyecto((s) => s.actores.find((a) => a.id === s.seleccionado) ?? s.actores[0]);
  const agregar = useProyecto((s) => s.agregarSonido);
  const cerrar = useRef<HTMLButtonElement>(null);
  const [filtro, setFiltro] = useState<CategoriaSonido | 'todos'>('todos');
  const { sonando, escuchar } = useSonando();

  useEffect(() => {
    if (!abierta) return;
    setFiltro('todos');
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && abrir(false);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, abrir]);

  const anadir = (id: string) => {
    if (!actor) return;
    const r = agregar(actor.id, id);
    if (r === 'ok') {
      decir('sonidos.agregado', { nombre: tDinamica(`sonido.${id}`) });
      sonidoEncaje();
    } else decir(r === 'ya' ? 'sonidos.yaTiene' : 'sonidos.maximo', { max: MAX_SONIDOS });
  };

  const lista = SONIDOS.filter((s) => filtro === 'todos' || s.categoria === filtro);

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && abrir(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-sonidos"
            className="tarjeta max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="titulo-sonidos" className="titulo m-0 text-2xl font-extrabold">
                {t('sonidos.titulo')}
              </h2>
              <button
                ref={cerrar}
                type="button"
                className="btn btn-suave"
                onClick={() => abrir(false)}
                aria-label={t('comun.cerrar')}
              >
                ✕
              </button>
            </div>
            <div
              role="group"
              aria-label={t('sonidos.categorias')}
              className="mb-3 flex flex-wrap gap-2"
            >
              {(['todos', ...CATEGORIAS_SONIDO] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className="pestana !min-h-9 !flex-none !px-3 !text-base"
                  aria-selected={filtro === c}
                  onClick={() => setFiltro(c)}
                >
                  {c === 'todos' ? t('sonidos.todos') : traducir(`sonidocat.${c}` as never)}
                </button>
              ))}
            </div>
            <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
              {lista.map((s) => {
                const nombre = tDinamica(`sonido.${s.id}`);
                const tiene = actor?.sonidos.includes(s.id) ?? false;
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded-2xl border border-[var(--borde)] bg-[var(--fondo)]/50 p-2"
                  >
                    <button
                      type="button"
                      className="btn !min-h-11 !min-w-11 !px-0"
                      aria-label={t('sonidos.escuchar', { nombre })}
                      title={t('sonidos.escuchar', { nombre })}
                      onClick={() => escuchar(s.id)}
                    >
                      {sonando === s.id ? (
                        <span className="ecualizador" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        '▶'
                      )}
                    </button>
                    <span className="text-3xl" aria-hidden="true">
                      {s.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="titulo block truncate text-lg font-extrabold">{nombre}</span>
                      <span className="text-xs font-bold text-[var(--texto-suave)]">
                        {t('sonidos.segundos', { n: s.duracion.toFixed(1) })}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-suave !min-h-10 !px-3 !text-base"
                      disabled={tiene}
                      onClick={() => anadir(s.id)}
                    >
                      {tiene ? t('sonidos.tiene') : t('sonidos.agregarBoton')}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
