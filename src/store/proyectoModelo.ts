import { FONDOS, PERSONAJES } from '../stage/biblioteca';
import type { EstadoActor } from '../engine/tipos';

/** Modelo del proyecto de Kody (versión 2) y utilidades puras, sin React ni navegador. */

export const MAX_ACTORES = 8;

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
  /** Disfraz inicial (0 o 1). */
  disfraz: number;
}

export interface Proyecto {
  version: 2;
  actores: ActorProyecto[];
  fondo: string;
  /** JSON de Blockly de cada actor, por id. */
  scripts: Record<string, object>;
  seleccionado: string;
}

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
  totalDisfraces: 2,
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
    actores.push({
      id,
      nombre:
        typeof a.nombre === 'string' && a.nombre.trim() ? a.nombre.trim().slice(0, 20) : 'Actor',
      personaje,
      x: limitar(a.x, -240, 240, 0),
      y: limitar(a.y, -180, 180, 0),
      direccion: limitar(a.direccion, -180, 180, 90),
      tamano: limitar(a.tamano, 10, 500, 100),
      visible: a.visible !== false,
      disfraz: limitar(a.disfraz, 0, 1, 0) >= 0.5 ? 1 : 0,
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
  };
}
