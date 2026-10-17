import { useT } from '../i18n';
import { borrarDato } from '../store/controlador';
import { useProyecto } from '../store/proyecto';
import { useApp } from '../store/useApp';
import { DialogoTexto } from './DialogoTexto';
import { Ventana } from './Ventana';

/** Ventanas para crear o borrar variables y listas (se abren desde la paleta de bloques). */
export function DialogosDatos() {
  const t = useT();
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
        titulo={es === 'lista' ? t('datos.nuevaLista') : t('datos.nuevaVariable')}
        etiqueta={es === 'lista' ? t('datos.etiquetaLista') : t('datos.etiquetaVariable')}
        ayuda={es === 'lista' ? t('datos.ayudaLista') : t('datos.ayudaVariable')}
        inicial=""
        maximo={20}
        boton={t('comun.crear')}
        alCerrar={cerrar}
        alGuardar={async (v) => {
          const problema = crearDato(es, v);
          if (!problema) {
            cerrar();
            decir(es === 'lista' ? 'datos.listaCreada' : 'datos.variableCreada', {
              nombre: v.trim(),
            });
          }
          return problema;
        }}
      />
      <Ventana
        abierta={d?.accion === 'borrar'}
        titulo={es === 'lista' ? t('datos.borrarLista') : t('datos.borrarVariable')}
        alCerrar={cerrar}
      >
        <p className="m-0 mb-3 text-sm font-bold text-[var(--texto-suave)]">{t('datos.elige')}</p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {nombres.map((n) => (
            <li key={n}>
              <button
                type="button"
                className="btn btn-suave w-full justify-between"
                onClick={() => {
                  borrarDato(es, n);
                  cerrar();
                  decir('datos.borrado', { nombre: n });
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
