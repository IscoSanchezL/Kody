import { create } from 'zustand';
import { supabase } from './cliente';
import { SUPABASE_CLAVE, SUPABASE_URL, GOOGLE_DOMINIO } from './config';
import { ErrorClase, buscarClase, iniciarComoAlumno } from './claseApi';

export type Rol = 'student' | 'teacher' | 'guardian' | 'admin';

/** Lo único que Kody sabe de una persona: apodo, avatar y rol (nunca su correo). */
export interface Perfil {
  id: string;
  rol: Rol;
  nombre: string;
  avatar: string;
}

export type ResultadoAcceso = { ok: true } | { ok: false; mensaje: string; necesitaPin?: boolean };

interface EstadoSesion {
  perfil: Perfil | null;
  /** true cuando ya se sabe si hay una sesión guardada (evita parpadeos). */
  listo: boolean;
  /** Si Google está activado en la nube (null = aún no se sabe). */
  googleActivo: boolean | null;
  iniciar: () => void;
  entrarConGoogle: () => Promise<string | null>;
  entrarConClase: (codigo: string, alumnoId: string, pin?: string) => Promise<ResultadoAcceso>;
  cambiarApodo: (nombre: string) => Promise<string | null>;
  salir: () => Promise<void>;
}

/** Valida el apodo: entre 2 y 40 letras (lo pide la base de datos). */
export function validarApodo(v: string): string | null {
  const n = v.trim().replace(/\s+/g, ' ');
  if (n.length < 2) return 'Escribe al menos 2 letras.';
  if (n.length > 40) return 'Máximo 40 letras.';
  return null;
}

async function cargarPerfil(id: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, avatar')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  const avatar = (data.avatar as { emoji?: string } | null)?.emoji ?? '🦊';
  return {
    id: data.id as string,
    rol: data.role as Rol,
    nombre: data.display_name as string,
    avatar,
  };
}

async function consultarGoogle(): Promise<boolean> {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_CLAVE },
    });
    if (!r.ok) return false;
    const d = (await r.json()) as { external?: { google?: boolean } };
    return d.external?.google === true;
  } catch {
    return false;
  }
}

let arrancado = false;

export const useSesion = create<EstadoSesion>((set, get) => ({
  perfil: null,
  listo: false,
  googleActivo: null,

  iniciar: () => {
    if (arrancado) return;
    arrancado = true;
    void consultarGoogle().then((googleActivo) => set({ googleActivo }));

    supabase.auth.onAuthStateChange((_evento, sesion) => {
      // Se difiere para no bloquear a Supabase mientras procesa el cambio de sesión.
      setTimeout(async () => {
        if (!sesion?.user) return set({ perfil: null, listo: true });
        const perfil = await cargarPerfil(sesion.user.id);
        set({ perfil, listo: true });
        // Tras volver de Google se limpia la dirección (quita ?code=...).
        if (location.search.includes('code=')) history.replaceState(null, '', location.pathname);
      }, 0);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) set({ listo: true });
    });
  },

  entrarConGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}${import.meta.env.BASE_URL}`,
        queryParams: {
          prompt: 'select_account',
          ...(GOOGLE_DOMINIO ? { hd: GOOGLE_DOMINIO } : {}),
        },
      },
    });
    return error ? 'No se pudo abrir Google. Inténtalo de nuevo en un momento.' : null;
  },

  entrarConClase: async (codigo, alumnoId, pin) => {
    try {
      const sesion = await iniciarComoAlumno(codigo, alumnoId, pin);
      const { error } = await supabase.auth.setSession(sesion);
      if (error) return { ok: false, mensaje: 'No se pudo iniciar la sesión. Inténtalo otra vez.' };
      return { ok: true };
    } catch (e) {
      if (e instanceof ErrorClase)
        return { ok: false, mensaje: e.message, necesitaPin: e.necesitaPin };
      return { ok: false, mensaje: 'Algo salió mal. Inténtalo otra vez.' };
    }
  },

  cambiarApodo: async (nombre) => {
    const perfil = get().perfil;
    if (!perfil) return 'Primero entra a Kody.';
    const limpio = nombre.trim().replace(/\s+/g, ' ');
    const problema = validarApodo(limpio);
    if (problema) return problema;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: limpio })
      .eq('id', perfil.id);
    if (error) return 'No se pudo guardar tu apodo. Inténtalo otra vez.';
    set({ perfil: { ...perfil, nombre: limpio } });
    return null;
  },

  salir: async () => {
    await supabase.auth.signOut();
    set({ perfil: null });
  },
}));

export { buscarClase };
