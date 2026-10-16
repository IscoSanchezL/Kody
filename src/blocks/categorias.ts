/** Categorías de bloques: color + ícono consistentes en toda la app. */
export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  color: string;
}

export const CATEGORIAS = {
  eventos: { id: 'eventos', nombre: 'Eventos', icono: '🚩', color: '#ca8a04' },
  movimiento: { id: 'movimiento', nombre: 'Movimiento', icono: '🧭', color: '#2563eb' },
  apariencia: { id: 'apariencia', nombre: 'Apariencia', icono: '🎨', color: '#7c3aed' },
  sonido: { id: 'sonido', nombre: 'Sonido', icono: '🔊', color: '#db2777' },
  control: { id: 'control', nombre: 'Control', icono: '🔁', color: '#ea580c' },
  sensores: { id: 'sensores', nombre: 'Sensores', icono: '👀', color: '#0891b2' },
  operadores: { id: 'operadores', nombre: 'Operadores', icono: '🧮', color: '#16a34a' },
  variables: { id: 'variables', nombre: 'Variables', icono: '📦', color: '#dc2626' },
  listas: { id: 'listas', nombre: 'Listas', icono: '📋', color: '#be123c' },
  mis_bloques: { id: 'mis_bloques', nombre: 'Mis bloques', icono: '🧩', color: '#c026d3' },
} as const satisfies Record<string, Categoria>;

export type IdCategoria = keyof typeof CATEGORIAS;
