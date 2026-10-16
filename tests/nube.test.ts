import { describe, expect, it } from 'vitest';
import { mensajeDeError } from '../src/nube/proyectos';
import { validarApodo } from '../src/nube/sesion';

describe('apodo', () => {
  it('acepta de 2 a 40 letras', () => {
    expect(validarApodo('Lu')).toBeNull();
    expect(validarApodo('  Luna  de   Kody ')).toBeNull();
    expect(validarApodo('a'.repeat(40))).toBeNull();
  });
  it('rechaza muy corto o muy largo', () => {
    expect(validarApodo('L')).toMatch(/2 letras/);
    expect(validarApodo('   ')).toMatch(/2 letras/);
    expect(validarApodo('a'.repeat(41))).toMatch(/40/);
  });
});

describe('mensajes de error de la nube', () => {
  it('avisa cuando el proyecto es demasiado grande', () => {
    expect(mensajeDeError({ message: 'proyecto_grande' })).toMatch(/grande/);
  });
  it('explica el límite de proyectos', () => {
    expect(mensajeDeError({ message: 'limite_proyectos' })).toMatch(/30 proyectos/);
  });
  it('explica la falta de internet', () => {
    expect(mensajeDeError({ code: 'unavailable', message: 'network error' })).toMatch(/conexión/);
  });
  it('explica la sesión vencida', () => {
    expect(mensajeDeError({ code: 'permission-denied', message: 'Missing permissions' })).toMatch(
      /sesión/,
    );
  });
  it('no muestra textos técnicos en errores desconocidos', () => {
    const m = mensajeDeError({ message: 'relation "x" does not exist', code: 'internal' });
    expect(m).not.toMatch(/relation/);
    expect(m).toMatch(/Inténtalo/);
  });
});
