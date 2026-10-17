import { CATEGORIAS, type IdCategoria } from './categorias';
import { t as tr } from '../i18n';
import { nombresDe } from './definiciones';

/** Entrada numérica con "sombra": el niño puede escribir el número o encajar otro bloque. */
const n = (valor: number) => ({ shadow: { type: 'math_number', fields: { NUM: valor } } });
const txt = (valor: string) => ({ shadow: { type: 'text', fields: { TEXT: valor } } });
const bloque = (type: string, inputs?: Record<string, unknown>) => ({
  kind: 'block',
  type,
  ...(inputs ? { inputs } : {}),
});

/** Bloques de cada categoría. Es una función: las muestras de texto salen en el idioma actual. */
const contenido = (): Partial<Record<IdCategoria, object[]>> => ({
  variables: [],
  listas: [],
  mis_bloques: [],
  lapiz: [
    bloque('lap_bajar'),
    bloque('lap_subir'),
    bloque('lap_color'),
    bloque('lap_grosor', { N: n(2) }),
    bloque('lap_cambiar_grosor', { N: n(1) }),
    bloque('lap_borrar'),
    bloque('lap_sellar'),
  ],
  eventos: [
    bloque('evento_al_ejecutar'),
    bloque('evento_tecla'),
    bloque('evento_clic_actor'),
    bloque('evento_mensaje'),
    bloque('ev_enviar'),
  ],
  movimiento: [
    bloque('mov_mover', { PASOS: n(50) }),
    bloque('mov_girar_der', { GRADOS: n(90) }),
    bloque('mov_girar_izq', { GRADOS: n(90) }),
    bloque('mov_apuntar', { DIR: n(90) }),
    bloque('mov_ir_a', { X: n(0), Y: n(0) }),
    bloque('mov_deslizar', { SEG: n(1), X: n(100), Y: n(50) }),
    bloque('mov_cambiar_x', { N: n(10) }),
    bloque('mov_cambiar_y', { N: n(10) }),
    bloque('mov_rebotar'),
  ],
  apariencia: [
    bloque('ap_decir', { TEXTO: txt(tr('tb.hola')) }),
    bloque('ap_decir_seg', { TEXTO: txt(tr('tb.hola')), SEG: n(2) }),
    bloque('ap_pensar', { TEXTO: txt(tr('tb.mmm')) }),
    bloque('ap_pensar_seg', { TEXTO: txt(tr('tb.mmm')), SEG: n(2) }),
    bloque('ap_sig_disfraz'),
    bloque('ap_cambiar_tamano', { N: n(10) }),
    bloque('ap_fijar_tamano', { N: n(100) }),
    bloque('ap_mostrar'),
    bloque('ap_ocultar'),
    bloque('ap_fondo'),
  ],
  sonido: [bloque('son_tocar'), bloque('son_nota', { SEG: n(0.5) })],
  control: [
    bloque('ctrl_esperar', { SEG: n(1) }),
    bloque('ctrl_repetir', { VECES: n(10) }),
    bloque('ctrl_por_siempre'),
    bloque('ctrl_repetir_hasta'),
    bloque('ctrl_si'),
    bloque('ctrl_si_sino'),
    bloque('ctrl_esperar_hasta'),
    bloque('ctrl_detener'),
    bloque('evento_clon'),
    bloque('clon_crear'),
    bloque('clon_borrar'),
  ],
  sensores: [
    bloque('sen_tecla'),
    bloque('sen_borde'),
    bloque('sen_tocando'),
    bloque('sen_x'),
    bloque('sen_y'),
    bloque('sen_dir'),
    bloque('sen_distancia'),
    bloque('sen_raton_x'),
    bloque('sen_raton_y'),
    bloque('sen_raton_abajo'),
    bloque('sen_preguntar', { TEXTO: txt(tr('tb.nombrePregunta')) }),
    bloque('sen_respuesta'),
    bloque('sen_temporizador'),
    bloque('sen_reiniciar_temporizador'),
  ],
  operadores: [
    bloque('op_suma', { A: n(1), B: n(1) }),
    bloque('op_resta', { A: n(1), B: n(1) }),
    bloque('op_mult', { A: n(2), B: n(2) }),
    bloque('op_div', { A: n(10), B: n(2) }),
    bloque('op_aleatorio', { DESDE: n(1), HASTA: n(10) }),
    bloque('cmp_mayor', { A: n(50), B: n(10) }),
    bloque('cmp_menor', { A: n(10), B: n(50) }),
    bloque('cmp_igual', { A: n(10), B: n(10) }),
    bloque('op_y'),
    bloque('op_o'),
    bloque('op_no'),
    bloque('op_resto', { A: n(10), B: n(3) }),
    bloque('op_redondear', { A: n(3.6) }),
    bloque('op_funcion', { A: n(16) }),
    bloque('op_unir', { A: txt(tr('tb.holaEspacio')), B: txt(tr('tb.mundo')) }),
    bloque('op_letra', { N: n(1), TEXTO: txt('Kody') }),
    bloque('op_longitud_texto', { A: txt('Kody') }),
    bloque('op_contiene_texto', { A: txt('Kody'), B: txt('K') }),
  ],
});

