import { useEffect, useRef, useState } from 'react';
import {
  guardarEnNube,
  hayCambiosSinGuardar,
  salirYLimpiar,
  useNube,
  type EstadoGuardado,
} from '../nube/guardado';
import { useSesion, type Rol } from '../nube/sesion';
import { useApp } from '../store/useApp';

const ROL: Record<Rol, string> = {
  student: '',
  teacher: 'Docente',
  guardian: 'Tutor',
  admin: 'Administrador',
};

const ESTADO: Record<EstadoGuardado, string> = {
  'sin-cuenta': '',
  'sin-guardar': '☁️ Sin guardar',
  guardando: '☁️ Guardando…',
  guardado: '☁️ Guardado',
  error: '⚠️ No se guardó',
};

/** Botón "Entrar" o, con sesión, el estado del guardado y el menú de la persona. */
export function CuentaBarra() {
  const perfil = useSesion((s) => s.perfil);
  const abrirVentana = useApp((s) => s.abrirVentana);
  const estado = useNube((s) => s.estado);
  const proyectoId = useNube((s) => s.proyectoId);
  const mensaje = useNube((s) => s.mensaje);

  const [abierto, setAbierto] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !caja.current?.contains(e.target as Node) && cerrar();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    document.addEventListener('mousedown', fuera);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fuera);
      window.removeEventListener('keydown', esc);
    };
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    setConfirmarSalida(false);
  };

  if (!perfil) {
    return (
      <button type="button" className="btn" onClick={() => abrirVentana('acceso', true)}>
        👤 Entrar
      </button>
    );
  }

  const guardarAhora = () => (proyectoId ? void guardarEnNube() : abrirVentana('nombre', true));

  return (
    <div ref={caja} className="relative flex items-center gap-2">
      {proyectoId ? (
        <span
          className="rounded-full border-[3px] border-[var(--borde)] px-3 py-1 text-sm font-extrabold"
          role="status"
          title={mensaje}
        >
          {ESTADO[estado]}
        </span>
      ) : (
        <button
          type="button"
          className="btn btn-ejecutar !min-h-11 !px-4 !text-base"
          onClick={guardarAhora}
        >
          ☁️ Guardar
        </button>
      )}
      <button
        type="button"
        className="btn btn-suave"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <span aria-hidden="true">{perfil.avatar}</span> {perfil.nombre} ▾
      </button>
      {abierto && (
        <div role="menu" className="menu-flotante">
          {ROL[perfil.rol] && (
            <div className="px-3 py-1 text-xs font-extrabold text-[var(--texto-suave)]">
              {ROL[perfil.rol]}
            </div>
          )}
          <button
            role="menuitem"
            type="button"
            className="opcion-menu"
            onClick={() => {
              cerrar();
              guardarAhora();
            }}
          >
            ☁️ Guardar ahora
          </button>
          <button
            role="menuitem"
            type="button"
            className="opcion-menu"
            onClick={() => {
              cerrar();
              abrirVentana('proyectos', true);
            }}
          >
            📂 Mis proyectos
          </button>
          <button
            role="menuitem"
            type="button"
            className="opcion-menu"
            onClick={() => {
              cerrar();
              abrirVentana('apodo', true);
            }}
          >
            ✏️ Cambiar mi apodo
          </button>
          {confirmarSalida ? (
            <div className="px-3 py-2 text-sm font-bold">
              {hayCambiosSinGuardar()
                ? 'Tu proyecto actual no está guardado en tu cuenta y se borrará de este computador. ¿Salir igual?'
                : 'Se cerrará tu sesión y se limpiará este computador. ¿Salir?'}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-detener !min-h-10 !px-3 !text-base"
                  onClick={() => {
                    cerrar();
                    void salirYLimpiar();
                  }}
                >
                  Sí, salir
                </button>
                <button
                  type="button"
                  className="btn btn-suave !min-h-10 !px-3 !text-base"
                  onClick={() => setConfirmarSalida(false)}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <button
              role="menuitem"
              type="button"
              className="opcion-menu"
              onClick={() => setConfirmarSalida(true)}
            >
              🚪 Salir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
