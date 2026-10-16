import { describe, expect, it } from 'vitest';
import { validarBloquePropio } from '../src/blocks/misBloques';

describe('crear un bloque propio', () => {
  it('acepta un nombre con o sin datos y limpia los espacios', () => {
    const r = validarBloquePropio('  dibujar   cuadrado ', [' lado ', '', ''], []);
    expect(r).toEqual({ ok: true, bloque: { nombre: 'dibujar cuadrado', params: ['lado'] } });
    expect(validarBloquePropio('saltar', [], [])).toMatchObject({ ok: true });
  });
  it('rechaza nombres vacíos, largos o repetidos', () => {
    expect(validarBloquePropio('  ', [], [])).toMatchObject({ ok: false });
    expect(validarBloquePropio('a'.repeat(21), [], [])).toMatchObject({ ok: false });
    expect(validarBloquePropio('Saltar', [], ['saltar'])).toMatchObject({
      ok: false,
      mensaje: expect.stringMatching(/ese nombre/),
    });
  });
  it('rechaza datos muy largos, de más o repetidos', () => {
    expect(validarBloquePropio('x', ['a'.repeat(13)], [])).toMatchObject({ ok: false });
    expect(validarBloquePropio('x', ['a', 'b', 'c', 'd'], [])).toMatchObject({ ok: false });
    expect(validarBloquePropio('x', ['lado', 'LADO'], [])).toMatchObject({ ok: false });
  });
});
