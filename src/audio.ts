/** Sonidos sintetizados con Web Audio (sin archivos externos, funciona offline). */
let ctx: AudioContext | null = null;

function contexto(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Volumen (0–1) del sonido que se está programando; lo fija quien llama a tocarEfecto/tocarNota. */
let escala = 1;
/** Todo lo que está sonando o por sonar, para poder detenerlo ("detener todos los sonidos"). */
const activos = new Set<AudioScheduledSourceNode>();
function registrar<T extends AudioScheduledSourceNode>(n: T): T {
  activos.add(n);
  n.addEventListener('ended', () => activos.delete(n));
  return n;
}

/** Corta de golpe todos los sonidos en curso. */
export function detenerSonidos() {
  for (const n of [...activos]) {
    try {
      n.stop();
    } catch {
      /* ya había terminado */
    }
  }
  activos.clear();
}

function nota(freq: number, inicio: number, dur: number, tipo: OscillatorType, vol = 0.08) {
  const c = contexto();
  if (!c) return;
  const o = registrar(c.createOscillator());
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol * escala, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + inicio);
  o.stop(c.currentTime + inicio + dur + 0.02);
}

/** Nota que se sostiene (órgano, sintetizador): sube rápido, se mantiene y se apaga suave. */
function sostenida(freq: number, dur: number, tipo: OscillatorType, vol: number, desafine = 0) {
  const c = contexto();
  if (!c) return;
  const o = registrar(c.createOscillator());
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  o.detune.value = desafine;
  const t0 = c.currentTime;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol * escala, t0 + 0.03);
  g.gain.setValueAtTime(vol * escala, t0 + Math.max(0.04, dur - 0.06));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

