/**
 * Catálogo de sonidos e instrumentos de Kody. Es solo información (sin audio): el motor sabe
 * cuánto dura cada sonido (para "tocar sonido hasta terminar") y la interfaz arma las listas.
 * El audio de cada sonido se sintetiza en `src/audio.ts`, con la misma clave.
 */

export type CategoriaSonido = 'juego' | 'efectos' | 'musica' | 'animales' | 'gente';

export interface InfoSonido {
  id: string;
  /** Segundos que dura. */
  duracion: number;
  emoji: string;
  categoria: CategoriaSonido;
}

export const SONIDOS: InfoSonido[] = [
  { id: 'pop', duracion: 0.15, emoji: '🫧', categoria: 'efectos' },
  { id: 'boing', duracion: 0.3, emoji: '🪀', categoria: 'efectos' },
  { id: 'ding', duracion: 0.55, emoji: '🔔', categoria: 'musica' },
  { id: 'laser', duracion: 0.3, emoji: '🔫', categoria: 'efectos' },
  { id: 'tambor', duracion: 0.25, emoji: '🥁', categoria: 'musica' },
  { id: 'aplauso', duracion: 0.5, emoji: '👏', categoria: 'gente' },
  { id: 'moneda', duracion: 0.45, emoji: '🪙', categoria: 'juego' },
  { id: 'salto', duracion: 0.22, emoji: '🦘', categoria: 'juego' },
  { id: 'victoria', duracion: 0.85, emoji: '🏆', categoria: 'juego' },
  { id: 'derrota', duracion: 0.9, emoji: '😢', categoria: 'juego' },
  { id: 'magia', duracion: 0.6, emoji: '✨', categoria: 'juego' },
  { id: 'sirena', duracion: 0.9, emoji: '🚨', categoria: 'efectos' },
  { id: 'gota', duracion: 0.22, emoji: '💧', categoria: 'efectos' },
  { id: 'explosion', duracion: 0.8, emoji: '💥', categoria: 'efectos' },
  { id: 'cohete', duracion: 1.1, emoji: '🚀', categoria: 'efectos' },
  { id: 'campana', duracion: 1.3, emoji: '🛎️', categoria: 'musica' },
  { id: 'pajaro', duracion: 0.55, emoji: '🐦', categoria: 'animales' },
  { id: 'maullido', duracion: 0.7, emoji: '🐱', categoria: 'animales' },
  { id: 'ladrido', duracion: 0.5, emoji: '🐶', categoria: 'animales' },
];

/** Lo que trae cada actor nuevo (y los proyectos guardados antes de que existiera la biblioteca). */
export const SONIDOS_INICIALES = ['pop', 'boing', 'ding', 'laser', 'tambor', 'aplauso'];
export const MAX_SONIDOS = 24;

export const CATEGORIAS_SONIDO: CategoriaSonido[] = [
  'juego',
  'efectos',
  'musica',
  'animales',
  'gente',
];

export const sonidoPorId = (id: string) => SONIDOS.find((s) => s.id === id);
export const duracionSonido = (id: string) => sonidoPorId(id)?.duracion ?? 0.3;

export const INSTRUMENTOS = ['piano', 'organo', 'xilofono', 'guitarra', 'sintetizador', 'campanas'];
