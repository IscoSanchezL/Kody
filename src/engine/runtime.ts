import type {
  Cesion,
  EstadoActor,
  Expr,
  ModoEjecucion,
  Oyentes,
  Programa,
  Sentencia,
} from './tipos';
import { ESCENARIO } from './tipos';

/** Máximo de bloques por hilo y por cuadro antes de cortar (protege contra bucles locos). */
const PRESUPUESTO_PASOS = 5000;

const normalizar = (g: number) => {
  const r = ((((g + 180) % 360) + 360) % 360) - 180;
  return r === -180 ? 180 : r;
};
const limitarNumero = (n: number) => (Number.isFinite(n) ? n : 0);

interface Hilo {
  id: number;
  actorId: string;
  gen: Generator<Cesion, void, void>;
  /** Tiempo (ms del reloj interno) hasta el que duerme. */
  duermeHasta: number;
  bloqueActivo: string | null;
  terminado: boolean;
}

/**
 * Runtime de Kody: ejecuta programas como hilos cooperativos (generadores).
 * El reloj es interno y se avanza con `tick(dt)`, lo que lo hace determinista y testeable.
 */
export class Runtime {
  readonly actores = new Map<string, EstadoActor>();
  private inicial = new Map<string, EstadoActor>();
  private hilos: Hilo[] = [];
  private reloj = 0;
  private siguienteHilo = 1;
  modo: ModoEjecucion = 'detenido';
  private aleatorio: () => number;

  constructor(
    private oyentes: Oyentes = {},
    aleatorio: () => number = Math.random,
  ) {
    this.aleatorio = aleatorio;
  }

  /** Registra un actor y guarda su estado inicial (para reiniciar al ejecutar). */
  agregarActor(actor: EstadoActor) {
    this.actores.set(actor.id, { ...actor });
    this.inicial.set(actor.id, { ...actor });
  }

  private cambiarModo(m: ModoEjecucion) {
    this.modo = m;
    this.oyentes.alCambiarModo?.(m);
  }

  private reiniciarActores() {
    for (const [id, ini] of this.inicial) this.actores.set(id, { ...ini, dialogo: null });
  }

  /** Inicia la ejecución: un hilo por programa, para el actor indicado. */
  iniciar(programas: Programa[], actorId: string, paso = false) {
    this.detener();
    this.reiniciarActores();
    this.reloj = 0;
    for (const p of programas) {
      this.hilos.push({
        id: this.siguienteHilo++,
        actorId,
        gen: this.ejecutarPila(p.cuerpo, actorId),
        duermeHasta: 0,
        bloqueActivo: null,
        terminado: false,
      });
    }
    this.cambiarModo(paso ? 'paso-a-paso' : 'corriendo');
    if (paso) this.avisarBloques();
  }

  pausar() {
    if (this.modo === 'corriendo') this.cambiarModo('pausado');
  }

  reanudar() {
    if (this.modo === 'pausado' || this.modo === 'paso-a-paso') this.cambiarModo('corriendo');
  }

  detener() {
    this.hilos = [];
    for (const a of this.actores.values()) a.dialogo = null;
    this.oyentes.alActivarBloques?.([]);
    if (this.modo !== 'detenido') this.cambiarModo('detenido');
  }

  /** Avanza un fotograma. `dt` en milisegundos. */
  tick(dt: number) {
    if (this.modo !== 'corriendo') return;
    this.reloj += dt;
    for (const h of this.hilos) this.avanzarHilo(h, false);
    this.limpiarTerminados();
  }

  /** Modo paso a paso: ejecuta exactamente un bloque del primer hilo disponible. */
  paso() {
    if (this.modo !== 'paso-a-paso') return;
    // El reloj salta para que las esperas no bloqueen la depuración.
    this.reloj += 1e6;
    const h = this.hilos.find((x) => !x.terminado);
    if (h) this.avanzarHilo(h, true);
    this.limpiarTerminados();
  }

  get activo() {
    return this.hilos.length > 0;
  }

