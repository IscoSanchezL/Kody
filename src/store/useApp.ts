import { create } from 'zustand';
import type { ModoEjecucion } from '../engine/tipos';

export type Tema = 'claro' | 'oscuro' | 'contraste';

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
  /** Ventana de la biblioteca de personajes. */
  bibliotecaAbierta: boolean;
  /** Posición del puntero sobre el escenario (null si está fuera). */
  puntero: { x: number; y: number } | null;
  setPanel: (p: 'actores' | 'fondos') => void;
  alternarEscenarioGrande: () => void;
  alternarCuadricula: () => void;
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

const ORDEN: Tema[] = ['claro', 'oscuro', 'contraste'];

export const useApp = create<EstadoApp>((set, get) => ({
  tema: leer<Tema>('kody.tema', 'claro'),
  escala: leer<number>('kody.escala', 1),
  modo: 'detenido',
  panel: 'actores',
  escenarioGrande: leer<boolean>('kody.grande', false),
  cuadricula: false,
  bibliotecaAbierta: false,
  puntero: null,
  setPanel: (panel) => set({ panel }),
  alternarEscenarioGrande: () => {
    const v = !get().escenarioGrande;
    guardar('kody.grande', v);
    set({ escenarioGrande: v });
  },
  alternarCuadricula: () => set((s) => ({ cuadricula: !s.cuadricula })),
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
