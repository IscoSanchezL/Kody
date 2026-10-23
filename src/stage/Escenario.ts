import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
  type FederatedPointerEvent,
} from 'pixi.js';
import type { Runtime } from '../engine/runtime';
import { t } from '../i18n';
import { ESCENARIO, RADIO_ACTOR, type Dialogo, type EstadoActor } from '../engine/tipos';
import { alDataUri } from './disfraces';
import { fondoPorId, personajePorId } from './biblioteca';
import { esIcono3D, uriPersonaje } from './uris';
import { rasterizar } from './rasterizar';

const TAM_BASE = 96; // px del actor al 100 %
const TEX_ACTOR = 240; // tamaño (px) con el que se rasteriza cada personaje
const TEX_FONDO = { ancho: 960, alto: 720 };

/** Lo que el escenario necesita saber de la aplicación (sin depender de React). */
export interface PuenteEscenario {
  /** Personaje y variante que se ven con el disfraz `indice` del actor. */
  disfrazDe: (actorId: string, indice: number) => { personaje: string; variante: 0 | 1 };
  seleccionado: () => string;
  cuadricula: () => boolean;
  /** Solo se puede arrastrar cuando el programa está detenido. */
  puedeArrastrar: () => boolean;
  alMover: (actorId: string, x: number, y: number) => void;
  alSeleccionar: (actorId: string) => void;
  alClic: (actorId: string) => void;
  alPuntero: (p: { x: number; y: number } | null) => void;
}

interface VistaActor {
  cont: Container;
  anillo: Graphics;
  sprite: Sprite;
  globo: Container;
  clave: string;
}

const COLOR_PRIMARIO = 0x4f46e5;

/**
 * Escenario de Kody (PixiJS). Dibuja el estado de los actores del runtime
 * y también hace avanzar el runtime en cada fotograma.
 */
export class Escenario {
  private app = new Application();
  private mundo = new Container();
  private capaActores = new Container();
  private capaCuadricula = new Container();
  private fondo = new Sprite();
  private fondoId = '';
  private vistas = new Map<string, VistaActor>();
  private texturas = new Map<string, Texture>();
  private cargando = new Set<string>();
  private arrastre: { id: string; dx: number; dy: number } | null = null;
  private montado = false;
  private observador: ResizeObserver | null = null;
  private destruido = false;

  constructor(private puente: PuenteEscenario) {}