const campo = (type: string, nombre: string, extra?: Record<string, unknown>) => ({
  kind: 'block',
  type,
  fields: { [type.startsWith('var_') ? 'VAR' : 'LISTA']: nombre },
  ...(extra ? { inputs: extra } : {}),
});

/** Bloques de la paleta "Variables": botones para crear/borrar y un bloque por cada variable. */
export function contenidoVariables(): object[] {
  const nombres = nombresDe('variable');
  const botones = [
    { kind: 'button', text: tr('tb.crearVariable'), callbackKey: 'KODY_CREAR_VARIABLE' },
    ...(nombres.length
      ? [{ kind: 'button', text: tr('tb.borrarVariable'), callbackKey: 'KODY_BORRAR_VARIABLE' }]
      : []),
  ];
  if (!nombres.length) return [...botones, { kind: 'label', text: tr('tb.vacioVariables') }];
  const p = nombres[0];
  return [
    ...botones,
    ...nombres.map((n) => campo('var_valor', n)),
    campo('var_fijar', p, { VALOR: n(0) }),
    campo('var_cambiar', p, { N: n(1) }),
    campo('var_mostrar', p),
    campo('var_ocultar', p),
  ];
}

/** Bloques de la paleta "Listas". */
export function contenidoListas(): object[] {
  const nombres = nombresDe('lista');
  const botones = [
    { kind: 'button', text: tr('tb.crearLista'), callbackKey: 'KODY_CREAR_LISTA' },
    ...(nombres.length
      ? [{ kind: 'button', text: tr('tb.borrarLista'), callbackKey: 'KODY_BORRAR_LISTA' }]
      : []),
  ];
  if (!nombres.length) return [...botones, { kind: 'label', text: tr('tb.vacioListas') }];
  const p = nombres[0];
  return [
    ...botones,
    ...nombres.map((x) => campo('lis_valor', x)),
    campo('lis_agregar', p, { ITEM: txt(tr('tb.cosa')) }),
    campo('lis_borrar', p, { N: n(1) }),
    campo('lis_borrar_todo', p),
    campo('lis_insertar', p, { ITEM: txt(tr('tb.cosa')), N: n(1) }),
    campo('lis_reemplazar', p, { N: n(1), ITEM: txt(tr('tb.cosa')) }),
    campo('lis_elemento', p, { N: n(1) }),
    campo('lis_posicion', p, { ITEM: txt(tr('tb.cosa')) }),
    campo('lis_longitud', p),
    campo('lis_contiene', p, { ITEM: txt(tr('tb.cosa')) }),
    campo('lis_mostrar', p),
    campo('lis_ocultar', p),
  ];
}

/** Paleta "Mis bloques": crear uno y, por cada bloque definido en este actor, su llamada y sus parámetros. */
export function contenidoMisBloques(espacio: {
  getBlocksByType: (tipo: string) => { nombre?: string; params?: string[] }[];
}): object[] {
  const definidos = espacio
    .getBlocksByType('fun_definir')
    .map((b) => ({ nombre: String(b.nombre ?? ''), params: (b.params ?? []).map(String) }))
    .filter((d) => d.nombre);
  const botones = [
    { kind: 'button', text: tr('tb.crearBloque'), callbackKey: 'KODY_CREAR_BLOQUE' },
  ];
  if (!definidos.length) return [...botones, { kind: 'label', text: tr('tb.vacioBloques') }];
  const llamadas = definidos.map((d) => ({
    kind: 'block',
    type: 'fun_llamar',
    extraState: { nombre: d.nombre, params: d.params },
    inputs: Object.fromEntries(d.params.map((_, i) => [`ARG${i + 1}`, n(10)])),
  }));
  const nombresParam = [...new Set(definidos.flatMap((d) => d.params))];
  const parametros = nombresParam.map((nombre) => ({
    kind: 'block',
    type: 'fun_param',
    extraState: { nombre, params: [] },
  }));
  return [...botones, ...llamadas, ...parametros];
}

const ORDEN: IdCategoria[] = [
  'eventos',
  'movimiento',
  'apariencia',
  'sonido',
  'lapiz',
  'control',
  'sensores',
  'operadores',
  'variables',
  'listas',
  'mis_bloques',
];

/** Toolbox por categorías; solo muestra las que ya tienen bloques. */
export function crearToolbox(permitidas?: IdCategoria[]) {
  const todo = contenido();
  const ids = ORDEN.filter((id) => todo[id] && (!permitidas || permitidas.includes(id)));
  return {
    kind: 'categoryToolbox',
    contents: ids.map((id) => ({
      kind: 'category',
      name: `${CATEGORIAS[id].icono}  ${CATEGORIAS[id].nombre}`,
      categorystyle: id,
      ...(id === 'variables'
        ? { custom: 'KODY_VARIABLES' }
        : id === 'listas'
          ? { custom: 'KODY_LISTAS' }
          : id === 'mis_bloques'
            ? { custom: 'KODY_MIS_BLOQUES' }
            : { contents: todo[id] }),
    })),
  };
}
