import { describe, expect, it } from 'vitest';
import { SONIDOS_SINTETIZADOS, detenerSonidos, tocarEfecto, tocarNota } from '../src/audio';
import { compilar } from '../src/engine/compilar';
import {
  CATEGORIAS_SONIDO,
  INSTRUMENTOS,
  MAX_SONIDOS,
  SONIDOS,
  SONIDOS_INICIALES,
  duracionSonido,
} from '../src/engine/sonidos';
import { Runtime } from '../src/engine/runtime';
import type { EstadoActor, Oyentes } from '../src/engine/tipos';
import { en } from '../src/i18n/en';
import { es } from '../src/i18n/es';
import {
  agregarSonidoA,
  crearActor,
  validarProyecto,
  validarSonidos,
} from '../src/store/proyectoModelo';

describe('catálogo de sonidos', () => {
  it('cada sonido tiene nombre en los dos idiomas, duración y categoría conocida', () => {
    for (const s of SONIDOS) {
      expect(`sonido.${s.id}` in es, s.id).toBe(true);
      expect(`sonido.${s.id}` in en, s.id).toBe(true);
      expect(s.duracion).toBeGreaterThan(0);
      expect(s.duracion).toBeLessThan(3);
      expect(CATEGORIAS_SONIDO).toContain(s.categoria);
    }
    for (const c of CATEGORIAS_SONIDO) expect(`sonidocat.${c}` in es).toBe(true);
    for (const i of INSTRUMENTOS)
      expect(`instrumento.${i}` in es && `instrumento.${i}` in en).toBe(true);
  });
  it('no hay ids repetidos y los iniciales existen', () => {
    expect(new Set(SONIDOS.map((s) => s.id)).size).toBe(SONIDOS.length);
    for (const id of SONIDOS_INICIALES) expect(SONIDOS.some((s) => s.id === id)).toBe(true);
  });
  it('el audio sabe sintetizar cada sonido del catálogo', () => {
    expect([...SONIDOS_SINTETIZADOS].sort()).toEqual(SONIDOS.map((s) => s.id).sort());
  });
  it('sin audio disponible (como en estas pruebas) nada se rompe', () => {
    for (const s of SONIDOS) expect(() => tocarEfecto(s.id, 80)).not.toThrow();
    for (const i of INSTRUMENTOS) expect(() => tocarNota(64, 0.3, 100, i)).not.toThrow();
    expect(() => detenerSonidos()).not.toThrow();
    expect(() => tocarEfecto('no-existe')).not.toThrow();
  });
  it('un sonido desconocido dura lo de un efecto corto', () => {
    expect(duracionSonido('no-existe')).toBe(0.3);
  });
});

describe('sonidos de cada actor', () => {
  it('un actor nuevo trae los sonidos de siempre', () => {
    expect(crearActor('kody', []).sonidos).toEqual(SONIDOS_INICIALES);
  });
  it('un proyecto de antes (sin lista) recibe los sonidos de siempre', () => {
    expect(validarSonidos(undefined)).toEqual(SONIDOS_INICIALES);
    expect(validarSonidos('hola')).toEqual(SONIDOS_INICIALES);
  });
  it('limpia sonidos inventados y repetidos, y respeta una lista vacía', () => {
    expect(validarSonidos(['pop', 'inventado', 'pop', 3, 'moneda'])).toEqual(['pop', 'moneda']);
    expect(validarSonidos([])).toEqual([]);
    expect(
      validarSonidos(SONIDOS.map((s) => s.id).concat(SONIDOS.map((s) => s.id))).length,
    ).toBeLessThanOrEqual(MAX_SONIDOS);
  });
  it('agregar no repite ni pasa del máximo', () => {
    expect(agregarSonidoA(['pop'], 'pop')).toBe('ya');
    expect(agregarSonidoA(['pop'], 'moneda')).toEqual(['pop', 'moneda']);
    const lleno = Array.from({ length: MAX_SONIDOS }, (_, i) => `s${i}`);
    expect(agregarSonidoA(lleno, 'moneda')).toBe('max');
  });
  it('se conserva al validar un proyecto guardado', () => {
    const actor = { ...crearActor('gato', []), sonidos: ['maullido', 'pop'] };
    const p = validarProyecto({
      version: 2,
      actores: [actor],
      fondo: 'pradera',
      scripts: {},
      seleccionado: actor.id,
    });
    expect(p?.actores[0].sonidos).toEqual(['maullido', 'pop']);
  });
});