  async montar(host: HTMLElement, runtime: Runtime) {
    await this.app.init({
      resizeTo: host,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    if (this.destruido) {
      this.app.destroy(true);
      return;
    }
    host.appendChild(this.app.canvas);
    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', t('escenario.aria'));
    this.app.canvas.style.touchAction = 'none';

    this.fondo.position.set(-ESCENARIO.mitadX, -ESCENARIO.mitadY);
    this.construirCuadricula();
    this.mundo.addChild(this.fondo, this.capaCuadricula, this.capaActores);
    this.app.stage.addChild(this.mundo);
    this.montado = true;

    this.ajustar();
    this.app.renderer.on('resize', () => this.ajustar());
    // Pixi solo reacciona a la ventana; así también sigue al contenedor (escenario grande, pantalla completa).
    this.observador = new ResizeObserver(() => this.app.resize());
    this.observador.observe(host);
    this.conectarPuntero();

    this.app.ticker.add((t) => {
      runtime.tick(Math.min(t.deltaMS, 100));
      this.dibujarFondo(runtime.fondo);
      this.capaCuadricula.visible = this.puente.cuadricula();
      const vivos = new Set<string>();
      for (const a of runtime.actores.values()) {
        vivos.add(a.id);
        this.dibujarActor(a, runtime.modo);
      }
      for (const [id, v] of this.vistas) {
        if (!vivos.has(id)) {
          v.cont.destroy({ children: true });
          this.vistas.delete(id);
        }
      }
    });
  }

  destruir() {
    this.destruido = true;
    this.observador?.disconnect();
    if (this.montado) this.app.destroy(true, { children: true });
  }

  /** Escala el escenario lógico (480×360) para que quepa en el contenedor. */
  private ajustar() {
    const { width, height } = this.app.screen;
    const escala = Math.min(width / ESCENARIO.ancho, height / ESCENARIO.alto);
    this.mundo.scale.set(escala);
    this.mundo.position.set(width / 2, height / 2);
  }

  // ---------------------------------------------------------- Texturas

  /**
   * Devuelve la textura si ya está lista; si no, empieza a cargarla.
   * El SVG se convierte primero en un lienzo de tamaño fijo: así el resultado no depende
   * de cómo cada navegador (sobre todo Safari) calcula el tamaño de una imagen SVG.
   */
  private textura(clave: string, uri: () => string, ancho: number, alto: number): Texture | null {
    const lista = this.texturas.get(clave);
    if (lista) return lista;
    if (!this.cargando.has(clave)) {
      this.cargando.add(clave);
      rasterizar(uri(), ancho, alto)
        .then((lienzo) => {
          if (!this.destruido) this.texturas.set(clave, Texture.from(lienzo));
        })
        .catch(() => this.cargando.delete(clave));
    }
    return null;
  }

  private dibujarFondo(id: string) {
    if (id === this.fondoId) return;
    const t = this.textura(
      `f:${id}`,
      () => alDataUri(fondoPorId(id).svg),
      TEX_FONDO.ancho,
      TEX_FONDO.alto,
    );
    if (!t) return; // se mantiene el anterior hasta que cargue el nuevo
    this.fondo.texture = t;
    this.fondo.scale.set(ESCENARIO.ancho / TEX_FONDO.ancho, ESCENARIO.alto / TEX_FONDO.alto);
    this.fondoId = id;
  }

  // ----------------------------------------------------- Cuadrícula (ayuda)

  private construirCuadricula() {
    const { mitadX: mx, mitadY: my } = ESCENARIO;
    const g = new Graphics();
    for (let x = -mx; x <= mx; x += 40) {
      g.moveTo(x, -my)
        .lineTo(x, my)
        .stroke({ color: 0x4f46e5, alpha: x === 0 ? 0.9 : 0.25, width: x === 0 ? 2 : 1 });
    }
    for (let y = -my; y <= my; y += 40) {
      if (y % 40 !== 0) continue;
      g.moveTo(-mx, y)
        .lineTo(mx, y)
        .stroke({ color: 0x4f46e5, alpha: y === 0 ? 0.9 : 0.25, width: y === 0 ? 2 : 1 });
    }
    this.capaCuadricula.addChild(g);
    const estilo = {
      fontFamily: 'Nunito, system-ui, sans-serif',
      fontWeight: '800' as const,
      fontSize: 10,
      fill: 0x3730a3,
      stroke: { color: 0xffffff, width: 3 },
    };
    for (let x = -200; x <= 200; x += 40) {
      if (x === 0) continue;
      const t = new Text({ text: String(x), style: estilo });
      t.anchor.set(0.5, 0);
      t.position.set(x, 3);
      this.capaCuadricula.addChild(t);
    }
    for (let y = -160; y <= 160; y += 40) {
      if (y === 0) continue;
      const t = new Text({ text: String(-y), style: estilo });
      t.anchor.set(0, 0.5);
      t.position.set(4, y);
      this.capaCuadricula.addChild(t);
    }
    this.capaCuadricula.visible = false;
  }

  // ------------------------------------------------------------ Puntero

  private conectarPuntero() {
    const st = this.app.stage;
    st.eventMode = 'static';
    st.hitArea = this.app.screen;
    st.on('pointermove', (e: FederatedPointerEvent) => {
      const p = this.mundo.toLocal(e.global);
      const x = Math.round(p.x);
      const y = Math.round(-p.y);
      const dentro = Math.abs(x) <= ESCENARIO.mitadX && Math.abs(y) <= ESCENARIO.mitadY;
      this.puente.alPuntero(dentro ? { x, y } : null);
      if (this.arrastre) {
        const r = RADIO_ACTOR * 0.5;
        const nx = Math.max(
          -ESCENARIO.mitadX + r,
          Math.min(ESCENARIO.mitadX - r, x - this.arrastre.dx),
        );
        const ny = Math.max(
          -ESCENARIO.mitadY + r,
          Math.min(ESCENARIO.mitadY - r, y - this.arrastre.dy),
        );
        this.puente.alMover(this.arrastre.id, Math.round(nx), Math.round(ny));
      }
    });
    const soltar = () => {
      this.arrastre = null;
    };
    st.on('pointerup', soltar);
    st.on('pointerupoutside', soltar);
    this.app.canvas.addEventListener('pointerleave', () => this.puente.alPuntero(null));
  }

  // ------------------------------------------------------------- Actores

  private crearVista(a: EstadoActor): VistaActor {
    const cont = new Container();
    const anillo = new Graphics();
    const sprite = new Sprite();
    sprite.anchor.set(0.5);
    const globo = new Container();
    cont.addChild(anillo, sprite, globo);
    cont.eventMode = 'static';
    sprite.eventMode = 'static';
    sprite.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      if (this.puente.puedeArrastrar()) {
        const p = this.mundo.toLocal(e.global);
        const est = a;
        this.arrastre = { id: a.id, dx: Math.round(p.x) - est.x, dy: Math.round(-p.y) - est.y };
        this.puente.alSeleccionar(a.id);
      } else {
        this.puente.alClic(a.id);
      }
    });
    this.capaActores.addChild(cont);
    const v = { cont, anillo, sprite, globo, clave: '' };
    this.vistas.set(a.id, v);
    return v;
  }

