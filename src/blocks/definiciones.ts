import * as Blockly from 'blockly';
import { MENSAJES, NOTAS, OPCIONES_FONDOS, SONIDOS, TECLAS } from './opciones';

/**
 * Definición de los bloques de Kody.
 * Los campos numéricos son entradas con "sombra" para poder encajar otros bloques encima.
 */

const num = (name: string) => ({ type: 'input_value', name, check: 'Number' });
const txt = (name: string) => ({ type: 'input_value', name, check: ['String', 'Number'] });
const cualquiera = (name: string) => ({ type: 'input_value', name, check: ['Number', 'String'] });
const bool = (name: string) => ({ type: 'input_value', name, check: 'Boolean' });
const lista = (name: string, options: [string, string][]) => ({
  type: 'field_dropdown',
  name,
  options,
});
const aqui = { type: 'input_dummy' };
const cuerpo = (name = 'CUERPO') => ({ type: 'input_statement', name });

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
  {
    type: 'ap_fondo',
    message0: 'cambiar escenario a %1',
    args0: [lista('FONDO', OPCIONES_FONDOS)],
    ...pila,
    style: 'apariencia',
    tooltip: 'Cambia el fondo del escenario.',
  },

  // ---------- Sonido ----------
  {
    type: 'son_tocar',
    message0: 'tocar sonido %1',
    args0: [lista('SONIDO', SONIDOS)],
    ...pila,
    style: 'sonido',
    tooltip: 'Reproduce un efecto de sonido.',
  },
  {
    type: 'son_nota',
    message0: 'tocar nota %1 por %2 seg',
    args0: [lista('NOTA', NOTAS), num('SEG')],
    ...pila,
    style: 'sonido',
    tooltip: 'Toca una nota musical.',
  },

  // ---------- Eventos (los que no son sombrero) ----------
  {
    type: 'ev_enviar',
    message0: 'enviar mensaje %1',
    args0: [lista('MENSAJE', MENSAJES)],
    ...pila,
    style: 'eventos',
    tooltip: 'Avisa a todos los actores.',
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
    args0: [num('VECES'), aqui, cuerpo()],
    ...pila,
    style: 'control',
    tooltip: 'Repite los bloques de adentro.',
  },
  {
    type: 'ctrl_por_siempre',
    message0: 'por siempre %1 %2',
    args0: [aqui, cuerpo()],
    previousStatement: null,
    style: 'control',
    tooltip: 'Repite sin parar hasta que presiones ■.',
  },
  {
    type: 'ctrl_repetir_hasta',
    message0: 'repetir hasta que %1 %2 %3',
    args0: [bool('COND'), aqui, cuerpo()],
    ...pila,
    style: 'control',
    tooltip: 'Repite hasta que se cumpla la condición.',
  },
  {
    type: 'ctrl_si',
    message0: 'si %1 entonces %2 %3',
    args0: [bool('COND'), aqui, cuerpo()],
    ...pila,
    style: 'control',
    tooltip: 'Hace algo solo si se cumple la condición.',
  },
  {
    type: 'ctrl_si_sino',
    message0: 'si %1 entonces %2 %3 si no %4 %5',
    args0: [bool('COND'), aqui, cuerpo(), aqui, cuerpo('CUERPO_SINO')],
    ...pila,
    style: 'control',
    tooltip: 'Elige entre dos caminos.',
  },
  {
    type: 'ctrl_esperar_hasta',
    message0: 'esperar hasta que %1',
    args0: [bool('COND')],
    ...pila,
    style: 'control',
    tooltip: 'Espera a que se cumpla la condición.',
  },
  {
    type: 'ctrl_detener',
    message0: 'detener todo',
    previousStatement: null,
    style: 'control',
    tooltip: 'Detiene todos los programas.',
  },

  // ---------- Sensores ----------
  {
    type: 'sen_tecla',
    message0: '¿tecla %1 presionada?',
    args0: [lista('TECLA', TECLAS)],
    output: 'Boolean',
    style: 'sensores',
    tooltip: 'Es verdadero mientras sostienes la tecla.',
  },
  {
    type: 'sen_borde',
    message0: '¿tocando el borde?',
    output: 'Boolean',
    style: 'sensores',
    tooltip: 'Es verdadero si llegó al borde del escenario.',
  },
  {
    type: 'sen_x',
    message0: 'posición x',
    output: 'Number',
    style: 'sensores',
    tooltip: 'Dónde está, de lado a lado.',
  },
  {
    type: 'sen_y',
    message0: 'posición y',
    output: 'Number',
    style: 'sensores',
    tooltip: 'Dónde está, de arriba a abajo.',
  },
  {
    type: 'sen_dir',
    message0: 'dirección',
    output: 'Number',
    style: 'sensores',
    tooltip: 'Hacia dónde mira, en grados.',
  },

  // ---------- Operadores ----------
  {
    type: 'op_suma',
    message0: '%1 + %2',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
    tooltip: 'Suma.',
  },
  {
    type: 'op_resta',
    message0: '%1 − %2',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
    tooltip: 'Resta.',
  },
  {
    type: 'op_mult',
    message0: '%1 × %2',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
    tooltip: 'Multiplica.',
  },
  {
    type: 'op_div',
    message0: '%1 ÷ %2',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
    tooltip: 'Divide.',
  },
  {
    type: 'op_aleatorio',
    message0: 'número al azar entre %1 y %2',
    args0: [num('DESDE'), num('HASTA')],
    output: 'Number',
    style: 'operadores',
    tooltip: 'Elige un número al azar.',
  },
  {
    type: 'cmp_mayor',
    message0: '%1 > %2',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'Boolean',
    style: 'operadores',
    tooltip: '¿El primero es mayor?',
  },
  {
    type: 'cmp_menor',
    message0: '%1 < %2',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'Boolean',
    style: 'operadores',
    tooltip: '¿El primero es menor?',
  },
  {
    type: 'cmp_igual',
    message0: '%1 = %2',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'Boolean',
    style: 'operadores',
    tooltip: '¿Son iguales?',
  },
  {
    type: 'op_y',
    message0: '%1 y %2',
    args0: [bool('A'), bool('B')],
    output: 'Boolean',
    style: 'operadores',
    tooltip: 'Verdadero si se cumplen las dos.',
  },
  {
    type: 'op_o',
    message0: '%1 o %2',
    args0: [bool('A'), bool('B')],
    output: 'Boolean',
    style: 'operadores',
    tooltip: 'Verdadero si se cumple al menos una.',
  },
  {
    type: 'op_no',
    message0: 'no %1',
    args0: [bool('A')],
    output: 'Boolean',
    style: 'operadores',
    tooltip: 'Cambia verdadero por falso.',
  },
];

