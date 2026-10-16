import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { MAX_ELEMENTOS_LISTA, Runtime } from '../src/engine/runtime';
import type { EstadoActor, Monitores } from '../src/engine/tipos';
import { quitarUsosDeDato, validarNombreDato, validarProyecto } from '../src/store/proyectoModelo';

const actor: EstadoActor = {
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
};

const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } });
const t = (v: string) => ({ shadow: { type: 'text', fields: { TEXT: v } } });
const fijar = (v: string, valor: object) => ({
  type: 'var_fijar',
  fields: { VAR: v },
  inputs: { VALOR: valor },
});
const cambiar = (v: string, d: number) => ({
  type: 'var_cambiar',
  fields: { VAR: v },
  inputs: { N: n(d) },
});
const agregar = (l: string, item: object) => ({
  type: 'lis_agregar',
  fields: { LISTA: l },
  inputs: { ITEM: item },
});

function cadena(bloques: object[]): object | undefined {
  let sig: object | undefined;
  for (let i = bloques.length - 1; i >= 0; i--)
    sig = { ...bloques[i], ...(sig ? { next: { block: sig } } : {}) };
  return sig;
}
const espacio = (bloques: object[]) => ({
  blocks: { blocks: [{ type: 'evento_al_ejecutar', id: 'h', next: { block: cadena(bloques) } }] },
});

function correr(
  bloques: object[],
  variables: string[] = [],
  listas: string[] = [],
  oyente?: (m: Monitores) => void,
) {
  const rt = new Runtime({ alCambiarMonitores: oyente });
  rt.agregarActor(actor);
  rt.iniciar({ a1: compilar(espacio(bloques)) }, false, { variables, listas });
  for (let i = 0; i < 20; i++) rt.tick(16);
  return rt;
}

describe('variables', () => {
  it('empiezan en 0 y se pueden fijar y cambiar', () => {
    const rt = correr(
      [fijar('puntos', n(5)), cambiar('puntos', 3), cambiar('puntos', -1)],
      ['puntos'],
    );
    expect(rt.valorVariable('puntos')).toBe(7);
    expect(correr([], ['x']).valorVariable('x')).toBe(0);
  });
  it('guardan texto y se pueden leer con el bloque de valor', () => {
    const rt = correr(
      [fijar('a', t('hola')), fijar('b', { block: { type: 'var_valor', fields: { VAR: 'a' } } })],
      ['a', 'b'],
    );
    expect(rt.valorVariable('b')).toBe('hola');
  });
  it('una variable que no existe se ignora sin romper el programa', () => {
    const rt = correr([fijar('fantasma', n(9)), cambiar('fantasma', 1)], ['otra']);
    expect(rt.valorVariable('fantasma')).toBeUndefined();
    expect(rt.valorVariable('otra')).toBe(0);
  });
  it('se reinician en cada ejecución', () => {
    const rt = new Runtime();
    rt.agregarActor(actor);
    const prog = { a1: compilar(espacio([cambiar('p', 4)])) };
    rt.iniciar(prog, false, { variables: ['p'], listas: [] });
    for (let i = 0; i < 5; i++) rt.tick(16);
    expect(rt.valorVariable('p')).toBe(4);
    rt.iniciar(prog, false, { variables: ['p'], listas: [] });
    for (let i = 0; i < 5; i++) rt.tick(16);
    expect(rt.valorVariable('p')).toBe(4);
  });
  it('compilan y funcionan dentro de operaciones', () => {
    const rt = correr(
      [
        fijar('a', n(4)),
        fijar('b', {
          block: {
            type: 'op_mult',
            inputs: { A: { block: { type: 'var_valor', fields: { VAR: 'a' } } }, B: n(5) },
          },
        }),
      ],
      ['a', 'b'],
    );
    expect(rt.valorVariable('b')).toBe(20);
  });
});

