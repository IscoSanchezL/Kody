import { PERSONAJES } from './biblioteca';

/**
 * Imágenes planas de los personajes (biblioteca, escenario 2D, sellos del lápiz), generadas
 * a partir de los mismos modelos 3D: así todo Kody muestra a los personajes igual de naturales.
 * Se dibujan una sola vez, con un lienzo de WebGL aparte, y quedan guardadas como PNG.
 */

const TAM = 256;
const iconos = new Map<string, string>();
const oyentes = new Set<() => void>();
let estado: 'pendiente' | 'generando' | 'listo' | 'fallo' = 'pendiente';
let revision = 0;

const clave = (id: string, disfraz: number) => `${id}:${disfraz % 2}`;

/** La imagen ya generada de un personaje, o undefined si aún no está lista. */
export const iconoListo = (id: string, disfraz: number) => iconos.get(clave(id, disfraz));

/** Cambia cada vez que se generan imágenes nuevas (para que la interfaz se redibuje). */
export const revisionIconos = () => revision;
export function alCambiarIconos(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

/** Empieza a generar las imágenes (una sola vez). Si el equipo no tiene 3D, se siguen usando los dibujos planos. */
export function solicitarIconos() {
  if (estado !== 'pendiente') return;
  estado = 'generando';
  void generar()
    .then(() => (estado = 'listo'))
    .catch(() => (estado = 'fallo'))
    .finally(() => {
      revision++;
      oyentes.forEach((f) => f());
    });
}

async function generar() {
  const THREE = await import('three');
  const { crearModelo3D } = await import('./modelos3d');
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  try {
    renderer.setPixelRatio(1);
    renderer.setSize(TAM, TAM, false);
    renderer.setClearColor(0x000000, 0);
    for (const p of PERSONAJES) {
      for (const disfraz of [0, 1] as const) {
        const escena = new THREE.Scene();
        escena.add(new THREE.HemisphereLight(0xffffff, 0x9aa7c7, 1.7));
        const sol = new THREE.DirectionalLight(0xffffff, 2.3);
        sol.position.set(-160, 240, 340);
        escena.add(sol);
        const m = crearModelo3D(p.id);
        m.variantes[0].visible = disfraz === 0;
        m.variantes[1].visible = disfraz === 1;
        m.animar?.(0.25);
        // Vista en tres cuartos, como en el escenario.
        m.grupo.rotation.y = m.perfil ? -0.5 : p.id === 'kody' ? 0.12 : 0.28;
        escena.add(m.grupo);
        const caja = new THREE.Box3().setFromObject(m.grupo);
        const tam = caja.getSize(new THREE.Vector3());
        const centro = caja.getCenter(new THREE.Vector3());
        const medio = (Math.max(tam.x, tam.y) / 2) * 1.1;
        const cam = new THREE.OrthographicCamera(-medio, medio, medio, -medio, 1, 2000);
        cam.position.set(centro.x, centro.y, 600);
        cam.lookAt(centro.x, centro.y, 0);
        renderer.render(escena, cam);
        iconos.set(clave(p.id, disfraz), renderer.domElement.toDataURL('image/png'));
        escena.traverse((o) => {
          const mesh = o as import('three').Mesh;
          mesh.geometry?.dispose?.();
          const mat = mesh.material as
            import('three').Material | import('three').Material[] | undefined;
          for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) x.dispose();
        });
      }
    }
  } finally {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
