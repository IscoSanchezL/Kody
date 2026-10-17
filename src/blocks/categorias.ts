import { tDinamica } from '../i18n';

/** Categorías de bloques: color + ícono consistentes en toda la app. */
export interface Categoria {
  id: string;
  /** Nombre en el idioma actual (se calcula al leerlo). */
  readonly nombre: string;
  icono: string;
  color: string;
}

const categoria = (id: string, icono: string, color: string): Categoria => ({
  id,
  get nombre() {
    return tDinamica(`cat.${id}`);
  },
  icono,
  color,
});

export const CATEGORIAS = {
  eventos: categoria('eventos', '🚩', '#ca8a04'),
  movimiento: categoria('movimiento', '🧭', '#2563eb'),
  apariencia: categoria('apariencia', '🎨', '#7c3aed'),
  sonido: categoria('sonido', '🔊', '#db2777'),
  lapiz: categoria('lapiz', '🖊️', '#0d9488'),
  control: categoria('control', '🔁', '#ea580c'),
  sensores: categoria('sensores', '👀', '#0891b2'),
  operadores: categoria('operadores', '🧮', '#16a34a'),
  variables: categoria('variables', '📦', '#dc2626'),
  listas: categoria('listas', '📋', '#be123c'),
  mis_bloques: categoria('mis_bloques', '🧩', '#c026d3'),
} satisfies Record<string, Categoria>;

export type IdCategoria = keyof typeof CATEGORIAS;
