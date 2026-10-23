/** Tamaños del panel del escenario (columna derecha). Puro: se prueba sin navegador. */

export const ANCHO_NORMAL = 544;
export const ANCHO_GRANDE = 736;
export const ANCHO_MIN = 300;
/** Lo mínimo que debe quedar para el editor de bloques. */
export const ANCHO_MIN_EDITOR = 360;
/** Lo que se mueve con cada flecha del teclado. */
export const PASO_ANCHO = 24;

/** Ajusta el ancho pedido a lo que cabe en el contenedor (nunca deja el editor demasiado angosto). */
export function limitarAncho(px: number, contenedor: number): number {
  const max = Math.max(ANCHO_MIN, contenedor - ANCHO_MIN_EDITOR - 24);
  return Math.round(Math.min(max, Math.max(ANCHO_MIN, px)));
}
