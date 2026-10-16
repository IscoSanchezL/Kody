/** Reglas para crear un bloque propio ("Mis bloques"). Puro: se prueba sin navegador. */

export const MAX_LARGO_BLOQUE = 20;
export const MAX_LARGO_PARAM = 12;
export const MAX_PARAMS = 3;

const limpiar = (t: string) => t.trim().replace(/\s+/g, ' ');

export interface BloquePropio {
  nombre: string;
  params: string[];
}

/** Devuelve el bloque limpio, o un mensaje amable si no se puede crear. */
export function validarBloquePropio(
  nombre: string,
  params: string[],
  existentes: string[],
): { ok: true; bloque: BloquePropio } | { ok: false; mensaje: string } {
  const n = limpiar(nombre);
  if (!n) return { ok: false, mensaje: 'Escribe un nombre para tu bloque.' };
  if (n.length > MAX_LARGO_BLOQUE)
    return { ok: false, mensaje: `El nombre puede tener hasta ${MAX_LARGO_BLOQUE} letras.` };
  if (existentes.some((e) => e.toLowerCase() === n.toLowerCase()))
    return { ok: false, mensaje: 'Ya tienes un bloque con ese nombre.' };
  const ps = params.map(limpiar).filter(Boolean);
  if (ps.length > MAX_PARAMS)
    return { ok: false, mensaje: `Un bloque puede recibir hasta ${MAX_PARAMS} datos.` };
  if (ps.some((p) => p.length > MAX_LARGO_PARAM))
    return { ok: false, mensaje: `Cada dato puede tener hasta ${MAX_LARGO_PARAM} letras.` };
  if (new Set(ps.map((p) => p.toLowerCase())).size !== ps.length)
    return { ok: false, mensaje: 'Los datos no pueden llamarse igual.' };
  return { ok: true, bloque: { nombre: n, params: ps } };
}
