import * as Blockly from 'blockly';

/**
 * Definición de los bloques de Kody (Fase 1).
 * Los campos numéricos son entradas con "sombra" para poder encajar otros bloques encima.
 */

const num = (name: string) => ({ type: 'input_value', name, check: 'Number' });
const txt = (name: string) => ({ type: 'input_value', name, check: ['String', 'Number'] });

const pila = { previousStatement: null, nextStatement: null };

const bloques = [
  // ---------- Movimiento ----------
  {
    type: 'mov_mover',
    message0: 'mover %1 pasos',
    args0: [num('PASOS')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Mueve al actor hacia donde mira.',
  },
  {
    type: 'mov_girar_der',
    message0: 'girar ↻ %1 grados',
    args0: [num('GRADOS')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Gira a la derecha.',
  },
  {
    type: 'mov_girar_izq',
    message0: 'girar ↺ %1 grados',
    args0: [num('GRADOS')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Gira a la izquierda.',
  },
  {
    type: 'mov_apuntar',
    message0: 'apuntar hacia %1 °',
    args0: [num('DIR')],
    ...pila,
    style: 'movimiento',
    tooltip: '90 = derecha, 0 = arriba, 180 = abajo, -90 = izquierda.',
  },
  {
    type: 'mov_ir_a',
    message0: 'ir a x: %1 y: %2',
    args0: [num('X'), num('Y')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Salta a un lugar del escenario.',
  },
  {
    type: 'mov_deslizar',
    message0: 'deslizar en %1 seg a x: %2 y: %3',
    args0: [num('SEG'), num('X'), num('Y')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Se desliza suavemente hasta un lugar.',
  },
  {
    type: 'mov_cambiar_x',
    message0: 'sumar %1 a x',
    args0: [num('N')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Mueve a los lados.',
  },
  {
    type: 'mov_cambiar_y',
    message0: 'sumar %1 a y',
    args0: [num('N')],
    ...pila,
    style: 'movimiento',
    tooltip: 'Mueve hacia arriba o abajo.',
  },
  {
    type: 'mov_rebotar',
    message0: 'rebotar si toca el borde',
    ...pila,
    style: 'movimiento',
    tooltip: 'Rebota si llega al borde del escenario.',
  },

  // ---------- Apariencia ----------
  {
    type: 'ap_decir',
    message0: 'decir %1',
    args0: [txt('TEXTO')],
    ...pila,
    style: 'apariencia',
    tooltip: 'Muestra un globo de texto.',
  },
  {
    type: 'ap_decir_seg',
    message0: 'decir %1 durante %2 seg',
    args0: [txt('TEXTO'), num('SEG')],
    ...pila,
    style: 'apariencia',
    tooltip: 'Habla por un rato.',
  },
  {
    type: 'ap_pensar',
    message0: 'pensar %1',
    args0: [txt('TEXTO')],
    ...pila,
    style: 'apariencia',
    tooltip: 'Muestra un pensamiento.',
  },
  {
    type: 'ap_pensar_seg',
    message0: 'pensar %1 durante %2 seg',
    args0: [txt('TEXTO'), num('SEG')],
    ...pila,
    style: 'apariencia',
    tooltip: 'Piensa por un rato.',
  },
  {
    type: 'ap_sig_disfraz',
    message0: 'siguiente disfraz',
    ...pila,
    style: 'apariencia',
    tooltip: 'Cambia la ropa del actor.',
  },
  {
    type: 'ap_cambiar_tamano',
    message0: 'cambiar tamaño en %1',
    args0: [num('N')],
    ...pila,
    style: 'apariencia',
    tooltip: 'Hace más grande o más pequeño.',
  },
  {
    type: 'ap_fijar_tamano',
    message0: 'fijar tamaño a %1 %',
    args0: [num('N')],
    ...pila,
    style: 'apariencia',
    tooltip: '100 es el tamaño normal.',
  },
  {
    type: 'ap_mostrar',
    message0: 'mostrar',
    ...pila,
    style: 'apariencia',
    tooltip: 'Hace visible al actor.',
  },
  {
    type: 'ap_ocultar',
    message0: 'ocultar',
    ...pila,
    style: 'apariencia',
    tooltip: 'Esconde al actor.',
  },

  // ---------- Control ----------
  {
    type: 'ctrl_esperar',
    message0: 'esperar %1 seg',
    args0: [num('SEG')],
    ...pila,
    style: 'control',
    tooltip: 'Hace una pausa.',
  },
  {
    type: 'ctrl_repetir',
    message0: 'repetir %1 veces %2 %3',
    args0: [num('VECES'), { type: 'input_dummy' }, { type: 'input_statement', name: 'CUERPO' }],
    ...pila,
    style: 'control',
    tooltip: 'Repite los bloques de adentro.',
  },
  {
    type: 'ctrl_por_siempre',
    message0: 'por siempre %1 %2',
    args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'CUERPO' }],
    previousStatement: null,
    style: 'control',
    tooltip: 'Repite sin parar hasta que presiones ■.',
  },

  // ---------- Operadores ----------
  {
    type: 'op_aleatorio',
    message0: 'número al azar entre %1 y %2',
    args0: [num('DESDE'), num('HASTA')],
    output: 'Number',
    style: 'operadores',
    tooltip: 'Elige un número al azar.',
  },
];

/** Bloque sombrero con "gorro" (zelos dibuja el gorro con hat = 'cap'). */
const sombrero = {
  init(this: Blockly.Block) {
    this.jsonInit({
      type: 'evento_al_ejecutar',
      message0: 'al hacer clic en ▶',
      nextStatement: null,
      style: 'eventos',
      tooltip: 'Aquí empieza tu programa.',
    });
    (this as unknown as { hat: string }).hat = 'cap';
  },
};

let registrado = false;

/** Registra todos los bloques (idempotente). */
export function registrarBloques() {
  if (registrado) return;
  registrado = true;
  Blockly.common.defineBlocksWithJsonArray(bloques);
  Blockly.Blocks['evento_al_ejecutar'] = sombrero;
}
