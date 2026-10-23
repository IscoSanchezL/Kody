import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { Runtime } from '../src/engine/runtime';
import type { EstadoActor, Oyentes } from '../src/engine/tipos';

const actor = (id = 'a1', x = 0): EstadoActor => ({
  id,
  nombre: id,
  x,
  y: 0,
  direccion: 90,
  tamano: 100,
  visible: true,
  disfrazActual: 0,
  totalDisfraces: 2,
  dialogo: null,
});

const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const bloqueNum = (n: number) => ({ block: { type: 'math_number', fields: { NUM: n } } });

/** Encadena bloques con `next`. */
function cadena(bloques: object[]): object | undefined {
  let siguiente: object | undefined;
  for (let i = bloques.length - 1; i >= 0; i--) {
    siguiente = { ...bloques[i], ...(siguiente ? { next: { block: siguiente } } : {}) };
  }
  return siguiente;
}

/** Espacio con un sombrero y una pila debajo. */
function espacio(bloques: object[], sombrero: object = { type: 'evento_al_ejecutar', id: 'h' }) {
  const pila = cadena(bloques);
  return { blocks: { blocks: [{ ...sombrero, ...(pila ? { next: { block: pila } } : {}) }] } };
}

function nuevo(oyentes: Oyentes = {}, ...actores: EstadoActor[]) {
  const rt = new Runtime(oyentes);
  for (const a of actores.length ? actores : [actor()]) rt.agregarActor(a);
  return rt;
}

function avanzar(rt: Runtime, ms = 3000) {
  for (let t = 0; t < ms; t += 16) rt.tick(16);
}

function correr(ws: object, ms = 3000) {
  const rt = nuevo();
  rt.iniciar({ a1: compilar(ws) });
  avanzar(rt, ms);
  return { rt, a: rt.actores.get('a1')! };
}

const mover = (n: number, id = 'm') => ({
  type: 'mov_mover',
  id,
  inputs: { PASOS: num(n) },
});

describe('compilar', () => {
  it('ignora bloques sueltos sin sombrero', () => {
    expect(compilar({ blocks: { blocks: [{ type: 'mov_mover', id: 'x' }] } })).toHaveLength(0);
  });
  it('compila la pila bajo el sombrero', () => {
    const p = compilar(espacio([mover(10)]));
    expect(p).toHaveLength(1);
    expect(p[0].cuerpo[0].tipo).toBe('mov_mover');
  });
  it('guarda los campos del sombrero de tecla', () => {
    const p = compilar(
      espacio([], { type: 'evento_tecla', id: 'k', fields: { TECLA: 'espacio' } }),
    );
    expect(p[0].campos.TECLA).toBe('espacio');
  });
});

describe('movimiento', () => {
  it('mover 50 pasos a la derecha', () => {
    const { a } = correr(espacio([mover(50)]));
    expect(a.x).toBeCloseTo(50);
    expect(a.y).toBeCloseTo(0);
  });
  it('apuntar arriba y mover', () => {
    const { a } = correr(
      espacio([{ type: 'mov_apuntar', id: 'p', inputs: { DIR: num(0) } }, mover(30)]),
    );
    expect(a.y).toBeCloseTo(30);
    expect(a.x).toBeCloseTo(0);
  });
  it('girar a la derecha 90 desde 90 queda en 180', () => {
    const { a } = correr(
      espacio([{ type: 'mov_girar_der', id: 'g', inputs: { GRADOS: num(90) } }]),
    );
    expect(a.direccion).toBe(180);
  });
  it('nunca sale del escenario y rebota', () => {
    const { a } = correr(espacio([mover(9999), { type: 'mov_rebotar', id: 'r' }]));
    expect(a.x).toBeLessThanOrEqual(240 - 40);
    expect(a.direccion).toBe(-90);
  });
});

