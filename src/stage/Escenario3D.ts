import * as THREE from 'three';
import type { Runtime } from '../engine/runtime';
import { t } from '../i18n';
import { ESCENARIO, RADIO_ACTOR, type Dialogo, type EstadoActor } from '../engine/tipos';
import { alDataUri } from './disfraces';
import { fondoPorId } from './biblioteca';
import type { PuenteEscenario } from './Escenario';
import { crearModelo3D, type Modelo3D } from './modelos3d';
import { rasterizar } from './rasterizar';

/**
 * Escenario 3D de Kody (Three.js): un "teatro de títeres". El fondo pintado queda atrás y los
 * actores 3D están delante, en el plano z = 0. Así x e y significan lo mismo que en 2D.
 */

const FOV = 30;
const PROFUNDIDAD_FONDO = 90;
const ESCALA_TEXTURA = 2; // los globos y la cuadrícula se dibujan al doble para verse nítidos

interface Vista3D {
  personaje: string;
  modelo: Modelo3D;
  raiz: THREE.Group;
  cuerpo: THREE.Group;
  sombra: THREE.Mesh;
  anillo: THREE.Mesh;
  globo: THREE.Sprite | null;
  claveGlobo: string;
  fase: number;
  ultimaX: number;
  ultimaY: number;
  giro: number;
  inclinacion: number;
}

const ACENTO = '#4f46e5';

