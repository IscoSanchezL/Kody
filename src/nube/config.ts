/**
 * Configuración de la nube de Kody (Supabase).
 *
 * La URL y la clave "publishable" son públicas por diseño: viajan en el navegador de todas
 * formas y la seguridad la dan las políticas de la base de datos (RLS), no el secreto de la
 * clave. Nunca pongas aquí la clave "service_role".
 * Se pueden cambiar con VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.
 */
export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://fomdxwpxydxtqkbjtozl.supabase.co';

export const SUPABASE_CLAVE: string =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_AXrAZfEip3gTbP1BjidbNw_XSzPfNRH';

/** Dominio del colegio para sugerirlo en el selector de Google (opcional, solo es una pista). */
export const GOOGLE_DOMINIO: string | undefined = import.meta.env.VITE_GOOGLE_HD || undefined;

export const MAX_PROYECTOS = 30;
