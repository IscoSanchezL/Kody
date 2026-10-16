import type {
  Cesion,
  DatosProyecto,
  EstadoActor,
  Expr,
  ModoEjecucion,
  Monitores,
  Oyentes,
  Programa,
  Sentencia,
} from './tipos';
import { ESCENARIO, RADIO_ACTOR } from './tipos';

/** Máximo de bloques por hilo y por cuadro antes de cortar (protege contra bucles locos). */
const PRESUPUESTO_PASOS = 5000;

const normalizar = (g: number) => {
  const r = ((((g + 180) % 360) + 360) % 360) - 180;
  return r === -180 ? 180 : r;
};
/** Una lista no puede crecer sin freno (protege la memoria del equipo). */
export const MAX_ELEMENTOS_LISTA = 1000;
const MAX_TEXTO = 500;
const limitarNumero = (n: number) => (Number.isFinite(n) ? n : 0);

type Valor = number | string | boolean;

interface Hilo {
  id: number;
  actorId: string;
  programaId: string;
  gen: Generator<Cesion, void, void>;
  /** Tiempo (ms del reloj interno) hasta el que duerme. */
  duermeHasta: number;
  bloqueActivo: string | null;
  terminado: boolean;
}

interface Manejador {
  actorId: string;
  programa: Programa;
}

/**
 * Runtime de Kody: ejecuta programas como hilos cooperativos (generadores).
 * El reloj es interno y se avanza con `tick(dt)`, lo que lo hace determinista y testeable.
 *
 * Programas con sombrero "al hacer clic en ▶" arrancan al ejecutar; los demás sombreros
 * (tecla, clic en actor, mensaje) quedan escuchando mientras el proyecto está corriendo.
 */
export class Runtime {
  readonly actores = new Map<string, EstadoActor>();
  private inicial = new Map<string, EstadoActor>();
  private hilos: Hilo[] = [];
  private manejadores: Manejador[] = [];
  private teclas = new Set<string>();
  private reloj = 0;
  private siguienteHilo = 1;
  modo: ModoEjecucion = 'detenido';
  /** Escenario actual (id de fondo). */
  fondo = '';
  private fondoInicial = '';
  private aleatorio: () => number;
  // Variables y listas (para todos los actores). Solo existen las que declara el proyecto.
  private variables = new Map<string, number | string>();
  private listas = new Map<string, (number | string)[]>();
  private visibles = new Set<string>();
  private datosSucios = false;
  // Pregunta abierta ("preguntar ... y esperar"), última respuesta, ratón y temporizador.
  private preguntando = false;
  private respuesta = '';
  private raton = { x: 0, y: 0, abajo: false };
  private inicioTemporizador = 0;

  constructor(
    private oyentes: Oyentes = {},
    aleatorio: () => number = Math.random,
  ) {
    this.aleatorio = aleatorio;
  }

  // ---------- Actores y escenario ----------

  /** Registra un actor y guarda su estado inicial (para reiniciar al ejecutar). */
  agregarActor(actor: EstadoActor) {
    this.actores.set(actor.id, { ...actor });
    this.inicial.set(actor.id, { ...actor });
  }

  /** Reemplaza todos los actores (al cambiar el proyecto). */
  reemplazarActores(lista: EstadoActor[]) {
    this.actores.clear();
    this.inicial.clear();
    for (const a of lista) this.agregarActor(a);
  }

  /** Cambia el estado inicial y actual de un actor (arrastrar, editar propiedades). */
  fijarInicial(actor: EstadoActor) {
    this.actores.set(actor.id, { ...actor, dialogo: null });
    this.inicial.set(actor.id, { ...actor, dialogo: null });
  }

  fijarFondoInicial(id: string) {
    this.fondo = id;
    this.fondoInicial = id;
  }

  // ---------- Ciclo de vida ----------

