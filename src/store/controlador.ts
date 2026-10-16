import * as Blockly from 'blockly';
import { compilar } from '../engine/compilar';
import { Runtime } from '../engine/runtime';
import type { Programa } from '../engine/tipos';
import { sonidoExito, sonidoInicio, tocarEfecto, tocarNota } from '../audio';
import { teclaABloque } from '../blocks/opciones';
import { instantanea, proyectoInicial, useProyecto } from './proyecto';
import { aEstado, validarProyecto } from './proyectoModelo';
import { useApp } from './useApp';

/**
 * Controlador: une el proyecto (store), el editor de Blockly y el runtime.
 * Es el único lugar que conoce a los tres.
 */

let espacio: Blockly.WorkspaceSvg | null = null;
let resaltados: string[] = [];
let detenidoAMano = false;

function resaltar(ids: string[]) {
  if (!espacio) return;
  for (const id of resaltados) if (!ids.includes(id)) espacio.highlightBlock(id, false);
  for (const id of ids) if (!resaltados.includes(id)) espacio.highlightBlock(id, true);
  resaltados = ids;
}

export const runtime = new Runtime({
  alActivarBloques: resaltar,
  alAviso: (m) => useApp.getState().decir(m),
  alCambiarMonitores: (m) => useApp.getState().setMonitores(m),
  alSonido: (tipo, dato, seg) => {
    if (tipo === 'sonido') tocarEfecto(String(dato));
    else tocarNota(Number(dato), seg);
  },
  alCambiarModo: (modo) => {
    const anterior = useApp.getState().modo;
    useApp.getState().setModo(modo);
    if (modo === 'detenido' && anterior !== 'detenido' && !detenidoAMano) {
      useApp.getState().decir('¡Listo! Tu programa terminó 🎉 ¿Quieres probar algo más?');
      sonidoExito();
    }
  },
});

// ---------------------------------------------------- Proyecto -> runtime

/** Copia los actores y el fondo del proyecto al runtime (cuando no se está ejecutando). */
function sincronizar() {
  const { actores, fondo } = useProyecto.getState();
  runtime.reemplazarActores(actores.map(aEstado));
  runtime.fijarFondoInicial(fondo);
}
sincronizar();

let anteriores = useProyecto.getState().actores;
let fondoAnterior = useProyecto.getState().fondo;
useProyecto.subscribe((s) => {
  if (s.actores === anteriores && s.fondo === fondoAnterior) return;
  anteriores = s.actores;
  fondoAnterior = s.fondo;
  // Cambiar actores o escenario mientras corre el programa lo detiene: así nada queda a medias.
  if (runtime.modo !== 'detenido') {
    detenidoAMano = true;
    runtime.detener();
  }
  sincronizar();
});

// ------------------------------------------------------------- Editor

export function registrarEspacio(w: Blockly.WorkspaceSvg | null) {
  espacio = w;
  resaltados = [];
}

/** Guarda en el proyecto lo que hay ahora en el editor (para el actor que se está editando). */
export function guardarScriptActual() {
  if (!espacio) return;
  const { seleccionado, guardarScript } = useProyecto.getState();
  guardarScript(seleccionado, Blockly.serialization.workspaces.save(espacio));
}

/** Cambia de actor guardando antes lo que se estaba editando. */
export function seleccionarActor(id: string) {
  if (id === useProyecto.getState().seleccionado) return;
  guardarScriptActual();
  useProyecto.getState().seleccionar(id);
}

/** Clic sobre un actor en el escenario (activa "al hacer clic en este actor"). */
export function clicEnActor(id: string) {
  runtime.clicActor(id);
}

/** Borra una variable o lista y todos los bloques que la usaban (en todos los actores). */
export function borrarDato(tipo: 'variable' | 'lista', nombre: string) {
  guardarScriptActual();
  if (runtime.modo !== 'detenido') {
    detenidoAMano = true;
    runtime.detener();
  }
  useProyecto.getState().borrarDato(tipo, nombre);
}

