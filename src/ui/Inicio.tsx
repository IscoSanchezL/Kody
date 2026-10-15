import { motion, useReducedMotion } from 'framer-motion';
import { PERSONAJES } from '../stage/biblioteca';
import { alDataUri } from '../stage/disfraces';
import { useSesion } from '../nube/sesion';
import { useApp } from '../store/useApp';

const BASE = import.meta.env.BASE_URL;

/** Bloques que se arman solos; colores suaves, con acabado de cristal. */
const PILA = [
  { texto: 'al hacer clic en 🏁', tono: '#e2b062', hat: true },
  { texto: 'mover 10 pasos', tono: '#7ea6e0' },
  { texto: 'repetir 4 veces', tono: '#74c4a0' },
  { texto: 'decir ¡Hola, mundo!', tono: '#a99be6' },
];
const CICLO = 9; // segundos por vuelta

const CRISTALES = [
  { x: '4%', y: '14%', t: 120, r: 12, d: 14, clip: 'polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)' },
  { x: '84%', y: '58%', t: 150, r: -18, d: 18, clip: 'polygon(30% 0,100% 20%,70% 100%,0 70%)' },
  { x: '72%', y: '6%', t: 70, r: 25, d: 11, clip: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' },
  { x: '12%', y: '74%', t: 90, r: -8, d: 16, clip: 'polygon(0 20%,60% 0,100% 60%,40% 100%)' },
];

const PASOS = [
  { n: '01', titulo: 'Arma con bloques', texto: 'Une piezas para dar órdenes. Sin escribir código.' },
  { n: '02', titulo: 'Dirige el escenario 3D', texto: '8 personajes y 8 mundos que responden a tu programa.' },
  { n: '03', titulo: 'Guarda en la nube', texto: 'Tu cuenta lleva tus proyectos a cualquier computador.' },
];

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const cristal =
  'border border-white/15 bg-gradient-to-br from-white/[0.12] to-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_20px_50px_-20px_rgba(0,0,0,0.6)]';

/** Pila de bloques que cae, encaja, se ejecuta y se reinicia. */
function PilaAnimada({ quieta }: { quieta: boolean }) {
  const n = PILA.length;
  return (
    <div className="relative mx-auto w-full max-w-[22rem]" aria-hidden="true">
      <div className="flex flex-col items-start gap-1">
        {PILA.map((b, i) => {
          // Momento (0–1) en que encaja cada bloque, y momento en que se ilumina al ejecutarse.
          const entra = 0.04 + i * 0.1;
          const encaja = entra + 0.07;
          const brilla = 0.52 + i * 0.07;
          const sale = 0.93;
          return (
            <motion.div
              key={b.texto}
              className={`relative flex h-12 items-center px-5 text-[15px] font-extrabold text-white ${
                b.hat ? 'rounded-t-[26px] rounded-b-xl' : 'rounded-xl'
              }`}
              style={{
                marginLeft: i === 3 ? 28 : 0,
                background: `linear-gradient(135deg, ${b.tono}f0, ${b.tono}a0)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,.55), inset 0 -3px 0 rgba(0,0,0,.18), 0 10px 30px -10px ${b.tono}`,
                border: '1px solid rgba(255,255,255,.35)',
                minWidth: i === 0 ? 220 : i === 3 ? 200 : 230,
              }}
              initial={quieta ? false : { opacity: 0, y: -90, rotate: i % 2 ? 8 : -8 }}
              animate={
                quieta
                  ? undefined
                  : {
                      opacity: [0, 0, 1, 1, 1, 1, 0],
                      y: [-90, -90, 4, 0, 0, 0, 14],
                      rotate: [i % 2 ? 8 : -8, i % 2 ? 8 : -8, 0, 0, 0, 0, 0],
                      filter: [
                        'brightness(1)', 'brightness(1)', 'brightness(1.1)', 'brightness(1)',
                        'brightness(1.5)', 'brightness(1)', 'brightness(1)',
                      ],
                    }
              }
              transition={{
                duration: CICLO,
                times: [0, entra, encaja, encaja + 0.03, brilla, brilla + 0.06, sale],
                repeat: Infinity,
                ease: 'easeOut',
              }}
            >
              <span className="absolute inset-x-3 top-1 h-px bg-white/50" />
              {b.texto}
              <span className="absolute -bottom-[7px] left-6 h-[8px] w-8 rounded-b-md" style={{ background: `${b.tono}c0` }} />
            </motion.div>
          );
        })}
      </div>

      {/* Mini escenario: Kody avanza cuando se ejecutan los bloques */}
      <div className={`relative mt-6 h-24 overflow-hidden rounded-2xl ${cristal}`}>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-cyan-300/20 to-transparent" />
        <motion.img
          src={`${BASE}kody-logo.svg`}
          alt=""
          width={64}
          height={64}
          className="absolute bottom-2 left-4 drop-shadow-[0_8px_16px_rgba(0,0,0,.5)]"
          animate={quieta ? undefined : { x: [0, 0, 0, 70, 140, 210, 210, 0], rotate: [0, 0, 0, 0, 0, 0, 0, 0], scale: [1, 1, 1, 1, 1, 1, 1.1, 1] }}
          transition={{ duration: CICLO, times: [0, 0.5, 0.52, 0.6, 0.68, 0.76, 0.86, 0.95], repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute right-4 top-3 rounded-xl border border-white/30 bg-white/15 px-3 py-1 text-sm font-extrabold text-white backdrop-blur"
          initial={quieta ? false : { opacity: 0, scale: 0.8 }}
          animate={quieta ? undefined : { opacity: [0, 0, 1, 1, 0, 0], scale: [0.8, 0.8, 1, 1, 0.95, 0.95] }}
          transition={{ duration: CICLO, times: [0, 0.74, 0.78, 0.9, 0.93, 1], repeat: Infinity }}
        >
          ¡Hola, mundo!
        </motion.span>
      </div>
      {/* Carga: indica el progreso del programa */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300"
          initial={{ width: 0 }}
          animate={quieta ? { width: '100%' } : { width: ['0%', '0%', '100%', '100%'] }}
          transition={{ duration: CICLO, times: [0, 0.5, 0.86, 1], repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <span className="sr-only">{n} bloques de ejemplo</span>
    </div>
  );
}

/** Página de inicio: presenta Kody y deja elegir cómo entrar. */
export function Inicio() {
  const quieta = !!useReducedMotion();
  const abrirVentana = useApp((s) => s.abrirVentana);
  const setPantalla = useApp((s) => s.setPantalla);
  const googleActivo = useSesion((s) => s.googleActivo);
  const entrarConGoogle = useSesion((s) => s.entrarConGoogle);

  const google = async () => {
    const problema = await entrarConGoogle();
    if (problema) abrirVentana('acceso', true);
  };
  const sube = (i: number) => ({
    initial: quieta ? false : { opacity: 0, y: 26, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[#070a1c] text-white">
      {/* Fondo: cuadrícula técnica, auroras suaves y cristales flotantes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,255,.16) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%,#000 20%,transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%,#000 20%,transparent 75%)',
          }}
        />
        <motion.div
          className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-indigo-500/30 blur-[120px]"
          animate={quieta ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-[120px]"
          animate={quieta ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        {CRISTALES.map((c, i) => (
          <motion.div
            key={i}
            className="absolute hidden border border-white/20 md:block"
            style={{
              left: c.x,
              top: c.y,
              width: c.t,
              height: c.t,
              clipPath: c.clip,
              background: 'linear-gradient(135deg,rgba(255,255,255,.28),rgba(165,180,252,.08) 55%,rgba(255,255,255,.02))',
              backdropFilter: 'blur(6px)',
            }}
            animate={quieta ? { rotate: c.r } : { rotate: [c.r, c.r + 14, c.r], y: [0, -16, 0] }}
            transition={{ duration: c.d, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <main className="relative mx-auto grid min-h-full max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="text-center lg:text-left">
          <motion.p
            {...sube(0)}
            className={`m-0 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-indigo-100 ${cristal}`}
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
            Programación por bloques · para estudiantes
          </motion.p>

          <motion.div {...sube(1)} className="mt-5 flex items-center justify-center gap-4 lg:justify-start">
            <img src={`${BASE}kody-logo.svg`} alt="" width={84} height={84} className="drop-shadow-[0_10px_30px_rgba(125,140,255,.55)]" />
            <h1 className="titulo m-0 bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
              Kody
            </h1>
          </motion.div>

          <motion.p {...sube(2)} className="m-0 mt-4 max-w-lg text-2xl font-bold leading-snug text-indigo-100/90 lg:max-w-xl">
            Arma bloques y mira cómo tus ideas <span className="bg-gradient-to-r from-cyan-200 to-violet-300 bg-clip-text text-transparent">cobran vida</span> en 3D.
          </motion.p>

          <motion.div {...sube(3)} className="mx-auto mt-8 flex max-w-md flex-col gap-3 lg:mx-0">
            <button
              type="button"
              onClick={google}
              disabled={googleActivo !== true}
              className="group relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-b from-indigo-400 to-indigo-600 px-6 py-4 text-xl font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_14px_40px_-10px_rgba(99,102,241,.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-offset-4"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-md transition-transform duration-700 group-hover:translate-x-[420%]" />
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white"><GoogleG /></span>
              {googleActivo === false ? 'Cuenta: muy pronto' : 'Entrar con Google'}
            </button>
            <button
              type="button"
              onClick={() => setPantalla('editor')}
              className="cursor-pointer border-0 bg-transparent p-2 text-base font-extrabold text-indigo-200 underline decoration-indigo-300/40 underline-offset-4 hover:text-white"
            >
              Probar sin cuenta →
            </button>
          </motion.div>

          <motion.ul {...sube(4)} className="m-0 mt-6 flex list-none flex-wrap justify-center gap-2 p-0 lg:justify-start" aria-label="Personajes">
            {PERSONAJES.map((p) => (
              <li key={p.id} className={`rounded-xl p-1.5 ${cristal}`}>
                <img src={alDataUri(p.svg(0))} alt={p.nombre} width={36} height={36} />
              </li>
            ))}
          </motion.ul>
        </section>

        <motion.section
          {...sube(3)}
          className={`relative rounded-[2rem] p-6 sm:p-8 ${cristal}`}
          aria-label="Así se programa con Kody"
        >
          <div className="mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-200/80">
            <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-white/30" /><i className="h-2.5 w-2.5 rounded-full bg-white/20" /><i className="h-2.5 w-2.5 rounded-full bg-white/10" /></span>
            programa.kody
          </div>
          <PilaAnimada quieta={quieta} />
        </motion.section>

        <motion.ul {...sube(5)} className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3 lg:col-span-2">
          {PASOS.map((p) => (
            <li key={p.n} className={`rounded-3xl p-5 text-left ${cristal}`}>
              <span className="font-mono text-sm font-bold text-cyan-200/80">{p.n}</span>
              <h2 className="titulo m-0 mt-1 text-xl font-extrabold">{p.titulo}</h2>
              <p className="m-0 mt-1 text-base font-bold text-indigo-100/75">{p.texto}</p>
            </li>
          ))}
        </motion.ul>

        <footer className="pb-2 text-center text-sm font-bold text-indigo-200/70 lg:col-span-2">
          <a className="text-indigo-100 underline" href={`${BASE}privacidad.html`}>Política de privacidad</a>
          {' · '}Kody solo muestra tu apodo, nunca tu correo.
        </footer>
      </main>
    </div>
  );
}
