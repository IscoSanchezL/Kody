import { describe, expect, it } from 'vitest';
import { FONDOS, PERSONAJES } from '../src/stage/biblioteca';

describe('escenarios', () => {
  it('hay 16 escenarios con nombre', () => {
    expect(FONDOS).toHaveLength(16);
    for (const f of FONDOS) expect(f.nombre.length).toBeGreaterThan(2);
  });
  for (const f of FONDOS) {
    describe(f.id, () => {
      it('es un SVG de 480×360 bien cerrado', () => {
        expect(f.svg.startsWith('<svg')).toBe(true);
        expect(f.svg).toContain('viewBox="0 0 480 360"');
        expect(f.svg.trimEnd().endsWith('</svg>')).toBe(true);
        expect(f.svg.length).toBeLessThan(250_000);
      });
      it('no repite identificadores (rompería degradados y filtros)', () => {
        const ids = [...f.svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
        expect(ids.length).toBe(new Set(ids).size);
      });
      it('todas las referencias url(#…) apuntan a algo que existe', () => {
        const ids = new Set([...f.svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
        for (const m of f.svg.matchAll(/url\(#([^)]+)\)/g)) expect(ids.has(m[1])).toBe(true);
      });
    });
  }
  it('los dibujos planos de los personajes (respaldo) siguen funcionando', () => {
    for (const p of PERSONAJES) {
      for (const v of [0, 1] as const) expect(p.svg(v).startsWith('<svg')).toBe(true);
    }
  });
});
