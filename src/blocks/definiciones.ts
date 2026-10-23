import * as Blockly from 'blockly';
import { t, tDinamica } from '../i18n';
import {
  opcionesColoresLapiz,
  opcionesFecha,
  opcionesFondos,
  opcionesPropiedad,
  opcionesFunciones,
  opcionesModoDisfraz,
  opcionesMensajes,
  opcionesNotas,
  opcionesInstrumentos,
  opcionesTeclas,
} from './opciones';

/**
 * Definición de los bloques de Kody.
 * Los campos numéricos son entradas con "sombra" para poder encajar otros bloques encima.
 * Los textos no están aquí: cada bloque lee su etiqueta (`b.<tipo>`) y su ayuda (`b.<tipo>.ayuda`)
 * del diccionario de idiomas al crearse, así que el editor se rehace al cambiar de idioma.
 */

const num = (name: string) => ({ type: 'input_value', name, check: 'Number' });
const txt = (name: string) => ({ type: 'input_value', name, check: ['String', 'Number'] });
const cualquiera = (name: string) => ({ type: 'input_value', name, check: ['Number', 'String'] });
const bool = (name: string) => ({ type: 'input_value', name, check: 'Boolean' });
/** Lista desplegable: las opciones se piden al crear el bloque, ya traducidas. */
const lista = (name: string, options: () => [string, string][]) => ({
  type: 'field_dropdown',
  name,
  options,
});
const aqui = { type: 'input_dummy' };
const cuerpo = (name = 'CUERPO') => ({ type: 'input_statement', name });

const pila = { previousStatement: null, nextStatement: null };

/** A dónde ir / hacia dónde apuntar: un lugar al azar, el ratón o un actor del proyecto. */
const objetivos = (conAzar: boolean): [string, string][] => [
  ...(conAzar ? ([[t('op.azar'), '__azar__']] as [string, string][]) : []),
  [t('op.raton'), '__raton__'],
  ...proveedorActores(),
];

