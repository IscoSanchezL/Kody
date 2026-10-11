/** Tipos compartidos del motor de Kody. El motor no conoce React ni Pixi. */

/** Medidas del escenario (coordenadas estilo Scratch: centro = 0,0). */
export const ESCENARIO = { ancho: 480, alto: 360, mitadX: 240, mitadY: 180 } as const;

/** Globo de texto sobre un actor. */
export interface Dialogo {
  texto: string;
  tipo: 'decir' | 'pensar';
}

/** Estado visible de un actor; el escenario solo lee esto. */
export interface EstadoActor {
  id: string;
  nombre: string;
  x: number;
  y: number;
  /** Grados. 90 = derecha, 0 = arriba, 180 = abajo, -90 = izquierda. */
  direccion: number;
  /** Porcentaje (100 = tamaño normal). */
  tamano: number;
  visible: boolean;
  disfrazActual: number;
  totalDisfraces: number;
  dialogo: Dialogo | null;
}

/** Expresión (valor) ya compilada. */
export type Expr =
  | { tipo: 'num'; valor: number }
  | { tipo: 'txt'; valor: string }
  | { tipo: 'aleatorio'; desde: Expr; hasta: Expr };

/** Sentencia (bloque apilable) ya compilada. */
export interface Sentencia {
  id: string;
  tipo: string;
  entradas: Record<string, Expr>;
  /** Cuerpos de bloques en forma de "C" (repetir, por siempre...). */
  hijos: Record<string, Sentencia[]>;
}

/** Un programa = un bloque sombrero + la pila que cuelga de él. */
export interface Programa {
  sombrero: string;
  id: string;
  cuerpo: Sentencia[];
}

/** Lo que un hilo "cede" al planificador. */
export type Cesion = { k: 'paso'; id: string } | { k: 'cuadro' } | { k: 'espera'; ms: number };

export type ModoEjecucion = 'detenido' | 'corriendo' | 'pausado' | 'paso-a-paso';

/** Eventos que el runtime comunica a la interfaz. */
export interface Oyentes {
  /** Bloques activos (para resaltarlos en el editor). */
  alActivarBloques?: (ids: string[]) => void;
  /** Mensaje amable (nunca un "error" técnico). */
  alAviso?: (mensaje: string) => void;
  alCambiarModo?: (modo: ModoEjecucion) => void;
}
