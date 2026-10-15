import { SUPABASE_CLAVE, SUPABASE_URL } from './config';

/** Acceso de estudiantes con código de clase (función `class-access` de Supabase). */

export interface AlumnoClase {
  id: string;
  name: string;
  avatar: string;
  hasPin: boolean;
}

export interface ClaseEncontrada {
  nombre: string;
  alumnos: AlumnoClase[];
}

export class ErrorClase extends Error {
  constructor(
    mensaje: string,
    readonly estado: number,
    readonly necesitaPin = false,
  ) {
    super(mensaje);
  }
}

/** Deja solo letras y números en mayúscula (el código se puede escribir con guiones o espacios). */
export const normalizarCodigo = (v: string) =>
  v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);

async function llamar<T>(cuerpo: Record<string, unknown>): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${SUPABASE_URL}/functions/v1/class-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_CLAVE,
        Authorization: `Bearer ${SUPABASE_CLAVE}`,
      },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorClase('No hay conexión con Kody. Revisa tu internet e inténtalo de nuevo.', 0);
  }
  const datos = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) {
    throw new ErrorClase(
      typeof datos.error === 'string' ? datos.error : 'Algo salió mal. Inténtalo otra vez.',
      r.status,
      datos.needsPin === true,
    );
  }
  return datos as T;
}

export async function buscarClase(codigo: string): Promise<ClaseEncontrada> {
  const d = await llamar<{ classroom: { name: string }; students: AlumnoClase[] }>({
    action: 'lookup',
    code: normalizarCodigo(codigo),
  });
  return { nombre: d.classroom.name, alumnos: d.students };
}

export async function iniciarComoAlumno(codigo: string, alumnoId: string, pin?: string) {
  const d = await llamar<{ session: { access_token: string; refresh_token: string } }>({
    action: 'login',
    code: normalizarCodigo(codigo),
    studentId: alumnoId,
    ...(pin ? { pin } : {}),
  });
  return d.session;
}
