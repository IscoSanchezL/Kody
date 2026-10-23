import { FONDOS } from '../stage/biblioteca';
import { tDinamica } from '../i18n';

/**
 * Opciones de las listas desplegables de los bloques.
 * Son funciones: las etiquetas se traducen al crear cada bloque; los valores (lo que se guarda
 * en los proyectos) no cambian nunca.
 */

type Opciones = [string, string][];
const traducir = (prefijo: string, valores: string[]): Opciones =>
  valores.map((v) => [tDinamica(`${prefijo}.${v}`), v]);

export const opcionesTeclas = (): Opciones => [
  ...traducir('tecla', ['espacio', 'arriba', 'abajo', 'izquierda', 'derecha']),
  ['w', 'w'],
  ['a', 'a'],
  ['s', 's'],
  ['d', 'd'],
];

export const opcionesMensajes = (): Opciones =>
  traducir('mensaje', ['hola', 'vamos', 'ganaste', 'perdiste', 'm1', 'm2']);

export const opcionesNotas = (): Opciones =>
  traducir('nota', ['60', '62', '64', '65', '67', '69', '71', '72']);

export const opcionesSonidos = (): Opciones =>
  traducir('sonido', ['pop', 'boing', 'ding', 'laser', 'tambor', 'aplauso']);

export const opcionesModoDisfraz = (): Opciones => traducir('disfrazmodo', ['num', 'nombre']);

export const opcionesFondos = (): Opciones => FONDOS.map((f) => [f.nombre, f.id]);

export const opcionesFunciones = (): Opciones =>
  traducir('func', ['abs', 'raiz', 'piso', 'techo', 'sen', 'cos']);

/** Traduce una tecla del teclado al nombre usado en los bloques (o null si no se usa). */
export function teclaABloque(e: { key: string }): string | null {
  switch (e.key) {
    case ' ':
      return 'espacio';
    case 'ArrowUp':
      return 'arriba';
    case 'ArrowDown':
      return 'abajo';
    case 'ArrowLeft':
      return 'izquierda';
    case 'ArrowRight':
      return 'derecha';
  }
  const k = e.key.toLowerCase();
  return ['w', 'a', 's', 'd'].includes(k) ? k : null;
}

/** Colores del lápiz: la etiqueta lleva un emoji para reconocerlos aunque no se vean bien. */
export const opcionesColoresLapiz = (): Opciones => [
  [tDinamica('color.rojo'), '#dc2626'],
  [tDinamica('color.naranja'), '#ea580c'],
  [tDinamica('color.amarillo'), '#eab308'],
  [tDinamica('color.verde'), '#16a34a'],
  [tDinamica('color.azul'), '#2563eb'],
  [tDinamica('color.morado'), '#7c3aed'],
  [tDinamica('color.negro'), '#111827'],
  [tDinamica('color.blanco'), '#f8fafc'],
];
