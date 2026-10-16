import { FONDOS } from '../stage/biblioteca';

/** Opciones de las listas desplegables de los bloques. */

export const TECLAS: [string, string][] = [
  ['espacio', 'espacio'],
  ['↑ flecha arriba', 'arriba'],
  ['↓ flecha abajo', 'abajo'],
  ['← flecha izquierda', 'izquierda'],
  ['→ flecha derecha', 'derecha'],
  ['w', 'w'],
  ['a', 'a'],
  ['s', 's'],
  ['d', 'd'],
];

export const MENSAJES: [string, string][] = [
  ['¡hola!', 'hola'],
  ['¡vamos!', 'vamos'],
  ['¡ganaste!', 'ganaste'],
  ['¡perdiste!', 'perdiste'],
  ['mensaje 1', 'm1'],
  ['mensaje 2', 'm2'],
];

export const NOTAS: [string, string][] = [
  ['Do', '60'],
  ['Re', '62'],
  ['Mi', '64'],
  ['Fa', '65'],
  ['Sol', '67'],
  ['La', '69'],
  ['Si', '71'],
  ['Do agudo', '72'],
];

export const SONIDOS: [string, string][] = [
  ['pop', 'pop'],
  ['boing', 'boing'],
  ['ding', 'ding'],
  ['láser', 'laser'],
  ['tambor', 'tambor'],
  ['aplauso', 'aplauso'],
];

export const OPCIONES_FONDOS: [string, string][] = FONDOS.map((f) => [f.nombre, f.id]);

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
export const COLORES_LAPIZ: [string, string][] = [
  ['🔴 rojo', '#dc2626'],
  ['🟠 naranja', '#ea580c'],
  ['🟡 amarillo', '#eab308'],
  ['🟢 verde', '#16a34a'],
  ['🔵 azul', '#2563eb'],
  ['🟣 morado', '#7c3aed'],
  ['⚫ negro', '#111827'],
  ['⚪ blanco', '#f8fafc'],
];
