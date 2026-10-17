import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { responderPregunta } from '../store/controlador';
import { useApp } from '../store/useApp';

/** La pregunta de "preguntar … y esperar": una barra con su casilla, al pie del escenario. */
export function PreguntaEscenario() {
  const t = useT();
  const pregunta = useApp((s) => s.pregunta);
  const [texto, setTexto] = useState('');
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pregunta === null) return;
    setTexto('');
    campo.current?.focus();
  }, [pregunta]);

  if (pregunta === null) return null;
  return (
    <form
      className="absolute inset-x-2 bottom-2 z-10 flex flex-col gap-1.5 rounded-2xl border border-white/30 bg-black/65 p-2 backdrop-blur"
      onSubmit={(e) => {
        e.preventDefault();
        responderPregunta(texto);
      }}
    >
      <label className="text-sm font-extrabold text-white" htmlFor="kody-respuesta">
        {pregunta || '…'}
      </label>
      <div className="flex gap-2">
        <input
          id="kody-respuesta"
          ref={campo}
          className="campo flex-1"
          value={texto}
          maxLength={200}
          autoComplete="off"
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit" className="btn !min-h-9 !px-4 !text-base">
          {t('pregunta.listo')}
        </button>
      </div>
    </form>
  );
}
