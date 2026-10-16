import { borrarDato } from '../store/controlador';
import { useProyecto } from '../store/proyecto';
import { useApp } from '../store/useApp';
import { DialogoTexto } from './DialogoTexto';
import { Ventana } from './Ventana';

/** Ventanas para crear o borrar variables y listas (se abren desde la paleta de bloques). */
export function DialogosDatos() {
  const d = useApp((s) => s.datosDialogo);
  const abrirDatos = useApp((s) => s.abrirDatos);
  const decir = useApp((s) => s.decir);
  const crearDato = useProyecto((s) => s.crearDato);
  const variables = useProyecto((s) => s.variables);
  const listas = useProyecto((s) => s.listas);

  const cerrar = () => abrirDatos(null);
  const es = d?.tipo === 'lista' ? 'lista' : 'variable';
  const nombres = es === 'lista' ? listas : variables;

  return (
    <>
      <DialogoTexto
        abierta={d?.accion === 'crear'}
        titulo={es === 'lista' ? 'Nueva lista' : 'Nueva variable'}
        etiqueta={es === 'lista' ? 'Nombre de la lista' : 'Nombre de la variable'}
        ayuda={
          es === 'lista'
            ? 'Una lista guarda varios datos en orden, como los nombres de tus amigos.'
            : 'Una variable guarda un dato que cambia, como los puntos o las vidas.'
        }
        inicial=""
        maximo={20}
        boton="Crear"
        alCerrar={cerrar}
        alGuardar={async (v) => {
          const problema = crearDato(es, v);
          if (!problema) {
            cerrar();
            decir(
              es === 'lista'
                ? `¡Lista "${v.trim()}" creada! Búscala en 📋 Listas.`
                : `¡Variable "${v.trim()}" creada! Búscala en 📦 Variables.`,
            );
          }
          return problema;
        }}
      />
      <Ventana
        abierta={d?.accion === 'borrar'}
        titulo={es === 'lista' ? 'Borrar una lista' : 'Borrar una variable'}
        alCerrar={cerrar}
      >
        <p className="m-0 mb-3 text-sm font-bold text-[var(--texto-suave)]">
          Elige cuál borrar. También se quitarán los bloques que la usan.
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {nombres.map((n) => (
            <li key={n}>
              <button
                type="button"
                className="btn btn-suave w-full justify-between"
                onClick={() => {
                  borrarDato(es, n);
                  cerrar();
                  decir(`Borré "${n}" y los bloques que la usaban.`);
                }}
              >
                <span>{n}</span>
                <span aria-hidden="true">🗑</span>
              </button>
            </li>
          ))}
        </ul>
      </Ventana>
    </>
  );
}
