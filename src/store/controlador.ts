import type * as Blockly from 'blockly';
import { serialization } from 'blockly';
import { compilar } from '../engine/compilar';
import { Runtime } from '../engine/runtime';
import type { EstadoActor } from '../engine/tipos';
import { sonidoExito, sonidoInicio } from '../audio';
import { useApp } from './useApp';

/** Actor inicial de la Fase 1: Kody el zorro robot. */
export const ACTOR_INICIAL: EstadoActor = {
  id: 'kody',
  nombre: 'Kody',
  x: -120,
  y: -40,
  direccion: 90,
  tamano: 100,
  visible: true,
  disfrazActual: 0,
  totalDisfraces: 2,
  dialogo: null,
};

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
  alCambiarModo: (modo) => {
    const anterior = useApp.getState().modo;
    useApp.getState().setModo(modo);
    if (modo === 'detenido' && anterior !== 'detenido' && !detenidoAMano) {
      useApp.getState().decir('¡Listo! Tu programa terminó 🎉 ¿Quieres probar algo más?');
      sonidoExito();
    }
  },
});
runtime.agregarActor(ACTOR_INICIAL);

export function registrarEspacio(w: Blockly.WorkspaceSvg | null) {
  espacio = w;
  resaltados = [];
}

/** Compila los bloques actuales y los ejecuta. */
export function ejecutar(paso = false) {
  if (!espacio) return;
  const programas = compilar(serialization.workspaces.save(espacio));
  if (programas.length === 0) {
    useApp
      .getState()
      .decir('Necesito un bloque amarillo 🚩 "al hacer clic en ▶" para empezar. ¡Arrástralo!');
    return;
  }
  detenidoAMano = false;
  sonidoInicio();
  runtime.iniciar(programas, ACTOR_INICIAL.id, paso);
  useApp
    .getState()
    .decir(paso ? 'Paso a paso: toca 👣 para avanzar un bloque.' : '¡Allá vamos! 🚀');
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
