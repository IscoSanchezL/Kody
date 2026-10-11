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
