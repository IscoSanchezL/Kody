import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { Runtime } from '../src/engine/runtime';
import type { EstadoActor, Oyentes } from '../src/engine/tipos';

const actor = (id: string, x = 0, y = 0): EstadoActor => ({
  id,
  nombre: id,
  x,
  y,
  direccion: 90,
  tamano: 100,
  visible: true,
  disfrazActual: 0,
  totalDisfraces: 2,
  dialogo: null,
});

const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } });
const t = (v: string) => ({ shadow: { type: 'text', fields: { TEXT: v } } });
const b = (type: string, inputs: Record<string, object> = {}, fields: object = {}) => ({
  block: { type, inputs, fields },
});
const fijar = (v: string, valor: object) => ({
  type: 'var_fijar',
  fields: { VAR: v },
  inputs: { VALOR: valor },
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

function crear(bloques: object[], vars: string[], oyentes: Oyentes = {}, ...extra: EstadoActor[]) {
  const rt = new Runtime(oyentes);
  rt.agregarActor(actor('a1'));
  for (const e of extra) rt.agregarActor(e);
  return { rt, prog: { a1: compilar(espacio(bloques)) }, datos: { variables: vars, listas: [] } };
}
function correr(bloques: object[], vars: string[], oyentes: Oyentes = {}, ...extra: EstadoActor[]) {
  const { rt, prog, datos } = crear(bloques, vars, oyentes, ...extra);
  rt.iniciar(prog, false, datos);
  for (let i = 0; i < 30; i++) rt.tick(16);
  return rt;
}

describe('operadores de texto y números', () => {
  const valor = (bloque: object) => correr([fijar('r', bloque)], ['r']).valorVariable('r');
  it('unir, letra, longitud y contiene', () => {
    expect(valor(b('op_unir', { A: t('hola '), B: t('mundo') }))).toBe('hola mundo');
    expect(valor(b('op_unir', { A: t('n'), B: n(5) }))).toBe('n5');
    expect(valor(b('op_letra', { N: n(2), TEXTO: t('Kody') }))).toBe('o');
    expect(valor(b('op_letra', { N: n(9), TEXTO: t('Kody') }))).toBe('');
    expect(valor(b('op_letra', { N: n(0), TEXTO: t('Kody') }))).toBe('');
    expect(valor(b('op_longitud_texto', { A: t('Kody') }))).toBe(4);
    expect(valor(b('op_longitud_texto', { A: n(1234) }))).toBe(4);
    expect(valor(b('op_contiene_texto', { A: t('Kody el zorro'), B: t('ZORRO') }))).toBe('true');
    expect(valor(b('op_contiene_texto', { A: t('Kody'), B: t('x') }))).toBe('false');
  });
  it('resto y redondear', () => {
    expect(valor(b('op_resto', { A: n(10), B: n(3) }))).toBe(1);
    expect(valor(b('op_resto', { A: n(-7), B: n(3) }))).toBe(-1);
    expect(valor(b('op_resto', { A: n(10), B: n(0) }))).toBe(0);
    expect(valor(b('op_redondear', { A: n(3.6) }))).toBe(4);
    expect(valor(b('op_redondear', { A: n(2.4) }))).toBe(2);
  });
  it('funciones matemáticas', () => {
    const f = (func: string, x: number) => valor(b('op_funcion', { A: n(x) }, { FUNC: func }));
    expect(f('abs', -5)).toBe(5);
    expect(f('raiz', 16)).toBe(4);
    expect(f('raiz', -4)).toBe(0);
    expect(f('piso', 2.9)).toBe(2);
    expect(f('techo', 2.1)).toBe(3);
    expect(f('sen', 90)).toBe(1);
    expect(f('sen', 0)).toBe(0);
    expect(f('cos', 180)).toBe(-1);
  });
  it('una función desconocida no rompe el programa', () => {
    expect(valor(b('op_funcion', { A: n(-3) }, { FUNC: 'raro' }))).toBe(3);
  });
});

describe('sensores nuevos', () => {
  it('el temporizador cuenta y se puede reiniciar', () => {
    const rt = new Runtime();
    rt.agregarActor(actor('a1'));
    const prog = compilar(
      espacio([
        { type: 'ctrl_esperar', inputs: { SEG: n(2) } },
        fijar('antes', b('sen_temporizador')),
        { type: 'sen_reiniciar_temporizador' },
        { type: 'ctrl_esperar', inputs: { SEG: n(1) } },
        fijar('despues', b('sen_temporizador')),
      ]),
    );
    rt.iniciar({ a1: prog }, false, { variables: ['antes', 'despues'], listas: [] });
    for (let i = 0; i < 400; i++) rt.tick(16);
    expect(Number(rt.valorVariable('antes'))).toBeGreaterThanOrEqual(2);
    expect(Number(rt.valorVariable('antes'))).toBeLessThan(2.3);
    expect(Number(rt.valorVariable('despues'))).toBeGreaterThanOrEqual(1);
    expect(Number(rt.valorVariable('despues'))).toBeLessThan(1.3);
  });
  it('el ratón: posición y presionado', () => {
    const rt = new Runtime();
    rt.agregarActor(actor('a1'));
    rt.fijarRaton(30, -40);
    rt.fijarRatonAbajo(true);
    const prog = compilar(
      espacio([
        fijar('mx', b('sen_raton_x')),
        fijar('my', b('sen_raton_y')),
        fijar('abajo', b('sen_raton_abajo')),
      ]),
    );
    rt.iniciar({ a1: prog }, false, { variables: ['mx', 'my', 'abajo'], listas: [] });
    for (let i = 0; i < 5; i++) rt.tick(16);
    expect(rt.valorVariable('mx')).toBe(30);
    expect(rt.valorVariable('my')).toBe(-40);
    expect(rt.valorVariable('abajo')).toBe('true');
  });
  it('la distancia al ratón y a otro actor', () => {
    const rt = new Runtime();
    rt.agregarActor(actor('a1', 0, 0));
    rt.agregarActor(actor('a2', 30, 40));
    rt.fijarRaton(0, 100);
    const prog = compilar(
      espacio([
        fijar('alRaton', b('sen_distancia', {}, { ACTOR: '__raton__' })),
        fijar('alOtro', b('sen_distancia', {}, { ACTOR: 'a2' })),
        fijar('alNadie', b('sen_distancia', {}, { ACTOR: 'no-existe' })),
      ]),
    );
    rt.iniciar({ a1: prog }, false, { variables: ['alRaton', 'alOtro', 'alNadie'], listas: [] });
    for (let i = 0; i < 5; i++) rt.tick(16);
    expect(rt.valorVariable('alRaton')).toBe(100);
    expect(rt.valorVariable('alOtro')).toBe(50);
    expect(rt.valorVariable('alNadie')).toBe(0);
  });
});

describe('preguntar y esperar', () => {
  const programa = [
    { type: 'sen_preguntar', inputs: { TEXTO: t('¿Cómo te llamas?') } },
    fijar('nombre', b('sen_respuesta')),
  ];

  it('el programa espera hasta que se responde, y la respuesta queda guardada', () => {
    const preguntas: string[] = [];
    let terminadas = 0;
    const { rt, prog, datos } = crear(programa, ['nombre'], {
      alPreguntar: (x) => preguntas.push(x),
      alTerminarPregunta: () => terminadas++,
    });
    rt.iniciar(prog, false, datos);
    for (let i = 0; i < 50; i++) rt.tick(16);
    expect(preguntas).toEqual(['¿Cómo te llamas?']);
    expect(rt.valorVariable('nombre')).toBe(0); // sigue esperando
    expect(rt.activo).toBe(true);
    rt.responder('Luna');
    for (let i = 0; i < 5; i++) rt.tick(16);
    expect(rt.valorVariable('nombre')).toBe('Luna');
    expect(terminadas).toBe(1);
    expect(rt.activo).toBe(false);
  });
  it('detener el programa cierra la pregunta abierta', () => {
    let terminadas = 0;
    const { rt, prog, datos } = crear(programa, ['nombre'], {
      alTerminarPregunta: () => terminadas++,
    });
    rt.iniciar(prog, false, datos);
    for (let i = 0; i < 5; i++) rt.tick(16);
    rt.detener();
    expect(terminadas).toBe(1);
    rt.responder('tarde'); // ya no hay pregunta: se ignora
    expect(terminadas).toBe(1);
  });
  it('en paso a paso no se queda esperando', () => {
    const { rt, prog, datos } = crear(programa, ['nombre']);
    rt.iniciar(prog, true, datos);
    for (let i = 0; i < 6; i++) rt.paso();
    expect(rt.valorVariable('nombre')).toBe('');
  });
  it('limita el largo de la respuesta', () => {
    const { rt, prog, datos } = crear(programa, ['nombre']);
    rt.iniciar(prog, false, datos);
    for (let i = 0; i < 3; i++) rt.tick(16);
    rt.responder('x'.repeat(5000));
    for (let i = 0; i < 3; i++) rt.tick(16);
    expect(String(rt.valorVariable('nombre')).length).toBeLessThanOrEqual(500);
  });
});