  private cambiarModo(m: ModoEjecucion) {
    this.modo = m;
    this.oyentes.alCambiarModo?.(m);
  }

  private reiniciarEscena() {
    for (const [id, ini] of this.inicial) this.actores.set(id, { ...ini, dialogo: null });
    if (this.fondo !== this.fondoInicial) {
      this.fondo = this.fondoInicial;
      this.oyentes.alCambiarFondo?.(this.fondo);
    }
  }

  /** Inicia la ejecución con los programas de cada actor (por id). */
  iniciar(
    porActor: Record<string, Programa[]>,
    paso = false,
    datos: DatosProyecto = { variables: [], listas: [] },
  ) {
    this.detener();
    this.reiniciarEscena();
    this.reiniciarDatos(datos);
    this.respuesta = '';
    this.inicioTemporizador = 0;
    this.reloj = 0;
    this.teclas.clear();
    for (const [actorId, programas] of Object.entries(porActor)) {
      if (!this.actores.has(actorId)) continue;
      for (const p of programas) {
        if (p.sombrero === 'evento_al_ejecutar') this.arrancarHilo(actorId, p);
        else this.manejadores.push({ actorId, programa: p });
      }
    }
    this.cambiarModo(paso ? 'paso-a-paso' : 'corriendo');
    if (this.hilos.length === 0 && this.manejadores.length === 0) this.cambiarModo('detenido');
  }

  /** La interfaz entrega lo que escribió la persona a una pregunta abierta. */
  responder(texto: string) {
    if (!this.preguntando) return;
    this.respuesta = texto.slice(0, MAX_TEXTO);
    this.preguntando = false;
    this.oyentes.alTerminarPregunta?.();
  }

  /** Posición del ratón sobre el escenario (la interfaz la actualiza). */
  fijarRaton(x: number, y: number) {
    this.raton.x = x;
    this.raton.y = y;
  }

  fijarRatonAbajo(abajo: boolean) {
    this.raton.abajo = abajo;
  }

  /** Deja las variables en 0 y las listas vacías, y oculta todos los monitores. */
  private reiniciarDatos(datos: DatosProyecto) {
    this.variables = new Map(datos.variables.map((n) => [n, 0]));
    this.listas = new Map(datos.listas.map((n) => [n, []]));
    this.visibles.clear();
    this.datosSucios = true;
    this.notificarDatos();
  }

  /** Variables y listas que hoy tienen su monitor visible. */
  monitores(): Monitores {
    return {
      variables: [...this.variables]
        .filter(([n]) => this.visibles.has(`v:${n}`))
        .map(([nombre, valor]) => ({ nombre, valor })),
      listas: [...this.listas]
        .filter(([n]) => this.visibles.has(`l:${n}`))
        .map(([nombre, valores]) => ({ nombre, valores: [...valores] })),
    };
  }

  /** Avisa a la interfaz si algo visible cambió (como máximo una vez por fotograma). */
  private notificarDatos() {
    if (!this.datosSucios) return;
    this.datosSucios = false;
    this.oyentes.alCambiarMonitores?.(this.monitores());
  }

  /** Valor actual de una variable (para pruebas y para la interfaz). */
  valorVariable(nombre: string): number | string | undefined {
    return this.variables.get(nombre);
  }

  valoresLista(nombre: string): (number | string)[] | undefined {
    return this.listas.get(nombre);
  }

  pausar() {
    if (this.modo === 'corriendo') this.cambiarModo('pausado');
  }

  reanudar() {
    if (this.modo === 'pausado' || this.modo === 'paso-a-paso') this.cambiarModo('corriendo');
  }

  detener() {
    if (this.preguntando) {
      this.preguntando = false;
      this.oyentes.alTerminarPregunta?.();
    }
    this.hilos = [];
    this.manejadores = [];
    this.teclas.clear();
    for (const a of this.actores.values()) a.dialogo = null;
    this.oyentes.alActivarBloques?.([]);
    if (this.modo !== 'detenido') this.cambiarModo('detenido');
  }