/** Bloque sombrero con "gorro" (zelos dibuja el gorro con hat = 'cap'). */
function sombrero(definicion: object) {
  return {
    init(this: Blockly.Block) {
      this.jsonInit({ nextStatement: null, style: 'eventos', ...definicion });
      (this as unknown as { hat: string }).hat = 'cap';
    },
  };
}

/** Quién da la lista de actores para "¿tocando a …?" (la configura la aplicación). */
let proveedorActores: () => [string, string][] = () => [];
export function configurarActores(fn: () => [string, string][]) {
  proveedorActores = fn;
}

/** Quién da los nombres de variables y listas del proyecto (los configura la aplicación). */
let proveedorDatos = {
  variables: (): string[] => [],
  listas: (): string[] => [],
};
export function configurarDatos(p: typeof proveedorDatos) {
  proveedorDatos = p;
}
export const nombresDe = (tipo: 'variable' | 'lista') =>
  tipo === 'variable' ? proveedorDatos.variables() : proveedorDatos.listas();

type Parte =
  | string
  | { dato: 'variable' | 'lista'; name: string }
  | { entrada: string; check?: string | string[] };

const VACIO: [string, string] = ['(crea una primero)', ''];

/** Define un bloque que mezcla texto, nombres de variables/listas y casillas para encajar valores. */
function bloqueDato(
  tipo: string,
  estilo: 'variables' | 'listas',
  partes: Parte[],
  forma: 'pila' | 'numero' | 'texto' | 'logico',
  ayuda: string,
) {
  Blockly.Blocks[tipo] = {
    init(this: Blockly.Block) {
      type Pendiente = { campo: string | Blockly.Field; nombre?: string };
      let pendientes: Pendiente[] = [];
      const poner = (entrada: Blockly.Input) => {
        for (const f of pendientes) entrada.appendField(f.campo as never, f.nombre);
        pendientes = [];
      };
      for (const p of partes) {
        if (typeof p === 'string') pendientes.push({ campo: p });
        else if ('dato' in p) {
          const quien = p.dato;
          pendientes.push({
            nombre: p.name,
            campo: new Blockly.FieldDropdown(() => {
              const o = nombresDe(quien).map((n): [string, string] => [n, n]);
              return o.length ? o : [VACIO];
            }),
          });
        } else {
          const entrada = this.appendValueInput(p.entrada);
          if (p.check) entrada.setCheck(p.check);
          poner(entrada);
        }
      }
      if (pendientes.length) poner(this.appendDummyInput());
      this.setInputsInline(true);
      if (forma === 'pila') {
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      } else {
        this.setOutput(
          true,
          forma === 'numero' ? ['Number', 'String'] : forma === 'logico' ? 'Boolean' : 'String',
        );
      }
      this.setStyle(estilo);
      this.setTooltip(ayuda);
    },
  };
}

let registrado = false;

