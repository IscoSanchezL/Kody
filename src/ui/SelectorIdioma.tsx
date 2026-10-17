import { useIdioma, useT, type Idioma } from '../i18n';

const OPCIONES: { id: Idioma; corto: string; nombre: string }[] = [
  { id: 'es', corto: 'ES', nombre: 'Español' },
  { id: 'en', corto: 'EN', nombre: 'English' },
];

/** Selector de idioma ES | EN. `sobreOscuro` lo adapta a la página de inicio (fondo oscuro fijo). */
export function SelectorIdioma({ sobreOscuro = false }: { sobreOscuro?: boolean }) {
  const t = useT();
  const idioma = useIdioma((s) => s.idioma);
  const setIdioma = useIdioma((s) => s.setIdioma);

  return (
    <div
      role="group"
      aria-label={t('idioma.etiqueta')}
      className={`inline-flex items-center divide-x overflow-hidden rounded-xl border ${
        sobreOscuro
          ? 'divide-white/30 border-white/30 bg-white/10 backdrop-blur'
          : 'divide-[var(--borde)] border-[var(--borde)]'
      }`}
    >
      {OPCIONES.map((o) => {
        const activo = idioma === o.id;
        return (
          <button
            key={o.id}
            type="button"
            lang={o.id}
            title={o.nombre}
            aria-label={o.nombre}
            aria-pressed={activo}
            onClick={() => setIdioma(o.id)}
            className={`min-h-10 min-w-11 cursor-pointer border-0 px-3 text-base font-extrabold ${
              activo
                ? sobreOscuro
                  ? 'bg-indigo-400 text-white'
                  : 'bg-[var(--primario)] text-[var(--primario-texto)]'
                : sobreOscuro
                  ? 'bg-transparent text-indigo-100 hover:bg-white/15'
                  : 'bg-[var(--panel)] text-[var(--texto)] hover:brightness-110'
            }`}
          >
            {o.corto}
          </button>
        );
      })}
    </div>
  );
}
