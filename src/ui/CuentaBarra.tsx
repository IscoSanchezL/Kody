import { useEffect, useRef, useState } from 'react';
import { guardarEnNube, hayCambiosSinGuardar, salirYLimpiar, useNube } from '../nube/guardado';
import { useT } from '../i18n';
import { apodoVisible, useSesion, type Rol } from '../nube/sesion';
import { useApp } from '../store/useApp';

const ROL: Record<Rol, string> = { student: '' };

const CLAVE_ESTADO = {
  'sin-guardar': 'cuenta.sinGuardar',
  guardando: 'cuenta.guardando',
  guardado: 'cuenta.guardado',
  error: 'cuenta.error',
} as const;

/** Botón "Entrar" o, con sesión, el estado del guardado y el menú de la persona. */
export function CuentaBarra() {
  const t = useT();
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
        {t('cuenta.entrar')}
      </button>
    );
  }

  const guardarAhora = () => (proyectoId ? void guardarEnNube() : abrirVentana('nombre', true));

  return (
    <div ref={caja} className="relative flex items-center gap-2">
      {proyectoId ? (
        <span
          className="rounded-full border border-[var(--borde)] px-3 py-1 text-sm font-extrabold"
          role="status"
          title={mensaje}
        >
          {estado === 'sin-cuenta' ? '' : t(CLAVE_ESTADO[estado])}
        </span>
      ) : (
        <button
          type="button"
          className="btn btn-ejecutar !min-h-11 !px-4 !text-base"
          onClick={guardarAhora}
        >
          {t('cuenta.guardar')}
        </button>
      )}
      <button
        type="button"
        className="btn btn-suave"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <span aria-hidden="true">{perfil.avatar}</span> {apodoVisible(perfil.nombre)} ▾
      </button>
      <button
        type="button"
        className="btn btn-suave"
        onClick={() => {
          setAbierto(true);
          setConfirmarSalida(true);
        }}
      >
        {t('cuenta.salir')}
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
            {t('cuenta.guardarAhora')}
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
            {t('cuenta.misProyectos')}
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
            {t('cuenta.cambiarApodo')}
          </button>
          {confirmarSalida ? (
            <div className="px-3 py-2 text-sm font-bold">
              {hayCambiosSinGuardar() ? t('cuenta.salirSinGuardar') : t('cuenta.salirConfirmar')}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-detener !min-h-10 !px-3 !text-base"
                  onClick={() => {
                    cerrar();
                    void salirYLimpiar();
                  }}
                >
                  {t('cuenta.siSalir')}
                </button>
                <button
                  type="button"
                  className="btn btn-suave !min-h-10 !px-3 !text-base"
                  onClick={() => setConfirmarSalida(false)}
                >
                  {t('comun.no')}
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
              {t('cuenta.salir')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