  private dibujarActor(a: EstadoActor, modo: string) {
    const v = this.vistas.get(a.id) ?? this.crearVista(a);
    const parado = modo === 'detenido';
    v.cont.visible = a.visible;
    v.cont.position.set(a.x, -a.y);
    v.sprite.cursor = parado ? 'grab' : 'pointer';

    const { personaje, variante: disfraz } = this.puente.disfrazDe(a.id, a.disfrazActual);
    const pers = personajePorId(personaje);
    const tex = this.textura(
      `p:${pers.id}:${disfraz}:${esIcono3D(pers.id, disfraz) ? '3d' : 'svg'}`,
      () => uriPersonaje(pers.id, disfraz),
      TEX_ACTOR,
      TEX_ACTOR,
    );
    if (tex) {
      v.sprite.texture = tex;
      const lado = (TAM_BASE * a.tamano) / 100;
      const s = lado / TEX_ACTOR;
      // Mira a la izquierda si su dirección es negativa (giro "izquierda-derecha").
      v.sprite.scale.set(a.direccion < 0 ? -s : s, s);
    }
    const lado = (TAM_BASE * a.tamano) / 100;

    // Anillo de selección (solo con el programa detenido)
    v.anillo.clear();
    if (parado && this.puente.seleccionado() === a.id) {
      const r = (RADIO_ACTOR * a.tamano) / 100 + 8;
      v.anillo
        .circle(0, 0, r)
        .fill({ color: COLOR_PRIMARIO, alpha: 0.12 })
        .stroke({ color: COLOR_PRIMARIO, alpha: 0.9, width: 3 });
    }
    this.actualizarGlobo(v, a.dialogo, lado, a);
  }

  private actualizarGlobo(v: VistaActor, d: Dialogo | null, lado: number, a: EstadoActor) {
    const clave = d ? `${d.tipo}:${d.texto}` : '';
    if (clave !== v.clave) {
      v.clave = clave;
      v.globo.removeChildren().forEach((c) => c.destroy({ children: true }));
      if (d) this.construirGlobo(v.globo, d);
    }
    if (d) {
      // Mantiene el globo dentro del escenario.
      const w = v.globo.width;
      const gx =
        Math.max(-ESCENARIO.mitadX + 4 - (a.x - w / 2), 0) +
        Math.min(ESCENARIO.mitadX - 4 - (a.x + w / 2), 0);
      const gy = Math.max(-lado / 2 - 6, -ESCENARIO.mitadY + v.globo.height + 4 + a.y);
      v.globo.position.set(gx, gy);
    }
  }

  private construirGlobo(cont: Container, d: Dialogo) {
    const texto = new Text({
      text: d.texto,
      style: {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontWeight: '800',
        fontSize: 15,
        fill: 0x1e1b4b,
        wordWrap: true,
        wordWrapWidth: 150,
        align: 'center',
      },
    });
    const pad = 10;
    const w = Math.max(48, texto.width + pad * 2);
    const h = texto.height + pad * 2;
    const bg = new Graphics();
    bg.roundRect(-w / 2, -h, w, h, 14)
      .fill(0xffffff)
      .stroke({ color: COLOR_PRIMARIO, width: 2.5 });
    if (d.tipo === 'decir') {
      bg.poly([-8, -2, 8, -2, 0, 12]).fill(0xffffff);
      bg.moveTo(-8, -1).lineTo(0, 12).lineTo(8, -1).stroke({ color: COLOR_PRIMARIO, width: 2.5 });
      bg.rect(-7, -4, 14, 4).fill(0xffffff);
    } else {
      bg.circle(-4, 8, 5).fill(0xffffff).stroke({ color: COLOR_PRIMARIO, width: 2 });
      bg.circle(-9, 17, 3).fill(0xffffff).stroke({ color: COLOR_PRIMARIO, width: 2 });
    }
    texto.anchor.set(0.5, 0);
    texto.position.set(0, -h + pad);
    cont.addChild(bg, texto);
  }
}