  /** ¿Hay programas escuchando teclas, clics o mensajes? */
  get escuchando() {
    return this.manejadores.length > 0;
  }

  get activo() {
    return this.hilos.length > 0;
  }

  // ---------- Eventos externos ----------

  private arrancarHilo(actorId: string, p: Programa) {
    // Si el mismo programa ya corre, se reinicia (como en Scratch).
    this.hilos = this.hilos.filter((h) => h.programaId !== p.id);
    this.hilos.push({
      id: this.siguienteHilo++,
      actorId,
      programaId: p.id,
      gen: this.ejecutarPila(p.cuerpo, actorId),
      duermeHasta: 0,
      bloqueActivo: null,
      terminado: false,
    });
  }

  presionarTecla(tecla: string) {
    if (this.modo !== 'corriendo') return;
    const nueva = !this.teclas.has(tecla);
    this.teclas.add(tecla);
    if (!nueva) return; // la repetición automática del teclado no relanza programas
    for (const m of this.manejadores) {
      if (m.programa.sombrero === 'evento_tecla' && m.programa.campos.TECLA === tecla) {
        this.arrancarHilo(m.actorId, m.programa);
      }
    }
  }

  soltarTecla(tecla: string) {
    this.teclas.delete(tecla);
  }

  clicActor(actorId: string) {
    if (this.modo !== 'corriendo') return;
    for (const m of this.manejadores) {
      if (m.programa.sombrero === 'evento_clic_actor' && m.actorId === actorId) {
        this.arrancarHilo(m.actorId, m.programa);
      }
    }
  }

  enviar(mensaje: string) {
    for (const m of this.manejadores) {
      if (m.programa.sombrero === 'evento_mensaje' && m.programa.campos.MENSAJE === mensaje) {
        this.arrancarHilo(m.actorId, m.programa);
      }
    }
  }

  // ---------- Planificador ----------

