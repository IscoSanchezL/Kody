import { useState } from 'react';
import { useSesion } from '../nube/sesion';
import { useApp } from '../store/useApp';
import { Ventana } from './Ventana';

const GoogleG = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

/** Ventana para entrar: con Google o seguir sin cuenta. */
export function Acceso() {
  const abierta = useApp((s) => s.accesoAbierto);
  const abrirVentana = useApp((s) => s.abrirVentana);
  const googleActivo = useSesion((s) => s.googleActivo);
  const entrarConGoogle = useSesion((s) => s.entrarConGoogle);
  const perfil = useSesion((s) => s.perfil);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const cerrar = () => {
    setError('');
    abrirVentana('acceso', false);
  };

  const google = async () => {
    setError('');
    setOcupado(true);
    const problema = await entrarConGoogle();
    setOcupado(false);
    if (problema) setError(problema);
    else cerrar();
  };

  return (
    <Ventana abierta={abierta && !perfil} titulo="Entrar a Kody" alCerrar={cerrar}>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="tarjeta-boton !flex-row !justify-start !gap-3 !p-4 text-left disabled:opacity-60"
          onClick={google}
          disabled={googleActivo !== true || ocupado}
        >
          <GoogleG />
          <span>
            <span className="titulo block text-xl font-extrabold">Continuar con Google</span>
            <span className="text-sm font-bold text-[var(--texto-suave)]">
              {googleActivo === false
                ? 'Muy pronto'
                : googleActivo === null
                  ? 'Revisando…'
                  : ocupado
                    ? 'Abriendo Google…'
                    : 'Con tu cuenta de Google'}
            </span>
          </span>
        </button>

        <button type="button" className="btn btn-suave" onClick={cerrar}>
          Seguir sin cuenta
        </button>
        <p className="m-0 text-xs font-bold text-[var(--texto-suave)]">
          Sin cuenta, tus proyectos solo quedan en este navegador. Con cuenta los guardas en la
          nube y puedes abrirlos en cualquier computador. Kody solo muestra tu apodo, nunca tu
          correo ni tu nombre.
        </p>
        {error && (
          <p
            role="alert"
            className="m-0 rounded-xl border border-[var(--peligro)] p-3 text-sm font-bold"
          >
            {error}
          </p>
        )}
      </div>
    </Ventana>
  );
}
