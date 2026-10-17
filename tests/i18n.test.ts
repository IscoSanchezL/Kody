import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { es } from '../src/i18n/es';
import { t, useIdioma } from '../src/i18n';

const marcas = (texto: string) => [...texto.matchAll(/\{\w+\}|%\d/g)].map((m) => m[0]).sort();

describe('diccionarios es / en', () => {
  it('tienen exactamente las mismas claves', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it('ninguna traducción está vacía', () => {
    for (const [clave, texto] of [...Object.entries(es), ...Object.entries(en)]) {
      expect(texto.trim(), clave).not.toBe('');
    }
  });

  it('cada texto usa las mismas variables {x} y las mismas marcas %1 en los dos idiomas', () => {
    for (const clave of Object.keys(es) as (keyof typeof es)[]) {
      expect(marcas(en[clave]), clave).toEqual(marcas(es[clave]));
    }
  });

  it('los textos en inglés no se quedaron copiados del español (salvo nombres propios)', () => {
    const iguales = (Object.keys(es) as (keyof typeof es)[]).filter(
      (k) => es[k] === en[k] && /[¿¡áéíóúñ]/i.test(es[k]),
    );
    expect(iguales).toEqual([]);
  });
});

describe('bloques', () => {
  const fuente = readFileSync('src/blocks/definiciones.ts', 'utf8');
  const tipos = new Set<string>();
  for (const m of fuente.matchAll(/^ {4}type: '(\w+)',$/gm)) tipos.add(m[1]);
  for (const m of fuente.matchAll(/Blockly\.Blocks\['(\w+)'\]/g)) tipos.add(m[1]);
  for (const m of fuente.matchAll(/bloqueDato\(\s*'(\w+)'/g)) tipos.add(m[1]);

  it('encuentra los bloques en el código fuente', () => {
    expect(tipos.size).toBeGreaterThan(80);
  });

  it('cada bloque tiene su ayuda traducida (y su etiqueta, salvo los de "Mis bloques")', () => {
    for (const tipo of tipos) {
      expect(`b.${tipo}.ayuda` in es, `${tipo}.ayuda`).toBe(true);
      if (!tipo.startsWith('fun_')) expect(`b.${tipo}` in es, tipo).toBe(true);
    }
  });

  it('las categorías, teclas y notas están traducidas', () => {
    for (const k of ['eventos', 'movimiento', 'mis_bloques']) expect(`cat.${k}` in es).toBe(true);
    for (const k of ['espacio', 'arriba', 'abajo', 'izquierda', 'derecha'])
      expect(`tecla.${k}` in es).toBe(true);
  });
});

describe('t()', () => {
  it('en pruebas (sin navegador) el idioma es español', () => {
    expect(useIdioma.getState().idioma).toBe('es');
    expect(t('comun.cancelar')).toBe('Cancelar');
  });

  it('interpola {x} y cambia con el idioma', () => {
    expect(t('proyectos.borrar', { nombre: 'Luna' })).toBe('Borrar Luna');
    useIdioma.setState({ idioma: 'en' });
    try {
      expect(t('proyectos.borrar', { nombre: 'Luna' })).toBe('Delete Luna');
      expect(t('nube.limite', { max: 30 })).toMatch(/30 projects/);
    } finally {
      useIdioma.setState({ idioma: 'es' });
    }
  });

  it('deja intacta una variable que no se pasó', () => {
    expect(t('proyectos.borrar')).toBe('Borrar {nombre}');
  });
});
