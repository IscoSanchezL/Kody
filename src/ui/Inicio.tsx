import { motion, useReducedMotion } from 'framer-motion';
import { PERSONAJES } from '../stage/biblioteca';
import { alDataUri } from '../stage/disfraces';
import { useSesion } from '../nube/sesion';
import { useApp } from '../store/useApp';

const BLOQUES = [
  { texto: 'al hacer clic en 🏁', color: '#f59e0b', x: '6%', y: '16%', r: -8 },
  { texto: 'avanzar 10 pasos', color: '#3b82f6', x: '74%', y: '12%', r: 7 },
  { texto: 'repetir 4 veces', color: '#10b981', x: '10%', y: '70%', r: 6 },
  { texto: 'decir ¡Hola!', color: '#a855f7', x: '70%', y: '74%', r: -6 },
];

const PASOS = [
  { icono: '🧩', titulo: 'Arrastra bloques', texto: 'Une piezas de colores para dar órdenes, sin escribir código.' },
  { icono: '🎭', titulo: 'Dirige a tus personajes', texto: 'Elige entre 8 personajes y 8 escenarios en 3D.' },
  { icono: '☁️', titulo: 'Guarda en la nube', texto: 'Con tu cuenta, tus proyectos te siguen a cualquier computador.' },
];

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

/** Página de inicio: presenta Kody y deja elegir cómo entrar. */
export function Inicio() {
  const quieta = useReducedMotion();
  const abrirVentana = useApp((s) => s.abrirVentana);
  const setPantalla = useApp((s) => s.setPantalla);
  const googleActivo = useSesion((s) => s.googleActivo);
  const entrarConGoogle = useSesion((s) => s.entrarConGoogle);

  const google = async () => {
    const problema = await entrarConGoogle();
    if (problema) abrirVentana('acceso', true);
  };
  const flota = (i: number) =>
    quieta ? {} : { y: [0, -10, 0], transition: { repeat: Infinity, duration: 3 + i * 0.4, ease: 'easeInOut' as const } };

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_top,#4338ca_0%,#1e1b4b_55%,#0f0d2e_100%)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              opacity: 0.25 + (i % 4) * 0.15,
            }}
          />
        ))}
        {BLOQUES.map((b, i) => (
          <motion.div
            key={b.texto}
            className="absolute hidden rounded-2xl px-4 py-2 text-sm font-extrabold shadow-lg sm:block"
            style={{ left: b.x, top: b.y, background: b.color, rotate: b.r }}
            animate={flota(i)}
          >
            {b.texto}
          </motion.div>
        ))}
      </div>

      <main className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center px-5 py-10 text-center">
        <p className="m-0 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-bold">
          Para estudiantes de 4.º grado · en español
        </p>

        <motion.img
          src={alDataUri(PERSONAJES[0].svg(0))}
          alt="Kody, el zorro robot"
          width={168}
          height={168}
          className="mt-6 drop-shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          animate={flota(0)}
        />
        <h1 className="titulo m-0 mt-2 text-6xl font-extrabold tracking-tight sm:text-7xl">Kody</h1>
        <p className="m-0 mt-2 max-w-xl text-xl font-bold text-indigo-100">
          Programa jugando: arma bloques y mira cómo tus personajes cobran vida en 3D.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3">
          <button type="button" className="btn !py-4 !text-xl" onClick={() => abrirVentana('acceso', true)}>
            🎒 Entrar con el código de mi clase
          </button>
          <button
            type="button"
            className="btn btn-suave !py-3 disabled:opacity-60"
            onClick={google}
            disabled={googleActivo !== true}
          >
            <GoogleG /> Continuar con Google
          </button>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-2 text-base font-extrabold text-indigo-100 underline underline-offset-4 hover:text-white"
            onClick={() => setPantalla('editor')}
          >
            Probar sin cuenta →
          </button>
        </div>

        <ul className="m-0 mt-10 flex list-none flex-wrap justify-center gap-2 p-0" aria-label="Personajes">
          {PERSONAJES.map((p, i) => (
            <motion.li key={p.id} animate={flota(i)} className="rounded-2xl bg-white/10 p-2">
              <img src={alDataUri(p.svg(0))} alt={p.nombre} width={56} height={56} />
            </motion.li>
          ))}
        </ul>

        <ul className="m-0 mt-10 grid w-full list-none gap-3 p-0 sm:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.titulo} className="rounded-3xl border border-white/15 bg-white/10 p-5 text-left backdrop-blur">
              <div className="text-4xl" aria-hidden="true">{p.icono}</div>
              <h2 className="titulo m-0 mt-2 text-xl font-extrabold">{p.titulo}</h2>
              <p className="m-0 mt-1 text-base font-bold text-indigo-100">{p.texto}</p>
            </li>
          ))}
        </ul>

        <footer className="mt-10 pb-4 text-sm font-bold text-indigo-200">
          <a className="text-indigo-100 underline" href={`${import.meta.env.BASE_URL}privacidad.html`}>
            Política de privacidad
          </a>
          {' · '}Kody solo muestra tu apodo, nunca tu correo.
        </footer>
      </main>
    </div>
  );
}
