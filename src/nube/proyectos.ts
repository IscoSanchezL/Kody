import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import type { Proyecto } from '../store/proyectoModelo';
import { validarProyecto } from '../store/proyectoModelo';
import { autenticacion, baseDatos } from './cliente';
import { t } from '../i18n';
import { MAX_BYTES_PROYECTO, MAX_PROYECTOS } from './config';

/**
 * Proyectos guardados en la nube: usuarios/{uid}/proyectos/{id} en Firestore.
 * Cada persona solo puede leer y escribir lo suyo (reglas en firestore.rules).
 * El programa se guarda como texto JSON (Firestore no admite listas dentro de listas).
 */

export interface ResumenProyecto {
  id: string;
  nombre: string;
  actualizado: string;
}

/** Convierte un error técnico de la nube en un mensaje amable. */
export function mensajeDeError(error: { message?: string; code?: string } | null): string {
  const m = error?.message ?? '';
  const c = error?.code ?? '';
  if (m.includes('limite_proyectos')) return t('nube.limite', { max: MAX_PROYECTOS });
  if (m.includes('proyecto_grande')) return t('nube.grande');
  if (c === 'unavailable' || m.includes('Failed to fetch') || m.includes('network'))
    return t('nube.sinConexion');
  if (c === 'unauthenticated' || c === 'permission-denied') return t('nube.sesion');
  return t('nube.generico');
}

export class ErrorNube extends Error {}

function lanzar(e: unknown): never {
  if (e instanceof ErrorNube) throw e;
  throw new ErrorNube(mensajeDeError(e as { message?: string; code?: string }));
}

function coleccion() {
  const uid = autenticacion().currentUser?.uid;
  if (!uid) throw new ErrorNube(mensajeDeError({ code: 'unauthenticated' }));
  return collection(baseDatos(), 'usuarios', uid, 'proyectos');
}

const aTexto = (t: unknown): string =>
  t && typeof (t as Timestamp).toDate === 'function'
    ? (t as Timestamp).toDate().toISOString()
    : new Date().toISOString();

function serializar(proyecto: Proyecto): string {
  const texto = JSON.stringify(proyecto);
  if (new TextEncoder().encode(texto).length > MAX_BYTES_PROYECTO)
    throw new ErrorNube(mensajeDeError({ message: 'proyecto_grande' }));
  return texto;
}

export async function listarProyectos(): Promise<ResumenProyecto[]> {
  try {
    const r = await getDocs(
      query(coleccion(), orderBy('actualizado', 'desc'), limit(MAX_PROYECTOS)),
    );
    return r.docs.map((d) => ({
      id: d.id,
      nombre: String(d.data().nombre ?? t('proyecto.sinNombre')),
      actualizado: aTexto(d.data().actualizado),
    }));
  } catch (e) {
    lanzar(e);
  }
}

export async function abrirProyecto(id: string): Promise<{ nombre: string; proyecto: Proyecto }> {
  try {
    const d = await getDoc(doc(coleccion(), id));
    const datos = d.data();
    let bruto: unknown;
    try {
      bruto = JSON.parse(String(datos?.datos ?? ''));
    } catch {
      bruto = null;
    }
    const proyecto = validarProyecto(bruto);
    if (!datos || !proyecto) throw new ErrorNube(t('nube.noSePudoAbrir'));
    return { nombre: String(datos.nombre), proyecto };
  } catch (e) {
    lanzar(e);
  }
}

export async function crearProyecto(nombre: string, proyecto: Proyecto): Promise<string> {
  try {
    const texto = serializar(proyecto);
    const existentes = await getDocs(query(coleccion(), limit(MAX_PROYECTOS)));
    if (existentes.size >= MAX_PROYECTOS)
      throw new ErrorNube(mensajeDeError({ message: 'limite_proyectos' }));
    const r = await addDoc(coleccion(), {
      nombre,
      datos: texto,
      actualizado: serverTimestamp(),
    });
    return r.id;
  } catch (e) {
    lanzar(e);
  }
}

export async function actualizarProyecto(
  id: string,
  proyecto: Proyecto,
  nombre?: string,
): Promise<void> {
  try {
    await updateDoc(doc(coleccion(), id), {
      datos: serializar(proyecto),
      ...(nombre ? { nombre } : {}),
      actualizado: serverTimestamp(),
    });
  } catch (e) {
    lanzar(e);
  }
}

export async function renombrarProyecto(id: string, nombre: string): Promise<void> {
  try {
    await updateDoc(doc(coleccion(), id), { nombre, actualizado: serverTimestamp() });
  } catch (e) {
    lanzar(e);
  }
}

export async function borrarProyecto(id: string): Promise<void> {
  try {
    await deleteDoc(doc(coleccion(), id));
  } catch (e) {
    lanzar(e);
  }
}
