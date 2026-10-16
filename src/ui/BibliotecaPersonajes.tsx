import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { PERSONAJES } from '../stage/biblioteca';
import { useIconos } from './useIconos';
import { uriPersonaje } from '../stage/uris';
import { useProyecto } from '../store/proyecto';
import { MAX_ACTORES } from '../store/proyectoModelo';
import { guardarScriptActual } from '../store/controlador';
import { useApp } from '../store/useApp';
import { sonidoEncaje } from '../audio';

/** Ventana para elegir un personaje nuevo. */
export function BibliotecaPersonajes() {
  useIconos();
  const abierta = useApp((s) => s.bibliotecaAbierta);
  const abrir = useApp((s) => s.abrirBiblioteca);
  const decir = useApp((s) => s.decir);
  const cantidad = useProyecto((s) => s.actores.length);
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierta) return;
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && abrir(false);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, abrir]);

  const elegir = (id: string, nombre: string) => {
    guardarScriptActual();
    if (useProyecto.getState().agregarActor(id)) {
      decir(`¡${nombre} se unió al escenario! Arrástralo para ponerlo donde quieras.`);
      sonidoEncaje();
    }
    abrir(false);
  };

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
            aria-labelledby="titulo-biblioteca"
            className="tarjeta w-full max-w-2xl p-5"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="titulo-biblioteca" className="titulo m-0 text-2xl font-extrabold">
                Elige un personaje
              </h2>
              <button
                ref={cerrar}
                type="button"
                className="btn btn-suave"
                onClick={() => abrir(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {cantidad >= MAX_ACTORES ? (
              <p className="m-0 font-bold">
                Ya tienes {MAX_ACTORES} actores, ¡el máximo! Quita uno para agregar otro.
              </p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
                {PERSONAJES.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="tarjeta-boton w-full"
                      onClick={() => elegir(p.id, p.nombre)}
                    >
                      <img src={uriPersonaje(p.id, 0)} alt="" width={84} height={84} />
                      <span className="titulo text-lg font-extrabold">{p.nombre}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
