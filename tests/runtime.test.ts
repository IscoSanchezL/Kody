import { describe, expect, it } from 'vitest';
import { compilar } from '../src/engine/compilar';
import { Runtime } from '../src/engine/runtime';
import type { EstadoActor } from '../src/engine/tipos';

const actor = (): EstadoActor => ({
  id: 'a1',
  nombre: 'Kody',
  x: 0,
  y: 0,
  direccion: 90,
  tamano: 100,
  visible: true,
  disfrazActual: 0,
  totalDisfraces: 2,
  dialogo: null,
});

const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });

/** Construye el JSON de un espacio con una pila de bloques bajo el sombrero. */
function espacio(...bloques: object[]) {
  let siguiente: object | undefined;
  for (let i = bloques.length - 1; i >= 0; i--) {
    siguiente = { ...bloques[i], ...(siguiente ? { next: { block: siguiente } } : {}) };
  }
  return {
    blocks: {
      blocks: [
        {
          type: 'evento_al_ejecutar',
          id: 'h',
          ...(siguiente ? { next: { block: siguiente } } : {}),
        },
      ],
    },
  };
}

function correr(ws: object, ms = 5000) {
  const rt = new Runtime();
  rt.agregarActor(actor());
  rt.iniciar(compilar(ws), 'a1');
  for (let t = 0; t < ms; t += 16) rt.tick(16);
  return { rt, a: rt.actores.get('a1')! };
}

describe('compilar', () => {
  it('ignora bloques sueltos sin sombrero', () => {
    expect(compilar({ blocks: { blocks: [{ type: 'mov_mover', id: 'x' }] } })).toHaveLength(0);
  });
  it('compila la pila bajo el sombrero', () => {
    const p = compilar(espacio({ type: 'mov_mover', id: 'm', inputs: { PASOS: num(10) } }));
    expect(p).toHaveLength(1);
    expect(p[0].cuerpo[0].tipo).toBe('mov_mover');
  });
});

describe('movimiento', () => {
  it('mover 50 pasos a la derecha', () => {
    const { a } = correr(espacio({ type: 'mov_mover', id: 'm', inputs: { PASOS: num(50) } }));
    expect(a.x).toBeCloseTo(50);
    expect(a.y).toBeCloseTo(0);
  });
  it('girar y mover (hacia arriba)', () => {
    const { a } = correr(
      espacio(
        { type: 'mov_apuntar', id: 'p', inputs: { DIR: num(0) } },
        { type: 'mov_mover', id: 'm', inputs: { PASOS: num(30) } },
      ),
    );
    expect(a.y).toBeCloseTo(30);
    expect(a.x).toBeCloseTo(0);
  });
  it('girar a la derecha 90 desde 90 queda en 180', () => {
    const { a } = correr(espacio({ type: 'mov_girar_der', id: 'g', inputs: { GRADOS: num(90) } }));
    expect(a.direccion).toBe(180);
  });
  it('nunca sale del escenario', () => {
    const { a } = correr(espacio({ type: 'mov_mover', id: 'm', inputs: { PASOS: num(9999) } }));
    expect(a.x).toBeLessThanOrEqual(240);
  });
});

describe('control', () => {
  it('repetir 4 veces', () => {
    const { a } = correr(
      espacio({
        type: 'ctrl_repetir',
        id: 'r',
        inputs: {
          VECES: num(4),
          CUERPO: { block: { type: 'mov_mover', id: 'm', inputs: { PASOS: num(10) } } },
        },
      }),
    );
    expect(a.x).toBeCloseTo(40);
  });
  it('esperar respeta el tiempo', () => {
    const ws = espacio(
      { type: 'ctrl_esperar', id: 'e', inputs: { SEG: num(1) } },
      { type: 'mov_mover', id: 'm', inputs: { PASOS: num(10) } },
    );
    const rt = new Runtime();
    rt.agregarActor(actor());
    rt.iniciar(compilar(ws), 'a1');
    for (let t = 0; t < 500; t += 16) rt.tick(16);
    expect(rt.actores.get('a1')!.x).toBe(0);
    for (let t = 0; t < 700; t += 16) rt.tick(16);
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
  });
  it('por siempre no congela: avanza un cuadro por vuelta', () => {
    const rt = new Runtime();
    rt.agregarActor(actor());
    rt.iniciar(
      compilar(
        espacio({
          type: 'ctrl_por_siempre',
          id: 'f',
          inputs: { CUERPO: { block: { type: 'mov_cambiar_x', id: 'm', inputs: { N: num(1) } } } },
        }),
      ),
      'a1',
    );
    for (let i = 0; i < 10; i++) rt.tick(16);
    expect(rt.actores.get('a1')!.x).toBe(10);
    expect(rt.modo).toBe('corriendo');
    rt.detener();
    expect(rt.modo).toBe('detenido');
  });
  it('watchdog corta un por siempre vacío sin colgar', () => {
    const avisos: string[] = [];
    const rt = new Runtime({ alAviso: (m) => avisos.push(m) });
    rt.agregarActor(actor());
    rt.iniciar(compilar(espacio({ type: 'ctrl_por_siempre', id: 'f', inputs: {} })), 'a1');
    rt.tick(16);
    expect(rt.modo).toBe('corriendo'); // sigue vivo, no se cuelga
    expect(avisos).toHaveLength(0);
  });
});

describe('apariencia', () => {
  it('decir por segundos muestra y luego borra el globo', () => {
    const ws = espacio({
      type: 'ap_decir_seg',
      id: 'd',
      inputs: { TEXTO: { shadow: { type: 'text', fields: { TEXT: '¡Hola!' } } }, SEG: num(1) },
    });
    const rt = new Runtime();
    rt.agregarActor(actor());
    rt.iniciar(compilar(ws), 'a1');
    rt.tick(16);
    expect(rt.actores.get('a1')!.dialogo?.texto).toBe('¡Hola!');
    for (let t = 0; t < 1200; t += 16) rt.tick(16);
    expect(rt.actores.get('a1')!.dialogo).toBeNull();
  });
  it('siguiente disfraz da la vuelta', () => {
    const { a } = correr(
      espacio({ type: 'ap_sig_disfraz', id: 'a' }, { type: 'ap_sig_disfraz', id: 'b' }),
    );
    expect(a.disfrazActual).toBe(0);
  });
});

describe('paso a paso', () => {
  it('ejecuta un bloque por paso', () => {
    const rt = new Runtime();
    rt.agregarActor(actor());
    rt.iniciar(
      compilar(
        espacio(
          { type: 'mov_mover', id: 'm1', inputs: { PASOS: num(10) } },
          { type: 'mov_mover', id: 'm2', inputs: { PASOS: num(10) } },
        ),
      ),
      'a1',
      true,
    );
    rt.paso();
    expect(rt.actores.get('a1')!.x).toBeCloseTo(10);
    rt.paso();
    expect(rt.actores.get('a1')!.x).toBeCloseTo(20);
  });
  it('reiniciar al ejecutar devuelve el actor a su estado inicial', () => {
    const ws = espacio({ type: 'mov_mover', id: 'm', inputs: { PASOS: num(50) } });
    const rt = new Runtime();
    rt.agregarActor(actor());
    rt.iniciar(compilar(ws), 'a1');
    rt.tick(16);
    rt.iniciar(compilar(ws), 'a1');
    expect(rt.actores.get('a1')!.x).toBe(0);
  });
});