const bloques = [
  // ---------- Lápiz ----------
  {
    type: 'lap_bajar',
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_subir',
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_tono',
    args0: [num('N')],
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_cambiar_tono',
    args0: [num('N')],
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_color',
    args0: [lista('COLOR', opcionesColoresLapiz)],
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_grosor',
    args0: [num('N')],
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_cambiar_grosor',
    args0: [num('N')],
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_borrar',
    ...pila,
    style: 'lapiz',
  },
  {
    type: 'lap_sellar',
    ...pila,
    style: 'lapiz',
  },
  // ---------- Clones ----------
  {
    type: 'clon_borrar',
    previousStatement: null,
    style: 'control',
  },
  // ---------- Movimiento ----------
  {
    type: 'mov_mover',
    args0: [num('PASOS')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_girar_der',
    args0: [num('GRADOS')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_girar_izq',
    args0: [num('GRADOS')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_apuntar',
    args0: [num('DIR')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_ir_a',
    args0: [num('X'), num('Y')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_deslizar',
    args0: [num('SEG'), num('X'), num('Y')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_ir_a_obj',
    args0: [lista('OBJ', () => objetivos(true))],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_deslizar_obj',
    args0: [num('SEG'), lista('OBJ', () => objetivos(true))],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_apuntar_obj',
    args0: [lista('OBJ', () => objetivos(false))],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_fijar_x',
    args0: [num('N')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_fijar_y',
    args0: [num('N')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_cambiar_x',
    args0: [num('N')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_cambiar_y',
    args0: [num('N')],
    ...pila,
    style: 'movimiento',
  },
  {
    type: 'mov_rebotar',
    ...pila,
    style: 'movimiento',
  },

  // ---------- Apariencia ----------
  {
    type: 'ap_decir',
    args0: [txt('TEXTO')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_decir_seg',
    args0: [txt('TEXTO'), num('SEG')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_pensar',
    args0: [txt('TEXTO')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_pensar_seg',
    args0: [txt('TEXTO'), num('SEG')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_sig_disfraz',
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_disfraz_num',
    args0: [lista('MODO', opcionesModoDisfraz)],
    output: ['Number', 'String'],
    style: 'apariencia',
  },
  {
    type: 'ap_cambiar_tamano',
    args0: [num('N')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_fijar_tamano',
    args0: [num('N')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_mostrar',
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_ocultar',
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_fondo',
    args0: [lista('FONDO', opcionesFondos)],
    ...pila,
    style: 'apariencia',
  },

  {
    type: 'ap_sig_fondo',
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_transparencia_fijar',
    args0: [num('N')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_transparencia_cambiar',
    args0: [num('N')],
    ...pila,
    style: 'apariencia',
  },
  {
    type: 'ap_tamano',
    output: 'Number',
    style: 'apariencia',
  },
  {
    type: 'ap_fondo_num',
    output: 'Number',
    style: 'apariencia',
  },
  // ---------- Sonido ----------
  {
    type: 'son_detener',
    ...pila,
    style: 'sonido',
  },
  {
    type: 'son_silencio',
    args0: [num('SEG')],
    ...pila,
    style: 'sonido',
  },
  {
    type: 'son_instrumento',
    args0: [lista('INSTRUMENTO', opcionesInstrumentos)],
    ...pila,
    style: 'sonido',
  },
  {
    type: 'son_volumen_cambiar',
    args0: [num('N')],
    ...pila,
    style: 'sonido',
  },
  {
    type: 'son_volumen_fijar',
    args0: [num('N')],
    ...pila,
    style: 'sonido',
  },
  {
    type: 'son_volumen',
    output: 'Number',
    style: 'sonido',
  },
  {
    type: 'son_nota',
    args0: [lista('NOTA', opcionesNotas), num('SEG')],
    ...pila,
    style: 'sonido',
  },

  // ---------- Eventos (los que no son sombrero) ----------
  {
    type: 'ev_enviar',
    args0: [lista('MENSAJE', opcionesMensajes)],
    ...pila,
    style: 'eventos',
  },
  {
    type: 'ev_enviar_espera',
    args0: [lista('MENSAJE', opcionesMensajes)],
    ...pila,
    style: 'eventos',
  },

  // ---------- Control ----------
  {
    type: 'ctrl_esperar',
    args0: [num('SEG')],
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_repetir',
    args0: [num('VECES'), aqui, cuerpo()],
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_por_siempre',
    args0: [aqui, cuerpo()],
    previousStatement: null,
    style: 'control',
  },
  {
    type: 'ctrl_repetir_hasta',
    args0: [bool('COND'), aqui, cuerpo()],
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_si',
    args0: [bool('COND'), aqui, cuerpo()],
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_si_sino',
    args0: [bool('COND'), aqui, cuerpo(), aqui, cuerpo('CUERPO_SINO')],
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_esperar_hasta',
    args0: [bool('COND')],
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_detener_este',
    previousStatement: null,
    style: 'control',
  },
  {
    type: 'ctrl_detener_otros',
    ...pila,
    style: 'control',
  },
  {
    type: 'ctrl_detener',
    previousStatement: null,
    style: 'control',
  },

  // ---------- Sensores ----------
  {
    type: 'sen_tecla',
    args0: [lista('TECLA', opcionesTeclas)],
    output: 'Boolean',
    style: 'sensores',
  },
  {
    type: 'sen_borde',
    output: 'Boolean',
    style: 'sensores',
  },
  {
    type: 'sen_x',
    output: 'Number',
    style: 'sensores',
  },
  {
    type: 'sen_y',
    output: 'Number',
    style: 'sensores',
  },
  {
    type: 'sen_dir',
    output: 'Number',
    style: 'sensores',
  },

  // ---------- Operadores ----------
  {
    type: 'op_suma',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_resta',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_mult',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_div',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_aleatorio',
    args0: [num('DESDE'), num('HASTA')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'sen_preguntar',
    args0: [txt('TEXTO')],
    ...pila,
    style: 'sensores',
  },
  {
    type: 'sen_respuesta',
    output: 'String',
    style: 'sensores',
  },
  {
    type: 'sen_raton_x',
    output: 'Number',
    style: 'sensores',
  },
  {
    type: 'sen_raton_y',
    output: 'Number',
    style: 'sensores',
  },
  {
    type: 'sen_tocando_raton',
    output: 'Boolean',
    style: 'sensores',
  },
  {
    type: 'sen_fecha',
    args0: [lista('FECHA', opcionesFecha)],
    output: 'Number',
    style: 'sensores',
  },
  {
    type: 'sen_raton_abajo',
    output: 'Boolean',
    style: 'sensores',
  },
  {
    type: 'sen_temporizador',
    output: 'Number',
    style: 'sensores',
  },
  {
    type: 'sen_reiniciar_temporizador',
    ...pila,
    style: 'sensores',
  },
  {
    type: 'op_unir',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'String',
    style: 'operadores',
  },
  {
    type: 'op_letra',
    args0: [num('N'), txt('TEXTO')],
    output: 'String',
    style: 'operadores',
  },
  {
    type: 'op_longitud_texto',
    args0: [txt('A')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_contiene_texto',
    args0: [txt('A'), txt('B')],
    output: 'Boolean',
    style: 'operadores',
  },
  {
    type: 'op_resto',
    args0: [num('A'), num('B')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_redondear',
    args0: [num('A')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'op_funcion',
    args0: [lista('FUNC', opcionesFunciones), num('A')],
    output: 'Number',
    style: 'operadores',
  },
  {
    type: 'cmp_mayor',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'Boolean',
    style: 'operadores',
  },
  {
    type: 'cmp_menor',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'Boolean',
    style: 'operadores',
  },
  {
    type: 'cmp_igual',
    args0: [cualquiera('A'), cualquiera('B')],
    output: 'Boolean',
    style: 'operadores',
  },
  {
    type: 'op_y',
    args0: [bool('A'), bool('B')],
    output: 'Boolean',
    style: 'operadores',
  },
  {
    type: 'op_o',
    args0: [bool('A'), bool('B')],
    output: 'Boolean',
    style: 'operadores',
  },
  {
    type: 'op_no',
    args0: [bool('A')],
    output: 'Boolean',
    style: 'operadores',
  },
];

type Def = Record<string, unknown> & { type: string };

/** Resuelve lo que depende del idioma: etiqueta, ayuda y opciones de las listas desplegables. */
function traducir(def: Def): object {
  const args0 = (def.args0 as { options?: unknown }[] | undefined)?.map((a) =>
    typeof a.options === 'function' ? { ...a, options: (a.options as () => unknown)() } : a,
  );
  return {
    ...def,
    message0: tDinamica(`b.${def.type}`),
    tooltip: tDinamica(`b.${def.type}.ayuda`),
    ...(args0 ? { args0 } : {}),
  };
}

/** Bloque sombrero con "gorro" (zelos dibuja el gorro con hat = 'cap'). */
function sombrero(def: Def) {
  return {
    init(this: Blockly.Block) {
      this.jsonInit(traducir({ nextStatement: null, style: 'eventos', ...def }));
      (this as unknown as { hat: string }).hat = 'cap';
    },
  };
}

/** Quién da la lista de actores para "¿tocando a …?" (la configura la aplicación). */
let proveedorActores: () => [string, string][] = () => [];
export function configurarActores(fn: () => [string, string][]) {
  proveedorActores = fn;
}

/** Quién da los sonidos del actor que se está editando (los configura la aplicación). */
let proveedorSonidos: () => string[] = () => [];
export function configurarSonidos(fn: () => string[]) {
  proveedorSonidos = fn;
}

/** Quién da los nombres de los disfraces del actor que se está editando (la configura la aplicación). */
let proveedorDisfraces: () => string[] = () => [];
export function configurarDisfraces(fn: () => string[]) {
  proveedorDisfraces = fn;
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
  { dato: 'variable' | 'lista'; name: string } | { entrada: string; check?: string | string[] };

/** Define un bloque que mezcla texto, nombres de variables/listas y casillas para encajar valores.
 *  El texto sale del diccionario (`b.<tipo>`) con marcas %1, %2… que apuntan a `partes`. */
function bloqueDato(
  tipo: string,
  estilo: 'variables' | 'listas',
  partes: Parte[],
  forma: 'pila' | 'numero' | 'texto' | 'logico',
) {
  Blockly.Blocks[tipo] = {
    init(this: Blockly.Block) {
      type Pendiente = { campo: string | Blockly.Field; nombre?: string };
      let pendientes: Pendiente[] = [];
      const poner = (entrada: Blockly.Input) => {
        for (const f of pendientes) entrada.appendField(f.campo as never, f.nombre);
        pendientes = [];
      };
      for (const trozo of tDinamica(`b.${tipo}`).split(/(%\d)/)) {
        const marca = /^%(\d)$/.exec(trozo);
        if (!marca) {
          const texto = trozo.trim();
          if (texto) pendientes.push({ campo: texto });
          continue;
        }
        const p = partes[Number(marca[1]) - 1];
        if (!p) continue;
        if ('dato' in p) {
          const quien = p.dato;
          pendientes.push({
            nombre: p.name,
            campo: new Blockly.FieldDropdown(() => {
              const o = nombresDe(quien).map((n): [string, string] => [n, n]);
              return o.length ? o : [[t('op.vacio'), '']];
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
      this.setTooltip(tDinamica(`b.${tipo}.ayuda`));
    },
  };
}

let registrado = false;

/** Registra todos los bloques (idempotente). Los textos se leen al crear cada bloque. */
export function registrarBloques() {
  if (registrado) return;
  registrado = true;
  for (const def of bloques as Def[]) {
    Blockly.Blocks[def.type] = {
      init(this: Blockly.Block) {
        this.jsonInit(traducir(def));
      },
    };
  }

  Blockly.Blocks['evento_al_ejecutar'] = sombrero({ type: 'evento_al_ejecutar' });
  Blockly.Blocks['evento_tecla'] = sombrero({
    type: 'evento_tecla',
    args0: [lista('TECLA', opcionesTeclas)],
  });
  Blockly.Blocks['evento_clic_actor'] = sombrero({ type: 'evento_clic_actor' });
  Blockly.Blocks['evento_clon'] = sombrero({ type: 'evento_clon', style: 'control' });
  Blockly.Blocks['evento_cuando'] = sombrero({
    type: 'evento_cuando',
    args0: [bool('COND')],
  });
  Blockly.Blocks['evento_fondo'] = sombrero({
    type: 'evento_fondo',
    args0: [lista('FONDO', opcionesFondos)],
  });
  Blockly.Blocks['evento_mensaje'] = sombrero({
    type: 'evento_mensaje',
    args0: [lista('MENSAJE', opcionesMensajes)],
  });

  const V = (name = 'VAR') => ({ dato: 'variable' as const, name });
  const L = (name = 'LISTA') => ({ dato: 'lista' as const, name });
  const e = (entrada: string, check?: string | string[]) => ({ entrada, check });
  const ANY = ['Number', 'String'];
  bloqueDato('var_valor', 'variables', [V()], 'numero');
  bloqueDato('var_fijar', 'variables', [V(), e('VALOR', ANY)], 'pila');
  bloqueDato('var_cambiar', 'variables', [V(), e('N', 'Number')], 'pila');
  bloqueDato('var_mostrar', 'variables', [V()], 'pila');
  bloqueDato('var_ocultar', 'variables', [V()], 'pila');
  bloqueDato('lis_valor', 'listas', [L()], 'texto');
  bloqueDato('lis_agregar', 'listas', [e('ITEM', ANY), L()], 'pila');
  bloqueDato('lis_borrar', 'listas', [e('N', 'Number'), L()], 'pila');
  bloqueDato('lis_borrar_todo', 'listas', [L()], 'pila');
  bloqueDato('lis_insertar', 'listas', [e('ITEM', ANY), e('N', 'Number'), L()], 'pila');
  bloqueDato('lis_reemplazar', 'listas', [e('N', 'Number'), L(), e('ITEM', ANY)], 'pila');
  bloqueDato('lis_elemento', 'listas', [e('N', 'Number'), L()], 'numero');
  bloqueDato('lis_posicion', 'listas', [e('ITEM', ANY), L()], 'numero');
  bloqueDato('lis_longitud', 'listas', [L()], 'numero');
  bloqueDato('lis_contiene', 'listas', [L(), e('ITEM', ANY)], 'logico');
  bloqueDato('lis_mostrar', 'listas', [L()], 'pila');
  bloqueDato('lis_ocultar', 'listas', [L()], 'pila');

  /** Pone una lista desplegable de actores en el lugar de %1 del texto del bloque. */
  const conDesplegable = (b: Blockly.Block, tipo: string, campo: Blockly.Field, nombre: string) => {
    const fila = b.appendDummyInput();
    for (const trozo of tDinamica(`b.${tipo}`).split(/(%1)/)) {
      if (trozo === '%1') fila.appendField(campo, nombre);
      else if (trozo.trim()) fila.appendField(trozo.trim());
    }
  };

  // "tocar sonido": la lista ofrece los sonidos que tiene el actor.
  for (const tipo of ['son_tocar', 'son_tocar_espera']) {
    Blockly.Blocks[tipo] = {
      init(this: Blockly.Block) {
        conDesplegable(
          this,
          tipo,
          new Blockly.FieldDropdown(() => {
            const ids = proveedorSonidos();
            return ids.length
              ? ids.map((id): [string, string] => [tDinamica(`sonido.${id}`), id])
              : [[t('op.vacio'), '']];
          }),
          'SONIDO',
        );
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setStyle('sonido');
        this.setTooltip(tDinamica(`b.${tipo}.ayuda`));
      },
    };
  }

  Blockly.Blocks['ap_disfraz_a'] = {
    init(this: Blockly.Block) {
      conDesplegable(
        this,
        'ap_disfraz_a',
        new Blockly.FieldDropdown(() => {
          const nombres = proveedorDisfraces();
          return nombres.length
            ? nombres.map((n): [string, string] => [n, n])
            : [[t('op.vacio'), '']];
        }),
        'DISFRAZ',
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('apariencia');
      this.setTooltip(t('b.ap_disfraz_a.ayuda'));
    },
  };

  Blockly.Blocks['clon_crear'] = {
    init(this: Blockly.Block) {
      conDesplegable(
        this,
        'clon_crear',
        new Blockly.FieldDropdown(() => [[t('op.yo'), '__yo__'], ...proveedorActores()]),
        'ACTOR',
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('control');
      this.setTooltip(t('b.clon_crear.ayuda'));
    },
  };

  // ----- Mis bloques: funciones propias con hasta 3 parámetros -----
  type EstadoFun = { nombre: string; params: string[] };
  const conEstado = (cuerpo: (b: Blockly.Block & EstadoFun) => void) => ({
    nombre: '',
    params: [] as string[],
    saveExtraState(this: EstadoFun): EstadoFun {
      return { nombre: this.nombre, params: this.params };
    },
    loadExtraState(this: Blockly.Block & EstadoFun & { armar: () => void }, e: Partial<EstadoFun>) {
      this.nombre = String(e?.nombre ?? '');
      this.params = (e?.params ?? []).slice(0, 3).map(String);
      this.armar();
    },
    init(this: Blockly.Block & EstadoFun & { armar: () => void }) {
      this.armar = () => cuerpo(this);
      this.armar();
    },
  });
  Blockly.Blocks['fun_definir'] = conEstado((b) => {
    if (b.getInput('CAB')) b.removeInput('CAB');
    const fila = b
      .appendDummyInput('CAB')
      .appendField(t('b.fun_definir'))
      .appendField(new Blockly.FieldLabel(b.nombre || '…'));
    if (b.params.length) {
      fila.appendField(t('b.fun_definir.con'));
      for (const p of b.params) fila.appendField(new Blockly.FieldLabel(`⟨${p}⟩`));
    }
    b.setNextStatement(true);
    b.setStyle('mis_bloques');
    (b as unknown as { hat: string }).hat = 'cap';
    b.setTooltip(t('b.fun_definir.ayuda'));
  });
  Blockly.Blocks['fun_llamar'] = conEstado((b) => {
    for (const i of [...b.inputList]) b.removeInput(i.name);
    if (!b.params.length) b.appendDummyInput('CAB').appendField(b.nombre || '…');
    b.params.forEach((p, i) => {
      const e = b.appendValueInput(`ARG${i + 1}`).setCheck(['Number', 'String']);
      if (i === 0) e.appendField(b.nombre || '…');
      e.appendField(p);
    });
    b.setInputsInline(true);
    b.setPreviousStatement(true);
    b.setNextStatement(true);
    b.setStyle('mis_bloques');
    b.setTooltip(t('b.fun_llamar.ayuda'));
  });
  Blockly.Blocks['fun_param'] = conEstado((b) => {
    for (const i of [...b.inputList]) b.removeInput(i.name);
    b.appendDummyInput('CAB').appendField(new Blockly.FieldLabel(b.nombre || '…'));
    b.setOutput(true, ['Number', 'String']);
    b.setStyle('mis_bloques');
    b.setTooltip(t('b.fun_param.ayuda'));
  });

  Blockly.Blocks['sen_distancia'] = {
    init(this: Blockly.Block) {
      conDesplegable(
        this,
        'sen_distancia',
        new Blockly.FieldDropdown(() => [[t('op.raton'), '__raton__'], ...proveedorActores()]),
        'ACTOR',
      );
      this.setOutput(true, 'Number');
      this.setStyle('sensores');
      this.setTooltip(t('b.sen_distancia.ayuda'));
    },
  };

  // "[x] de [actor]": una propiedad de otro actor.
  Blockly.Blocks['sen_de'] = {
    init(this: Blockly.Block) {
      this.jsonInit({
        message0: tDinamica('b.sen_de'),
        args0: [
          { type: 'field_dropdown', name: 'PROP', options: opcionesPropiedad() },
          {
            type: 'field_dropdown',
            name: 'ACTOR',
            options: (() => {
              const o = proveedorActores();
              return o.length ? o : [[t('op.sinActores'), '']];
            }) as never,
          },
        ],
        output: 'Number',
        style: 'sensores',
        tooltip: tDinamica('b.sen_de.ayuda'),
      });
    },
  };

  Blockly.Blocks['sen_tocando'] = {
    init(this: Blockly.Block) {
      conDesplegable(
        this,
        'sen_tocando',
        new Blockly.FieldDropdown(() => {
          const o = proveedorActores();
          return o.length ? o : [[t('op.sinActores'), '']];
        }),
        'ACTOR',
      );
      this.setOutput(true, 'Boolean');
      this.setStyle('sensores');
      this.setTooltip(t('b.sen_tocando.ayuda'));
    },
  };
}
