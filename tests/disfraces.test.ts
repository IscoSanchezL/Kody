import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { Runtime } from '../src/engine/runtime';
import type { EstadoActor } from '../src/engine/tipos';
import {
  MAX_DISFRACES,
  agregarDisfrazA,
  aEstado,
  crearActor,
  disfracesDe,
  disfrazActivo,
  quitarDisfrazDe,
  renombrarDisfrazEn,
  validarProyecto,
} from '../src/store/proyectoModelo';

describe('lista de disfraces', () => {
  it('cada personaje trae sus dos variantes con nombre', () => {
    const d = disfracesDe('gato');
    expect(d).toHaveLength(2);
    expect(d.map((x) => x.variante)).toEqual([0, 1]);
    expect(new Set(d.map((x) => x.nombre)).size).toBe(2);
    expect(crearActor('gato', []).disfraces).toEqual(d);
  });
  it('el disfraz activo da la vuelta y se apoya en el personaje si no hay lista', () => {
    const a = crearActor('dino', []);
    expect(disfrazActivo(a, 1)).toEqual({ personaje: 'dino', variante: 1 });
    expect(disfrazActivo(a, 2)).toEqual({ personaje: 'dino', variante: 0 });
    expect(disfrazActivo(a, -1)).toEqual({ personaje: 'dino', variante: 1 });
    expect(disfrazActivo({ personaje: 'pez' }, 1)).toEqual({ personaje: 'pez', variante: 1 });
  });
  it('agregar pone el nuevo disfraz y no repite nombres', () => {
    const base = disfracesDe('kody');
    const r1 = agregarDisfrazA(base, { personaje: 'gato', variante: 1 })!;
    expect(r1.disfraces).toHaveLength(3);
    expect(r1.disfraz).toBe(2);
    expect(r1.disfraces[2].personaje).toBe('gato');
    const r2 = agregarDisfrazA(r1.disfraces, { personaje: 'gato', variante: 1 })!;
    const nombres = r2.disfraces.map((d) => d.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });
  it('hay un máximo de disfraces', () => {
    let lista = disfracesDe('kody');
    while (lista.length < MAX_DISFRACES)
      lista = agregarDisfrazA(lista, { personaje: 'pez', variante: 0 })!.disfraces;
    expect(agregarDisfrazA(lista, { personaje: 'pez', variante: 0 })).toBeNull();
  });
  it('quitar deja siempre uno y ajusta el que está puesto', () => {
    const lista = [...disfracesDe('kody'), ...disfracesDe('gato')];
    expect(quitarDisfrazDe(lista, 0, 2)?.disfraz).toBe(1); // se corre uno a la izquierda
    expect(quitarDisfrazDe(lista, 3, 3)?.disfraz).toBe(2); // el último puesto: queda el anterior
    expect(quitarDisfrazDe(lista, 3, 1)?.disfraz).toBe(1);
    expect(quitarDisfrazDe(disfracesDe('kody').slice(0, 1), 0, 0)).toBeNull();
    expect(quitarDisfrazDe(lista, 9, 0)).toBeNull();
  });
  it('renombrar rechaza vacíos y nombres de otro disfraz', () => {
    const lista = disfracesDe('kody');
    expect(renombrarDisfrazEn(lista, 0, '  Feliz  ')?.[0].nombre).toBe('Feliz');
    expect(renombrarDisfrazEn(lista, 0, '   ')).toBeNull();
    expect(renombrarDisfrazEn(lista, 0, lista[1].nombre.toUpperCase())).toBeNull();
    expect(renombrarDisfrazEn(lista, 0, lista[0].nombre)?.[0].nombre).toBe(lista[0].nombre);
  });
});

describe('proyectos guardados con disfraces', () => {
  const actorViejo = {
    id: 'a',
    nombre: 'K',
    personaje: 'gato',
    x: 0,
    y: 0,
    direccion: 90,
    tamano: 100,
    visible: true,
    disfraz: 1,
  };
  const base = (actor: object) => ({
    version: 2,
    actores: [actor],
    fondo: 'pradera',
    scripts: {},
    seleccionado: 'a',
  });
  it('un proyecto de antes (sin lista) recibe los dos disfraces de su personaje', () => {
    const a = validarProyecto(base(actorViejo))!.actores[0];
    expect(a.disfraces).toEqual(disfracesDe('gato'));
    expect(a.disfraz).toBe(1);
  });
  it('limpia disfraces inventados y el número que se pasa', () => {
    const a = validarProyecto(
      base({
        ...actorViejo,
        disfraz: 99,
        disfraces: [
          { personaje: 'inventado', variante: 0, nombre: 'x' },
          { personaje: 'pez', variante: 1, nombre: 'Rápido' },
          { personaje: 'pez', variante: 7, nombre: 'Rápido' },
          'basura',
        ],
      }),
    )!.actores[0];
    expect(a.disfraces.map((d) => [d.personaje, d.variante, d.nombre])).toEqual([
      ['pez', 1, 'Rápido'],
      ['pez', 0, 'Rápido 2'],
    ]);
    expect(a.disfraz).toBe(1);
  });
  it('si ningún disfraz sirve, usa los del personaje', () => {
    const a = validarProyecto(base({ ...actorViejo, disfraces: [{ personaje: 'nada' }] }))!
      .actores[0];
    expect(a.disfraces).toEqual(disfracesDe('gato'));
  });
  it('el actor pasa sus nombres de disfraz al motor', () => {
    const e = aEstado(crearActor('kody', []));
    expect(e.totalDisfraces).toBe(2);
    expect(e.nombresDisfraces).toHaveLength(2);
  });
});

describe('bloques de disfraces en el motor', () => {
  const actor = (): EstadoActor => ({
    id: 'a1',
    nombre: 'a1',
    x: 0,
    y: 0,
    direccion: 90,
    tamano: 100,
    visible: true,
    disfrazActual: 0,
    totalDisfraces: 3,
    nombresDisfraces: ['uno', 'dos', 'tres'],
    dialogo: null,
  });
  const fijar = (v: string, valor: object) => ({
    type: 'var_fijar',
    fields: { VAR: v },
    inputs: { VALOR: { block: valor } },
  });
  function correr(bloques: object[]) {
    let sig: object | undefined;
    for (let i = bloques.length - 1; i >= 0; i--)
      sig = { ...bloques[i], ...(sig ? { next: { block: sig } } : {}) };
    const rt = new Runtime();
    rt.agregarActor(actor());
    const prog = compilar({
      blocks: { blocks: [{ type: 'evento_al_ejecutar', id: 'h', next: { block: sig } }] },
    });
    rt.iniciar({ a1: prog }, false, { variables: ['n', 'nombre'], listas: [] });
    for (let i = 0; i < 10; i++) rt.tick(16);
    return rt;
  }
  it('cambiar disfraz a … busca por nombre', () => {
    const rt = correr([{ type: 'ap_disfraz_a', fields: { DISFRAZ: 'tres' } }]);
    expect(rt.actores.get('a1')!.disfrazActual).toBe(2);
  });
  it('un nombre que no existe se ignora', () => {
    const rt = correr([{ type: 'ap_disfraz_a', fields: { DISFRAZ: 'nada' } }]);
    expect(rt.actores.get('a1')!.disfrazActual).toBe(0);
  });
  it('siguiente disfraz recorre todos', () => {
    const rt = correr([
      { type: 'ap_sig_disfraz' },
      { type: 'ap_sig_disfraz' },
      { type: 'ap_sig_disfraz' },
    ]);
    expect(rt.actores.get('a1')!.disfrazActual).toBe(0);
  });
  it('el número y el nombre del disfraz se pueden leer', () => {
    const rt = correr([
      { type: 'ap_disfraz_a', fields: { DISFRAZ: 'dos' } },
      fijar('n', { type: 'ap_disfraz_num', fields: { MODO: 'num' } }),
      fijar('nombre', { type: 'ap_disfraz_num', fields: { MODO: 'nombre' } }),
    ]);
    expect(rt.valorVariable('n')).toBe(2);
    expect(rt.valorVariable('nombre')).toBe('dos');
  });
});
