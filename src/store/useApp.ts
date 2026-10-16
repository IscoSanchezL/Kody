import { create } from 'zustand';
import type { ModoEjecucion, Monitores } from '../engine/tipos';

export type Tema = 'claro' | 'gris' | 'oscuro';

interface EstadoApp {
  tema: Tema;
  /** Escala de la interfaz (0.9 – 1.3). */
  escala: number;
  modo: ModoEjecucion;
  /** Lo que dice la mascota Kody. */
  mensaje: string;
  /** Cambia en cada mensaje para re-animar el globo. */
  mensajeId: number;
  /** Pestaña del panel derecho. */
  panel: 'actores' | 'fondos';
  /** Escenario ampliado. */
  escenarioGrande: boolean;
  /** Cuadrícula de coordenadas sobre el escenario. */
  cuadricula: boolean;
  /** Escenario en 3D (si no, 2D). */
  modo3d: boolean;
  /** Pantalla visible: página de inicio o el editor. */
  pantalla: 'inicio' | 'editor';
  setPantalla: (p: 'inicio' | 'editor') => void;
  /** Ventanas de la cuenta. */
  accesoAbierto: boolean;
  proyectosAbierto: boolean;
  apodoAbierto: boolean;
  nombreAbierto: boolean;
  abrirVentana: (v: 'acceso' | 'proyectos' | 'apodo' | 'nombre', abierta: boolean) => void;
  /** Ventana para crear o borrar una variable o lista (null = cerrada). */
  datosDialogo: { tipo: 'variable' | 'lista'; accion: 'crear' | 'borrar' } | null;
  abrirDatos: (d: { tipo: 'variable' | 'lista'; accion: 'crear' | 'borrar' } | null) => void;
  /** Ventana para crear un bloque propio ("Mis bloques"). */
  bloquePropioAbierto: boolean;
  abrirBloquePropio: (abierta: boolean) => void;
  /** Variables y listas visibles sobre el escenario mientras corre el programa. */
  monitores: Monitores;
  setMonitores: (m: Monitores) => void;
  /** Pregunta abierta de "preguntar ... y esperar" (null = ninguna). */
  pregunta: string | null;
  setPregunta: (p: string | null) => void;
  /** Ventana de la biblioteca de personajes. */
  bibliotecaAbierta: boolean;
  /** Posición del puntero sobre el escenario (null si está fuera). */
  puntero: { x: number; y: number } | null;
  setPanel: (p: 'actores' | 'fondos') => void;
  alternarEscenarioGrande: () => void;
  alternarCuadricula: () => void;
  setModo3d: (v: boolean) => void;
  abrirBiblioteca: (abierta: boolean) => void;
  setPuntero: (p: { x: number; y: number } | null) => void;
  setTema: (t: Tema) => void;
  ciclarTema: () => void;
  cambiarEscala: (delta: number) => void;
  setModo: (m: ModoEjecucion) => void;
  decir: (m: string) => void;
}

const leer = <T>(clave: string, defecto: T): T => {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : defecto;
  } catch {
    return defecto;
  }
};
const guardar = (clave: string, valor: unknown) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: la app sigue funcionando */
  }
};

/** El tema de alto contraste se retiró: quien lo tenía guardado pasa a Cristal. */
function leerTema(): Tema {
  const t = leer<string>('kody.tema', 'oscuro');
  return t === 'claro' || t === 'gris' ? t : 'oscuro';
}

const ORDEN: Tema[] = ['claro', 'gris', 'oscuro'];

export const useApp = create<EstadoApp>((set, get) => ({
  tema: leerTema(),
  escala: leer<number>('kody.escala', 1),
  modo: 'detenido',
  panel: 'actores',
  escenarioGrande: leer<boolean>('kody.grande', false),
  cuadricula: false,
  modo3d: leer<boolean>('kody.3d', true),
  pantalla: 'inicio',
  setPantalla: (pantalla) => set({ pantalla }),
  accesoAbierto: false,
  proyectosAbierto: false,
  apodoAbierto: false,
  nombreAbierto: false,
  abrirVentana: (v, abierta) =>
    set({
      accesoAbierto: v === 'acceso' ? abierta : false,
      proyectosAbierto: v === 'proyectos' ? abierta : false,
      apodoAbierto: v === 'apodo' ? abierta : false,
      nombreAbierto: v === 'nombre' ? abierta : false,
    }),
  bloquePropioAbierto: false,
  abrirBloquePropio: (bloquePropioAbierto) => set({ bloquePropioAbierto }),
  datosDialogo: null,
  abrirDatos: (datosDialogo) => set({ datosDialogo }),
  monitores: { variables: [], listas: [] },
  setMonitores: (monitores) => set({ monitores }),
  pregunta: null,
  setPregunta: (pregunta) => set({ pregunta }),
  bibliotecaAbierta: false,
  puntero: null,
  setPanel: (panel) => set({ panel }),
  alternarEscenarioGrande: () => {
    const v = !get().escenarioGrande;
    guardar('kody.grande', v);
    set({ escenarioGrande: v });
  },
  alternarCuadricula: () => set((s) => ({ cuadricula: !s.cuadricula })),
  setModo3d: (modo3d) => {
    guardar('kody.3d', modo3d);
    set({ modo3d });
  },
  abrirBiblioteca: (bibliotecaAbierta) => set({ bibliotecaAbierta }),
  setPuntero: (puntero) => set({ puntero }),
  mensaje: '¡Hola! Soy Kody 🦊 Arrastra bloques y presiona ▶ para ver la magia.',
  mensajeId: 0,
  setTema: (tema) => {
    guardar('kody.tema', tema);
    set({ tema });
  },
  ciclarTema: () => get().setTema(ORDEN[(ORDEN.indexOf(get().tema) + 1) % ORDEN.length]),
  cambiarEscala: (delta) => {
    const escala = Math.min(1.3, Math.max(0.9, Math.round((get().escala + delta) * 100) / 100));
    guardar('kody.escala', escala);
    set({ escala });
  },
  setModo: (modo) => set({ modo }),
  decir: (mensaje) => set((s) => ({ mensaje, mensajeId: s.mensajeId + 1 })),
}));
