import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PERSONAJES } from '../stage/biblioteca';
import { useIconos } from './useIconos';
import { uriPersonaje } from '../stage/uris';
import { useProyecto } from '../store/proyecto';
import { MAX_ACTORES, MAX_DISFRACES } from '../store/proyectoModelo';
import { guardarScriptActual } from '../store/controlador';
import { useApp } from '../store/useApp';
import { sonidoEncaje } from '../audio';
import { useT } from '../i18n';

type Eleccion = { personaje: string; variante: 0 | 1 };

/**
 * Biblioteca de personajes. Sirve para dos cosas: agregar un actor nuevo, o agregar un disfraz
 * al actor elegido (en ese caso cada personaje ofrece sus dos variantes). A la derecha hay
 * una vista previa grande de lo que se va a agregar.
 */
export function BibliotecaPersonajes() {
  const t = useT();
  useIconos();
  const abierta = useApp((s) => s.bibliotecaAbierta);
  const modo = useApp((s) => s.bibliotecaModo);
  const abrir = useApp((s) => s.abrirBiblioteca);
  const decir = useApp((s) => s.decir);
  const cantidad = useProyecto((s) => s.actores.length);
  const seleccionado = useProyecto((s) => s.seleccionado);
  const cuantosDisfraces = useProyecto(
    (s) => s.actores.find((a) => a.id === s.seleccionado)?.disfraces.length ?? 0,
  );
  const cerrar = useRef<HTMLButtonElement>(null);
  const [elegido, setElegido] = useState<Eleccion>({ personaje: PERSONAJES[0].id, variante: 0 });

  useEffect(() => {
    if (!abierta) return;
    setElegido({ personaje: PERSONAJES[0].id, variante: 0 });
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && abrir(false);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, abrir]);

  const nombreDe = (id: string) => PERSONAJES.find((p) => p.id === id)?.nombre ?? id;
  const lleno = modo === 'actor' ? cantidad >= MAX_ACTORES : cuantosDisfraces >= MAX_DISFRACES;

  const agregar = (e: Eleccion = elegido) => {
    guardarScriptActual();
    const nombre = nombreDe(e.personaje);
    if (modo === 'actor') {
      if (useProyecto.getState().agregarActor(e.personaje)) {
        decir('biblioteca.unio', { nombre });
        sonidoEncaje();
      }
    } else {
      const puesto = useProyecto.getState().agregarDisfraz(seleccionado, e);
      if (puesto) {
        decir('disfraz.agregado', { nombre: puesto });
        sonidoEncaje();
      }
    }
    abrir(false);
  };

  // En modo disfraz cada personaje ofrece sus dos variantes; en modo actor, una sola entrada.
  const opciones: Eleccion[] = PERSONAJES.flatMap((p) =>
    modo === 'disfraz'
      ? ([0, 1] as const).map((variante) => ({ personaje: p.id, variante }))
      : [{ personaje: p.id, variante: 0 as const }],
  );

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
            className="tarjeta max-h-[92vh] w-full max-w-3xl overflow-y-auto p-5"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="titulo-biblioteca" className="titulo m-0 text-2xl font-extrabold">
                {t(modo === 'actor' ? 'biblioteca.titulo' : 'biblioteca.tituloDisfraz')}
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
            {lleno ? (
              <p className="m-0 font-bold">
                {modo === 'actor'
                  ? t('biblioteca.maximo', { max: MAX_ACTORES })
                  : t('disfraz.maximo', { max: MAX_DISFRACES })}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
                <ul className="m-0 grid max-h-[26rem] list-none grid-cols-2 gap-2.5 overflow-y-auto p-1 sm:grid-cols-3">
                  {opciones.map((o) => {
                    const activo =
                      o.personaje === elegido.personaje && o.variante === elegido.variante;
                    return (
                      <li key={`${o.personaje}:${o.variante}`}>
                        <button
                          type="button"
                          className="tarjeta-boton w-full"
                          aria-pressed={activo}
                          onClick={() => setElegido(o)}
                          onDoubleClick={() => agregar(o)}
                        >
                          <img
                            src={uriPersonaje(o.personaje, o.variante)}
                            alt=""
                            width={84}
                            height={84}
                          />
                          <span className="titulo text-base font-extrabold">
                            {nombreDe(o.personaje)}
                            {modo === 'disfraz' && ` ${o.variante + 1}`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--borde)] bg-[var(--fondo)]/60 p-3 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--texto-suave)]">
                    {t('biblioteca.vistaPrevia')}
                  </span>
                  <motion.img
                    key={`${elegido.personaje}:${elegido.variante}`}
                    src={uriPersonaje(elegido.personaje, elegido.variante)}
                    alt=""
                    width={176}
                    height={176}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  />
                  <span className="titulo text-xl font-extrabold">
                    {nombreDe(elegido.personaje)}
                    {modo === 'disfraz' && ` ${elegido.variante + 1}`}
                  </span>
                  <button type="button" className="btn mt-auto w-full" onClick={() => agregar()}>
                    {t(modo === 'actor' ? 'biblioteca.agregarActor' : 'biblioteca.agregarDisfraz')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
