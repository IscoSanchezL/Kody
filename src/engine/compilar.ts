import type { Expr, OpBinaria, Programa, Sentencia } from './tipos';

/**
 * Compilador: JSON de Blockly (serialization.workspaces.save) -> programas.
 * Trabaja sobre JSON plano, así se puede probar sin navegador.
 */

interface BloqueJSON {
  type: string;
  id?: string;
  fields?: Record<string, unknown>;
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
]);

let contadorId = 0;
const idDe = (b: BloqueJSON) => b.id ?? `anon-${++contadorId}`;

const camposDe = (b: BloqueJSON): Record<string, string> =>
  Object.fromEntries(Object.entries(b.fields ?? {}).map(([k, v]) => [k, String(v ?? '')]));

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
};

/** Convierte un bloque de valor en una expresión. */
function compilarExpr(b: BloqueJSON | undefined): Expr {
  if (!b) return { tipo: 'num', valor: 0 };
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
