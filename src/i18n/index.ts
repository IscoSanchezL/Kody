import { useCallback } from 'react';
import { create } from 'zustand';
import { en } from './en';
import { es, type Clave } from './es';

/**
 * i18n ligero de Kody: dos idiomas (es / en), sin dependencias.
 * - `t(clave, vars)` traduce con interpolación `{x}`.
 * - `useT()` es el hook para componentes: se vuelven a dibujar al cambiar el idioma.
 * - El idioma se guarda en localStorage ('labs-lang'); por defecto, el del navegador.
 */

export type Idioma = 'es' | 'en';
export type { Clave };
export type Vars = Record<string, string | number>;

export const CLAVE_IDIOMA = 'labs-lang';

const DICCIONARIOS: Record<Idioma, Record<Clave, string>> = { es, en };

/** Idioma inicial: el guardado; si no hay, 'en' si el navegador empieza por "en", si no 'es'. */
export function idiomaInicial(): Idioma {
  if (typeof window === 'undefined') return 'es'; // pruebas y entornos sin navegador
  try {
    const guardado = localStorage.getItem(CLAVE_IDIOMA);
    if (guardado === 'es' || guardado === 'en') return guardado;
  } catch {
    /* sin almacenamiento: se usa el del navegador */
  }
  const nav = typeof navigator !== 'undefined' ? (navigator.language ?? '') : '';
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es';
}

/** Refleja el idioma en el documento (atributo lang, título y descripción). */
function aplicarEnDocumento(idioma: Idioma) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = idioma;
  document.title = DICCIONARIOS[idioma]['app.titulo'];
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', DICCIONARIOS[idioma]['app.descripcion']);
}

interface EstadoIdioma {
  idioma: Idioma;
  setIdioma: (idioma: Idioma) => void;
}

export const useIdioma = create<EstadoIdioma>((set, get) => ({
  idioma: idiomaInicial(),
  setIdioma: (idioma) => {
    if (idioma === get().idioma) return;
    try {
      localStorage.setItem(CLAVE_IDIOMA, idioma);
    } catch {
      /* sin almacenamiento: el cambio vale para esta sesión */
    }
    aplicarEnDocumento(idioma);
    set({ idioma });
  },
}));
aplicarEnDocumento(useIdioma.getState().idioma);

/** Idioma actual (para código que no es un componente). */
export const idiomaActual = (): Idioma => useIdioma.getState().idioma;

/** Reemplaza cada `{nombre}` por su valor (si falta en `vars`, lo deja tal cual). */
function interpolar(texto: string, vars?: Vars): string {
  if (!vars) return texto;
  return texto.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Traduce una clave al idioma actual. Si falta, usa el español y, si tampoco, la clave. */
export function t(clave: Clave, vars?: Vars): string {
  const d = DICCIONARIOS[useIdioma.getState().idioma];
  return interpolar(d[clave] ?? es[clave] ?? clave, vars);
}

/** Igual que `t`, pero para claves armadas al vuelo (p. ej. `b.${tipo}`). */
export const tDinamica = (clave: string, vars?: Vars): string => t(clave as Clave, vars);

/** Hook: devuelve `t` y hace que el componente se redibuje al cambiar el idioma. */
export function useT() {
  const idioma = useIdioma((s) => s.idioma);
  // La identidad cambia con el idioma, para que los efectos y memos que usan `t` se actualicen.
  return useCallback(t, [idioma]);
}

/** Código para formatear fechas y números en el idioma actual. */
export const localeActual = () => (useIdioma.getState().idioma === 'en' ? 'en' : 'es');
