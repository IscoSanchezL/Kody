import type { Expr, Programa, Sentencia } from './tipos';

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

/** Bloques sombrero reconocidos (inician un hilo). */
export const SOMBREROS = new Set(['evento_al_ejecutar']);

let contadorId = 0;
const idDe = (b: BloqueJSON) => b.id ?? `anon-${++contadorId}`;

/** Convierte un bloque de valor en una expresión. */
function compilarExpr(b: BloqueJSON | undefined): Expr {
  if (!b) return { tipo: 'num', valor: 0 };
  switch (b.type) {
    case 'math_number':
      return { tipo: 'num', valor: Number(b.fields?.NUM ?? 0) || 0 };
    case 'text':
      return { tipo: 'txt', valor: String(b.fields?.TEXT ?? '') };
    case 'op_aleatorio':
      return {
        tipo: 'aleatorio',
        desde: compilarEntrada(b, 'DESDE'),
        hasta: compilarEntrada(b, 'HASTA'),
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
      else entradas[nombre] = compilarExpr(e.block ?? e.shadow);
    }
    pila.push({ id: idDe(b), tipo: b.type, entradas, hijos });
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
      cuerpo: compilarPila(raiz.next?.block),
    });
  }
  return programas;
}