describe('listas', () => {
  const leer = (op: string, extra: object = {}, campos: object = { LISTA: 'l' }) => ({
    type: op,
    fields: campos,
    ...extra,
  });
  const guardarEn = (v: string, bloque: object) => fijar(v, { block: bloque });

  it('agregar, longitud y elemento (la primera posición es 1)', () => {
    const rt = correr(
      [
        agregar('l', t('uno')),
        agregar('l', t('dos')),
        agregar('l', n(3)),
        guardarEn('largo', leer('lis_longitud')),
        guardarEn('segundo', leer('lis_elemento', { inputs: { N: n(2) } })),
        guardarEn('fuera', leer('lis_elemento', { inputs: { N: n(9) } })),
        guardarEn('cero', leer('lis_elemento', { inputs: { N: n(0) } })),
      ],
      ['largo', 'segundo', 'fuera', 'cero'],
      ['l'],
    );
    expect(rt.valoresLista('l')).toEqual(['uno', 'dos', 3]);
    expect(rt.valorVariable('largo')).toBe(3);
    expect(rt.valorVariable('segundo')).toBe('dos');
    expect(rt.valorVariable('fuera')).toBe('');
    expect(rt.valorVariable('cero')).toBe('');
  });
  it('posición y contiene', () => {
    const rt = correr(
      [
        agregar('l', t('a')),
        agregar('l', t('b')),
        guardarEn('pos', leer('lis_posicion', { inputs: { ITEM: t('B') } })),
        guardarEn('no', leer('lis_posicion', { inputs: { ITEM: t('z') } })),
        guardarEn('si', leer('lis_contiene', { inputs: { ITEM: t('a') } })),
      ],
      ['pos', 'no', 'si'],
      ['l'],
    );
    expect(rt.valorVariable('pos')).toBe(2);
    expect(rt.valorVariable('no')).toBe(0);
    expect(rt.valorVariable('si')).toBe('true');
  });
  it('borrar, insertar, reemplazar y vaciar', () => {
    const rt = correr(
      [
        agregar('l', n(1)),
        agregar('l', n(2)),
        agregar('l', n(3)),
        { type: 'lis_borrar', fields: { LISTA: 'l' }, inputs: { N: n(2) } },
        { type: 'lis_insertar', fields: { LISTA: 'l' }, inputs: { ITEM: n(9), N: n(1) } },
        { type: 'lis_reemplazar', fields: { LISTA: 'l' }, inputs: { N: n(3), ITEM: t('fin') } },
        { type: 'lis_borrar', fields: { LISTA: 'l' }, inputs: { N: n(50) } },
      ],
      [],
      ['l'],
    );
    expect(rt.valoresLista('l')).toEqual([9, 1, 'fin']);
    const vacio = correr(
      [agregar('l', n(1)), { type: 'lis_borrar_todo', fields: { LISTA: 'l' } }],
      [],
      ['l'],
    );
    expect(vacio.valoresLista('l')).toEqual([]);
  });
  it('no crece sin límite', () => {
    const rt = new Runtime();
    rt.agregarActor(actor);
    const prog = compilar({
      blocks: {
        blocks: [
          {
            type: 'evento_al_ejecutar',
            id: 'h',
            next: {
              block: {
                type: 'ctrl_repetir',
                inputs: {
                  VECES: n(MAX_ELEMENTOS_LISTA + 500),
                  CUERPO: { block: agregar('l', n(1)) },
                },
              },
            },
          },
        ],
      },
    });
    rt.iniciar({ a1: prog }, false, { variables: [], listas: ['l'] });
    for (let i = 0; i < 2000; i++) rt.tick(16);
    expect(rt.valoresLista('l')?.length).toBe(MAX_ELEMENTOS_LISTA);
  });
  it('una lista que no existe se ignora', () => {
    const rt = correr([agregar('fantasma', n(1))], [], ['l']);
    expect(rt.valoresLista('fantasma')).toBeUndefined();
  });
});