/** Dibuja un globo de "decir" o "pensar" en un lienzo y lo devuelve como sprite. */
function crearGlobo(d: Dialogo): THREE.Sprite {
  const e = ESCALA_TEXTURA;
  const medida = document.createElement('canvas').getContext('2d')!;
  const fuente = `800 ${15 * e}px Nunito, system-ui, sans-serif`;
  medida.font = fuente;
  const maxAncho = 150 * e;
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of d.texto.split(/\s+/)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (medida.measureText(prueba).width > maxAncho && actual) {
      lineas.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  const alto = 19 * e;
  const pad = 10 * e;
  const cola = 15 * e;
  const ancho = Math.max(
    48 * e,
    Math.max(...lineas.map((l) => medida.measureText(l).width), 0) + pad * 2,
  );
  const alturaCaja = lineas.length * alto + pad * 2;

  const lienzo = document.createElement('canvas');
  lienzo.width = Math.ceil(ancho + 8 * e);
  lienzo.height = Math.ceil(alturaCaja + cola + 8 * e);
  const ctx = lienzo.getContext('2d')!;
  ctx.font = fuente;
  ctx.lineWidth = 2.5 * e;
  ctx.strokeStyle = ACENTO;
  ctx.fillStyle = '#fff';
  const x0 = 4 * e;
  const y0 = 4 * e;
  ctx.beginPath();
  ctx.roundRect(x0, y0, ancho, alturaCaja, 14 * e);
  ctx.fill();
  ctx.stroke();
  const cx = lienzo.width / 2;
  const base = y0 + alturaCaja;
  if (d.tipo === 'decir') {
    ctx.beginPath();
    ctx.moveTo(cx - 8 * e, base - 1);
    ctx.lineTo(cx, base + cola - 3 * e);
    ctx.lineTo(cx + 8 * e, base - 1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 8 * e, base);
    ctx.lineTo(cx, base + cola - 3 * e);
    ctx.lineTo(cx + 8 * e, base);
    ctx.stroke();
    ctx.fillRect(cx - 7 * e, base - 3 * e, 14 * e, 4 * e);
  } else {
    for (const [dx, dy, r] of [
      [-3, 8, 5],
      [-8, 15, 3],
    ] as const) {
      ctx.beginPath();
      ctx.arc(cx + dx * e, base + dy * e, r * e, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#1e1b4b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lineas.forEach((l, i) => ctx.fillText(l, cx, y0 + pad + alto * i + alto / 2));

  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: textura, transparent: true, depthTest: false }),
  );
  sprite.center.set(0.5, 0);
  sprite.scale.set(lienzo.width / e, lienzo.height / e, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/** Cuadrícula de coordenadas (líneas cada 40 y números) sobre el plano del escenario. */
function crearCuadricula(): THREE.Mesh {
  const e = ESCALA_TEXTURA;
  const lienzo = document.createElement('canvas');
  lienzo.width = ESCENARIO.ancho * e;
  lienzo.height = ESCENARIO.alto * e;
  const ctx = lienzo.getContext('2d')!;
  const px = (x: number) => (x + ESCENARIO.mitadX) * e;
  const py = (y: number) => (ESCENARIO.mitadY - y) * e;
  ctx.strokeStyle = '#4f46e5';
  for (let x = -240; x <= 240; x += 40) {
    ctx.globalAlpha = x === 0 ? 0.9 : 0.28;
    ctx.lineWidth = (x === 0 ? 2 : 1) * e;
    ctx.beginPath();
    ctx.moveTo(px(x), 0);
    ctx.lineTo(px(x), lienzo.height);
    ctx.stroke();
  }
  for (let y = -160; y <= 160; y += 40) {
    ctx.globalAlpha = y === 0 ? 0.9 : 0.28;
    ctx.lineWidth = (y === 0 ? 2 : 1) * e;
    ctx.beginPath();
    ctx.moveTo(0, py(y));
    ctx.lineTo(lienzo.width, py(y));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.font = `800 ${10 * e}px Nunito, system-ui, sans-serif`;
  ctx.lineWidth = 3 * e;
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#3730a3';
  const etiqueta = (t: string, x: number, y: number, alinea: CanvasTextAlign) => {
    ctx.textAlign = alinea;
    ctx.strokeText(t, x, y);
    ctx.fillText(t, x, y);
  };
  ctx.textBaseline = 'top';
  for (let x = -200; x <= 200; x += 40) if (x) etiqueta(String(x), px(x), py(0) + 3 * e, 'center');
  ctx.textBaseline = 'middle';
  for (let y = -160; y <= 160; y += 40) if (y) etiqueta(String(y), px(0) + 4 * e, py(y), 'left');

  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  const malla = new THREE.Mesh(
    new THREE.PlaneGeometry(ESCENARIO.ancho, ESCENARIO.alto),
    new THREE.MeshBasicMaterial({
      map: textura,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  malla.renderOrder = -1;
  malla.visible = false;
  return malla;
}

/** Sombra suave en forma de mancha (degradado radial). */
function texturaSombra(): THREE.CanvasTexture {
  const l = document.createElement('canvas');
  l.width = l.height = 128;
  const ctx = l.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(15,10,60,0.55)');
  g.addColorStop(1, 'rgba(15,10,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(l);
}

export class Escenario3D {
  private renderer!: THREE.WebGLRenderer;
  private escena = new THREE.Scene();
  private camara = new THREE.PerspectiveCamera(FOV, 4 / 3, 10, 4000);
  private distancia = 700;
  private fondo!: THREE.Mesh;
  private cuadricula = crearCuadricula();
  private vistas = new Map<string, Vista3D>();
  private texturasFondo = new Map<string, THREE.CanvasTexture>();
  private cargando = new Set<string>();
  private fondoId = '';
  private observador: ResizeObserver | null = null;
  private sombraTex = texturaSombra();
  private raycaster = new THREE.Raycaster();
  private plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private arrastre: { id: string; dx: number; dy: number } | null = null;
  private punteroNdc = new THREE.Vector2(0, 0);
  private punteroDentro = false;
  private balanceo = new THREE.Vector2(0, 0);
  private ultimoCuadro = performance.now();
  private tiempo = 0;
  private sinMovimiento = false;
  private destruido = false;
  private limpiezas: Array<() => void> = [];

  constructor(private puente: PuenteEscenario) {}

  async montar(host: HTMLElement, runtime: Runtime) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (this.destruido) {
      this.renderer.dispose();
      return;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const lienzo = this.renderer.domElement;
    lienzo.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
    lienzo.setAttribute('role', 'img');
    lienzo.setAttribute('aria-label', t('escenario.aria3d'));
    host.appendChild(lienzo);
    this.sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Luces suaves (aspecto de juguete)
    this.escena.add(new THREE.HemisphereLight(0xffffff, 0x9aa7c7, 1.7));
    const sol = new THREE.DirectionalLight(0xffffff, 2.3);
    sol.position.set(-160, 240, 340);
    this.escena.add(sol);

    // Fondo pintado, atrás
    this.fondo = new THREE.Mesh(
      new THREE.PlaneGeometry(ESCENARIO.ancho, ESCENARIO.alto),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    );
    this.fondo.position.z = -PROFUNDIDAD_FONDO;
    this.fondo.renderOrder = -2;
    this.escena.add(this.fondo, this.cuadricula);

    this.ajustar(host.clientWidth, host.clientHeight);
    this.observador = new ResizeObserver(() => this.ajustar(host.clientWidth, host.clientHeight));
    this.observador.observe(host);
    this.conectarPuntero(lienzo);

    this.ultimoCuadro = performance.now();
    this.renderer.setAnimationLoop(() => {
      const ahora = performance.now();
      const dt = Math.min((ahora - this.ultimoCuadro) / 1000, 0.1);
      this.ultimoCuadro = ahora;
      this.tiempo += dt;
      runtime.tick(dt * 1000);
      this.cargarFondo(runtime.fondo);
      this.cuadricula.visible = this.puente.cuadricula();
      const vivos = new Set<string>();
      for (const a of runtime.actores.values()) {
        vivos.add(a.id);
        this.actualizarActor(a, runtime.modo, dt);
      }
      for (const [id, v] of this.vistas) if (!vivos.has(id)) this.quitarVista(id, v);
      this.moverCamara(dt);
      this.renderer.render(this.escena, this.camara);
    });
  }

  destruir() {
    this.destruido = true;
    this.observador?.disconnect();
    for (const l of this.limpiezas) l();
    if (!this.renderer) return;
    this.renderer.setAnimationLoop(null);
    this.escena.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) {
        (x as THREE.MeshBasicMaterial).map?.dispose();
        x.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  // ------------------------------------------------------------ Cámara

  /** Encaja el escenario (480×360) en el contenedor, sea cual sea su proporción. */
  private ajustar(ancho: number, alto: number) {
    if (!ancho || !alto) return;
    this.renderer.setSize(ancho, alto, false);
    const aspecto = ancho / alto;
    this.camara.aspect = aspecto;
    const mitad = Math.max(ESCENARIO.mitadY, ESCENARIO.mitadX / aspecto);
    this.distancia = mitad / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    this.camara.updateProjectionMatrix();
    // El fondo debe cubrir toda la vista aunque la cámara se balancee un poco.
    const k = (this.distancia + PROFUNDIDAD_FONDO) / this.distancia;
    const cubre = Math.max(mitad / ESCENARIO.mitadY, (mitad * aspecto) / ESCENARIO.mitadX);
    this.fondo.scale.setScalar(k * cubre * 1.06);
  }

  private moverCamara(dt: number) {
    const objetivo =
      this.sinMovimiento || !this.punteroDentro ? new THREE.Vector2(0, 0) : this.punteroNdc;
    this.balanceo.lerp(objetivo, Math.min(1, dt * 4));
    this.camara.position.set(this.balanceo.x * 22, this.balanceo.y * 12, this.distancia);
    this.camara.lookAt(0, 0, 0);
  }

  // ------------------------------------------------------------- Fondo

  private cargarFondo(id: string) {
    if (id === this.fondoId) return;
    const lista = this.texturasFondo.get(id);
    if (lista) {
      const mat = this.fondo.material as THREE.MeshBasicMaterial;
      mat.map = lista;
      mat.needsUpdate = true;
      this.fondoId = id;
      return;
    }
    if (this.cargando.has(id)) return;
    this.cargando.add(id);
    rasterizar(alDataUri(fondoPorId(id).svg), 960, 720)
      .then((lienzo) => {
        if (this.destruido) return;
        const t = new THREE.CanvasTexture(lienzo);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.texturasFondo.set(id, t);
      })
      .catch(() => this.cargando.delete(id));
  }

  // ------------------------------------------------------------ Puntero

  private aPlano(ndc: THREE.Vector2): { x: number; y: number } | null {
    this.raycaster.setFromCamera(ndc, this.camara);
    const p = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.plano, p)
      ? { x: Math.round(p.x), y: Math.round(p.y) }
      : null;
  }

  private actorBajo(ndc: THREE.Vector2): string | null {
    this.raycaster.setFromCamera(ndc, this.camara);
    const raices = [...this.vistas.values()].filter((v) => v.raiz.visible).map((v) => v.raiz);
    const golpe = this.raycaster.intersectObjects(raices, true)[0];
    for (let o: THREE.Object3D | null = golpe?.object ?? null; o; o = o.parent) {
      if (o.userData.actorId) return o.userData.actorId as string;
    }
    return null;
  }

  private conectarPuntero(el: HTMLCanvasElement) {
    const ndcDe = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
    };
    const mover = (e: PointerEvent) => {
      const ndc = ndcDe(e);
      this.punteroNdc.copy(ndc);
      this.punteroDentro = true;
      const p = this.aPlano(ndc);
      const dentro = !!p && Math.abs(p.x) <= ESCENARIO.mitadX && Math.abs(p.y) <= ESCENARIO.mitadY;
      this.puente.alPuntero(dentro ? p : null);
      if (this.arrastre && p) {
        const r = RADIO_ACTOR * 0.5;
        const nx = Math.max(
          -ESCENARIO.mitadX + r,
          Math.min(ESCENARIO.mitadX - r, p.x - this.arrastre.dx),
        );
        const ny = Math.max(
          -ESCENARIO.mitadY + r,
          Math.min(ESCENARIO.mitadY - r, p.y - this.arrastre.dy),
        );
        this.puente.alMover(this.arrastre.id, Math.round(nx), Math.round(ny));
      } else if (!this.arrastre) {
        el.style.cursor = this.actorBajo(ndc)
          ? this.puente.puedeArrastrar()
            ? 'grab'
            : 'pointer'
          : 'default';
      }
    };
    const bajar = (e: PointerEvent) => {
      const ndc = ndcDe(e);
      const id = this.actorBajo(ndc);
      if (!id) return;
      if (this.puente.puedeArrastrar()) {
        const p = this.aPlano(ndc);
        const v = this.vistas.get(id);
        if (!p || !v) return;
        this.arrastre = {
          id,
          dx: p.x - Math.round(v.raiz.position.x),
          dy: p.y - Math.round(v.raiz.userData.baseY ?? v.raiz.position.y),
        };
        this.puente.alSeleccionar(id);
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
      } else {
        this.puente.alClic(id);
      }
    };
    const soltar = (e: PointerEvent) => {
      this.arrastre = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const salir = () => {
      this.punteroDentro = false;
      this.puente.alPuntero(null);
    };
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerdown', bajar);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('pointerleave', salir);
    this.limpiezas.push(() => {
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerdown', bajar);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
      el.removeEventListener('pointerleave', salir);
    });
  }

  // ------------------------------------------------------------ Actores

  private crearVista(a: EstadoActor, personaje: string): Vista3D {
    const modelo = crearModelo3D(personaje);
    const raiz = new THREE.Group();
    raiz.userData.actorId = a.id;
    const cuerpo = new THREE.Group();
    cuerpo.add(modelo.grupo);
    raiz.add(cuerpo);

    const sombra = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: this.sombraTex, transparent: true, depthWrite: false }),
    );
    const anillo = new THREE.Mesh(
      new THREE.RingGeometry(0.93, 1, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    );
    const relleno = new THREE.Mesh(
      new THREE.CircleGeometry(0.93, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.13,
        depthWrite: false,
      }),
    );
    anillo.add(relleno);
    this.escena.add(raiz, sombra, anillo);
    const v: Vista3D = {
      personaje,
      modelo,
      raiz,
      cuerpo,
      sombra,
      anillo,
      globo: null,
      claveGlobo: '',
      fase: Math.random() * 6,
      ultimaX: a.x,
      ultimaY: a.y,
      giro: 0,
      inclinacion: 0,
    };
    this.vistas.set(a.id, v);
    return v;
  }

  private quitarVista(id: string, v: Vista3D) {
    this.escena.remove(v.raiz, v.sombra, v.anillo);
    if (v.globo) this.escena.remove(v.globo);
    this.vistas.delete(id);
  }

  private actualizarActor(a: EstadoActor, modo: string, dt: number) {
    const personaje = this.puente.personajeDe(a.id);
    let v = this.vistas.get(a.id);
    if (v && v.personaje !== personaje) {
      this.quitarVista(a.id, v);
      v = undefined;
    }
    v ??= this.crearVista(a, personaje);
    const parado = modo === 'detenido';
    const escala = a.tamano / 100;

    // Movimiento: balanceo, inclinación y giro hacia donde mira
    const vx = dt > 0 ? (a.x - v.ultimaX) / dt : 0;
    const vy = dt > 0 ? (a.y - v.ultimaY) / dt : 0;
    v.ultimaX = a.x;
    v.ultimaY = a.y;
    const rapido = Math.min(1, Math.hypot(vx, vy) / 200);
    const bob = this.sinMovimiento
      ? 0
      : Math.sin(this.tiempo * (2.2 + rapido * 6) + v.fase) * (2 + rapido * 3) * escala;
    const inclina = this.sinMovimiento ? 0 : THREE.MathUtils.clamp(-vx * 0.0011, -0.32, 0.32);
    v.inclinacion += (inclina - v.inclinacion) * Math.min(1, dt * 10);

    let objetivo: number;
    if (v.modelo.perfil) objetivo = a.direccion < 0 ? Math.PI + 0.5 : -0.5;
    else objetivo = Math.sin((a.direccion * Math.PI) / 180) * 0.55; // se ve un lado u otro
    v.giro += (objetivo - v.giro) * Math.min(1, dt * 10);

    v.raiz.position.set(a.x, a.y + bob, 0);
    v.raiz.userData.baseY = a.y;
    v.raiz.scale.setScalar(escala);
    v.raiz.visible = a.visible;
    v.cuerpo.rotation.set(0, v.giro, v.inclinacion);
    v.modelo.variantes[0].visible = a.disfrazActual % 2 === 0;
    v.modelo.variantes[1].visible = a.disfrazActual % 2 === 1;
    v.modelo.animar?.(this.tiempo);

    v.sombra.visible = a.visible;
    v.sombra.position.set(a.x, a.y - 47 * escala, -6);
    v.sombra.scale.set(86 * escala * (1 - bob * 0.01), 20 * escala, 1);

    const mostrarAnillo = parado && this.puente.seleccionado() === a.id && a.visible;
    v.anillo.visible = mostrarAnillo;
    if (mostrarAnillo) {
      v.anillo.position.set(a.x, a.y, -48);
      v.anillo.scale.setScalar(((RADIO_ACTOR * a.tamano) / 100 + 10) * 1.08);
    }
    this.actualizarGlobo(v, a, escala);
  }

  private actualizarGlobo(v: Vista3D, a: EstadoActor, escala: number) {
    const d = a.dialogo;
    const clave = d ? `${d.tipo}:${d.texto}` : '';
    if (clave !== v.claveGlobo) {
      v.claveGlobo = clave;
      if (v.globo) {
        this.escena.remove(v.globo);
        (v.globo.material as THREE.SpriteMaterial).map?.dispose();
        v.globo.material.dispose();
        v.globo = null;
      }
      if (d) {
        v.globo = crearGlobo(d);
        this.escena.add(v.globo);
      }
    }
    if (v.globo) {
      const w = v.globo.scale.x;
      const h = v.globo.scale.y;
      const x = THREE.MathUtils.clamp(
        a.x,
        -ESCENARIO.mitadX + w / 2 + 2,
        ESCENARIO.mitadX - w / 2 - 2,
      );
      const y = Math.min(a.y + 54 * escala, ESCENARIO.mitadY - h - 2);
      v.globo.position.set(x, y, 0); // mismo plano que los actores: sin deformación de perspectiva
      v.globo.visible = a.visible;
    }
  }
}
