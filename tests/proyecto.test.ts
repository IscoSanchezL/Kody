import { describe, expect, it } from 'vitest';
import {
  MAX_ACTORES,
  crearActor,
  limitarCampo,
  nombreUnico,
  posicionLibre,
  validarProyecto,
} from '../src/store/proyectoModelo';

const valido = () => ({
  version: 2,
  actores: [
    {
      id: 'a',
      nombre: 'Kody',
      personaje: 'kody',
      x: 0,
      y: 0,
      direccion: 90,
      tamano: 100,
      visible: true,
      disfraz: 0,
    },
  ],
  fondo: 'pradera',
  scripts: { a: { blocks: { blocks: [] } } },
  seleccionado: 'a',
});

describe('modelo de proyecto', () => {
  it('nombres únicos', () => {
    expect(nombreUnico('Gato', [])).toBe('Gato');
    expect(nombreUnico('Gato', ['Gato'])).toBe('Gato 2');
    expect(nombreUnico('Gato', ['Gato', 'Gato 2'])).toBe('Gato 3');
  });
  it('un actor nuevo no se encima con los existentes', () => {
    const a = crearActor('gato', []);
    const b = crearActor('gato', [a]);
    expect(b.nombre).toBe('Gato 2');
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(70);
    expect(b.id).not.toBe(a.id);
  });
  it('personaje desconocido cae en Kody', () => {
    expect(crearActor('nada', []).personaje).toBe('kody');
  });
  it('posicionLibre devuelve un lugar dentro del escenario', () => {
    const p = posicionLibre([]);
    expect(Math.abs(p.x)).toBeLessThanOrEqual(240);
    expect(Math.abs(p.y)).toBeLessThanOrEqual(180);
  });
});

describe('validarProyecto', () => {
  it('acepta un proyecto correcto', () => {
    expect(validarProyecto(valido())?.actores).toHaveLength(1);
  });
  it('rechaza basura y versiones desconocidas', () => {
    expect(validarProyecto(null)).toBeNull();
    expect(validarProyecto('hola')).toBeNull();
    expect(validarProyecto({ version: 1 })).toBeNull();
    expect(validarProyecto({ version: 2, actores: [] })).toBeNull();
  });
  it('limpia valores fuera de rango y personajes/fondos inventados', () => {
    const p = valido();
    Object.assign(p.actores[0], {
      x: 9999,
      y: -9999,
      tamano: 5,
      personaje: 'inventado',
      nombre: '  ',
    });
    p.fondo = 'no-existe';
    const r = validarProyecto(p)!;
    expect(r.actores[0].x).toBe(240);
    expect(r.actores[0].y).toBe(-180);
    expect(r.actores[0].tamano).toBe(10);
    expect(r.actores[0].personaje).toBe('kody');
    expect(r.actores[0].nombre).toBe('Actor');
    expect(r.fondo).toBe('pradera');
  });
  it('limita la cantidad de actores y repara ids repetidos', () => {
    const p = valido();
    p.actores = Array.from({ length: 12 }, () => ({ ...p.actores[0], id: 'igual' }));
    const r = validarProyecto(p)!;
    expect(r.actores).toHaveLength(MAX_ACTORES);
    expect(new Set(r.actores.map((a) => a.id)).size).toBe(MAX_ACTORES);
    expect(Object.keys(r.scripts)).toHaveLength(MAX_ACTORES);
  });
  it('arregla la selección y los programas faltantes', () => {
    const p = valido();
    p.seleccionado = 'otro';
    (p as { scripts: object }).scripts = {};
    const r = validarProyecto(p)!;
    expect(r.seleccionado).toBe('a');
    expect(r.scripts.a).toBeTruthy();
  });
});

describe('cuadros numéricos del actor', () => {
  it('recortan al rango y redondean', () => {
    expect(limitarCampo(999, -180, 180)).toBe(180);
    expect(limitarCampo(-999, -180, 180)).toBe(-180);
    expect(limitarCampo(10.6, -240, 240)).toBe(11);
    expect(limitarCampo(-0.4, -240, 240)).toBe(-0);
    expect(limitarCampo(5, 10, 300)).toBe(10);
  });
});

import { ANCHO_MIN, ANCHO_MIN_EDITOR, limitarAncho } from '../src/store/disposicion';

describe('ancho del panel del escenario', () => {
  it('no baja del mínimo ni deja el editor demasiado angosto', () => {
    expect(limitarAncho(50, 1400)).toBe(ANCHO_MIN);
    expect(limitarAncho(5000, 1400)).toBe(1400 - ANCHO_MIN_EDITOR - 24);
    expect(limitarAncho(800.4, 1600)).toBe(800);
  });
  it('en una pantalla muy chica sigue dando un valor usable', () => {
    expect(limitarAncho(900, 500)).toBe(ANCHO_MIN);
  });
});
