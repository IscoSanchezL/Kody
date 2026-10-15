/**
 * Configuración de la nube de Kody (Firebase).
 *
 * Estos valores son públicos por diseño: viajan en el navegador de todas formas y la
 * seguridad la dan las reglas de Firestore (firestore.rules), no el secreto de las claves.
 * Se pueden cambiar con las variables VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
 * VITE_FIREBASE_PROJECT_ID y VITE_FIREBASE_APP_ID.
 * Mientras estén vacíos, Kody funciona sin cuenta (solo en el navegador).
 */
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

/** ¿Ya se configuró Firebase? Si no, el acceso con cuenta se muestra como "muy pronto". */
export const NUBE_CONFIGURADA = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId,
);

/** Dominio del colegio para sugerirlo en el selector de Google (opcional, solo es una pista). */
export const GOOGLE_DOMINIO: string | undefined = import.meta.env.VITE_GOOGLE_HD || undefined;

export const MAX_PROYECTOS = 30;
/** Un documento de Firestore admite hasta 1 MiB; se deja margen para el nombre y los campos. */
export const MAX_BYTES_PROYECTO = 900_000;
