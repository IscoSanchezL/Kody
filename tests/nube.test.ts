import { describe, expect, it } from 'vitest';
import { normalizarCodigo } from '../src/nube/claseApi';
import { mensajeDeError } from '../src/nube/proyectos';
import { validarApodo } from '../src/nube/sesion';

describe('código de clase', () => {
  it('deja solo letras y números en mayúscula', () => {
    expect(normalizarCodigo('ab-cd 12')).toBe('ABCD12');
    expect(normalizarCodigo('  x_y!z ')).toBe('XYZ');
  });
  it('limita la longitud a 12', () => {
    expect(normalizarCodigo('abcdefghijklmnop')).toHaveLength(12);
  });
  it('un texto vacío queda vacío', () => {
    expect(normalizarCodigo('')).toBe('');
  });
});

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
  it('explica el límite de proyectos', () => {
    expect(mensajeDeError({ message: 'limite_proyectos' })).toMatch(/30 proyectos/);
  });
  it('explica la falta de internet', () => {
    expect(mensajeDeError({ message: 'TypeError: Failed to fetch' })).toMatch(/conexión/);
  });
  it('explica la sesión vencida', () => {
    expect(mensajeDeError({ code: 'PGRST301', message: 'JWT expired' })).toMatch(/sesión/);
  });
  it('no muestra textos técnicos en errores desconocidos', () => {
    const m = mensajeDeError({ message: 'relation "x" does not exist', code: '42P01' });
    expect(m).not.toMatch(/relation/);
    expect(m).toMatch(/Inténtalo/);
  });
});