describe('bloques de sonido en el motor', () => {
  const actor = (): EstadoActor => ({
    id: 'a1',
    nombre: 'a1',
    x: 0,
    y: 0,
    direccion: 90,
    tamano: 100,
    visible: true,
    disfrazActual: 0,
    totalDisfraces: 2,
    dialogo: null,
  });
  const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } });
  const fijar = (v: string, valor: object) => ({
    type: 'var_fijar',
    fields: { VAR: v },
    inputs: { VALOR: { block: valor } },
  });
  const marca = (v: string) => ({ type: 'var_fijar', fields: { VAR: v }, inputs: { VALOR: n(1) } });
  function crear(bloques: object[], oyentes: Oyentes = {}) {
    let sig: object | undefined;
    for (let i = bloques.length - 1; i >= 0; i--)
      sig = { ...bloques[i], ...(sig ? { next: { block: sig } } : {}) };
    const rt = new Runtime(oyentes);
    rt.agregarActor(actor());
    const prog = compilar({
      blocks: { blocks: [{ type: 'evento_al_ejecutar', id: 'h', next: { block: sig } }] },
    });
    rt.iniciar({ a1: prog }, false, { variables: ['v', 'listo'], listas: [] });
    return rt;
  }
  const avanzar = (rt: Runtime, ms: number) => {
    for (let t = 0; t < ms; t += 16) rt.tick(16);
  };

  it('tocar sonido hasta terminar espera lo que dura el sonido', () => {
    const rt = crear([{ type: 'son_tocar_espera', fields: { SONIDO: 'ding' } }, marca('listo')]);
    avanzar(rt, 300);
    expect(rt.valorVariable('listo')).toBe(0);
    avanzar(rt, 400);
    expect(rt.valorVariable('listo')).toBe(1);
  });
  it('tocar sonido (sin esperar) sigue de inmediato', () => {
    const rt = crear([{ type: 'son_tocar', fields: { SONIDO: 'ding' } }, marca('listo')]);
    avanzar(rt, 50);
    expect(rt.valorVariable('listo')).toBe(1);
  });
  it('el volumen se fija, se cambia, se recorta a 0–100 y se lee', () => {
    const avisos: unknown[][] = [];
    const rt = crear(
      [
        { type: 'son_volumen_fijar', inputs: { N: n(40) } },
        { type: 'son_volumen_cambiar', inputs: { N: n(-10) } },
        fijar('v', { type: 'son_volumen' }),
        { type: 'son_tocar', fields: { SONIDO: 'pop' } },
        { type: 'son_volumen_cambiar', inputs: { N: n(500) } },
        { type: 'son_tocar', fields: { SONIDO: 'pop' } },
        { type: 'son_volumen_fijar', inputs: { N: n(-5) } },
        { type: 'son_tocar', fields: { SONIDO: 'pop' } },
      ],
      { alSonido: (...a) => avisos.push(a) },
    );
    avanzar(rt, 100);
    expect(rt.valorVariable('v')).toBe(30);
    expect(avisos.map((a) => a[3])).toEqual([30, 100, 0]);
  });
  it('el instrumento llega a las notas y uno inválido se ignora', () => {
    const avisos: unknown[][] = [];
    const rt = crear(
      [
        { type: 'son_instrumento', fields: { INSTRUMENTO: 'guitarra' } },
        { type: 'son_nota', fields: { NOTA: '60' }, inputs: { SEG: n(0.1) } },
        { type: 'son_instrumento', fields: { INSTRUMENTO: 'tuba' } },
        { type: 'son_nota', fields: { NOTA: '62' }, inputs: { SEG: n(0.1) } },
      ],
      { alSonido: (...a) => avisos.push(a) },
    );
    avanzar(rt, 400);
    expect(avisos.map((a) => a[4])).toEqual(['guitarra', 'guitarra']);
  });
  it('el silencio espera y detener todos los sonidos avisa a la interfaz', () => {
    let cortes = 0;
    const rt = crear(
      [{ type: 'son_silencio', inputs: { SEG: n(0.5) } }, { type: 'son_detener' }, marca('listo')],
      {
        alDetenerSonidos: () => cortes++,
      },
    );
    avanzar(rt, 300);
    expect(rt.valorVariable('listo')).toBe(0);
    avanzar(rt, 400);
    expect(rt.valorVariable('listo')).toBe(1);
    expect(cortes).toBeGreaterThanOrEqual(1);
  });
  it('al detener el programa también se callan los sonidos', () => {
    let cortes = 0;
    const rt = crear([{ type: 'son_tocar_espera', fields: { SONIDO: 'campana' } }], {
      alDetenerSonidos: () => cortes++,
    });
    avanzar(rt, 100);
    const antes = cortes;
    rt.detener();
    expect(cortes).toBe(antes + 1);
  });
});
