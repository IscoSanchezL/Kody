/** Tipos compartidos del motor de Kody. El motor no conoce React ni Pixi. */

/** Medidas del escenario (coordenadas estilo Scratch: centro = 0,0). */
export const ESCENARIO = { ancho: 480, alto: 360, mitadX: 240, mitadY: 180 } as const;

/** Radio aproximado de un actor al 100 % (para choques y bordes). */
export const RADIO_ACTOR = 40;

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
  /** Nombres de los disfraces, en orden (para "cambiar disfraz a …"). */
  nombresDisfraces?: string[];
  /** Volumen del actor (0–100). Si falta, 100. */
  volumen?: number;
  /** Instrumento de "tocar nota". Si falta, el piano. */
  instrumento?: string;
  dialogo: Dialogo | null;
  /** Si es un clon, el id del actor original (los clones solo existen mientras corre el programa). */
  clonDe?: string;
}

export type OpBinaria =
  | '+'
  | '-'
  | '*'
  | '/'
  | '>'
  | '<'
  | '='
  | 'y'
  | 'o'
  | 'azar'
  | 'resto'
  | 'unir'
  | 'letra'
  | 'contiene';
export type OpUnaria = 'redondear' | 'abs' | 'raiz' | 'piso' | 'techo' | 'sen' | 'cos' | 'longitud';
/** Lo que el lápiz dibuja sobre el escenario (la interfaz lo pinta en una capa propia). */
export type EventoLapiz =
  | { t: 'linea'; x1: number; y1: number; x2: number; y2: number; color: string; grosor: number }
  | { t: 'sello'; actorId: string }
  | { t: 'borrar' };

/** Lo que un bloque de valor puede preguntarle a una lista. */
export type OpLista = 'texto' | 'elemento' | 'posicion' | 'longitud' | 'contiene';
export type NombreSensor =
  | 'tecla'
  | 'borde'
  | 'tocando'
  | 'x'
  | 'y'
  | 'dir'
  | 'respuesta'
  | 'raton-x'
  | 'raton-y'
  | 'raton-abajo'
  | 'temporizador'
  | 'distancia'
  | 'disfraz-num'
  | 'disfraz-nombre'
  | 'volumen';

/** Expresión (valor) ya compilada. */
export type Expr =
  | { tipo: 'num'; valor: number }
  | { tipo: 'txt'; valor: string }
  | { tipo: 'bin'; op: OpBinaria; a: Expr; b: Expr }
  | { tipo: 'no'; a: Expr }
  | { tipo: 'un'; op: OpUnaria; a: Expr }
  | { tipo: 'sensor'; nombre: NombreSensor; param?: string }
  | { tipo: 'var'; nombre: string }
  | { tipo: 'param'; nombre: string }
  | { tipo: 'lis'; op: OpLista; lista: string; a?: Expr };

/** Sentencia (bloque apilable) ya compilada. */
export interface Sentencia {
  id: string;
  tipo: string;
  /** Campos del bloque (listas desplegables, texto). */
  campos: Record<string, string>;
  entradas: Record<string, Expr>;
  /** Cuerpos de bloques en forma de "C" (repetir, si, por siempre...). */
  hijos: Record<string, Sentencia[]>;
}

/** Variables y listas que declara el proyecto (todas son para todos los actores). */
export interface DatosProyecto {
  variables: string[];
  listas: string[];
}

/** Lo que se muestra en el escenario: variables y listas con su monitor visible. */
export interface Monitores {
  variables: { nombre: string; valor: number | string }[];
  listas: { nombre: string; valores: (number | string)[] }[];
}

/** Un programa = un bloque sombrero + la pila que cuelga de él. */
export interface Programa {
  sombrero: string;
  id: string;
  campos: Record<string, string>;
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
  /** Un bloque pidió un sonido o una nota. */
  alSonido?: (
    tipo: 'sonido' | 'nota',
    dato: string | number,
    segundos: number,
    volumen?: number,
    instrumento?: string,
  ) => void;
  /** "detener todos los sonidos" (o se detuvo el programa). */
  alDetenerSonidos?: () => void;
  /** Un bloque hizo una pregunta: la interfaz la muestra y luego llama a `responder`. */
  alPreguntar?: (texto: string) => void;
  /** La pregunta terminó (se respondió o se detuvo el programa). */
  alTerminarPregunta?: () => void;
  /** El lápiz dibujó, selló o borró. */
  alLapiz?: (e: EventoLapiz) => void;
  /** Cambiaron las variables o listas que están visibles en el escenario. */
  alCambiarMonitores?: (m: Monitores) => void;
  /** Un bloque cambió el escenario. */
  alCambiarFondo?: (id: string) => void;
}
