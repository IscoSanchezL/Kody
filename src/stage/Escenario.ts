import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { Runtime } from '../engine/runtime';
import { ESCENARIO, type Dialogo, type EstadoActor } from '../engine/tipos';
import { alDataUri, kodySVG } from './disfraces';

const TAM_BASE = 96; // px del actor al 100 %

interface VistaActor {
  cont: Container;
  sprite: Sprite;
  globo: Container;
  clave: string;
}

/** Carga un SVG como textura de Pixi. */
async function textura(svg: string): Promise<Texture> {
  const img = new Image();
  img.src = alDataUri(svg);
  await img.decode();
  return Texture.from(img);
}

/**
 * Escenario de Kody (PixiJS). Dibuja el estado de los actores del runtime
 * y también hace avanzar el runtime en cada fotograma.
 */
export class Escenario {
  private app = new Application();
  private mundo = new Container();
  private capaActores = new Container();
  private vistas = new Map<string, VistaActor>();
  private texturas: Texture[] = [];
  private montado = false;
  private destruido = false;

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
    this.app.canvas.setAttribute('aria-label', 'Escenario donde se mueve Kody');

    this.texturas = [await textura(kodySVG(0)), await textura(kodySVG(1))];
    this.dibujarFondo();
    this.mundo.addChild(this.capaActores);
    this.app.stage.addChild(this.mundo);
    this.montado = true;

    this.ajustar();
    this.app.renderer.on('resize', () => this.ajustar());

    this.app.ticker.add((t) => {
      runtime.tick(Math.min(t.deltaMS, 100));
      for (const a of runtime.actores.values()) this.dibujarActor(a);
    });
  }

  destruir() {
    this.destruido = true;
    if (this.montado) this.app.destroy(true, { children: true });
  }

  /** Escala el escenario lógico (480×360) para que quepa en el contenedor. */
  private ajustar() {
    const { width, height } = this.app.screen;
    const escala = Math.min(width / ESCENARIO.ancho, height / ESCENARIO.alto);
    this.mundo.scale.set(escala);
    this.mundo.position.set(width / 2, height / 2);
  }

  private dibujarFondo() {
    const { mitadX: mx, mitadY: my } = ESCENARIO;
    const g = new Graphics();
    // cielo
    g.rect(-mx, -my, mx * 2, my * 2).fill(0xbae6fd);
    g.rect(-mx, -my, mx * 2, my * 0.7).fill({ color: 0xe0f2fe, alpha: 0.7 });
    // sol
    g.circle(160, -110, 34)
      .fill(0xfde047)
      .circle(160, -110, 46)
      .fill({ color: 0xfde047, alpha: 0.25 });
    // nubes
    for (const [cx, cy, r] of [
      [-150, -120, 1],
      [10, -145, 0.8],
      [100, -80, 0.6],
    ] as const) {
      g.circle(cx, cy, 20 * r)
        .circle(cx + 22 * r, cy + 4 * r, 16 * r)
        .circle(cx - 22 * r, cy + 6 * r, 14 * r)
        .fill({ color: 0xffffff, alpha: 0.9 });
    }
    // colinas
    g.ellipse(-130, 70, 190, 80).fill(0x86efac);
    g.ellipse(150, 85, 200, 85).fill(0x4ade80);
    // suelo
    g.rect(-mx, 60, mx * 2, my - 60).fill(0x22c55e);
    g.rect(-mx, 60, mx * 2, 8).fill({ color: 0x16a34a, alpha: 0.6 });
    // marco redondeado
    g.roundRect(-mx, -my, mx * 2, my * 2, 0).stroke({ color: 0x000000, alpha: 0.06, width: 2 });
    this.mundo.addChild(g);
  }

  private crearVista(a: EstadoActor): VistaActor {
    const cont = new Container();
    const sprite = new Sprite(this.texturas[0]);
    sprite.anchor.set(0.5);
    const globo = new Container();
    cont.addChild(sprite, globo);
    this.capaActores.addChild(cont);
    const v = { cont, sprite, globo, clave: '' };
    this.vistas.set(a.id, v);
    return v;
  }

  private dibujarActor(a: EstadoActor) {
    const v = this.vistas.get(a.id) ?? this.crearVista(a);
    v.cont.visible = a.visible;
    v.cont.position.set(a.x, -a.y);
    const textura = this.texturas[a.disfrazActual % this.texturas.length];
    if (v.sprite.texture !== textura) v.sprite.texture = textura;
    const lado = (TAM_BASE * a.tamano) / 100;
    v.sprite.width = lado;
    v.sprite.height = lado;
    // Estilo de giro "izquierda-derecha": mira a la izquierda si la dirección es negativa.
    if (a.direccion < 0) v.sprite.scale.x = -Math.abs(v.sprite.scale.x);
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
      v.globo.position.set(gx, -lado / 2 - 6);
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
      .stroke({ color: 0x4f46e5, width: 2.5 });
    if (d.tipo === 'decir') {
      bg.poly([-8, -2, 8, -2, 0, 12]).fill(0xffffff);
      bg.moveTo(-8, -1).lineTo(0, 12).lineTo(8, -1).stroke({ color: 0x4f46e5, width: 2.5 });
      bg.rect(-7, -4, 14, 4).fill(0xffffff);
    } else {
      bg.circle(-4, 8, 5).fill(0xffffff).stroke({ color: 0x4f46e5, width: 2 });
      bg.circle(-9, 17, 3).fill(0xffffff).stroke({ color: 0x4f46e5, width: 2 });
    }
    texto.anchor.set(0.5, 0);
    texto.position.set(0, -h + pad);
    cont.addChild(bg, texto);
  }
}
