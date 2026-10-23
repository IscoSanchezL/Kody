import { FONDOS, PERSONAJES } from '../stage/biblioteca';
import type { EstadoActor } from '../engine/tipos';
import { t } from '../i18n';

/** Modelo del proyecto de Kody (versión 2) y utilidades puras, sin React ni navegador. */

export const MAX_ACTORES = 8;

export const MAX_DISFRACES = 12;
export const MAX_LARGO_DISFRAZ = 20;

/** Un disfraz: cualquier personaje de la biblioteca (y cuál de sus dos variantes). */
export interface Disfraz {
  personaje: string;
  variante: 0 | 1;
  nombre: string;
}

export interface ActorProyecto {
  id: string;
  nombre: string;
  /** Id del personaje en la biblioteca. */
  personaje: string;
  x: number;
  y: number;
  direccion: number;
  tamano: number;
  visible: boolean;
  /** Los disfraces del actor, en orden. Siempre hay al menos uno. */
  disfraces: Disfraz[];
  /** Posición (empezando en 0) del disfraz con el que empieza el programa. */
  disfraz: number;
}

export interface Proyecto {
  version: 2;
  actores: ActorProyecto[];
  fondo: string;
  /** JSON de Blockly de cada actor, por id. */
  scripts: Record<string, object>;
  seleccionado: string;
  /** Variables y listas del proyecto (valen para todos los actores). */
  variables: string[];
  listas: string[];
}

export const MAX_DATOS = 30;
export const MAX_LARGO_NOMBRE_DATO = 20;

/** Valida el nombre de una variable o lista nueva. Devuelve un mensaje o null si está bien. */
export function validarNombreDato(nombre: string, existentes: string[]): string | null {
  const n = nombre.trim().replace(/\s+/g, ' ');
  if (n.length < 1) return t('datos.errVacio');
  if (n.length > MAX_LARGO_NOMBRE_DATO) return t('datos.errLargo', { max: MAX_LARGO_NOMBRE_DATO });
  if (existentes.some((e) => e.toLowerCase() === n.toLowerCase())) return t('datos.errRepetido');
  if (existentes.length >= MAX_DATOS) return t('datos.errMaximo', { max: MAX_DATOS });
  return null;
}

export const limpiarNombreDato = (nombre: string) => nombre.trim().replace(/\s+/g, ' ');

function validarNombres(entrada: unknown): string[] {
  if (!Array.isArray(entrada)) return [];
  const nombres: string[] = [];
  for (const x of entrada) {
    if (typeof x !== 'string') continue;
    const n = limpiarNombreDato(x).slice(0, MAX_LARGO_NOMBRE_DATO);
    if (n && !nombres.some((e) => e.toLowerCase() === n.toLowerCase())) nombres.push(n);
    if (nombres.length >= MAX_DATOS) break;
  }
  return nombres;
}

interface BloqueGuardado {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, { block?: BloqueGuardado; shadow?: BloqueGuardado }>;
  next?: { block?: BloqueGuardado };
}

/**
 * Quita de un programa guardado todos los bloques que usan una variable o lista
 * (`campo` = 'VAR' o 'LISTA'). Un bloque de pila se salta y el resto de la pila queda unido;
 * un bloque de valor desaparece de su casilla. Devuelve una copia; no cambia la entrada.
 */
export function quitarUsosDeDato(script: object, campo: 'VAR' | 'LISTA', nombre: string): object {
  const copia = JSON.parse(JSON.stringify(script)) as {
    blocks?: { blocks?: BloqueGuardado[] };
  };
  const usa = (b: BloqueGuardado) => b.fields?.[campo] === nombre;

  const dentro = (b: BloqueGuardado) => {
    for (const [nom, e] of Object.entries(b.inputs ?? {})) {
      if (!e.block) continue;
      if (nom.startsWith('CUERPO')) {
        const resto = cadena(e.block);
        if (resto) e.block = resto;
        else delete e.block;
      } else if (usa(e.block)) delete e.block;
      else dentro(e.block);
    }
  };
  function cadena(primero: BloqueGuardado | undefined): BloqueGuardado | undefined {
    let b = primero;
    while (b && usa(b)) b = b.next?.block;
    if (!b) return undefined;
    dentro(b);
    const sig = cadena(b.next?.block);
    if (sig) b.next = { block: sig };
    else delete b.next;
    return b;
  }

  const raices = copia.blocks?.blocks;
  if (raices)
    copia.blocks!.blocks = raices
      .map((r) => (usa(r) ? null : cadena(r)))
      .filter(Boolean) as BloqueGuardado[];
  return copia;
}