describe('control', () => {
  it('repetir 4 veces', () => {
    const { a } = correr(
      espacio([
        { type: 'ctrl_repetir', id: 'r', inputs: { VECES: num(4), CUERPO: { block: mover(10) } } },
      ]),
    );
    expect(a.x).toBeCloseTo(40);
  });
  it('esperar respeta el tiempo', () => {
    const rt = nuevo();
    rt.iniciar({
      a1: compilar(
        espacio([{ type: 'ctrl_esperar', id: 'e', inputs: { SEG: num(1) } }, mover(10)]),
      ),
    });
    avanzar(rt, 500);
    expect(rt.actores.get('a1')!.x).toBe(0);
    avanzar(rt, 700);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
  });
  it('por siempre no congela y se puede detener', () => {
    const rt = nuevo();
    rt.iniciar({
      a1: compilar(
        espacio([
          {
            type: 'ctrl_por_siempre',
            id: 'f',
            inputs: {
              CUERPO: { block: { type: 'mov_cambiar_x', id: 'm', inputs: { N: num(1) } } },
            },
          },
        ]),
      ),
    });
    for (let i = 0; i < 10; i++) rt.tick(16);
    expect(rt.actores.get('a1')!.x).toBe(10);
    expect(rt.modo).toBe('corriendo');
    rt.detener();
    expect(rt.modo).toBe('detenido');
  });
  it('por siempre vacío no cuelga el navegador', () => {
    const rt = nuevo();
    rt.iniciar({ a1: compilar(espacio([{ type: 'ctrl_por_siempre', id: 'f' }])) });
    rt.tick(16);
    expect(rt.modo).toBe('corriendo');
  });
  it('si / si no elige la rama correcta', () => {
    const ws = (a: number, b: number) =>
      espacio([
        {
          type: 'ctrl_si_sino',
          id: 's',
          inputs: {
            COND: {
              block: {
                type: 'cmp_mayor',
                inputs: { A: num(a), B: num(b) },
              },
            },
            CUERPO: { block: mover(10, 'm1') },
            CUERPO_SINO: { block: mover(99, 'm2') },
          },
        },
      ]);
    expect(correr(ws(5, 3)).a.x).toBeCloseTo(10);
    expect(correr(ws(1, 3)).a.x).toBeCloseTo(99);
  });
  it('repetir hasta que x > 50', () => {
    const { a } = correr(
      espacio([
        {
          type: 'ctrl_repetir_hasta',
          id: 'rh',
          inputs: {
            COND: {
              block: { type: 'cmp_mayor', inputs: { A: { block: { type: 'sen_x' } }, B: num(50) } },
            },
            CUERPO: { block: mover(20) },
          },
        },
      ]),
    );
    expect(a.x).toBeCloseTo(60);
  });
  it('detener todo corta el programa', () => {
    const rt = nuevo();
    rt.iniciar({
      a1: compilar(espacio([mover(10), { type: 'ctrl_detener', id: 'd' }, mover(10, 'm2')])),
    });
    avanzar(rt, 100);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
    expect(rt.modo).toBe('detenido');
  });
});

describe('operadores', () => {
  it('suma y multiplicación anidadas: (2 + 3) × 4', () => {
    const suma = { block: { type: 'op_suma', inputs: { A: num(2), B: num(3) } } };
    const { a } = correr(
      espacio([
        {
          type: 'mov_mover',
          id: 'm',
          inputs: { PASOS: { block: { type: 'op_mult', inputs: { A: suma, B: num(4) } } } },
        },
      ]),
    );
    expect(a.x).toBeCloseTo(20);
  });
  it('dividir entre cero no rompe nada', () => {
    const { a } = correr(
      espacio([
        {
          type: 'mov_mover',
          id: 'm',
          inputs: { PASOS: { block: { type: 'op_div', inputs: { A: num(5), B: num(0) } } } },
        },
      ]),
    );
    expect(a.x).toBe(0);
  });
  it('número al azar usa el generador inyectado', () => {
    const rt = new Runtime({}, () => 0.999);
    rt.agregarActor(actor());
    rt.iniciar({
      a1: compilar(
        espacio([
          {
            type: 'mov_mover',
            id: 'm',
            inputs: {
              PASOS: { block: { type: 'op_aleatorio', inputs: { DESDE: num(1), HASTA: num(10) } } },
            },
          },
        ]),
      ),
    });
    avanzar(rt, 50);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
  });
});