  /** Avanza un fotograma. `dt` en milisegundos. */
  tick(dt: number) {
    if (this.modo !== 'corriendo') return;
    this.reloj += dt;
    for (const h of [...this.hilos]) this.avanzarHilo(h, false);
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

  private limpiarTerminados() {
    this.hilos = this.hilos.filter((h) => !h.terminado);
    this.avisarBloques();
    this.notificarDatos();
    if (this.hilos.length === 0 && this.manejadores.length === 0 && this.modo !== 'detenido') {
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
    if (h.terminado || this.modo === 'detenido' || this.reloj < h.duermeHasta) return;
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

  // ---------- Evaluación de expresiones ----------

  private radio(a: EstadoActor) {
    return (RADIO_ACTOR * a.tamano) / 100;
  }

  /** Límite máximo de x e y para que el actor siga visible. */
  private limites(a: EstadoActor) {
    const r = this.radio(a);
    return { maxX: ESCENARIO.mitadX - r, maxY: ESCENARIO.mitadY - r };
  }

  private sensor(nombre: string, param: string | undefined, a: EstadoActor): Valor {
    switch (nombre) {
      case 'tecla':
        return this.teclas.has(param ?? '');
      case 'borde': {
        const { maxX, maxY } = this.limites(a);
        return Math.abs(a.x) >= maxX - 0.5 || Math.abs(a.y) >= maxY - 0.5;
      }
      case 'tocando': {
        const otro = this.actores.get(param ?? '');
        if (!otro || otro.id === a.id || !otro.visible || !a.visible) return false;
        return Math.hypot(a.x - otro.x, a.y - otro.y) < this.radio(a) + this.radio(otro);
      }
      case 'x':
        return a.x;
      case 'y':
        return a.y;
      case 'dir':
        return a.direccion;
      case 'respuesta':
        return this.respuesta;
      case 'raton-x':
        return this.raton.x;
      case 'raton-y':
        return this.raton.y;
      case 'raton-abajo':
        return this.raton.abajo;
      case 'temporizador':
        return Math.round(((this.reloj - this.inicioTemporizador) / 1000) * 10) / 10;
      case 'distancia': {
        if (param === '__raton__')
          return Math.round(Math.hypot(a.x - this.raton.x, a.y - this.raton.y));
        const otro = this.actores.get(param ?? '');
        return otro ? Math.round(Math.hypot(a.x - otro.x, a.y - otro.y)) : 0;
      }
      default:
        return 0;
    }
  }

  private evaluar(e: Expr, a: EstadoActor): Valor {
    switch (e.tipo) {
      case 'num':
      case 'txt':
        return e.valor;
      case 'no':
        return !this.aBooleano(this.evaluar(e.a, a));
      case 'sensor':
        return this.sensor(e.nombre, e.param, a);
      case 'un': {
        const x = this.evaluar(e.a, a);
        if (e.op === 'longitud') return String(x).length;
        const v = this.aNumero(x);
        switch (e.op) {
          case 'redondear':
            return Math.round(v);
          case 'abs':
            return Math.abs(v);
          case 'raiz':
            return v < 0 ? 0 : limitarNumero(Math.sqrt(v));
          case 'piso':
            return Math.floor(v);
          case 'techo':
            return Math.ceil(v);
          case 'sen':
            return Math.round(Math.sin((v * Math.PI) / 180) * 1e10) / 1e10;
          case 'cos':
            return Math.round(Math.cos((v * Math.PI) / 180) * 1e10) / 1e10;
        }
        return 0;
      }
      case 'var':
        return this.variables.get(e.nombre) ?? 0;
      case 'lis':
        return this.consultarLista(e.lista, e.op, e.a ? this.evaluar(e.a, a) : 0);
      case 'bin': {
        const x = this.evaluar(e.a, a);
        const y = this.evaluar(e.b, a);
        switch (e.op) {
          case '+':
            return limitarNumero(this.aNumero(x) + this.aNumero(y));
          case '-':
            return limitarNumero(this.aNumero(x) - this.aNumero(y));
          case '*':
            return limitarNumero(this.aNumero(x) * this.aNumero(y));
          case '/':
            return limitarNumero(this.aNumero(x) / this.aNumero(y));
          case '>':
            return this.aNumero(x) > this.aNumero(y);
          case '<':
            return this.aNumero(x) < this.aNumero(y);
          case '=':
            return this.iguales(x, y);
          case 'y':
            return this.aBooleano(x) && this.aBooleano(y);
          case 'o':
            return this.aBooleano(x) || this.aBooleano(y);
          case 'resto': {
            const d = this.aNumero(y);
            return d === 0 ? 0 : limitarNumero(this.aNumero(x) % d);
          }
          case 'unir':
            return (String(x) + String(y)).slice(0, MAX_TEXTO);
          case 'letra': {
            const i = Math.floor(this.aNumero(x));
            const t = String(y);
            return i >= 1 && i <= t.length ? t[i - 1] : '';
          }
          case 'contiene':
            return String(x).toLowerCase().includes(String(y).toLowerCase());
          case 'azar': {
            const p = Math.round(this.aNumero(x));
            const q = Math.round(this.aNumero(y));
            const [min, max] = p <= q ? [p, q] : [q, p];
            return min + Math.floor(this.aleatorio() * (max - min + 1));
          }
        }
      }
    }
  }

  /** Responde a "elemento n de", "posición de", "longitud de"... (las posiciones empiezan en 1). */
  private consultarLista(nombre: string, op: string, dato: Valor): Valor {
    const lista = this.listas.get(nombre) ?? [];
    switch (op) {
      case 'longitud':
        return lista.length;
      case 'elemento': {
        const i = Math.floor(this.aNumero(dato));
        return i >= 1 && i <= lista.length ? lista[i - 1] : '';
      }
      case 'posicion':
        return lista.findIndex((x) => this.iguales(x, dato)) + 1;
      case 'contiene':
        return lista.some((x) => this.iguales(x, dato));
      default:
        return lista.join(' ');
    }
  }

  /** Lo que se guarda en una variable o lista: número o texto (nunca un booleano). */
  private aGuardable(v: Valor): number | string {
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return typeof v === 'string' ? v.slice(0, MAX_TEXTO) : limitarNumero(v);
  }

  private aNumero(v: Valor): number {
    if (typeof v === 'boolean') return v ? 1 : 0;
    return limitarNumero(Number(v));
  }

  private aBooleano(v: Valor): boolean {
    if (typeof v === 'string') return v !== '' && v !== '0' && v.toLowerCase() !== 'false';
    return !!v;
  }

  private iguales(x: Valor, y: Valor): boolean {
    const nx = Number(x);
    const ny = Number(y);
    if (typeof x !== 'string' && typeof y !== 'string') return this.aNumero(x) === this.aNumero(y);
    if (x !== '' && y !== '' && !Number.isNaN(nx) && !Number.isNaN(ny)) return nx === ny;
    return String(x).toLowerCase() === String(y).toLowerCase();
  }

  private num(s: Sentencia, nombre: string, a: EstadoActor): number {
    const e = s.entradas[nombre];
    return e ? this.aNumero(this.evaluar(e, a)) : 0;
  }

  private txt(s: Sentencia, nombre: string, a: EstadoActor): string {
    const e = s.entradas[nombre];
    return e ? String(this.evaluar(e, a)) : '';
  }

  /** Condición vacía = falsa (igual que Scratch). */
  private cond(s: Sentencia, nombre: string, a: EstadoActor): boolean {
    const e = s.entradas[nombre];
    return e ? this.aBooleano(this.evaluar(e, a)) : false;
  }

  // ---------- Intérprete ----------

  private *ejecutarPila(pila: Sentencia[], actorId: string): Generator<Cesion, void, void> {
    for (const s of pila) {
      if (this.modo === 'detenido') return; // "detener todo" o botón ■
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
        const pasos = this.num(s, 'PASOS', a);
        a.x += pasos * Math.sin(rad);
        a.y += pasos * Math.cos(rad);
        this.mantenerDentro(a, false);
        break;
      }
      case 'mov_girar_der':
        a.direccion = normalizar(a.direccion + this.num(s, 'GRADOS', a));
        break;
      case 'mov_girar_izq':
        a.direccion = normalizar(a.direccion - this.num(s, 'GRADOS', a));
        break;
      case 'mov_ir_a':
        a.x = this.num(s, 'X', a);
        a.y = this.num(s, 'Y', a);
        this.mantenerDentro(a, false);
        break;
      case 'mov_apuntar':
        a.direccion = normalizar(this.num(s, 'DIR', a));
        break;
      case 'mov_cambiar_x':
        a.x += this.num(s, 'N', a);
        this.mantenerDentro(a, false);
        break;
      case 'mov_cambiar_y':
        a.y += this.num(s, 'N', a);
        this.mantenerDentro(a, false);
        break;
      case 'mov_rebotar':
        this.mantenerDentro(a, true);
        break;
      case 'mov_deslizar': {
        const dur = Math.max(0, this.num(s, 'SEG', a)) * 1000;
        const x0 = a.x;
        const y0 = a.y;
        const x1 = this.num(s, 'X', a);
        const y1 = this.num(s, 'Y', a);
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
        a.dialogo = { texto: this.txt(s, 'TEXTO', a), tipo: 'decir' };
        break;
      case 'ap_pensar':
        a.dialogo = { texto: this.txt(s, 'TEXTO', a), tipo: 'pensar' };
        break;
      case 'ap_decir_seg':
      case 'ap_pensar_seg': {
        const d = {
          texto: this.txt(s, 'TEXTO', a),
          tipo: s.tipo === 'ap_decir_seg' ? ('decir' as const) : ('pensar' as const),
        };
        a.dialogo = d;
        yield { k: 'espera', ms: Math.max(0, this.num(s, 'SEG', a)) * 1000 };
        if (a.dialogo === d) a.dialogo = null;
        break;
      }
      case 'ap_sig_disfraz':
        a.disfrazActual = (a.disfrazActual + 1) % Math.max(1, a.totalDisfraces);
        break;
      case 'ap_cambiar_tamano':
        a.tamano = Math.min(500, Math.max(10, a.tamano + this.num(s, 'N', a)));
        break;
      case 'ap_fijar_tamano':
        a.tamano = Math.min(500, Math.max(10, this.num(s, 'N', a)));
        break;
      case 'ap_mostrar':
        a.visible = true;
        break;
      case 'ap_ocultar':
        a.visible = false;
        break;
      case 'ap_fondo': {
        const id = s.campos.FONDO ?? '';
        if (id && id !== this.fondo) {
          this.fondo = id;
          this.oyentes.alCambiarFondo?.(id);
        }
        break;
      }

      // ----- Sonido -----
      case 'son_tocar':
        this.oyentes.alSonido?.('sonido', s.campos.SONIDO ?? 'pop', 0.3);
        break;
      case 'son_nota': {
        const seg = Math.min(4, Math.max(0.05, this.num(s, 'SEG', a)));
        this.oyentes.alSonido?.('nota', Number(s.campos.NOTA ?? 60), seg);
        yield { k: 'espera', ms: seg * 1000 };
        break;
      }

      // ----- Sensores con efecto -----
      case 'sen_preguntar': {
        // En "paso a paso" no se puede esperar a nadie: se responde en blanco.
        if (this.modo === 'paso-a-paso') {
          this.respuesta = '';
          break;
        }
        this.preguntando = true;
        this.oyentes.alPreguntar?.(this.txt(s, 'TEXTO', a));
        while (this.preguntando && this.modo !== 'detenido') yield { k: 'cuadro' };
        break;
      }
      case 'sen_reiniciar_temporizador':
        this.inicioTemporizador = this.reloj;
        break;

      // ----- Variables -----
      case 'var_fijar': {
        const n = s.campos.VAR ?? '';
        const e = s.entradas.VALOR;
        if (this.variables.has(n) && e) {
          this.variables.set(n, this.aGuardable(this.evaluar(e, a)));
          this.datosSucios = true;
        }
        break;
      }
      case 'var_cambiar': {
        const n = s.campos.VAR ?? '';
        if (this.variables.has(n)) {
          const actual = this.aNumero(this.variables.get(n) ?? 0);
          this.variables.set(n, limitarNumero(actual + this.num(s, 'N', a)));
          this.datosSucios = true;
        }
        break;
      }
      case 'var_mostrar':
      case 'var_ocultar':
        this.cambiarMonitor(`v:${s.campos.VAR ?? ''}`, s.tipo === 'var_mostrar');
        break;

      // ----- Listas -----
      case 'lis_agregar': {
        const l = this.listas.get(s.campos.LISTA ?? '');
        const e = s.entradas.ITEM;
        if (l && e && l.length < MAX_ELEMENTOS_LISTA) {
          l.push(this.aGuardable(this.evaluar(e, a)));
          this.datosSucios = true;
        }
        break;
      }
      case 'lis_borrar': {
        const l = this.listas.get(s.campos.LISTA ?? '');
        const i = Math.floor(this.num(s, 'N', a));
        if (l && i >= 1 && i <= l.length) {
          l.splice(i - 1, 1);
          this.datosSucios = true;
        }
        break;
      }
      case 'lis_borrar_todo': {
        const l = this.listas.get(s.campos.LISTA ?? '');
        if (l) {
          l.length = 0;
          this.datosSucios = true;
        }
        break;
      }
      case 'lis_insertar': {
        const l = this.listas.get(s.campos.LISTA ?? '');
        const e = s.entradas.ITEM;
        const i = Math.floor(this.num(s, 'N', a));
        if (l && e && i >= 1 && i <= l.length + 1 && l.length < MAX_ELEMENTOS_LISTA) {
          l.splice(i - 1, 0, this.aGuardable(this.evaluar(e, a)));
          this.datosSucios = true;
        }
        break;
      }
      case 'lis_reemplazar': {
        const l = this.listas.get(s.campos.LISTA ?? '');
        const e = s.entradas.ITEM;
        const i = Math.floor(this.num(s, 'N', a));
        if (l && e && i >= 1 && i <= l.length) {
          l[i - 1] = this.aGuardable(this.evaluar(e, a));
          this.datosSucios = true;
        }
        break;
      }
      case 'lis_mostrar':
      case 'lis_ocultar':
        this.cambiarMonitor(`l:${s.campos.LISTA ?? ''}`, s.tipo === 'lis_mostrar');
        break;

      // ----- Eventos -----
      case 'ev_enviar':
        this.enviar(s.campos.MENSAJE ?? '');
        break;

      // ----- Control -----
      case 'ctrl_esperar':
        yield { k: 'espera', ms: Math.max(0, this.num(s, 'SEG', a)) * 1000 };
        break;
      case 'ctrl_repetir': {
        const veces = Math.max(0, Math.floor(this.num(s, 'VECES', a)));
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
      case 'ctrl_repetir_hasta':
        while (!this.cond(s, 'COND', a)) {
          yield* this.ejecutarPila(s.hijos.CUERPO ?? [], actorId);
          yield { k: 'cuadro' };
        }
        break;
      case 'ctrl_si':
        if (this.cond(s, 'COND', a)) yield* this.ejecutarPila(s.hijos.CUERPO ?? [], actorId);
        break;
      case 'ctrl_si_sino':
        if (this.cond(s, 'COND', a)) yield* this.ejecutarPila(s.hijos.CUERPO ?? [], actorId);
        else yield* this.ejecutarPila(s.hijos.CUERPO_SINO ?? [], actorId);
        break;
      case 'ctrl_esperar_hasta':
        while (!this.cond(s, 'COND', a)) yield { k: 'cuadro' };
        break;
      case 'ctrl_detener':
        this.detener();
        return;
    }
  }

  private cambiarMonitor(clave: string, visible: boolean) {
    const existe = clave.startsWith('v:')
      ? this.variables.has(clave.slice(2))
      : this.listas.has(clave.slice(2));
    if (!existe) return;
    if (visible) this.visibles.add(clave);
    else this.visibles.delete(clave);
    this.datosSucios = true;
  }

  /**
   * Mantiene al actor visible en el escenario. Con `rebotar`, si está tocando el borde
   * también invierte su dirección (el actor ya fue recortado al borde por el movimiento).
   */
  private mantenerDentro(a: EstadoActor, rebotar: boolean) {
    const { maxX, maxY } = this.limites(a);
    const tol = rebotar ? 0.5 : 0;
    if (a.x > maxX - tol) {
      a.x = Math.min(a.x, maxX);
      if (rebotar) a.direccion = normalizar(-a.direccion);
    } else if (a.x < -maxX + tol) {
      a.x = Math.max(a.x, -maxX);
      if (rebotar) a.direccion = normalizar(-a.direccion);
    }
    if (a.y > maxY - tol) {
      a.y = Math.min(a.y, maxY);
      if (rebotar) a.direccion = normalizar(180 - a.direccion);
    } else if (a.y < -maxY + tol) {
      a.y = Math.max(a.y, -maxY);
      if (rebotar) a.direccion = normalizar(180 - a.direccion);
    }
  }
}
