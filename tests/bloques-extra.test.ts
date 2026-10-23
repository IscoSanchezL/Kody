import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { Runtime } from '../src/engine/runtime';
import type { EstadoActor } from '../src/engine/tipos';

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

function cadena(bloques: object[]): object | undefined {
  let sig: object | undefined;
  for (let i = bloques.length - 1; i >= 0; i--)
    sig = { ...bloques[i], ...(sig ? { next: { block: sig } } : {}) };
  return sig;
}
const prog = (bloques: object[], sombrero: object = { type: 'evento_al_ejecutar', id: 'h' }) => {
  const pila = cadena(bloques);
  return { ...sombrero, ...(pila ? { next: { block: pila } } : {}) };
};
const espacio = (...progs: object[]) => ({ blocks: { blocks: progs } });

function mundo(porActor: Record<string, object>, actores: EstadoActor[], opts?: { ahora?: Date }) {
  const rt = new Runtime({}, () => 0.5, opts?.ahora ? () => opts.ahora! : undefined);
  actores.forEach((a) => rt.agregarActor(a));
  rt.fijarListaFondos(['f1', 'f2', 'f3']);
  rt.fijarFondoInicial('f1');
  const p: Record<string, ReturnType<typeof compilar>> = {};
  for (const [id, ws] of Object.entries(porActor)) p[id] = compilar(ws);
  rt.iniciar(p);
  return rt;
}
const avanzar = (rt: Runtime, ms = 2000) => {
  for (let t = 0; t < ms; t += 16) rt.tick(16);
};

describe('movimiento hacia objetos', () => {
  it('ir a otro actor', () => {
    const rt = mundo({ a: espacio(prog([{ type: 'mov_ir_a_obj', fields: { OBJ: 'b' } }])) }, [
      actor('a'),
      actor('b', 100, -50),
    ]);
    avanzar(rt, 100);
    expect(rt.actores.get('a')).toMatchObject({ x: 100, y: -50 });
  });
  it('ir a posición al azar queda dentro del escenario', () => {
    const rt = mundo(
      { a: espacio(prog([{ type: 'mov_ir_a_obj', fields: { OBJ: '__azar__' } }])) },
      [actor('a')],
    );
    avanzar(rt, 100);
    const a = rt.actores.get('a')!;
    expect(Math.abs(a.x)).toBeLessThanOrEqual(240);
  });
  it('apuntar hacia otro actor', () => {
    const rt = mundo({ a: espacio(prog([{ type: 'mov_apuntar_obj', fields: { OBJ: 'b' } }])) }, [
      actor('a'),
      actor('b', 0, 100),
    ]);
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.direccion).toBeCloseTo(0);
  });
  it('apuntar al ratón', () => {
    const rt = new Runtime();
    rt.agregarActor(actor('a'));
    rt.fijarRaton(-50, 0);
    rt.iniciar({
      a: compilar(espacio(prog([{ type: 'mov_apuntar_obj', fields: { OBJ: '__raton__' } }]))),
    });
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.direccion).toBeCloseTo(-90);
  });
  it('deslizar hasta otro actor', () => {
    const rt = mundo(
      {
        a: espacio(
          prog([{ type: 'mov_deslizar_obj', fields: { OBJ: 'b' }, inputs: { SEG: n(0.5) } }]),
        ),
      },
      [actor('a'), actor('b', 80, 40)],
    );
    avanzar(rt, 1000);
    expect(rt.actores.get('a')).toMatchObject({ x: 80, y: 40 });
  });
  it('fijar x y fijar y', () => {
    const rt = mundo(
      {
        a: espacio(
          prog([
            { type: 'mov_fijar_x', inputs: { N: n(30) } },
            { type: 'mov_fijar_y', inputs: { N: n(-20) } },
          ]),
        ),
      },
      [actor('a', 5, 5)],
    );
    avanzar(rt, 100);
    expect(rt.actores.get('a')).toMatchObject({ x: 30, y: -20 });
  });
});

describe('escenarios', () => {
  it('siguiente escenario da la vuelta', () => {
    const rt = mundo(
      {
        a: espacio(
          prog([
            { type: 'ap_sig_fondo' },
            { type: 'ap_sig_fondo' },
            { type: 'ap_sig_fondo' },
            { type: 'ap_sig_fondo' },
          ]),
        ),
      },
      [actor('a')],
    );
    avanzar(rt, 200);
    expect(rt.fondo).toBe('f2');
  });
  it('"cuando el escenario cambie a" arranca el programa', () => {
    const rt = mundo(
      {
        a: espacio(prog([{ type: 'ap_fondo', fields: { FONDO: 'f3' } }])),
        b: espacio(
          prog([{ type: 'mov_fijar_x', inputs: { N: n(77) } }], {
            type: 'evento_fondo',
            id: 'ef',
            fields: { FONDO: 'f3' },
          }),
        ),
      },
      [actor('a'), actor('b')],
    );
    avanzar(rt, 200);
    expect(rt.actores.get('b')!.x).toBe(77);
  });
  it('número de escenario', () => {
    const rt = mundo(
      {
        a: espacio(
          prog([
            { type: 'ap_fondo', fields: { FONDO: 'f3' } },
            { type: 'mov_fijar_x', inputs: { N: { block: { type: 'ap_fondo_num' } } } },
          ]),
        ),
      },
      [actor('a')],
    );
    avanzar(rt, 200);
    expect(rt.actores.get('a')!.x).toBe(3);
  });
});

