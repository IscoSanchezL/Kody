import type { Expr, OpBinaria, OpUnaria, Programa, Sentencia } from './tipos';

/**
 * Compilador: JSON de Blockly (serialization.workspaces.save) -> programas.
 * Trabaja sobre JSON plano, así se puede probar sin navegador.
 */

interface BloqueJSON {
  type: string;
  id?: string;
  fields?: Record<string, unknown>;
  /** Estado propio de los bloques de "Mis bloques": nombre y nombres de sus parámetros. */
  extraState?: { nombre?: string; params?: string[] };
  inputs?: Record<string, { block?: BloqueJSON; shadow?: BloqueJSON }>;
  next?: { block?: BloqueJSON };
}

interface EspacioJSON {
  blocks?: { blocks?: BloqueJSON[] };
}

/** Bloques sombrero reconocidos (inician un programa). */
export const SOMBREROS = new Set([
  'evento_al_ejecutar',
  'evento_tecla',
  'evento_clic_actor',
  'evento_mensaje',
  'evento_clon',
  'fun_definir',
]);

let contadorId = 0;
const idDe = (b: BloqueJSON) => b.id ?? `anon-${++contadorId}`;

const camposDe = (b: BloqueJSON): Record<string, string> => {
  const campos = Object.fromEntries(
    Object.entries(b.fields ?? {}).map(([k, v]) => [k, String(v ?? '')]),
  );
  // Mis bloques: el nombre y los parámetros viajan en el estado extra del bloque.
  if (b.extraState?.nombre !== undefined) {
    campos.NOMBRE = String(b.extraState.nombre);
    (b.extraState.params ?? []).slice(0, 3).forEach((p, i) => (campos[`P${i + 1}`] = String(p)));
  }
  return campos;
};

const BINARIOS: Record<string, OpBinaria> = {
  op_suma: '+',
  op_resta: '-',
  op_mult: '*',
  op_div: '/',
  cmp_mayor: '>',
  cmp_menor: '<',
  cmp_igual: '=',
  op_y: 'y',
  op_o: 'o',
  op_aleatorio: 'azar',
  op_resto: 'resto',
  op_unir: 'unir',
  op_contiene_texto: 'contiene',
};

const UNARIOS: Record<string, OpUnaria> = {
  op_redondear: 'redondear',
  op_longitud_texto: 'longitud',
};