/** Registra todos los bloques (idempotente). */
export function registrarBloques() {
  if (registrado) return;
  registrado = true;
  Blockly.common.defineBlocksWithJsonArray(bloques);

  Blockly.Blocks['evento_al_ejecutar'] = sombrero({
    message0: 'al hacer clic en ▶',
    tooltip: 'Aquí empieza tu programa.',
  });
  Blockly.Blocks['evento_tecla'] = sombrero({
    message0: 'al presionar la tecla %1',
    args0: [lista('TECLA', TECLAS)],
    tooltip: 'Se ejecuta cuando presionas esa tecla.',
  });
  Blockly.Blocks['evento_clic_actor'] = sombrero({
    message0: 'al hacer clic en este actor',
    tooltip: 'Se ejecuta cuando tocas al actor en el escenario.',
  });
  Blockly.Blocks['evento_mensaje'] = sombrero({
    message0: 'al recibir %1',
    args0: [lista('MENSAJE', MENSAJES)],
    tooltip: 'Se ejecuta cuando otro actor envía ese mensaje.',
  });

  const V = (name = 'VAR') => ({ dato: 'variable' as const, name });
  const L = (name = 'LISTA') => ({ dato: 'lista' as const, name });
  const e = (entrada: string, check?: string | string[]) => ({ entrada, check });
  const ANY = ['Number', 'String'];
  bloqueDato('var_valor', 'variables', [V()], 'numero', 'El valor de la variable.');
  bloqueDato(
    'var_fijar',
    'variables',
    ['fijar', V(), 'a', e('VALOR', ANY)],
    'pila',
    'Guarda un valor en la variable.',
  );
  bloqueDato(
    'var_cambiar',
    'variables',
    ['cambiar', V(), 'en', e('N', 'Number')],
    'pila',
    'Suma (o resta) a la variable.',
  );
  bloqueDato(
    'var_mostrar',
    'variables',
    ['mostrar variable', V()],
    'pila',
    'La muestra en el escenario.',
  );
  bloqueDato(
    'var_ocultar',
    'variables',
    ['ocultar variable', V()],
    'pila',
    'La esconde del escenario.',
  );
  bloqueDato(
    'lis_valor',
    'listas',
    [L()],
    'texto',
    'Todos los elementos de la lista, separados por espacios.',
  );
  bloqueDato(
    'lis_agregar',
    'listas',
    ['agregar', e('ITEM', ANY), 'a', L()],
    'pila',
    'Pone un elemento al final de la lista.',
  );
  bloqueDato(
    'lis_borrar',
    'listas',
    ['borrar el elemento', e('N', 'Number'), 'de', L()],
    'pila',
    'Quita un elemento de la lista.',
  );
  bloqueDato('lis_borrar_todo', 'listas', ['borrar todo de', L()], 'pila', 'Deja la lista vacía.');
  bloqueDato(
    'lis_insertar',
    'listas',
    ['insertar', e('ITEM', ANY), 'en la posición', e('N', 'Number'), 'de', L()],
    'pila',
    'Mete un elemento en un lugar de la lista.',
  );
  bloqueDato(
    'lis_reemplazar',
    'listas',
    ['reemplazar el elemento', e('N', 'Number'), 'de', L(), 'con', e('ITEM', ANY)],
    'pila',
    'Cambia un elemento de la lista.',
  );
  bloqueDato(
    'lis_elemento',
    'listas',
    ['elemento', e('N', 'Number'), 'de', L()],
    'numero',
    'Lee un elemento. El primero es el 1.',
  );
  bloqueDato(
    'lis_posicion',
    'listas',
    ['posición de', e('ITEM', ANY), 'en', L()],
    'numero',
    'Dice en qué lugar está (0 si no está).',
  );
  bloqueDato(
    'lis_longitud',
    'listas',
    ['longitud de', L()],
    'numero',
    'Cuántos elementos tiene la lista.',
  );
  bloqueDato(
    'lis_contiene',
    'listas',
    [L(), 'contiene', e('ITEM', ANY)],
    'logico',
    '¿Está ese elemento en la lista?',
  );
  bloqueDato(
    'lis_mostrar',
    'listas',
    ['mostrar lista', L()],
    'pila',
    'La muestra en el escenario.',
  );
  bloqueDato('lis_ocultar', 'listas', ['ocultar lista', L()], 'pila', 'La esconde del escenario.');

  Blockly.Blocks['sen_tocando'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('¿tocando a')
        .appendField(
          new Blockly.FieldDropdown(() => {
            const o = proveedorActores();
            return o.length ? o : [['(no hay otros actores)', '']];
          }),
          'ACTOR',
        )
        .appendField('?');
      this.setOutput(true, 'Boolean');
      this.setStyle('sensores');
      this.setTooltip('Es verdadero si choca con ese actor.');
    },
  };
}
