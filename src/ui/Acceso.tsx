import { useEffect, useState } from 'react';
import { normalizarCodigo, type AlumnoClase, type ClaseEncontrada } from '../nube/claseApi';
import { buscarClase, useSesion } from '../nube/sesion';
import { useApp } from '../store/useApp';
import { Ventana } from './Ventana';

type Paso = 'inicio' | 'codigo' | 'alumnos' | 'pin';

const TITULOS: Record<Paso, string> = {
  inicio: 'Entrar a Kody',
  codigo: 'El código de tu clase',
  alumnos: '¿Quién eres?',
  pin: 'Tu PIN secreto',
};

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

/** Ventana para entrar: estudiante con código de clase, Google, o seguir sin cuenta. */
export function Acceso() {
  const abierta = useApp((s) => s.accesoAbierto);
  const abrirVentana = useApp((s) => s.abrirVentana);
  const googleActivo = useSesion((s) => s.googleActivo);
  const entrarConGoogle = useSesion((s) => s.entrarConGoogle);
  const entrarConClase = useSesion((s) => s.entrarConClase);

  const [paso, setPaso] = useState<Paso>('inicio');
  const [codigo, setCodigo] = useState('');
  const [clase, setClase] = useState<ClaseEncontrada | null>(null);
  const [alumno, setAlumno] = useState<AlumnoClase | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!abierta) return;
    setPaso('inicio');
    setCodigo('');
    setClase(null);
    setAlumno(null);
    setPin('');
    setError('');
    setOcupado(false);
  }, [abierta]);

  const cerrar = () => abrirVentana('acceso', false);

  const buscar = async () => {
    setError('');
    if (normalizarCodigo(codigo).length < 4)
      return setError('El código tiene al menos 4 letras o números.');
    setOcupado(true);
    try {
      const c = await buscarClase(codigo);
      if (c.alumnos.length === 0) setError('Tu docente aún no agregó estudiantes a esta clase.');
      else {
        setClase(c);
        setPaso('alumnos');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se encontró la clase.');
    } finally {
      setOcupado(false);
    }
  };

  const entrar = async (a: AlumnoClase, pinEscrito?: string) => {
    setOcupado(true);
    setError('');
    const r = await entrarConClase(codigo, a.id, pinEscrito);
    setOcupado(false);
    if (r.ok) return cerrar();
    setError(r.mensaje);
    setPin('');
    if (r.necesitaPin) setPaso('pin');
  };

  const elegirAlumno = (a: AlumnoClase) => {
    setAlumno(a);
    setError('');
    if (a.hasPin) setPaso('pin');
    else void entrar(a);
  };

  const teclear = (d: string) => {
    if (ocupado || pin.length >= 4) return;
    const nuevo = pin + d;
    setPin(nuevo);
    if (nuevo.length === 4 && alumno) void entrar(alumno, nuevo);
  };

  const google = async () => {
    setError('');
    const problema = await entrarConGoogle();
    if (problema) setError(problema);
  };

  return (
    <Ventana abierta={abierta} titulo={TITULOS[paso]} alCerrar={cerrar}>
      {paso === 'inicio' && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="tarjeta-boton !flex-row !justify-start !gap-3 !p-4 text-left"
            onClick={() => setPaso('codigo')}
          >
            <span className="text-4xl" aria-hidden="true">
              🎒
            </span>
            <span>
              <span className="titulo block text-xl font-extrabold">Soy estudiante</span>
              <span className="text-sm font-bold text-[var(--texto-suave)]">
                Con el código de mi clase
              </span>
            </span>
          </button>

          <button
            type="button"
            className="tarjeta-boton !flex-row !justify-start !gap-3 !p-4 text-left disabled:opacity-60"
            onClick={google}
            disabled={googleActivo !== true}
          >
            <GoogleG />
            <span>
              <span className="titulo block text-xl font-extrabold">Continuar con Google</span>
              <span className="text-sm font-bold text-[var(--texto-suave)]">
                {googleActivo === false
                  ? 'Muy pronto: tu docente lo está activando'
                  : googleActivo === null
                    ? 'Revisando…'
                    : 'Con la cuenta de tu colegio'}
              </span>
            </span>
          </button>

          <button type="button" className="btn btn-suave" onClick={cerrar}>
            Seguir sin cuenta
          </button>
          <p className="m-0 text-xs font-bold text-[var(--texto-suave)]">
            Sin cuenta, tus proyectos solo quedan en este navegador. Con cuenta los guardas en la
            nube y puedes abrirlos en cualquier computador. Kody solo muestra tu apodo, nunca tu
            correo.
          </p>
        </div>
      )}

      {paso === 'codigo' && (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void buscar();
          }}
        >
          <label className="text-sm font-bold text-[var(--texto-suave)]">
            Escribe el código que te dio tu docente
            <input
              className="campo mt-1 text-center text-2xl font-extrabold uppercase tracking-widest"
              value={codigo}
              onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
              autoFocus
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={12}
              aria-label="Código de la clase"
            />
          </label>
          <button type="submit" className="btn" disabled={ocupado}>
            {ocupado ? 'Buscando…' : 'Buscar mi clase'}
          </button>
          <button type="button" className="btn btn-suave" onClick={() => setPaso('inicio')}>
            ← Volver
          </button>
        </form>
      )}

      {paso === 'alumnos' && clase && (
        <div>
          <p className="m-0 mb-2 font-bold">Clase: {clase.nombre}</p>
          <ul className="m-0 grid max-h-72 list-none grid-cols-2 gap-2 overflow-y-auto p-0">
            {clase.alumnos.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="tarjeta-boton w-full"
                  onClick={() => elegirAlumno(a)}
                  disabled={ocupado}
                >
                  <span className="text-3xl" aria-hidden="true">
                    {a.avatar}
                  </span>
                  <span className="text-sm font-extrabold">{a.name}</span>
                  {a.hasPin && (
                    <span className="text-xs" aria-label="Tiene PIN">
                      🔒
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-suave mt-3" onClick={() => setPaso('codigo')}>
            ← Cambiar de clase
          </button>
        </div>
      )}

      {paso === 'pin' && alumno && (
        <div className="flex flex-col items-center gap-3">
          <p className="m-0 font-bold">
            {alumno.avatar} {alumno.name}
          </p>
          <div className="flex gap-2" aria-label={`${pin.length} de 4 números escritos`} role="img">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-5 w-5 rounded-full border-[3px] border-[var(--primario)] ${i < pin.length ? 'bg-[var(--primario)]' : ''}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                className="btn btn-suave !min-h-14 !min-w-16 !text-2xl"
                onClick={() => teclear(d)}
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-suave !min-h-14 !text-lg"
              onClick={() => setPin('')}
              aria-label="Borrar"
            >
              ⌫
            </button>
            <button
              type="button"
              className="btn btn-suave !min-h-14 !min-w-16 !text-2xl"
              onClick={() => teclear('0')}
            >
              0
            </button>
            <button
              type="button"
              className="btn btn-suave !min-h-14 !text-sm"
              onClick={() => {
                setPin('');
                setPaso('alumnos');
              }}
            >
              ← Atrás
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="m-0 mt-3 rounded-xl border-[3px] border-[var(--peligro)] p-3 text-sm font-bold"
        >
          {error}
        </p>
      )}
    </Ventana>
  );
}
