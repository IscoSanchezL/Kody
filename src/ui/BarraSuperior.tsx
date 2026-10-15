import { useEffect, useRef, useState } from 'react';
import {
  abrirArchivo,
  deshacer,
  detener,
  ejecutar,
  guardarArchivo,
  proyectoNuevo,
  siguientePaso,
} from '../store/controlador';
import { useApp, type Tema } from '../store/useApp';
import { uriPersonaje } from '../stage/uris';
import { CuentaBarra } from './CuentaBarra';

const NOMBRE_TEMA: Record<Tema, string> = {
  claro: '☀️ Claro',
  oscuro: '🌙 Oscuro',
  contraste: '◐ Contraste',
};

function MenuProyecto() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [confirmarNuevo, setConfirmarNuevo] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !caja.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fuera);
      window.removeEventListener('keydown', esc);
    };
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    setConfirmarNuevo(false);
  };

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        className="btn btn-suave"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        📁 Proyecto ▾
      </button>
      {abierto && (
        <div role="menu" className="menu-flotante">
          <button
            role="menuitem"
            type="button"
            className="opcion-menu"
            onClick={() => {
              guardarArchivo();
              cerrar();
            }}
          >
            💾 Guardar en un archivo
          </button>
          <button
            role="menuitem"
            type="button"
            className="opcion-menu"
            onClick={() => archivo.current?.click()}
          >
            📂 Abrir un archivo
          </button>
          {confirmarNuevo ? (
            <div className="px-3 py-2 text-sm font-bold">
              Se borrará tu proyecto actual. ¿Seguro?
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-detener !min-h-10 !px-3 !text-base"
                  onClick={() => {
                    proyectoNuevo();
                    cerrar();
                  }}
                >
                  Sí, nuevo
                </button>
                <button
                  type="button"
                  className="btn btn-suave !min-h-10 !px-3 !text-base"
                  onClick={() => setConfirmarNuevo(false)}
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
              onClick={() => setConfirmarNuevo(true)}
            >
              ✨ Proyecto nuevo
            </button>
          )}
        </div>
      )}
      <input
        ref={archivo}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) await abrirArchivo(f);
          cerrar();
        }}
      />
    </div>
  );
}

export function BarraSuperior() {
  const modo = useApp((s) => s.modo);
  const tema = useApp((s) => s.tema);
  const ciclarTema = useApp((s) => s.ciclarTema);
  const cambiarEscala = useApp((s) => s.cambiarEscala);
  const activo = modo !== 'detenido';

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b-[3px] border-[var(--borde)] bg-[var(--panel)] px-4 py-2">
      <div className="flex items-center gap-2">
        <img src={uriPersonaje('kody', 0)} alt="" width={44} height={44} />
        <h1 className="titulo m-0 text-3xl font-extrabold tracking-tight text-[var(--primario)]">
          Kody
        </h1>
      </div>

      <div className="mx-auto flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-ejecutar"
          onClick={() => ejecutar(false)}
          aria-label="Ejecutar programa"
        >
          ▶ Ejecutar
        </button>
        <button
          type="button"
          className="btn btn-detener"
          onClick={detener}
          disabled={!activo}
          aria-label="Detener programa"
        >
          ■ Detener
        </button>
        <button
          type="button"
          className="btn btn-suave"
          onClick={siguientePaso}
          aria-label="Paso a paso: ejecutar un bloque"
          title="Ejecuta un bloque a la vez para ver qué hace"
        >
          👣 Paso a paso
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-suave"
          onClick={() => deshacer(false)}
          aria-label="Deshacer"
          title="Deshacer"
        >
          ↶
        </button>
        <button
          type="button"
          className="btn btn-suave"
          onClick={() => deshacer(true)}
          aria-label="Rehacer"
          title="Rehacer"
        >
          ↷
        </button>
        <CuentaBarra />
        <MenuProyecto />
        <button
          type="button"
          className="btn btn-suave"
          onClick={() => cambiarEscala(-0.1)}
          aria-label="Hacer la letra más pequeña"
        >
          A−
        </button>
        <button
          type="button"
          className="btn btn-suave"
          onClick={() => cambiarEscala(0.1)}
          aria-label="Hacer la letra más grande"
        >
          A+
        </button>
        <button
          type="button"
          className="btn btn-suave"
          onClick={ciclarTema}
          aria-label={`Cambiar tema. Actual: ${tema}`}
        >
          {NOMBRE_TEMA[tema]}
        </button>
      </div>
    </header>
  );
}