describe('eventos', () => {
  const alPresionar = (tecla: string) =>
    espacio([mover(25)], { type: 'evento_tecla', id: 'k', fields: { TECLA: tecla } });

  it('al presionar una tecla se ejecuta su programa', () => {
    const rt = nuevo();
    rt.iniciar({ a1: compilar(alPresionar('derecha')) });
    avanzar(rt, 100);
    expect(rt.actores.get('a1')!.x).toBe(0);
    expect(rt.modo).toBe('corriendo'); // escuchando
    rt.presionarTecla('derecha');
    avanzar(rt, 100);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(25);
  });
  it('la repetición automática del teclado no relanza el programa', () => {
    const rt = nuevo();
    rt.iniciar({ a1: compilar(alPresionar('derecha')) });
    rt.presionarTecla('derecha');
    rt.presionarTecla('derecha');
    rt.presionarTecla('derecha');
    avanzar(rt, 100);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(25);
    rt.soltarTecla('derecha');
    rt.presionarTecla('derecha');
    avanzar(rt, 100);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(50);
  });
  it('clic en el actor activa solo su programa', () => {
    const rt = nuevo({}, actor('a1'), actor('a2'));
    const clic = compilar(espacio([mover(10)], { type: 'evento_clic_actor', id: 'c' }));
    rt.iniciar({ a1: clic, a2: [] });
    rt.clicActor('a2');
    avanzar(rt, 50);
    expect(rt.actores.get('a1')!.x).toBe(0);
    rt.clicActor('a1');
    avanzar(rt, 50);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
  });
  it('un actor envía un mensaje y otro lo recibe', () => {
    const rt = nuevo({}, actor('a1'), actor('a2'));
    const emisor = compilar(espacio([{ type: 'ev_enviar', id: 'e', fields: { MENSAJE: 'hola' } }]));
    const receptor = compilar(
      espacio([mover(30)], { type: 'evento_mensaje', id: 'r', fields: { MENSAJE: 'hola' } }),
    );
    rt.iniciar({ a1: emisor, a2: receptor });
    avanzar(rt, 100);
    expect(rt.actores.get('a2')!.x).toBeCloseTo(30);
    expect(rt.actores.get('a1')!.x).toBe(0);
  });
  it('sensor de tecla dentro de un si', () => {
    const rt = nuevo();
    const ws = espacio([
      {
        type: 'ctrl_por_siempre',
        id: 'f',
        inputs: {
          CUERPO: {
            block: {
              type: 'ctrl_si',
              inputs: {
                COND: { block: { type: 'sen_tecla', fields: { TECLA: 'arriba' } } },
                CUERPO: { block: { type: 'mov_cambiar_y', inputs: { N: num(1) } } },
              },
            },
          },
        },
      },
      // el sombrero de bandera y la tecla coexisten
    ]);
    rt.iniciar({ a1: compilar(ws) });
    avanzar(rt, 160);
    expect(rt.actores.get('a1')!.y).toBe(0);
    rt.presionarTecla('arriba'); // sin sombrero de tecla, solo estado
    avanzar(rt, 160);
    expect(rt.actores.get('a1')!.y).toBeGreaterThan(5);
  });
});

