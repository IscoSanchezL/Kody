import { fondoPorId, personajePorId } from './biblioteca';
import { alDataUri } from './disfraces';
import { iconoListo, solicitarIconos } from './iconos3d';

/** Direcciones de imagen (data URI) de los dibujos, guardadas para no recalcularlas. */
const cache = new Map<string, string>();

function memo(clave: string, crear: () => string) {
  let v = cache.get(clave);
  if (!v) {
    v = crear();
    cache.set(clave, v);
  }
  return v;
}

/**
 * Imagen de un personaje: la generada desde su modelo 3D si ya está lista; mientras tanto
 * (o si el equipo no puede dibujar 3D) se usa el dibujo plano de la biblioteca.
 */
export function uriPersonaje(id: string, disfraz: number) {
  solicitarIconos();
  return (
    iconoListo(id, disfraz) ??
    memo(`p:${id}:${disfraz % 2}`, () => alDataUri(personajePorId(id).svg((disfraz % 2) as 0 | 1)))
  );
}

/** ¿La imagen que devuelve `uriPersonaje` ya es la de 3D? (sirve para claves de caché) */
export const esIcono3D = (id: string, disfraz: number) => iconoListo(id, disfraz) !== undefined;

export const uriFondo = (id: string) => memo(`f:${id}`, () => alDataUri(fondoPorId(id).svg));