  private limpiarTerminados() {
    this.hilos = this.hilos.filter((h) => !h.terminado);
    this.avisarBloques();
    if (this.hilos.length === 0 && this.modo !== 'detenido') {
      this.cambiarModo('detenido');
    }
  }

  private avisarBloques() {
    const ids = this.hilos.map((h) => h.bloqueActivo).filter((x): x is string => !!x);
    this.oyentes.alActivarBloques?.(ids);
  }

  /**
   * Avanza un hilo hasta su próximo cuadro / espera.
   * En `unPaso`, se detiene tras ejecutar un solo bloque.
   */
  private avanzarHilo(h: Hilo, unPaso: boolean) {
    if (h.terminado || this.reloj < h.duermeHasta) return;
    let gastados = 0;
    let primerPaso = true;
    for (;;) {
      if (++gastados > PRESUPUESTO_PASOS) {
        this.oyentes.alAviso?.(
          '¡Uy! Tu programa se quedó dando vueltas muy rápido. Revisa tus bucles 🔍',
        );
        h.terminado = true;
        return;
      }
      const r = h.gen.next();
      if (r.done) {
        h.terminado = true;
        h.bloqueActivo = null;
        return;
      }
      const c = r.value;
      if (c.k === 'paso') {
        // En paso a paso, el primer "paso" es el bloque que está por ejecutarse.
        if (unPaso && !primerPaso) {
          h.bloqueActivo = c.id;
          return;
        }
        primerPaso = false;
        h.bloqueActivo = c.id;
      } else if (c.k === 'cuadro') {
        if (!unPaso) return;
      } else if (c.k === 'espera') {
        h.duermeHasta = this.reloj + c.ms;
        if (!unPaso) return;
        h.duermeHasta = 0;
      }
    }
  }

  // ---------- Intérprete ----------

  private evaluar(e: Expr): number | string {
    switch (e.tipo) {
      case 'num':
      case 'txt':
        return e.valor;
      case 'aleatorio': {
        const a = Math.round(Number(this.evaluar(e.desde)) || 0);
        const b = Math.round(Number(this.evaluar(e.hasta)) || 0);
        const [min, max] = a <= b ? [a, b] : [b, a];
        return min + Math.floor(this.aleatorio() * (max - min + 1));
      }
    }
  }

  private num(s: Sentencia, nombre: string): number {
    const e = s.entradas[nombre];
    return e ? limitarNumero(Number(this.evaluar(e))) : 0;
  }

  private txt(s: Sentencia, nombre: string): string {
    const e = s.entradas[nombre];
    return e ? String(this.evaluar(e)) : '';
  }

  private *ejecutarPila(pila: Sentencia[], actorId: string): Generator<Cesion, void, void> {
    for (const s of pila) {
      yield { k: 'paso', id: s.id };
      yield* this.ejecutar(s, actorId);
    }
  }