describe('monitores en el escenario', () => {
  it('solo muestra lo que el programa mostró y avisa cuando cambia', () => {
    const avisos: Monitores[] = [];
    correr(
      [
        { type: 'var_mostrar', fields: { VAR: 'p' } },
        cambiar('p', 2),
        { type: 'lis_mostrar', fields: { LISTA: 'l' } },
        agregar('l', t('x')),
        { type: 'var_mostrar', fields: { VAR: 'oculta' } },
        { type: 'var_ocultar', fields: { VAR: 'oculta' } },
      ],
      ['p', 'oculta'],
      ['l'],
      (m) => avisos.push(m),
    );
    const ultimo = avisos[avisos.length - 1];
    expect(ultimo.variables).toEqual([{ nombre: 'p', valor: 2 }]);
    expect(ultimo.listas).toEqual([{ nombre: 'l', valores: ['x'] }]);
    expect(avisos[0]).toEqual({ variables: [], listas: [] });
  });
});

describe('nombres de variables y listas', () => {
  it('acepta nombres normales y rechaza vacíos, largos y repetidos', () => {
    expect(validarNombreDato('puntos', [])).toBeNull();
    expect(validarNombreDato('   ', [])).toMatch(/nombre/);
    expect(validarNombreDato('a'.repeat(21), [])).toMatch(/20/);
    expect(validarNombreDato('Puntos', ['puntos'])).toMatch(/existe/);
    expect(
      validarNombreDato(
        'nueva',
        Array.from({ length: 30 }, (_, i) => `v${i}`),
      ),
    ).toMatch(/30/);
  });
  it('un proyecto guardado conserva y limpia sus variables', () => {
    const base = {
      version: 2,
      actores: [
        {
          id: 'a',
          nombre: 'K',
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
      scripts: {},
      seleccionado: 'a',
    };
    const p = validarProyecto({ ...base, variables: ['p', 'P', ' q ', 5, ''], listas: ['l'] });
    expect(p?.variables).toEqual(['p', 'q']);
    expect(p?.listas).toEqual(['l']);
    expect(validarProyecto(base)?.variables).toEqual([]);
  });
});

describe('borrar una variable quita sus bloques', () => {
  const programa = {
    blocks: {
      blocks: [
        {
          type: 'evento_al_ejecutar',
          next: {
            block: {
              type: 'var_fijar',
              fields: { VAR: 'x' },
              next: {
                block: {
                  type: 'mov_mover',
                  inputs: {
                    PASOS: {
                      block: { type: 'var_valor', fields: { VAR: 'x' } },
                      shadow: { type: 'math_number', fields: { NUM: 5 } },
                    },
                  },
                  next: {
                    block: {
                      type: 'ctrl_repetir',
                      inputs: {
                        CUERPO: {
                          block: {
                            type: 'var_cambiar',
                            fields: { VAR: 'x' },
                            next: { block: { type: 'var_cambiar', fields: { VAR: 'y' } } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  };
  it('salta los bloques de pila, vacía las casillas y deja intacto lo demás', () => {
    type Bloque = {
      type: string;
      fields?: { VAR?: string };
      inputs?: Record<string, { block?: Bloque; shadow?: object }>;
      next?: { block: Bloque };
    };
    const r = quitarUsosDeDato(programa, 'VAR', 'x') as unknown as {
      blocks: { blocks: Bloque[] };
    };
    const mover = r.blocks.blocks[0].next!.block;
    expect(mover.type).toBe('mov_mover');
    expect(mover.inputs!.PASOS).toEqual({ shadow: { type: 'math_number', fields: { NUM: 5 } } });
    const cuerpo = mover.next!.block.inputs!.CUERPO.block!;
    expect(cuerpo.type).toBe('var_cambiar');
    expect(cuerpo.fields!.VAR).toBe('y');
    expect(cuerpo.next).toBeUndefined();
  });
  it('no modifica el original', () => {
    const antes = JSON.stringify(programa);
    quitarUsosDeDato(programa, 'VAR', 'x');
    expect(JSON.stringify(programa)).toBe(antes);
  });
  it('un programa sin esa variable queda igual', () => {
    expect(quitarUsosDeDato(programa, 'VAR', 'zzz')).toEqual(programa);
  });
});
