import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { autenticacion, baseDatos, proveedorGoogle } from './cliente';
import { NUBE_CONFIGURADA } from './config';

export type Rol = 'student';

/** Lo único que Kody sabe de una persona: apodo y avatar (nunca su correo ni su nombre real). */
export interface Perfil {
  id: string;
  rol: Rol;
  nombre: string;
  avatar: string;
}

interface EstadoSesion {
  perfil: Perfil | null;
  /** true cuando ya se sabe si hay una sesión guardada (evita parpadeos). */
  listo: boolean;
  /** Si el acceso con Google está disponible (null = aún no se sabe). */
  googleActivo: boolean | null;
  iniciar: () => void;
  entrarConGoogle: () => Promise<string | null>;
  cambiarApodo: (nombre: string) => Promise<string | null>;
  salir: () => Promise<void>;
}

/** Valida el apodo: entre 2 y 40 letras. */
export function validarApodo(v: string): string | null {
  const n = v.trim().replace(/\s+/g, ' ');
  if (n.length < 2) return 'Escribe al menos 2 letras.';
  if (n.length > 40) return 'Máximo 40 letras.';
  return null;
}

const APODO_INICIAL = 'Explorador';
const AVATAR_INICIAL = '🦊';

/** Lee el apodo guardado (usuarios/{id}) o lo crea la primera vez. */
async function cargarPerfil(id: string): Promise<Perfil> {
  const ref = doc(baseDatos(), 'usuarios', id);
  try {
    const d = await getDoc(ref);
    if (d.exists()) {
      const datos = d.data() as { apodo?: string; avatar?: string };
      return {
        id,
        rol: 'student',
        nombre: datos.apodo || APODO_INICIAL,
        avatar: datos.avatar || AVATAR_INICIAL,
      };
    }
    await setDoc(ref, { apodo: APODO_INICIAL, avatar: AVATAR_INICIAL });
  } catch {
    // Sin conexión: se entra igual con el apodo inicial.
  }
  return { id, rol: 'student', nombre: APODO_INICIAL, avatar: AVATAR_INICIAL };
}

let arrancado = false;

export const useSesion = create<EstadoSesion>((set, get) => ({
  perfil: null,
  listo: false,
  googleActivo: null,

  iniciar: () => {
    if (arrancado) return;
    arrancado = true;
    if (!NUBE_CONFIGURADA) return set({ googleActivo: false, listo: true });
    set({ googleActivo: true });
    onAuthStateChanged(autenticacion(), (usuario) => {
      if (!usuario) return set({ perfil: null, listo: true });
      void cargarPerfil(usuario.uid).then((perfil) => set({ perfil, listo: true }));
    });
  },

  entrarConGoogle: async () => {
    try {
      await signInWithPopup(autenticacion(), proveedorGoogle());
      return null;
    } catch (e) {
      const codigo = (e as { code?: string }).code ?? '';
      if (codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request')
        return null;
      if (codigo === 'auth/popup-blocked') {
        // El navegador bloqueó la ventana emergente: se usa la redirección.
        try {
          await signInWithRedirect(autenticacion(), proveedorGoogle());
          return null;
        } catch {
          /* cae al mensaje general */
        }
      }
      if (codigo === 'auth/unauthorized-domain')
        return 'Este sitio aún no está autorizado en Firebase. Avisa a tu docente.';
      return 'No se pudo abrir Google. Inténtalo de nuevo en un momento.';
    }
  },

  cambiarApodo: async (nombre) => {
    const perfil = get().perfil;
    if (!perfil) return 'Primero entra a Kody.';
    const limpio = nombre.trim().replace(/\s+/g, ' ');
    const problema = validarApodo(limpio);
    if (problema) return problema;
    try {
      await setDoc(doc(baseDatos(), 'usuarios', perfil.id), {
        apodo: limpio,
        avatar: perfil.avatar,
      });
    } catch {
      return 'No se pudo guardar tu apodo. Inténtalo otra vez.';
    }
    set({ perfil: { ...perfil, nombre: limpio } });
    return null;
  },

  salir: async () => {
    if (NUBE_CONFIGURADA) await signOut(autenticacion());
    set({ perfil: null });
  },
}));