/** Cuerda pulsada (guitarra): diente de sierra cuyo brillo se apaga rápido. */
function pulsada(freq: number, dur: number, vol: number) {
  const c = contexto();
  if (!c) return;
  const o = registrar(c.createOscillator());
  const f = c.createBiquadFilter();
  const g = c.createGain();
  o.type = 'sawtooth';
  o.frequency.value = freq;
  f.type = 'lowpass';
  f.frequency.setValueAtTime(freq * 8, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(freq * 1.2, c.currentTime + dur);
  g.gain.setValueAtTime(vol * escala, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(f).connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

/** "Imán": un bloque encajó. */
export function sonidoEncaje() {
  nota(520, 0, 0.07, 'triangle');
  nota(780, 0.04, 0.08, 'triangle');
  try {
    navigator.vibrate?.(10);
  } catch {
    /* vibración no disponible */
  }
}

/** Programa terminado con éxito. */
export function sonidoExito() {
  [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.09, 0.18, 'sine', 0.09));
}

export function sonidoInicio() {
  nota(440, 0, 0.08, 'square', 0.04);
  nota(660, 0.06, 0.1, 'square', 0.04);
}

// ---------------------------------------------------------- Bloques de sonido

/** Ruido blanco filtrado (tambor, aplauso, explosión, cohete). `filtroFin` lo barre en el tiempo. */
function ruido(inicio: number, dur: number, vol: number, filtro = 1200, filtroFin?: number) {
  const c = contexto();
  if (!c) return;
  const largo = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, largo, c.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
  const fuente = registrar(c.createBufferSource());
  fuente.buffer = buffer;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(filtro, c.currentTime + inicio);
  if (filtroFin) f.frequency.exponentialRampToValueAtTime(filtroFin, c.currentTime + inicio + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol * escala, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
  fuente.connect(f).connect(g).connect(c.destination);
  fuente.start(c.currentTime + inicio);
}

/** Barrido de frecuencia (boing, láser, salto, maullido...). */
function barrido(
  desde: number,
  hasta: number,
  dur: number,
  tipo: OscillatorType,
  vol = 0.08,
  inicio = 0,
) {
  const c = contexto();
  if (!c) return;
  const o = registrar(c.createOscillator());
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(desde, c.currentTime + inicio);
  o.frequency.exponentialRampToValueAtTime(hasta, c.currentTime + inicio + dur);
  g.gain.setValueAtTime(vol * escala, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + inicio);
  o.stop(c.currentTime + inicio + dur + 0.02);
}

/** Cada sonido de la biblioteca (las claves son las de `src/engine/sonidos.ts`). */
const EFECTOS: Record<string, () => void> = {
  pop: () => barrido(700, 180, 0.12, 'sine', 0.12),
  boing: () => barrido(180, 640, 0.28, 'sine', 0.12),
  ding: () => {
    nota(1318, 0, 0.5, 'triangle', 0.1);
    nota(1760, 0.02, 0.4, 'sine', 0.05);
  },
  laser: () => barrido(1500, 120, 0.25, 'sawtooth', 0.06),
  tambor: () => {
    barrido(160, 50, 0.2, 'sine', 0.2);
    ruido(0, 0.08, 0.08, 800);
  },
  aplauso: () => {
    for (let i = 0; i < 7; i++) ruido(i * 0.06, 0.07, 0.07, 2200 + (i % 3) * 500);
  },
  moneda: () => {
    nota(988, 0, 0.08, 'square', 0.06);
    nota(1319, 0.07, 0.35, 'square', 0.06);
  },
  salto: () => barrido(260, 900, 0.18, 'square', 0.06),
  victoria: () => {
    (
      [
        [523, 0, 0.12],
        [523, 0.13, 0.12],
        [523, 0.26, 0.12],
        [659, 0.4, 0.2],
        [784, 0.62, 0.4],
      ] as const
    ).forEach(([f, t, d]) => nota(f, t, d, 'triangle', 0.12));
  },
  derrota: () => {
    [392, 370, 349, 311].forEach((f, i) =>
      barrido(f * 1.02, f * 0.97, i === 3 ? 0.4 : 0.18, 'sawtooth', 0.06, i * 0.2),
    );
  },
  magia: () => {
    [1047, 1319, 1568, 2093, 2637].forEach((f, i) => {
      nota(f, i * 0.07, 0.25, 'sine', 0.08);
      nota(f * 2, i * 0.07 + 0.02, 0.15, 'sine', 0.03);
    });
  },
  sirena: () => {
    barrido(600, 1000, 0.4, 'sawtooth', 0.05);
    barrido(1000, 600, 0.4, 'sawtooth', 0.05, 0.4);
  },
  gota: () => {
    barrido(1500, 600, 0.1, 'sine', 0.12);
    barrido(900, 500, 0.08, 'sine', 0.06, 0.12);
  },
  explosion: () => {
    ruido(0, 0.7, 0.32, 600, 120);
    barrido(160, 40, 0.5, 'sawtooth', 0.14);
  },
  cohete: () => {
    ruido(0, 1, 0.14, 300, 3000);
    barrido(80, 200, 1, 'sawtooth', 0.04);
  },
  campana: () => {
    nota(660, 0, 1.2, 'sine', 0.1);
    nota(660 * 2.76, 0, 0.8, 'sine', 0.05);
    nota(660 * 5.4, 0, 0.4, 'sine', 0.03);
  },
  pajaro: () => {
    [0, 0.14, 0.28].forEach((t, i) =>
      barrido(2400 + i * 300, 3800 + i * 200, 0.08, 'sine', 0.07, t),
    );
    barrido(3600, 2600, 0.12, 'sine', 0.06, 0.42);
  },
  maullido: () => {
    barrido(500, 900, 0.25, 'sawtooth', 0.045);
    barrido(900, 450, 0.4, 'sawtooth', 0.045, 0.25);
  },
  ladrido: () => {
    [0, 0.25].forEach((t) => {
      barrido(420, 190, 0.14, 'sawtooth', 0.1, t);
      ruido(t, 0.1, 0.06, 700);
    });
  },
};

/** Claves de los sonidos que sabe sintetizar (para comprobar que el catálogo está completo). */
export const SONIDOS_SINTETIZADOS = Object.keys(EFECTOS);

/** Toca un sonido de la biblioteca. `volumen` va de 0 a 100. */
export function tocarEfecto(nombre: string, volumen = 100) {
  const antes = escala;
  escala = Math.max(0, Math.min(1, volumen / 100));
  try {
    EFECTOS[nombre]?.();
  } finally {
    escala = antes;
  }
}

/** Nota MIDI (60 = Do central) con el instrumento elegido. */
export function tocarNota(midi: number, segundos: number, volumen = 100, instrumento = 'piano') {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const dur = Math.max(0.1, segundos);
  const antes = escala;
  escala = Math.max(0, Math.min(1, volumen / 100));
  try {
    switch (instrumento) {
      case 'organo':
        sostenida(freq, dur, 'sine', 0.09);
        sostenida(freq * 2, dur, 'sine', 0.04);
        sostenida(freq * 3, dur, 'sine', 0.02);
        break;
      case 'xilofono':
        nota(freq * 2, 0, Math.min(dur, 0.5), 'sine', 0.14);
        nota(freq * 4, 0, 0.12, 'sine', 0.05);
        break;
      case 'guitarra':
        pulsada(freq, Math.max(dur, 0.4), 0.1);
        break;
      case 'sintetizador':
        sostenida(freq, dur, 'sawtooth', 0.04, -6);
        sostenida(freq, dur, 'sawtooth', 0.04, 6);
        break;
      case 'campanas':
        nota(freq, 0, dur + 0.6, 'sine', 0.1);
        nota(freq * 2.76, 0, (dur + 0.6) * 0.6, 'sine', 0.04);
        nota(freq * 5.4, 0, (dur + 0.6) * 0.3, 'sine', 0.02);
        break;
      default:
        nota(freq, 0, dur, 'triangle', 0.12);
        nota(freq * 2, 0, dur * 0.5, 'sine', 0.03);
    }
  } finally {
    escala = antes;
  }
}
