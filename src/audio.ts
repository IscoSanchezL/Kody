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

// ---------------------------------------------------------- Bloques de sonido

/** Ruido blanco corto (para tambor y aplauso). */
function ruido(inicio: number, dur: number, vol: number, filtro = 1200) {
  const c = contexto();
  if (!c) return;
  const largo = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, largo, c.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
  const fuente = c.createBufferSource();
  fuente.buffer = buffer;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = filtro;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
  fuente.connect(f).connect(g).connect(c.destination);
  fuente.start(c.currentTime + inicio);
}

/** Barrido de frecuencia (boing, láser). */
function barrido(desde: number, hasta: number, dur: number, tipo: OscillatorType, vol = 0.08) {
  const c = contexto();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(desde, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(hasta, c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

/** Efectos del bloque "tocar sonido". */
export function tocarEfecto(nombre: string) {
  switch (nombre) {
    case 'pop':
      barrido(700, 180, 0.12, 'sine', 0.12);
      break;
    case 'boing':
      barrido(180, 640, 0.28, 'sine', 0.12);
      break;
    case 'ding':
      nota(1318, 0, 0.5, 'triangle', 0.1);
      nota(1760, 0.02, 0.4, 'sine', 0.05);
      break;
    case 'laser':
      barrido(1500, 120, 0.25, 'sawtooth', 0.06);
      break;
    case 'tambor':
      barrido(160, 50, 0.2, 'sine', 0.2);
      ruido(0, 0.08, 0.08, 800);
      break;
    case 'aplauso':
      for (let i = 0; i < 7; i++) ruido(i * 0.06, 0.07, 0.07, 2200 + (i % 3) * 500);
      break;
  }
}

/** Nota MIDI (60 = Do central) del bloque "tocar nota". */
export function tocarNota(midi: number, segundos: number) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  nota(freq, 0, Math.max(0.1, segundos), 'triangle', 0.12);
}
