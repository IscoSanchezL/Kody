import { t } from '../i18n';

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
  if (!n) return { ok: false, mensaje: t('bp.errNombre') };
  if (n.length > MAX_LARGO_BLOQUE)
    return { ok: false, mensaje: t('bp.errLargo', { max: MAX_LARGO_BLOQUE }) };
  if (existentes.some((e) => e.toLowerCase() === n.toLowerCase()))
    return { ok: false, mensaje: t('bp.errRepetido') };
  const ps = params.map(limpiar).filter(Boolean);
  if (ps.length > MAX_PARAMS) return { ok: false, mensaje: t('bp.errParams', { max: MAX_PARAMS }) };
  if (ps.some((p) => p.length > MAX_LARGO_PARAM))
    return { ok: false, mensaje: t('bp.errParamLargo', { max: MAX_LARGO_PARAM }) };
  if (new Set(ps.map((p) => p.toLowerCase())).size !== ps.length)
    return { ok: false, mensaje: t('bp.errParamRepetido') };
  return { ok: true, bloque: { nombre: n, params: ps } };
}