  private *ejecutar(s: Sentencia, actorId: string): Generator<Cesion, void, void> {
    const a = this.actores.get(actorId);
    if (!a) return;
    switch (s.tipo) {
      // ----- Movimiento -----
      case 'mov_mover': {
        const rad = (a.direccion * Math.PI) / 180;
        const pasos = this.num(s, 'PASOS');
        a.x += pasos * Math.sin(rad);
        a.y += pasos * Math.cos(rad);
        this.mantenerDentro(a, false);
        break;
      }
      case 'mov_girar_der':
        a.direccion = normalizar(a.direccion + this.num(s, 'GRADOS'));
        break;
      case 'mov_girar_izq':
        a.direccion = normalizar(a.direccion - this.num(s, 'GRADOS'));
        break;
      case 'mov_ir_a':
        a.x = this.num(s, 'X');
        a.y = this.num(s, 'Y');
        this.mantenerDentro(a, false);
        break;
      case 'mov_apuntar':
        a.direccion = normalizar(this.num(s, 'DIR'));
        break;
      case 'mov_cambiar_x':
        a.x += this.num(s, 'N');
        this.mantenerDentro(a, false);
        break;
      case 'mov_cambiar_y':
        a.y += this.num(s, 'N');
        this.mantenerDentro(a, false);
        break;
      case 'mov_rebotar':
        this.mantenerDentro(a, true);
        break;
      case 'mov_deslizar': {
        const dur = Math.max(0, this.num(s, 'SEG')) * 1000;
        const x0 = a.x;
        const y0 = a.y;
        const x1 = this.num(s, 'X');
        const y1 = this.num(s, 'Y');
        const inicio = this.reloj;
        if (dur === 0) {
          a.x = x1;
          a.y = y1;
          break;
        }
        for (;;) {
          const t = Math.min(1, (this.reloj - inicio) / dur);
          a.x = x0 + (x1 - x0) * t;
          a.y = y0 + (y1 - y0) * t;
          if (t >= 1) break;
          yield { k: 'cuadro' };
        }
        break;
      }

      // ----- Apariencia -----
      case 'ap_decir':
        a.dialogo = { texto: this.txt(s, 'TEXTO'), tipo: 'decir' };
        break;
      case 'ap_pensar':
        a.dialogo = { texto: this.txt(s, 'TEXTO'), tipo: 'pensar' };
        break;
      case 'ap_decir_seg':
      case 'ap_pensar_seg': {
        const d = {
          texto: this.txt(s, 'TEXTO'),
          tipo: s.tipo === 'ap_decir_seg' ? ('decir' as const) : ('pensar' as const),
        };
        a.dialogo = d;
        yield { k: 'espera', ms: Math.max(0, this.num(s, 'SEG')) * 1000 };
        if (a.dialogo === d) a.dialogo = null;
        break;
      }
      case 'ap_sig_disfraz':
        a.disfrazActual = (a.disfrazActual + 1) % Math.max(1, a.totalDisfraces);
        break;
      case 'ap_cambiar_tamano':
        a.tamano = Math.min(500, Math.max(10, a.tamano + this.num(s, 'N')));
        break;
      case 'ap_fijar_tamano':
        a.tamano = Math.min(500, Math.max(10, this.num(s, 'N')));
        break;
      case 'ap_mostrar':
        a.visible = true;
        break;
      case 'ap_ocultar':
        a.visible = false;
        break;

      // ----- Control -----
      case 'ctrl_esperar':
        yield { k: 'espera', ms: Math.max(0, this.num(s, 'SEG')) * 1000 };
        break;
      case 'ctrl_repetir': {
        const veces = Math.max(0, Math.floor(this.num(s, 'VECES')));
        for (let i = 0; i < veces; i++) {
          yield* this.ejecutarPila(s.hijos.CUERPO ?? [], actorId);
          yield { k: 'cuadro' };
        }
        break;
      }
      case 'ctrl_por_siempre':
        for (;;) {
          yield* this.ejecutarPila(s.hijos.CUERPO ?? [], actorId);
          yield { k: 'cuadro' };
        }
    }
  }

  /** Mantiene al actor visible en el escenario; si `rebotar`, también invierte la dirección. */
  private mantenerDentro(a: EstadoActor, rebotar: boolean) {
    const m = 20 * (a.tamano / 100); // margen: el actor nunca desaparece del todo
    const { mitadX, mitadY } = ESCENARIO;
    const maxX = mitadX - m;
    const maxY = mitadY - m;
    if (a.x > maxX) {
      a.x = maxX;
      if (rebotar) a.direccion = normalizar(-a.direccion);
    } else if (a.x < -maxX) {
      a.x = -maxX;
      if (rebotar) a.direccion = normalizar(-a.direccion);
    }
    if (a.y > maxY) {
      a.y = maxY;
      if (rebotar) a.direccion = normalizar(180 - a.direccion);
    } else if (a.y < -maxY) {
      a.y = -maxY;
      if (rebotar) a.direccion = normalizar(180 - a.direccion);
    }
  }
}
