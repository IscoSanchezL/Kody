import { fondoPorId, personajePorId } from './biblioteca';
import { alDataUri } from './disfraces';

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

export const uriPersonaje = (id: string, disfraz: number) =>
  memo(`p:${id}:${disfraz % 2}`, () => alDataUri(personajePorId(id).svg((disfraz % 2) as 0 | 1)));

export const uriFondo = (id: string) => memo(`f:${id}`, () => alDataUri(fondoPorId(id).svg));
