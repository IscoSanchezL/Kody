import { AnimatePresence, motion } from 'framer-motion';
import { uriPersonaje } from '../stage/uris';
import { useIconos } from './useIconos';
import { useApp } from '../store/useApp';

/** Kody, la mascota guía: muestra pistas y celebra con un globo de texto. */
export function Mascota() {
  useIconos();
  const mensaje = useApp((s) => s.mensaje);
  const id = useApp((s) => s.mensajeId);
  const corriendo = useApp((s) => s.modo !== 'detenido');
  const variante = corriendo ? 1 : 0;

  return (
    <div className="flex items-end gap-3" aria-live="polite">
      <motion.img
        src={uriPersonaje('kody', variante)}
        alt="Kody, tu guía"
        width={84}
        height={84}
        className="shrink-0"
        animate={corriendo ? { y: [0, -8, 0] } : { y: 0 }}
        transition={corriendo ? { repeat: Infinity, duration: 0.6 } : {}}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={id}
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative m-0 flex-1 rounded-2xl border-[3px] border-[var(--borde)] bg-[var(--panel)] px-4 py-3 text-base font-bold leading-snug"
        >
          {mensaje}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