/** Recorta un valor al rango y lo redondea (el escenario trabaja con enteros). */
export const limitarCampo = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(v)));

export const SCRIPT_VACIO = { blocks: { languageVersion: 0, blocks: [] } };

const limitar = (n: unknown, min: number, max: number, defecto: number) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : defecto;
};

export const nuevoId = () =>
  `a-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** "Gato", "Gato 2", "Gato 3"... sin repetir. */
export function nombreUnico(base: string, existentes: string[]): string {
  if (!existentes.includes(base)) return base;
  let n = 2;
  while (existentes.includes(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}

const POSICIONES = [
  [-120, -40],
  [100, -40],
  [-10, 70],
  [-170, 80],
  [160, 80],
  [-60, -110],
  [60, -120],
  [-200, -110],
] as const;

/** Elige un lugar libre en el escenario para un actor nuevo. */
export function posicionLibre(existentes: ActorProyecto[]): { x: number; y: number } {
  for (const [x, y] of POSICIONES) {
    if (existentes.every((a) => Math.hypot(a.x - x, a.y - y) > 70)) return { x, y };
  }
  return { x: Math.round(Math.random() * 300 - 150), y: Math.round(Math.random() * 200 - 100) };
}

/** Los dos disfraces de un personaje de la biblioteca (lo que trae un actor nuevo). */
export function disfracesDe(personajeId: string): Disfraz[] {
  const p = PERSONAJES.find((x) => x.id === personajeId) ?? PERSONAJES[0];
  return ([0, 1] as const).map((variante) => ({
    personaje: p.id,
    variante,
    nombre: `${p.nombre} ${variante + 1}`,
  }));
}

/** Personaje y variante que se ven con el disfraz número `indice` (da la vuelta si se pasa). */
export function disfrazActivo(
  actor: { personaje: string; disfraces?: Disfraz[] },
  indice: number,
): { personaje: string; variante: 0 | 1 } {
  const lista = actor.disfraces?.length ? actor.disfraces : disfracesDe(actor.personaje);
  const d = lista[((Math.floor(indice) % lista.length) + lista.length) % lista.length];
  return { personaje: d.personaje, variante: d.variante };
}

/** Limpia la lista de disfraces de un proyecto guardado (si no sirve, usa los del personaje). */
export function validarDisfraces(entrada: unknown, personajeBase: string): Disfraz[] {
  const lista: Disfraz[] = [];
  if (Array.isArray(entrada)) {
    for (const crudo of entrada.slice(0, MAX_DISFRACES)) {
      if (!crudo || typeof crudo !== 'object') continue;
      const d = crudo as Record<string, unknown>;
      if (!PERSONAJES.some((p) => p.id === d.personaje)) continue;
      const base =
        typeof d.nombre === 'string' && d.nombre.trim()
          ? d.nombre.trim().replace(/\s+/g, ' ').slice(0, MAX_LARGO_DISFRAZ)
          : String(d.personaje);
      lista.push({
        personaje: String(d.personaje),
        variante: d.variante === 1 ? 1 : 0,
        nombre: nombreUnico(
          base,
          lista.map((x) => x.nombre),
        ),
      });
    }
  }
  return lista.length ? lista : disfracesDe(personajeBase);
}

/** Resultado de cambiar la lista de disfraces: la lista nueva y cuál queda puesto. */
export interface CambioDisfraces {
  disfraces: Disfraz[];
  disfraz: number;
}

/** Agrega un disfraz al final y lo deja puesto. Devuelve null si ya hay el máximo. */
export function agregarDisfrazA(
  disfraces: Disfraz[],
  nuevo: { personaje: string; variante: 0 | 1; nombre?: string },
): CambioDisfraces | null {
  if (disfraces.length >= MAX_DISFRACES) return null;
  const p = PERSONAJES.find((x) => x.id === nuevo.personaje) ?? PERSONAJES[0];
  const base = (nuevo.nombre?.trim() || `${p.nombre} ${nuevo.variante + 1}`).slice(
    0,
    MAX_LARGO_DISFRAZ,
  );
  const disfraz: Disfraz = {
    personaje: p.id,
    variante: nuevo.variante,
    nombre: nombreUnico(
      base,
      disfraces.map((d) => d.nombre),
    ),
  };
  return { disfraces: [...disfraces, disfraz], disfraz: disfraces.length };
}

/** Quita un disfraz (siempre queda al menos uno) y ajusta cuál queda puesto. */
export function quitarDisfrazDe(
  disfraces: Disfraz[],
  indice: number,
  actual: number,
): CambioDisfraces | null {
  if (disfraces.length <= 1 || indice < 0 || indice >= disfraces.length) return null;
  const lista = disfraces.filter((_, i) => i !== indice);
  let disfraz = actual;
  if (indice < actual) disfraz = actual - 1;
  else if (indice === actual) disfraz = Math.min(actual, lista.length - 1);
  return { disfraces: lista, disfraz: Math.max(0, Math.min(disfraz, lista.length - 1)) };
}

/** Cambia el nombre de un disfraz; devuelve null si el nombre ya lo tiene otro o no sirve. */
export function renombrarDisfrazEn(
  disfraces: Disfraz[],
  indice: number,
  nombre: string,
): Disfraz[] | null {
  const limpio = nombre.trim().replace(/\s+/g, ' ').slice(0, MAX_LARGO_DISFRAZ);
  if (!limpio || indice < 0 || indice >= disfraces.length) return null;
  if (disfraces.some((d, i) => i !== indice && d.nombre.toLowerCase() === limpio.toLowerCase()))
    return null;
  return disfraces.map((d, i) => (i === indice ? { ...d, nombre: limpio } : d));
}

/** Crea un actor con un personaje de la biblioteca. */
export function crearActor(personajeId: string, existentes: ActorProyecto[]): ActorProyecto {
  const p = PERSONAJES.find((x) => x.id === personajeId) ?? PERSONAJES[0];
  return {
    id: nuevoId(),
    nombre: nombreUnico(
      p.nombre,
      existentes.map((a) => a.nombre),
    ),
    personaje: p.id,
    ...posicionLibre(existentes),
    direccion: 90,
    tamano: 100,
    visible: true,
    disfraces: disfracesDe(p.id),
    disfraz: 0,
  };
}

export const aEstado = (a: ActorProyecto): EstadoActor => ({
  id: a.id,
  nombre: a.nombre,
  x: a.x,
  y: a.y,
  direccion: a.direccion,
  tamano: a.tamano,
  visible: a.visible,
  disfrazActual: a.disfraz,
  totalDisfraces: a.disfraces.length,
  nombresDisfraces: a.disfraces.map((d) => d.nombre),
  dialogo: null,
});

/**
 * Valida y "limpia" un proyecto que viene de un archivo o del almacenamiento.
 * Devuelve null si no se puede usar. Nunca confía en los datos de entrada.
 */
export function validarProyecto(entrada: unknown): Proyecto | null {
  if (!entrada || typeof entrada !== 'object') return null;
  const o = entrada as Record<string, unknown>;
  if (o.version !== 2 || !Array.isArray(o.actores) || o.actores.length === 0) return null;

  const ids = new Set<string>();
  const actores: ActorProyecto[] = [];
  for (const crudo of o.actores.slice(0, MAX_ACTORES)) {
    if (!crudo || typeof crudo !== 'object') continue;
    const a = crudo as Record<string, unknown>;
    const id = typeof a.id === 'string' && a.id && !ids.has(a.id) ? a.id : nuevoId();
    ids.add(id);
    const personaje = PERSONAJES.some((p) => p.id === a.personaje) ? String(a.personaje) : 'kody';
    const disfraces = validarDisfraces(a.disfraces, personaje);
    actores.push({
      id,
      nombre:
        typeof a.nombre === 'string' && a.nombre.trim()
          ? a.nombre.trim().slice(0, 20)
          : t('actor.generico'),
      personaje,
      x: limitar(a.x, -240, 240, 0),
      y: limitar(a.y, -180, 180, 0),
      direccion: limitar(a.direccion, -180, 180, 90),
      tamano: limitar(a.tamano, 10, 500, 100),
      visible: a.visible !== false,
      disfraces,
      disfraz: Math.floor(limitar(a.disfraz, 0, disfraces.length - 1, 0)),
    });
  }
  if (actores.length === 0) return null;

  const scriptsEntrada = (o.scripts && typeof o.scripts === 'object' ? o.scripts : {}) as Record<
    string,
    unknown
  >;
  const scripts: Record<string, object> = {};
  for (const a of actores) {
    const s = scriptsEntrada[a.id];
    scripts[a.id] = s && typeof s === 'object' ? (s as object) : SCRIPT_VACIO;
  }

  return {
    version: 2,
    actores,
    fondo: FONDOS.some((f) => f.id === o.fondo) ? String(o.fondo) : 'pradera',
    scripts,
    seleccionado: actores.some((a) => a.id === o.seleccionado)
      ? String(o.seleccionado)
      : actores[0].id,
    variables: validarNombres(o.variables),
    listas: validarNombres(o.listas),
  };
}