describe('sensores', () => {
  it('tocando a otro actor', () => {
    const rt = nuevo({}, actor('a1', 0), actor('a2', 50));
    const ws = espacio([
      {
        type: 'ctrl_si',
        id: 's',
        inputs: {
          COND: { block: { type: 'sen_tocando', fields: { ACTOR: 'a2' } } },
          CUERPO: { block: mover(5) },
        },
      },
    ]);
    rt.iniciar({ a1: compilar(ws), a2: [] });
    avanzar(rt, 50);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(5); // 50 px < 80 px de radios sumados
    rt.fijarInicial(actor('a2', 200));
    rt.iniciar({ a1: compilar(ws), a2: [] });
    avanzar(rt, 50);
    expect(rt.actores.get('a1')!.x).toBe(0);
  });
  it('tocando el borde', () => {
    const { a } = correr(
      espacio([
        mover(9999),
        {
          type: 'ctrl_si',
          id: 's',
          inputs: {
            COND: { block: { type: 'sen_borde' } },
            CUERPO: {
              block: {
                type: 'mov_apuntar',
                inputs: { DIR: bloqueNum(-90).block ? num(-90) : num(0) },
              },
            },
          },
        },
      ]),
    );
    expect(a.direccion).toBe(-90);
  });
});

describe('apariencia, sonido y fondo', () => {
  it('decir por segundos muestra y luego borra el globo', () => {
    const rt = nuevo();
    rt.iniciar({
      a1: compilar(
        espacio([
          {
            type: 'ap_decir_seg',
            id: 'd',
            inputs: {
              TEXTO: { shadow: { type: 'text', fields: { TEXT: '¡Hola!' } } },
              SEG: num(1),
            },
          },
        ]),
      ),
    });
    rt.tick(16);
    expect(rt.actores.get('a1')!.dialogo?.texto).toBe('¡Hola!');
    avanzar(rt, 1200);
    expect(rt.actores.get('a1')!.dialogo).toBeNull();
  });
  it('siguiente disfraz da la vuelta', () => {
    const { a } = correr(
      espacio([
        { type: 'ap_sig_disfraz', id: 'a' },
        { type: 'ap_sig_disfraz', id: 'b' },
      ]),
    );
    expect(a.disfrazActual).toBe(0);
  });
  it('cambiar fondo avisa y se restablece al ejecutar de nuevo', () => {
    const avisos: string[] = [];
    const rt = nuevo({ alCambiarFondo: (id) => avisos.push(id) });
    rt.fijarFondoInicial('pradera');
    const ws = espacio([{ type: 'ap_fondo', id: 'f', fields: { FONDO: 'espacio' } }]);
    rt.iniciar({ a1: compilar(ws) });
    avanzar(rt, 50);
    expect(rt.fondo).toBe('espacio');
    rt.iniciar({ a1: [] });
    expect(rt.fondo).toBe('pradera');
    expect(avisos).toEqual(['espacio', 'pradera']);
  });
  it('tocar sonido y nota llegan a la interfaz', () => {
    const sonidos: unknown[][] = [];
    const rt = nuevo({ alSonido: (...args) => sonidos.push(args) });
    rt.iniciar({
      a1: compilar(
        espacio([
          { type: 'son_tocar', id: 's', fields: { SONIDO: 'ding' } },
          { type: 'son_nota', id: 'n', fields: { NOTA: '64' }, inputs: { SEG: num(0.5) } },
        ]),
      ),
    });
    avanzar(rt, 100);
    expect(sonidos[0]).toEqual(['sonido', 'ding', 0.55, 100, 'piano']);
    expect(sonidos[1]).toEqual(['nota', 64, 0.5, 100, 'piano']);
  });
});

describe('paso a paso y reinicio', () => {
  it('ejecuta un bloque por paso', () => {
    const rt = nuevo();
    rt.iniciar({ a1: compilar(espacio([mover(10, 'm1'), mover(10, 'm2')])) }, true);
    rt.paso();
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
    rt.paso();
    expect(rt.actores.get('a1')!.x).toBeCloseTo(20);
  });
  it('reiniciar al ejecutar devuelve el actor a su estado inicial', () => {
    const ws = espacio([mover(50)]);
    const rt = nuevo();
    rt.iniciar({ a1: compilar(ws) });
    rt.tick(16);
    rt.iniciar({ a1: compilar(ws) });
    expect(rt.actores.get('a1')!.x).toBe(0);
  });
  it('sin programas ejecutables queda detenido', () => {
    const rt = nuevo();
    rt.iniciar({ a1: [] });
    expect(rt.modo).toBe('detenido');
  });
});