describe('cuando <condición>', () => {
  it('arranca solo al pasar de falso a verdadero', () => {
    const cuando = prog([{ type: 'mov_cambiar_x', inputs: { N: n(1) } }], {
      type: 'evento_cuando',
      id: 'cu',
      inputs: { COND: { block: { type: 'sen_raton_abajo' } } },
    });
    const rt = new Runtime();
    rt.agregarActor(actor('a'));
    rt.iniciar({ a: compilar(espacio(cuando)) });
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.x).toBe(0);
    rt.fijarRatonAbajo(true);
    avanzar(rt, 500);
    expect(rt.actores.get('a')!.x).toBe(1); // una sola vez aunque siga presionado
    rt.fijarRatonAbajo(false);
    avanzar(rt, 100);
    rt.fijarRatonAbajo(true);
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.x).toBe(2);
  });
});

describe('control', () => {
  it('enviar y esperar espera a los que reciben', () => {
    const rt = mundo(
      {
        a: espacio(
          prog([
            { type: 'ev_enviar_espera', fields: { MENSAJE: 'hola' } },
            { type: 'mov_fijar_y', inputs: { N: n(9) } },
          ]),
        ),
        b: espacio(
          prog(
            [
              { type: 'ctrl_esperar', inputs: { SEG: n(1) } },
              { type: 'mov_fijar_x', inputs: { N: n(5) } },
            ],
            {
              type: 'evento_mensaje',
              id: 'm',
              fields: { MENSAJE: 'hola' },
            },
          ),
        ),
      },
      [actor('a'), actor('b')],
    );
    avanzar(rt, 500);
    expect(rt.actores.get('a')!.y).toBe(0); // todavía espera
    avanzar(rt, 1500);
    expect(rt.actores.get('b')!.x).toBe(5);
    expect(rt.actores.get('a')!.y).toBe(9);
  });
  it('detener este programa corta solo ese programa', () => {
    const rt = mundo(
      {
        a: espacio(
          prog([
            { type: 'mov_fijar_x', inputs: { N: n(1) } },
            { type: 'ctrl_detener_este' },
            { type: 'mov_fijar_x', inputs: { N: n(2) } },
          ]),
          prog([{ type: 'mov_fijar_y', inputs: { N: n(4) } }], {
            type: 'evento_al_ejecutar',
            id: 'h2',
          }),
        ),
      },
      [actor('a')],
    );
    avanzar(rt, 200);
    expect(rt.actores.get('a')).toMatchObject({ x: 1, y: 4 });
  });
  it('detener otros programas del actor', () => {
    const lento = prog(
      [
        { type: 'ctrl_esperar', inputs: { SEG: n(1) } },
        { type: 'mov_fijar_x', inputs: { N: n(99) } },
      ],
      { type: 'evento_al_ejecutar', id: 'lento' },
    );
    const corto = prog([{ type: 'ctrl_detener_otros' }], { type: 'evento_al_ejecutar', id: 'c' });
    const rt = mundo({ a: espacio(lento, corto) }, [actor('a')]);
    avanzar(rt, 2000);
    expect(rt.actores.get('a')!.x).toBe(0);
  });
});

describe('sensores nuevos', () => {
  const guardar = (reporter: object) =>
    espacio(prog([{ type: 'mov_fijar_x', inputs: { N: { block: reporter } } }]));
  it('tamaño', () => {
    const rt = mundo({ a: guardar({ type: 'ap_tamano' }) }, [{ ...actor('a'), tamano: 150 }]);
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.x).toBe(150);
  });
  it('¿tocando el ratón?', () => {
    const rt = new Runtime();
    rt.agregarActor(actor('a'));
    rt.fijarRaton(10, 0);
    rt.iniciar({ a: compilar(guardar({ type: 'sen_tocando_raton' })) });
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.x).toBe(1);
  });
  it('fecha actual (mes)', () => {
    const rt = mundo(
      { a: guardar({ type: 'sen_fecha', fields: { FECHA: 'mes' } }) },
      [actor('a')],
      {
        ahora: new Date(2031, 4, 9, 7, 8, 9),
      },
    );
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.x).toBe(5);
  });
  it('propiedad de otro actor', () => {
    const rt = mundo({ a: guardar({ type: 'sen_de', fields: { PROP: 'y', ACTOR: 'b' } }) }, [
      actor('a'),
      actor('b', 0, 42),
    ]);
    avanzar(rt, 100);
    expect(rt.actores.get('a')!.x).toBe(42);
  });
});

describe('lápiz: tono', () => {
  it('cambiar el tono cambia el color de la línea', () => {
    const colores: string[] = [];
    const rt = new Runtime({
      alLapiz: (e) => {
        if (e.t === 'linea') colores.push(e.color);
      },
    });
    rt.agregarActor(actor('a'));
    rt.iniciar({
      a: compilar(
        espacio(
          prog([
            { type: 'lap_tono', inputs: { N: n(0) } },
            { type: 'lap_bajar' },
            { type: 'lap_cambiar_tono', inputs: { N: n(50) } },
            { type: 'lap_bajar' },
          ]),
        ),
      ),
    });
    avanzar(rt, 100);
    expect(colores[0]).toBe('#ff0000');
    expect(colores[1]).toBe('#00ffff');
  });
});
