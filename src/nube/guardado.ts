import { create } from 'zustand';
import { guardarScriptActual, proyectoNuevo, runtime } from '../store/controlador';
import { instantanea, useProyecto } from '../store/proyecto';
import { t } from '../i18n';
import { useApp } from '../store/useApp';
import { ErrorNube, abrirProyecto, actualizarProyecto, crearProyecto } from './proyectos';
import { useSesion } from './sesion';

/**
 * Guardado en la nube: lleva la cuenta de qué proyecto de la nube se está editando,
 * lo guarda solo cada pocos segundos y avisa del estado ("Guardado", "Guardando…").
 */

export type EstadoGuardado = 'sin-cuenta' | 'sin-guardar' | 'guardando' | 'guardado' | 'error';

interface EstadoNube {
  /** Id del proyecto de la nube que se está editando (null = aún no está en la nube). */
  proyectoId: string | null;
  /** Nombre del proyecto de la nube (vacío = aún sin nombre: se muestra "Mi proyecto"). */
  nombre: string;
  estado: EstadoGuardado;
  mensaje: string;
}

export const useNube = create<EstadoNube>(() => ({
  proyectoId: null,
  nombre: '',
  estado: 'sin-cuenta',
  mensaje: '',
}));

const ESPERA_AUTOGUARDADO = 3000;
const ESPERA_REINTENTO = 15000;

let ultimaCopia = '';
let temporizador: ReturnType<typeof setTimeout> | undefined;
let guardando = false;

const poner = (c: Partial<EstadoNube>) => useNube.setState(c);

/** Guarda el proyecto actual en la cuenta (lo crea la primera vez). */
export async function guardarEnNube(nombre?: string): Promise<boolean> {
  if (!useSesion.getState().perfil) {
    poner({ estado: 'sin-cuenta' });
    return false;
  }
  if (guardando) return false;
  guardando = true;
  clearTimeout(temporizador);
  poner({ estado: 'guardando', mensaje: '' });
  try {
    guardarScriptActual();
    const proyecto = instantanea();
    const { proyectoId, nombre: actual } = useNube.getState();
    const nombreFinal = (nombre ?? actual).trim() || t('proyecto.defecto');
    if (proyectoId) {
      await actualizarProyecto(proyectoId, proyecto, nombre ? nombreFinal : undefined);
      poner({ nombre: nombreFinal });
    } else {
      const id = await crearProyecto(nombreFinal, proyecto);
      poner({ proyectoId: id, nombre: nombreFinal });
    }
    ultimaCopia = JSON.stringify(proyecto);
    poner({ estado: 'guardado', mensaje: '' });
    return true;
  } catch (e) {
    const mensaje = e instanceof ErrorNube ? e.message : t('nube.reintentar');
    poner({ estado: 'error', mensaje });
    if (useNube.getState().proyectoId) {
      // Reintenta solo (por ejemplo si se fue el internet un momento).
      temporizador = setTimeout(() => void guardarEnNube(), ESPERA_REINTENTO);
    }
    return false;
  } finally {
    guardando = false;
  }
}

/** Abre un proyecto de la nube y lo deja listo para editar. */
export async function abrirDeNube(id: string): Promise<boolean> {
  try {
    const { nombre, proyecto } = await abrirProyecto(id);
    clearTimeout(temporizador);
    runtime.detener();
    useProyecto.getState().reemplazar(proyecto);
    ultimaCopia = JSON.stringify(instantanea());
    poner({ proyectoId: id, nombre, estado: 'guardado', mensaje: '' });
    useApp.getState().decir('nube.abierto', { nombre });
    return true;
  } catch (e) {
    if (e instanceof ErrorNube) useApp.getState().decirTexto(e.message);
    else useApp.getState().decir('nube.noAbrir');
    return false;
  }
}

/** Empieza un proyecto nuevo (queda sin guardar en la nube hasta que se guarde). */
export function nuevoProyectoNube() {
  clearTimeout(temporizador);
  proyectoNuevo();
  ultimaCopia = '';
  poner({
    proyectoId: null,
    nombre: '',
    estado: useSesion.getState().perfil ? 'sin-guardar' : 'sin-cuenta',
    mensaje: '',
  });
}

/** ¿Hay trabajo que se perdería al salir o abrir otro proyecto? */
export function hayCambiosSinGuardar(): boolean {
  const { proyectoId, estado } = useNube.getState();
  if (proyectoId) return estado === 'guardando' || estado === 'error';
  return true;
}

/** Cierra la sesión y deja el equipo limpio (importante en computadores compartidos). */
export async function salirYLimpiar() {
  clearTimeout(temporizador);
  await useSesion.getState().salir();
  nuevoProyectoNube();
  useApp.getState().decir('cuenta.sesionCerrada');
}

let conectado = false;

/** Conecta el autoguardado y el estado de la cuenta. Se llama una sola vez al arrancar. */
export function conectarGuardado() {
  if (conectado) return;
  conectado = true;

  // Cambios en el proyecto → guardado automático (solo si ya está en la nube).
  useProyecto.subscribe(() => {
    const { proyectoId } = useNube.getState();
    if (!proyectoId || !useSesion.getState().perfil) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      if (JSON.stringify(instantanea()) !== ultimaCopia) void guardarEnNube();
    }, ESPERA_AUTOGUARDADO);
  });

  // Entrar o salir → se actualiza el estado.
  useSesion.subscribe((s, anterior) => {
    if (s.perfil?.id === anterior.perfil?.id) return;
    if (s.perfil) {
      if (useNube.getState().estado === 'sin-cuenta') poner({ estado: 'sin-guardar' });
    } else {
      clearTimeout(temporizador);
      poner({ proyectoId: null, estado: 'sin-cuenta', mensaje: '' });
    }
  });
}