export function deshacer(rehacer = false) {
  espacio?.undo(rehacer);
}

// ---------------------------------------------------------- Ejecución

/** Compila los programas de todos los actores y los ejecuta. */
export function ejecutar(paso = false) {
  guardarScriptActual();
  const { actores, scripts, variables, listas } = useProyecto.getState();
  const porActor: Record<string, Programa[]> = {};
  let total = 0;
  for (const a of actores) {
    porActor[a.id] = compilar(scripts[a.id] ?? {});
    total += porActor[a.id].length;
  }
  if (total === 0) {
    useApp
      .getState()
      .decir('Necesito un bloque amarillo 🚩 "al hacer clic en ▶" para empezar. ¡Arrástralo!');
    return;
  }
  detenidoAMano = false;
  sonidoInicio();
  runtime.iniciar(porActor, paso, { variables, listas });
  const escucha = runtime.escuchando;
  useApp
    .getState()
    .decir(
      paso
        ? 'Paso a paso: toca 👣 para avanzar un bloque.'
        : escucha
          ? '¡En marcha! Prueba tus teclas o haz clic en un actor. Presiona ■ para parar.'
          : '¡Allá vamos! 🚀',
    );
}

export function detener() {
  detenidoAMano = true;
  runtime.detener();
  useApp.getState().decir('Detenido. Cuando quieras, vuelve a presionar ▶.');
}

export function siguientePaso() {
  if (runtime.modo === 'paso-a-paso') runtime.paso();
  else ejecutar(true);
}

// ---------------------------------------------------------- Teclado

const escribiendo = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/** Conecta el teclado con el runtime (devuelve la función para desconectar). */
export function conectarTeclado() {
  const abajo = (e: KeyboardEvent) => {
    if (escribiendo(e.target) || runtime.modo !== 'corriendo') return;
    const t = teclaABloque(e);
    if (!t) return;
    if (['espacio', 'arriba', 'abajo', 'izquierda', 'derecha'].includes(t)) e.preventDefault();
    runtime.presionarTecla(t);
  };
  const arriba = (e: KeyboardEvent) => {
    const t = teclaABloque(e);
    if (t) runtime.soltarTecla(t);
  };
  window.addEventListener('keydown', abajo);
  window.addEventListener('keyup', arriba);
  return () => {
    window.removeEventListener('keydown', abajo);
    window.removeEventListener('keyup', arriba);
  };
}

// ----------------------------------------------------- Archivos de proyecto

/** Descarga el proyecto como archivo .json. */
export function guardarArchivo() {
  guardarScriptActual();
  const blob = new Blob([JSON.stringify(instantanea(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mi-proyecto.kody.json';
  a.click();
  URL.revokeObjectURL(url);
  useApp.getState().decir('¡Proyecto guardado! Lo encuentras en tu carpeta de descargas 📁');
}

/** Abre un proyecto desde un archivo .json. Devuelve true si funcionó. */
export async function abrirArchivo(archivo: File): Promise<boolean> {
  try {
    if (archivo.size > 20_000_000) throw new Error('grande');
    const p = validarProyecto(JSON.parse(await archivo.text()));
    if (!p) throw new Error('invalido');
    runtime.detener();
    useProyecto.getState().reemplazar(p);
    useApp.getState().decir('¡Proyecto abierto! Presiona ▶ para verlo en acción.');
    return true;
  } catch {
    useApp.getState().decir('Ese archivo no es un proyecto de Kody 🤔 Prueba con otro.');
    return false;
  }
}

/** Empieza de cero con el proyecto de ejemplo. */
export function proyectoNuevo() {
  runtime.detener();
  useProyecto.getState().reemplazar(proyectoInicial());
  useApp.getState().decir('Proyecto nuevo listo. ¡A crear! ✨');
}
