import { create } from 'zustand';
import { PERSONAJES } from '../stage/biblioteca';
import { scriptEjemplo } from './ejemplo';
import {
  MAX_ACTORES,
  SCRIPT_VACIO,
  crearActor,
  limpiarNombreDato,
  quitarUsosDeDato,
  validarNombreDato,
  validarProyecto,
  type ActorProyecto,
  type Proyecto,
} from './proyectoModelo';

const CLAVE = 'kody.proyecto.v2';
const CLAVE_V1 = 'kody.proyecto.v1';

/** Proyecto de inicio: Kody con un programa de ejemplo. */
export function proyectoInicial(): Proyecto {
  const kody: ActorProyecto = {
    ...crearActor('kody', []),
    id: 'kody',
    x: -120,
    y: -40,
  };
  return {
    version: 2,
    actores: [kody],
    fondo: 'pradera',
    scripts: { kody: scriptEjemplo },
    seleccionado: 'kody',
    variables: [],
    listas: [],
  };
}

function leer(): Proyecto {
  try {
    const v2 = localStorage.getItem(CLAVE);
    if (v2) {
      const p = validarProyecto(JSON.parse(v2));
      if (p) return p;
    }
    // Migración de la Fase 1: un solo programa guardado para Kody.
    const v1 = localStorage.getItem(CLAVE_V1);
    if (v1) {
      const base = proyectoInicial();
      base.scripts.kody = JSON.parse(v1);
      return base;
    }
  } catch {
    /* almacenamiento no disponible o dañado: se usa el proyecto de inicio */
  }
  return proyectoInicial();
}

interface EstadoProyecto extends Proyecto {
  /** Sube cada vez que se reemplaza el proyecto completo (el editor recarga sus bloques). */
  revision: number;
  agregarActor: (personajeId: string) => string | null;
  quitarActor: (id: string) => void;
  seleccionar: (id: string) => void;
  editarActor: (id: string, cambios: Partial<Omit<ActorProyecto, 'id'>>) => void;
  fijarFondo: (id: string) => void;
  guardarScript: (id: string, json: object) => void;
  reemplazar: (p: Proyecto) => void;
  /** Crean o borran variables y listas; devuelven un mensaje si no se pudo (o null). */
  crearDato: (tipo: 'variable' | 'lista', nombre: string) => string | null;
  borrarDato: (tipo: 'variable' | 'lista', nombre: string) => void;
}

export const useProyecto = create<EstadoProyecto>((set, get) => ({
  ...leer(),
  revision: 0,
  agregarActor: (personajeId) => {
    const { actores } = get();
    if (actores.length >= MAX_ACTORES || !PERSONAJES.some((p) => p.id === personajeId)) return null;
    const nuevo = crearActor(personajeId, actores);
    set((s) => ({
      actores: [...s.actores, nuevo],
      scripts: { ...s.scripts, [nuevo.id]: SCRIPT_VACIO },
      seleccionado: nuevo.id,
    }));
    return nuevo.id;
  },
  quitarActor: (id) =>
    set((s) => {
      if (s.actores.length <= 1) return s; // siempre queda al menos un actor
      const actores = s.actores.filter((a) => a.id !== id);
      const scripts = { ...s.scripts };
      delete scripts[id];
      return {
        actores,
        scripts,
        seleccionado: s.seleccionado === id ? actores[0].id : s.seleccionado,
      };
    }),
  seleccionar: (id) => set((s) => (s.actores.some((a) => a.id === id) ? { seleccionado: id } : s)),
  editarActor: (id, cambios) =>
    set((s) => ({ actores: s.actores.map((a) => (a.id === id ? { ...a, ...cambios } : a)) })),
  fijarFondo: (fondo) => set({ fondo }),
  guardarScript: (id, json) => set((s) => ({ scripts: { ...s.scripts, [id]: json } })),
  reemplazar: (p) => set((s) => ({ ...p, revision: s.revision + 1 })),
  crearDato: (tipo, nombre) => {
    const clave = tipo === 'variable' ? 'variables' : 'listas';
    const problema = validarNombreDato(nombre, get()[clave]);
    if (problema) return problema;
    set((s) => ({ [clave]: [...s[clave], limpiarNombreDato(nombre)] }) as Partial<EstadoProyecto>);
    return null;
  },
  borrarDato: (tipo, nombre) => {
    const clave = tipo === 'variable' ? 'variables' : 'listas';
    const campo = tipo === 'variable' ? 'VAR' : 'LISTA';
    set((s) => {
      const scripts: Record<string, object> = {};
      for (const [id, js] of Object.entries(s.scripts))
        scripts[id] = quitarUsosDeDato(js, campo, nombre);
      return {
        [clave]: s[clave].filter((n) => n !== nombre),
        scripts,
        // El editor recarga los bloques para que ya no aparezcan los que se quitaron.
        revision: s.revision + 1,
      } as Partial<EstadoProyecto>;
    });
  },
}));

/** Lo que se guarda y se exporta (sin funciones). */
export function instantanea(): Proyecto {
  const { version, actores, fondo, scripts, seleccionado, variables, listas } =
    useProyecto.getState();
  return { version, actores, fondo, scripts, seleccionado, variables, listas };
}

/** Escribe el proyecto en el almacenamiento del navegador ahora mismo. */
export function guardarYa() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(instantanea()));
  } catch {
    /* sin almacenamiento: la app sigue funcionando */
  }
}

// Autoguardado con un pequeño retraso para no escribir en cada movimiento.
let temporizador: ReturnType<typeof setTimeout> | undefined;
useProyecto.subscribe(() => {
  clearTimeout(temporizador);
  temporizador = setTimeout(guardarYa, 400);
});
