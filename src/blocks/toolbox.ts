import { CATEGORIAS, type IdCategoria } from './categorias';

/** Entrada numérica con "sombra": el niño puede escribir el número o encajar otro bloque. */
const n = (valor: number) => ({ shadow: { type: 'math_number', fields: { NUM: valor } } });
const t = (valor: string) => ({ shadow: { type: 'text', fields: { TEXT: valor } } });
const bloque = (type: string, inputs?: Record<string, unknown>) => ({
  kind: 'block',
  type,
  ...(inputs ? { inputs } : {}),
});

const contenido: Partial<Record<IdCategoria, object[]>> = {
  eventos: [bloque('evento_al_ejecutar')],
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
  ],
  control: [
    bloque('ctrl_esperar', { SEG: n(1) }),
    bloque('ctrl_repetir', { VECES: n(10) }),
    bloque('ctrl_por_siempre'),
  ],
  operadores: [bloque('op_aleatorio', { DESDE: n(1), HASTA: n(10) })],
};

/** Toolbox por categorías; solo muestra las que ya tienen bloques. */
export function crearToolbox(permitidas?: IdCategoria[]) {
  const ids = (Object.keys(contenido) as IdCategoria[]).filter(
    (id) => !permitidas || permitidas.includes(id),
  );
  return {
    kind: 'categoryToolbox',
    contents: ids.map((id) => ({
      kind: 'category',
      name: `${CATEGORIAS[id].icono}  ${CATEGORIAS[id].nombre}`,
      categorystyle: id,
      contents: contenido[id],
    })),
  };
}
