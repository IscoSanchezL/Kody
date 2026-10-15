import type { Proyecto } from '../store/proyectoModelo';
import { validarProyecto } from '../store/proyectoModelo';
import { supabase } from './cliente';
import { MAX_PROYECTOS } from './config';

/** Proyectos guardados en la nube (tabla kody_projects; cada persona solo ve los suyos). */

export interface ResumenProyecto {
  id: string;
  nombre: string;
  actualizado: string;
}

/** Convierte un error técnico de la nube en un mensaje amable. */
export function mensajeDeError(error: { message?: string; code?: string } | null): string {
  const m = error?.message ?? '';
  if (m.includes('limite_proyectos'))
    return `Ya tienes ${MAX_PROYECTOS} proyectos. Borra alguno para guardar otro.`;
  if (m.includes('Failed to fetch') || m.includes('NetworkError') || m.includes('Load failed'))
    return 'No hay conexión. Kody lo guardará cuando vuelva el internet.';
  if (error?.code === 'PGRST301' || m.toLowerCase().includes('jwt'))
    return 'Tu sesión terminó. Vuelve a entrar para guardar.';
  return 'No se pudo guardar. Inténtalo de nuevo en un momento.';
}

export class ErrorNube extends Error {}

function lanzar(error: { message?: string; code?: string } | null): never {
  throw new ErrorNube(mensajeDeError(error));
}

export async function listarProyectos(): Promise<ResumenProyecto[]> {
  const { data, error } = await supabase
    .from('kody_projects')
    .select('id, name, updated_at')
    .order('updated_at', { ascending: false })
    .limit(MAX_PROYECTOS);
  if (error) lanzar(error);
  return (data ?? []).map((p) => ({
    id: p.id as string,
    nombre: p.name as string,
    actualizado: p.updated_at as string,
  }));
}

export async function abrirProyecto(id: string): Promise<{ nombre: string; proyecto: Proyecto }> {
  const { data, error } = await supabase
    .from('kody_projects')
    .select('name, data')
    .eq('id', id)
    .maybeSingle();
  if (error) lanzar(error);
  const proyecto = validarProyecto(data?.data);
  if (!data || !proyecto) throw new ErrorNube('Este proyecto no se pudo abrir.');
  return { nombre: data.name as string, proyecto };
}

export async function crearProyecto(nombre: string, proyecto: Proyecto): Promise<string> {
  const { data, error } = await supabase
    .from('kody_projects')
    .insert({ name: nombre, data: proyecto })
    .select('id')
    .single();
  if (error || !data) lanzar(error);
  return data.id as string;
}

export async function actualizarProyecto(
  id: string,
  proyecto: Proyecto,
  nombre?: string,
): Promise<void> {
  const { error } = await supabase
    .from('kody_projects')
    .update({ data: proyecto, ...(nombre ? { name: nombre } : {}) })
    .eq('id', id);
  if (error) lanzar(error);
}

export async function renombrarProyecto(id: string, nombre: string): Promise<void> {
  const { error } = await supabase.from('kody_projects').update({ name: nombre }).eq('id', id);
  if (error) lanzar(error);
}

export async function borrarProyecto(id: string): Promise<void> {
  const { error } = await supabase.from('kody_projects').delete().eq('id', id);
  if (error) lanzar(error);
}