/** Convierte un bloque de valor en una expresión. */
function compilarExpr(b: BloqueJSON | undefined): Expr {
  if (!b) return { tipo: 'num', valor: 0 };
  const un = UNARIOS[b.type];
  if (un) return { tipo: 'un', op: un, a: compilarEntrada(b, 'A') };
  const op = BINARIOS[b.type];
  if (op) {
    // op_aleatorio usa DESDE/HASTA; los demás usan A/B
    const [na, nb] = b.type === 'op_aleatorio' ? ['DESDE', 'HASTA'] : ['A', 'B'];
    return { tipo: 'bin', op, a: compilarEntrada(b, na), b: compilarEntrada(b, nb) };
  }
  switch (b.type) {
    case 'math_number':
      return { tipo: 'num', valor: Number(b.fields?.NUM ?? 0) || 0 };
    case 'text':
      return { tipo: 'txt', valor: String(b.fields?.TEXT ?? '') };
    case 'op_no':
      return { tipo: 'no', a: compilarEntrada(b, 'A') };
    case 'sen_tecla':
      return { tipo: 'sensor', nombre: 'tecla', param: String(b.fields?.TECLA ?? '') };
    case 'sen_tocando':
      return { tipo: 'sensor', nombre: 'tocando', param: String(b.fields?.ACTOR ?? '') };
    case 'sen_borde':
      return { tipo: 'sensor', nombre: 'borde' };
    case 'sen_x':
      return { tipo: 'sensor', nombre: 'x' };
    case 'sen_y':
      return { tipo: 'sensor', nombre: 'y' };
    case 'sen_dir':
      return { tipo: 'sensor', nombre: 'dir' };
    case 'op_funcion':
      return {
        tipo: 'un',
        op: (['abs', 'raiz', 'piso', 'techo', 'sen', 'cos'].includes(String(b.fields?.FUNC))
          ? b.fields?.FUNC
          : 'abs') as OpUnaria,
        a: compilarEntrada(b, 'A'),
      };
    case 'op_letra':
      return {
        tipo: 'bin',
        op: 'letra',
        a: compilarEntrada(b, 'N'),
        b: compilarEntrada(b, 'TEXTO'),
      };
    case 'ap_disfraz_num':
      return {
        tipo: 'sensor',
        nombre: b.fields?.MODO === 'nombre' ? 'disfraz-nombre' : 'disfraz-num',
      };
    case 'son_volumen':
      return { tipo: 'sensor', nombre: 'volumen' };
    case 'sen_respuesta':
      return { tipo: 'sensor', nombre: 'respuesta' };
    case 'sen_raton_x':
      return { tipo: 'sensor', nombre: 'raton-x' };
    case 'sen_raton_y':
      return { tipo: 'sensor', nombre: 'raton-y' };
    case 'sen_raton_abajo':
      return { tipo: 'sensor', nombre: 'raton-abajo' };
    case 'sen_temporizador':
      return { tipo: 'sensor', nombre: 'temporizador' };
    case 'sen_distancia':
      return { tipo: 'sensor', nombre: 'distancia', param: String(b.fields?.ACTOR ?? '') };
    case 'fun_param':
      return { tipo: 'param', nombre: String(b.extraState?.nombre ?? '') };
    case 'var_valor':
      return { tipo: 'var', nombre: String(b.fields?.VAR ?? '') };
    case 'lis_valor':
      return { tipo: 'lis', op: 'texto', lista: String(b.fields?.LISTA ?? '') };
    case 'lis_longitud':
      return { tipo: 'lis', op: 'longitud', lista: String(b.fields?.LISTA ?? '') };
    case 'lis_elemento':
      return {
        tipo: 'lis',
        op: 'elemento',
        lista: String(b.fields?.LISTA ?? ''),
        a: compilarEntrada(b, 'N'),
      };
    case 'lis_posicion':
      return {
        tipo: 'lis',
        op: 'posicion',
        lista: String(b.fields?.LISTA ?? ''),
        a: compilarEntrada(b, 'ITEM'),
      };
    case 'lis_contiene':
      return {
        tipo: 'lis',
        op: 'contiene',
        lista: String(b.fields?.LISTA ?? ''),
        a: compilarEntrada(b, 'ITEM'),
      };
    default:
      return { tipo: 'num', valor: 0 };
  }
}

function compilarEntrada(b: BloqueJSON, nombre: string): Expr {
  const e = b.inputs?.[nombre];
  return compilarExpr(e?.block ?? e?.shadow);
}

/** Sigue la cadena `next` y compila una pila de sentencias. */
function compilarPila(primero: BloqueJSON | undefined): Sentencia[] {
  const pila: Sentencia[] = [];
  for (let b = primero; b; b = b.next?.block) {
    const entradas: Record<string, Expr> = {};
    const hijos: Record<string, Sentencia[]> = {};
    for (const [nombre, e] of Object.entries(b.inputs ?? {})) {
      if (nombre.startsWith('CUERPO')) hijos[nombre] = compilarPila(e.block);
      else if (e.block || e.shadow) entradas[nombre] = compilarExpr(e.block ?? e.shadow);
    }
    pila.push({ id: idDe(b), tipo: b.type, campos: camposDe(b), entradas, hijos });
  }
  return pila;
}

/** Compila todos los programas de un espacio de trabajo. */
export function compilar(entrada: object): Programa[] {
  const espacio = entrada as EspacioJSON;
  const programas: Programa[] = [];
  for (const raiz of espacio.blocks?.blocks ?? []) {
    if (!SOMBREROS.has(raiz.type)) continue; // bloques sueltos no se ejecutan
    programas.push({
      sombrero: raiz.type,
      id: idDe(raiz),
      campos: camposDe(raiz),
      cuerpo: compilarPila(raiz.next?.block),
    });
  }
  return programas;
}
