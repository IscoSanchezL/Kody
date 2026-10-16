import { useEffect, useState } from 'react';
import { MAX_LARGO_BLOQUE, MAX_LARGO_PARAM } from '../blocks/misBloques';
import { crearBloquePropio } from '../store/controlador';
import { useApp } from '../store/useApp';
import { Ventana } from './Ventana';

/** Ventana para crear un bloque propio: un nombre y hasta 3 datos que recibe. */
export function DialogoBloquePropio() {
  const abierta = useApp((s) => s.bloquePropioAbierto);
  const abrir = useApp((s) => s.abrirBloquePropio);
  const decir = useApp((s) => s.decir);
  const [nombre, setNombre] = useState('');
  const [params, setParams] = useState(['', '', '']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (abierta) {
      setNombre('');
      setParams(['', '', '']);
      setError('');
    }
  }, [abierta]);

  const cerrar = () => abrir(false);

  return (
    <Ventana abierta={abierta} titulo="Crear un bloque" alCerrar={cerrar}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const problema = crearBloquePropio(nombre, params);
          if (problema) return setError(problema);
          cerrar();
          decir(
            `¡Listo! Armé "definir ${nombre.trim()}" en tu área de trabajo. Pon adentro lo que debe hacer 🧩`,
          );
        }}
      >
        <label className="text-sm font-bold text-[var(--texto-suave)]">
          ¿Cómo se llama tu bloque?
          <input
            className="campo mt-1 text-lg"
            value={nombre}
            maxLength={MAX_LARGO_BLOQUE}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="por ejemplo: dibujar cuadrado"
            autoFocus
            autoComplete="off"
          />
        </label>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-1 p-0 text-sm font-bold text-[var(--texto-suave)]">
            Datos que recibe (opcional, hasta 3)
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {params.map((p, i) => (
              <input
                key={i}
                className="campo"
                aria-label={`Dato ${i + 1}`}
                value={p}
                maxLength={MAX_LARGO_PARAM}
                placeholder={['lado', 'color', 'veces'][i]}
                autoComplete="off"
                onChange={(e) => setParams(params.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
          </div>
        </fieldset>
        <p className="m-0 text-xs font-bold text-[var(--texto-suave)]">
          Después arrastra los datos desde "Mis bloques" para usarlos adentro.
        </p>
        {error && (
          <p
            role="alert"
            className="m-0 rounded-xl border border-[var(--peligro)] p-2 text-sm font-bold"
          >
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn flex-1">
            Crear
          </button>
          <button type="button" className="btn btn-suave" onClick={cerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </Ventana>
  );
}
