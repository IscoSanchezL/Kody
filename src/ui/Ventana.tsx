import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, type ReactNode } from 'react';

/** Ventana flotante accesible (se cierra con Esc o tocando fuera). */
export function Ventana({
  abierta,
  titulo,
  alCerrar,
  children,
  ancho = 'max-w-md',
}: {
  abierta: boolean;
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
  ancho?: string;
}) {
  const idTitulo = useId();
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierta) return;
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, alCerrar]);

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && alCerrar()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className={`tarjeta w-full ${ancho} p-5`}
            initial={{ scale: 0.94, y: 14 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id={idTitulo} className="titulo m-0 text-2xl font-extrabold">
                {titulo}
              </h2>
              <button
                ref={cerrar}
                type="button"
                className="btn btn-suave"
                onClick={alCerrar}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
