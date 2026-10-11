import { detener, ejecutar, siguientePaso } from '../store/controlador';
import { useApp, type Tema } from '../store/useApp';
import { alDataUri, kodySVG } from '../stage/disfraces';

const NOMBRE_TEMA: Record<Tema, string> = {
  claro: '☀️ Claro',
  oscuro: '🌙 Oscuro',
  contraste: '◐ Contraste',
};

export function BarraSuperior() {
  const modo = useApp((s) => s.modo);
  const tema = useApp((s) => s.tema);
  const ciclarTema = useApp((s) => s.ciclarTema);
  const cambiarEscala = useApp((s) => s.cambiarEscala);
  const activo = modo !== 'detenido';

  return (
    <header className="flex flex-wrap items-center gap-3 border-b-[3px] border-[var(--borde)] bg-[var(--panel)] px-4 py-2">
      <div className="flex items-center gap-2">
        <img src={alDataUri(kodySVG(0))} alt="" width={44} height={44} />
        <h1 className="titulo m-0 text-3xl font-extrabold tracking-tight text-[var(--primario)]">
          Kody
        </h1>
      </div>

      <div className="mx-auto flex items-center gap-3">
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

      <div className="flex items-center gap-2">
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
