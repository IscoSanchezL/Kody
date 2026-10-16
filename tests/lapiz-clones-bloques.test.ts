import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { MAX_CLONES, Runtime } from '../src/engine/runtime';
import type { EstadoActor, EventoLapiz, Oyentes } from '../src/engine/tipos';

const actor = (id = 'a1', x = 0, y = 0): EstadoActor => ({
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

function cadena(bloques: object[]): object | undefined {
  let sig: object | undefined;
  for (let i = bloques.length - 1; i >= 0; i--)
    sig = { ...bloques[i], ...(sig ? { next: { block: sig } } : {}) };
  return sig;
}
const hat = (type: string, cuerpo: object[], extra: object = {}) => ({
  type,
  ...extra,
  ...(cuerpo.length ? { next: { block: cadena(cuerpo) } } : {}),
});
const ws = (...raices: object[]) => ({ blocks: { blocks: raices } });
const alEjecutar = (cuerpo: object[]) => hat('evento_al_ejecutar', cuerpo, { id: 'inicio' });

function correr(
  espacio: object,
  datos: { variables?: string[]; listas?: string[] } = {},
  oyentes: Oyentes = {},
  actores: EstadoActor[] = [actor()],
  cuadros = 40,
) {
  const rt = new Runtime(oyentes);
  for (const a of actores) rt.agregarActor(a);
  rt.iniciar({ a1: compilar(espacio) }, false, {
    variables: datos.variables ?? [],
    listas: datos.listas ?? [],
  });
  for (let i = 0; i < cuadros; i++) rt.tick(16);
  return rt;
}

const mover = (pasos: number) => ({ type: 'mov_mover', inputs: { PASOS: n(pasos) } });

describe('lápiz', () => {
  const trazos = (cuerpo: object[]) => {
    const eventos: EventoLapiz[] = [];
    const rt = correr(ws(alEjecutar(cuerpo)), {}, { alLapiz: (e) => eventos.push(e) });
    return { eventos, rt };
  };
  const lineas = (e: EventoLapiz[]) => e.filter((x) => x.t === 'linea');

  it('con el lápiz arriba no dibuja', () => {
    const { eventos } = trazos([mover(30)]);
    expect(lineas(eventos)).toHaveLength(0);
  });
  it('con el lápiz abajo deja el trazo de cada movimiento', () => {
    const { eventos } = trazos([
      { type: 'lap_bajar' },
      mover(30),
      { type: 'lap_subir' },
      mover(10),
    ]);
    const l = lineas(eventos);
    expect(l).toHaveLength(2); // el punto al bajar + una línea
    expect(l[1]).toMatchObject({ x1: 0, y1: 0, color: '#2563eb', grosor: 2 });
    expect(l[1].t === 'linea' && Math.round(l[1].x2)).toBe(30);
  });
  it('dibuja también al ir a, sumar a x y deslizar', () => {
    const { eventos } = trazos([
      { type: 'lap_bajar' },
      { type: 'mov_ir_a', inputs: { X: n(50), Y: n(50) } },
      { type: 'mov_cambiar_x', inputs: { N: n(10) } },
      { type: 'mov_deslizar', inputs: { SEG: n(0.2), X: n(0), Y: n(0) } },
    ]);
    expect(lineas(eventos).length).toBeGreaterThan(3);
  });
  it('color y grosor se aplican y se validan', () => {
    const { eventos } = trazos([
      { type: 'lap_color', fields: { COLOR: '#dc2626' } },
      { type: 'lap_color', fields: { COLOR: 'rojo' } }, // inválido: se ignora
      { type: 'lap_grosor', inputs: { N: n(500) } }, // se limita a 50
      { type: 'lap_bajar' },
    ]);
    expect(lineas(eventos)[0]).toMatchObject({ color: '#dc2626', grosor: 50 });
    const { eventos: e2 } = trazos([
      { type: 'lap_grosor', inputs: { N: n(4) } },
      { type: 'lap_cambiar_grosor', inputs: { N: n(-10) } },
      { type: 'lap_bajar' },
    ]);
    expect(lineas(e2)[0]).toMatchObject({ grosor: 1 });
  });
  it('borrar todo y sellar avisan a la interfaz; empezar borra el dibujo', () => {
    const { eventos } = trazos([{ type: 'lap_sellar' }, { type: 'lap_borrar' }]);
    expect(eventos[0]).toEqual({ t: 'borrar' }); // al iniciar
    expect(eventos).toContainEqual({ t: 'sello', actorId: 'a1' });
    expect(eventos.filter((x) => x.t === 'borrar')).toHaveLength(2);
  });
});

describe('clones', () => {
  const clonarYo = { type: 'clon_crear', fields: { ACTOR: '__yo__' } };

  it('un clon hereda el estado y ejecuta "al comenzar como clon"', () => {
    const rt = correr(
      ws(
        alEjecutar([{ type: 'mov_ir_a', inputs: { X: n(40), Y: n(0) } }, clonarYo]),
        hat('evento_clon', [cambiar('clones', 1), mover(50)]),
      ),
      { variables: ['clones'] },
    );
    const clon = [...rt.actores.values()].find((a) => a.clonDe);
    expect(clon?.id).toBe('a1~1');
    expect(clon?.clonDe).toBe('a1');
    expect(Math.round(clon!.x)).toBe(90); // salió de x = 40 y avanzó 50
    expect(Math.round(rt.actores.get('a1')!.x)).toBe(40); // el original no se movió de nuevo
    expect(rt.valorVariable('clones')).toBe(1);
  });
  it('un clon puede borrarse a sí mismo; el original no', () => {
    const rt = correr(
      ws(
        alEjecutar([clonarYo, { type: 'clon_borrar' }, cambiar('despues', 1)]),
        hat('evento_clon', [cambiar('fin', 1), { type: 'clon_borrar' }, cambiar('nunca', 1)]),
      ),
      { variables: ['fin', 'nunca', 'despues'] },
    );
    expect([...rt.actores.values()].some((a) => a.clonDe)).toBe(false);
    expect(rt.valorVariable('fin')).toBe(1);
    expect(rt.valorVariable('nunca')).toBe(0); // se detuvo al borrarse
    expect(rt.valorVariable('despues')).toBe(1); // el original siguió
  });
  it('un clon que borra su pila no deja un hilo girando para siempre', () => {
    const rt = correr(
      ws(
        alEjecutar([clonarYo]),
        hat('evento_clon', [
          { type: 'ctrl_por_siempre', inputs: { CUERPO: { block: { type: 'clon_borrar' } } } },
        ]),
      ),
    );
    expect(rt.activo).toBe(false);
  });
  it('hay un máximo de clones', () => {
    const rt = correr(
      ws(
        alEjecutar([
          {
            type: 'ctrl_repetir',
            inputs: { VECES: n(MAX_CLONES + 20), CUERPO: { block: clonarYo } },
          },
        ]),
      ),
      {},
      {},
      [actor()],
      200,
    );
    expect([...rt.actores.values()].filter((a) => a.clonDe)).toHaveLength(MAX_CLONES);
  });
  it('los clones responden a mensajes y desaparecen al detener', () => {
    const rt = correr(
      ws(
        alEjecutar([clonarYo, { type: 'ev_enviar', fields: { MENSAJE: 'hola' } }]),
        hat('evento_mensaje', [cambiar('oyentes', 1)], { fields: { MENSAJE: 'hola' } }),
      ),
      { variables: ['oyentes'] },
      {},
      [actor()],
      5,
    );
    // El mensaje se envió antes de que el clon existiera con sus manejadores: lo recibe el original.
    expect(rt.valorVariable('oyentes')).toBeGreaterThanOrEqual(1);
    rt.detener();
    expect([...rt.actores.values()].some((a) => a.clonDe)).toBe(false);
  });
  it('"tocando a" también detecta a los clones', () => {
    const rt = new Runtime();
    rt.agregarActor(actor('a1', 0, 0));
    rt.agregarActor(actor('a2', 0, 0));
    const espacio = ws(
      hat('evento_al_ejecutar', [
        { type: 'mov_ir_a', inputs: { X: n(200), Y: n(0) } },
        { type: 'clon_crear', fields: { ACTOR: '__yo__' } },
        fijar('toca', { block: { type: 'sen_tocando', fields: { ACTOR: 'a1' } } }),
      ]),
    );
    rt.iniciar({ a2: compilar(espacio), a1: [] }, false, { variables: ['toca'], listas: [] });
    for (let i = 0; i < 5; i++) rt.tick(16);
    // a2 está lejos de a1; su clon también (copia su posición): no se tocan
    expect(rt.valorVariable('toca')).toBe('false');
    expect(rt.actores.get('a2~1')?.clonDe).toBe('a2');
  });
});

describe('mis bloques', () => {
  const def = (nombre: string, params: string[], cuerpo: object[]) =>
    hat('fun_definir', cuerpo, { extraState: { nombre, params } });
  const llamar = (nombre: string, params: string[], args: Record<string, object> = {}) => ({
    type: 'fun_llamar',
    extraState: { nombre, params },
    inputs: args,
  });
  const param = (nombre: string) => ({ block: { type: 'fun_param', extraState: { nombre } } });

  it('un bloque propio sin parámetros se ejecuta', () => {
    const rt = correr(
      ws(
        def('sumar', [], [cambiar('t', 5)]),
        alEjecutar([llamar('sumar', []), llamar('sumar', [])]),
      ),
      { variables: ['t'] },
    );
    expect(rt.valorVariable('t')).toBe(10);
  });
  it('recibe parámetros y los usa', () => {
    const rt = correr(
      ws(
        def(
          'avanzar',
          ['pasos', 'veces'],
          [
            {
              type: 'ctrl_repetir',
              inputs: { VECES: param('veces'), CUERPO: { block: mover(0) } },
            },
            fijar('r', {
              block: { type: 'op_mult', inputs: { A: param('pasos'), B: param('veces') } },
            }),
          ],
        ),
        alEjecutar([llamar('avanzar', ['pasos', 'veces'], { ARG1: n(7), ARG2: n(3) })]),
      ),
      { variables: ['r'] },
    );
    expect(rt.valorVariable('r')).toBe(21);
  });
  it('cada llamada tiene sus propios parámetros (también anidadas)', () => {
    const rt = correr(
      ws(
        def(
          'doble',
          ['x'],
          [fijar('d', { block: { type: 'op_mult', inputs: { A: param('x'), B: n(2) } } })],
        ),
        def(
          'cuatro',
          ['y'],
          [
            llamar('doble', ['x'], { ARG1: param('y') }),
            fijar('a', { block: { type: 'var_valor', fields: { VAR: 'd' } } }),
            llamar('doble', ['x'], {
              ARG1: { block: { type: 'var_valor', fields: { VAR: 'd' } } },
            }),
          ],
        ),
        alEjecutar([llamar('cuatro', ['y'], { ARG1: n(5) })]),
      ),
      { variables: ['d', 'a'] },
    );
    expect(rt.valorVariable('a')).toBe(10);
    expect(rt.valorVariable('d')).toBe(20);
  });
  it('una llamada a algo que no existe se ignora', () => {
    const rt = correr(ws(alEjecutar([llamar('fantasma', []), cambiar('t', 1)])), {
      variables: ['t'],
    });
    expect(rt.valorVariable('t')).toBe(1);
  });
  it('se puede repetir un bloque propio dentro de un bucle y con recursión corta', () => {
    const rt = correr(
      ws(
        def(
          'cuenta',
          ['n'],
          [
            cambiar('t', 1),
            {
              type: 'ctrl_si',
              inputs: {
                COND: { block: { type: 'cmp_mayor', inputs: { A: param('n'), B: n(1) } } },
                CUERPO: {
                  block: llamar('cuenta', ['n'], {
                    ARG1: { block: { type: 'op_resta', inputs: { A: param('n'), B: n(1) } } },
                  }),
                },
              },
            },
          ],
        ),
        alEjecutar([llamar('cuenta', ['n'], { ARG1: n(5) })]),
      ),
      { variables: ['t'] },
    );
    expect(rt.valorVariable('t')).toBe(5);
  });
  it('una recursión sin fin se corta con un aviso', () => {
    const avisos: string[] = [];
    const rt = correr(
      ws(def('infinito', [], [llamar('infinito', [])]), alEjecutar([llamar('infinito', [])])),
      {},
      { alAviso: (m) => avisos.push(m) },
    );
    expect(avisos.length).toBeGreaterThan(0);
    expect(rt.activo).toBe(false);
  });
  it('un parámetro fuera de un bloque propio vale 0', () => {
    const rt = correr(ws(alEjecutar([fijar('r', param('x'))])), { variables: ['r'] });
    expect(rt.valorVariable('r')).toBe(0);
  });
});
