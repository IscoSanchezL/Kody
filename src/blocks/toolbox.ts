import { CATEGORIAS, type IdCategoria } from './categorias';
import { nombresDe } from './definiciones';

/** Entrada numérica con "sombra": el niño puede escribir el número o encajar otro bloque. */
const n = (valor: number) => ({ shadow: { type: 'math_number', fields: { NUM: valor } } });
const t = (valor: string) => ({ shadow: { type: 'text', fields: { TEXT: valor } } });
const bloque = (type: string, inputs?: Record<string, unknown>) => ({
  kind: 'block',
  type,
  ...(inputs ? { inputs } : {}),
});

const contenido: Partial<Record<IdCategoria, object[]>> = {
  variables: [],
  listas: [],
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
    bloque('ap_decir', { TEXTO: t('¡Hola!') }),
    bloque('ap_decir_seg', { TEXTO: t('¡Hola!'), SEG: n(2) }),
    bloque('ap_pensar', { TEXTO: t('Mmm...') }),
    bloque('ap_pensar_seg', { TEXTO: t('Mmm...'), SEG: n(2) }),
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
  ],
  sensores: [
    bloque('sen_tecla'),
    bloque('sen_borde'),
    bloque('sen_tocando'),
    bloque('sen_x'),
    bloque('sen_y'),
    bloque('sen_dir'),
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
  ],
};

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
    { kind: 'button', text: '➕ Crear una variable', callbackKey: 'KODY_CREAR_VARIABLE' },
    ...(nombres.length
      ? [{ kind: 'button', text: '🗑 Borrar una variable', callbackKey: 'KODY_BORRAR_VARIABLE' }]
      : []),
  ];
  if (!nombres.length)
    return [...botones, { kind: 'label', text: 'Crea una variable para guardar puntos, vidas...' }];
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
    { kind: 'button', text: '➕ Crear una lista', callbackKey: 'KODY_CREAR_LISTA' },
    ...(nombres.length
      ? [{ kind: 'button', text: '🗑 Borrar una lista', callbackKey: 'KODY_BORRAR_LISTA' }]
      : []),
  ];
  if (!nombres.length)
    return [...botones, { kind: 'label', text: 'Crea una lista para guardar varios datos.' }];
  const p = nombres[0];
  return [
    ...botones,
    ...nombres.map((x) => campo('lis_valor', x)),
    campo('lis_agregar', p, { ITEM: t('cosa') }),
    campo('lis_borrar', p, { N: n(1) }),
    campo('lis_borrar_todo', p),
    campo('lis_insertar', p, { ITEM: t('cosa'), N: n(1) }),
    campo('lis_reemplazar', p, { N: n(1), ITEM: t('cosa') }),
    campo('lis_elemento', p, { N: n(1) }),
    campo('lis_posicion', p, { ITEM: t('cosa') }),
    campo('lis_longitud', p),
    campo('lis_contiene', p, { ITEM: t('cosa') }),
    campo('lis_mostrar', p),
    campo('lis_ocultar', p),
  ];
}

const ORDEN: IdCategoria[] = [
  'eventos',
  'movimiento',
  'apariencia',
  'sonido',
  'control',
  'sensores',
  'operadores',
  'variables',
  'listas',
];

/** Toolbox por categorías; solo muestra las que ya tienen bloques. */
export function crearToolbox(permitidas?: IdCategoria[]) {
  const ids = ORDEN.filter((id) => contenido[id] && (!permitidas || permitidas.includes(id)));
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
          : { contents: contenido[id] }),
    })),
  };
}
