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

function nota(freq: number, inicio: number, dur: number, tipo: OscillatorType, vol = 0.08) {
  const c = contexto();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + inicio);
  o.stop(c.currentTime + inicio + dur + 0.02);
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
