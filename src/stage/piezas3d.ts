import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Piezas para armar los personajes 3D de Kody: esferas, tubos, cajas redondeadas...
 * Sin archivos externos: pesan poco, mantienen un solo estilo y funcionan sin internet.
 * Cada modelo se ajusta a unas 96 unidades de alto, apoyado en el suelo, y tiene 2 disfraces.
 * Los animales de perfil (miran a +X) se voltean al ir a la izquierda y el escenario los gira en 3/4.
 */

export interface Modelo3D {
  grupo: THREE.Group;
  variantes: [THREE.Group, THREE.Group];
  /** Modelos de perfil (animales, pez, abeja) miran a +X y se voltean al ir a la izquierda. */
  perfil: boolean;
  /** Piezas que se mueven solas (alas, llama, cola). */
  animar?: (t: number) => void;
}

export const TINTA = 0x1e1b4b;
/** Alto objetivo de cada modelo y dónde queda el suelo (la sombra se dibuja ahí). */
export const ALTO = 96;
export const ANCHO_MAX = 136;
export const SUELO = -47;

export type Pos = [number, number, number];
export const V = (p: Pos) => new THREE.Vector3(...p);

export function material(color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.03, ...extra });
}
/** Acabado mate de pelaje y piel. */
export const PELO = { roughness: 0.85, metalness: 0 };
export const BRILLANTE = { roughness: 0.25, metalness: 0.1 };

/** Esfera o elipsoide (radios por eje). */
export function elip(
  rx: number,
  ry: number,
  rz: number,
  color: number,
  pos: Pos = [0, 0, 0],
  extra: Partial<THREE.MeshStandardMaterialParameters> = {},
  rot: Pos = [0, 0, 0],
) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), material(color, extra));
  m.scale.set(rx, ry, rz);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

export const esfera = (r: number, color: number, pos: Pos = [0, 0, 0], extra = {}) =>
  elip(r, r, r, color, pos, extra);

export function cono(
  r: number,
  h: number,
  color: number,
  pos: Pos,
  rot: Pos = [0, 0, 0],
  extra: Partial<THREE.MeshStandardMaterialParameters> = {},
) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 24), material(color, extra));
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

export function cilindro(
  r: number,
  h: number,
  color: number,
  pos: Pos,
  rot: Pos = [0, 0, 0],
  extra = {},
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), material(color, extra));
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

export function caja(
  w: number,
  h: number,
  d: number,
  color: number,
  pos: Pos,
  radio = 3,
  extra = {},
) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, radio), material(color, extra));
  m.position.set(...pos);
  return m;
}

/** Arco (media dona): ∩ por defecto; con `sonrisa` queda ∪. */
export function arco(
  r: number,
  grosor: number,
  color: number,
  pos: Pos,
  sonrisa = false,
  extra = {},
) {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(r, grosor, 10, 24, Math.PI),
    material(color, extra),
  );
  m.position.set(...pos);
  if (sonrisa) m.rotation.z = Math.PI;
  return m;
}

/**
 * Tubo que cambia de grosor: sigue una curva suave por los `puntos` y su radio va tomando
 * los valores de `radios`. Sirve para patas, colas, cuellos y brazos, con tapas redondas.
 */
export function tubo(
  puntos: Pos[],
  radios: number[],
  color: number,
  extra: Partial<THREE.MeshStandardMaterialParameters> = {},
  tramos = 22,
  radial = 14,
) {
  const curva = new THREE.CatmullRomCurve3(puntos.map(V));
  const geo = new THREE.TubeGeometry(curva, tramos, 1, radial, false);
  const pos = geo.attributes.position;
  const anillo = radial + 1;
  const v = new THREE.Vector3();
  const radioEn = (t: number) => {
    const f = t * (radios.length - 1);
    const k = Math.min(radios.length - 2, Math.floor(f));
    return radios[k] + (radios[k + 1] - radios[k]) * (f - k);
  };
  for (let i = 0; i <= tramos; i++) {
    const c = curva.getPointAt(i / tramos);
    const r = radioEn(i / tramos);
    for (let j = 0; j < anillo; j++) {
      const idx = i * anillo + j;
      v.set(pos.getX(idx), pos.getY(idx), pos.getZ(idx)).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, material(color, extra)));
  g.add(esfera(radios[0], color, puntos[0], extra));
  g.add(esfera(radios[radios.length - 1], color, puntos[puntos.length - 1], extra));
  return g;
}

export function nuevo(perfil = false) {
  const grupo = new THREE.Group();
  const v0 = new THREE.Group();
  const v1 = new THREE.Group();
  v1.visible = false;
  grupo.add(v0, v1);
  return { grupo, v0, v1, perfil };
}

/** Escala el modelo para que quepa, lo centra de lado a lado y lo apoya en el suelo. */
export function ajustar(m: Modelo3D, alto = ALTO, ancho = ANCHO_MAX): Modelo3D {
  const caja3 = new THREE.Box3().setFromObject(m.grupo);
  const t = caja3.getSize(new THREE.Vector3());
  const k = Math.min(alto / t.y, ancho / t.x);
  m.grupo.scale.setScalar(k);
  const c = new THREE.Box3().setFromObject(m.grupo);
  m.grupo.position.set(-(c.min.x + c.max.x) / 2, SUELO - c.min.y, 0);
  // Los modelos giran sobre su propio centro: el grupo exterior hace de pivote.
  const pivote = new THREE.Group();
  pivote.add(m.grupo);
  return { ...m, grupo: pivote };
}

/** Agrupa piezas y las agranda alrededor de un punto (cabezas más grandes = más simpáticas). */
export function agrandar(piezas: THREE.Object3D[], centro: Pos, k: number) {
  const g = new THREE.Group();
  g.add(...piezas);
  g.scale.setScalar(k);
  g.position.set(centro[0] * (1 - k), centro[1] * (1 - k), centro[2] * (1 - k));
  return g;
}

export const brillo = (x: number, y: number, z: number, r = 1.3) => esfera(r, 0xffffff, [x, y, z]);

/** Ojo oscuro y brillante sobre la cabeza, a un lado (se ve en 3/4). */
export function ojoLateral(x: number, y: number, z: number, r = 3.4, color = 0x14110f) {
  const lado = Math.sign(z) || 1;
  return [
    elip(r * 0.9, r, r * 0.6, color, [x, y, z], BRILLANTE),
    brillo(x + r * 0.28, y + r * 0.32, z + lado * r * 0.45, r * 0.34),
  ];
}

/** Dos copias, una a cada lado (z positivo y negativo). */
export const espejo = (f: (lado: 1 | -1) => THREE.Object3D | THREE.Object3D[]): THREE.Object3D[] =>
  ([1, -1] as const).flatMap((l) => f(l));
