import { useCallback, useEffect, useState } from 'react';
import { abrirDeNube, guardarEnNube, nuevoProyectoNube, useNube } from '../nube/guardado';
import {
  ErrorNube,
  borrarProyecto,
  listarProyectos,
  renombrarProyecto,
  type ResumenProyecto,
} from '../nube/proyectos';
import { localeActual, useT } from '../i18n';
import { useApp } from '../store/useApp';
import { Ventana } from './Ventana';

const fechaAmable = (iso: string) =>
  new Date(iso).toLocaleString(localeActual(), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

type Pendiente =
  { tipo: 'abrir'; id: string } | { tipo: 'nuevo' } | { tipo: 'borrar'; id: string } | null;

/** Lista de los proyectos de la cuenta: abrir, renombrar, borrar o empezar uno nuevo. */
export function MisProyectos() {
  const t = useT();
  const abierta = useApp((s) => s.proyectosAbierto);
  const abrirVentana = useApp((s) => s.abrirVentana);
  const proyectoActual = useNube((s) => s.proyectoId);

  const [lista, setLista] = useState<ResumenProyecto[] | null>(null);
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const [editando, setEditando] = useState<{ id: string; nombre: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cerrar = useCallback(() => abrirVentana('proyectos', false), [abrirVentana]);

  const cargar = useCallback(async () => {
    setError('');
    try {
      setLista(await listarProyectos());
    } catch (e) {
      setLista([]);
      setError(e instanceof ErrorNube ? e.message : t('proyectos.errCargar'));
    }
  }, [t]);

  useEffect(() => {
    if (!abierta) return;
    setLista(null);
    setPendiente(null);
    setEditando(null);
    void cargar();
  }, [abierta, cargar]);

  /** Si el proyecto actual no está en la nube, antes de reemplazarlo se pregunta. */
  const pedir = (p: NonNullable<Pendiente>) => (proyectoActual ? ejecutar(p) : setPendiente(p));

  const ejecutar = async (p: NonNullable<Pendiente>) => {
    setPendiente(null);
    setOcupado(true);
    try {
      if (p.tipo === 'abrir') {
        if (await abrirDeNube(p.id)) cerrar();
      } else if (p.tipo === 'nuevo') {
        nuevoProyectoNube();
        cerrar();
      } else {
        await borrarProyecto(p.id);
        if (p.id === proyectoActual) nuevoProyectoNube();
        await cargar();
      }
    } catch (e) {
      setError(e instanceof ErrorNube ? e.message : t('proyectos.errCompletar'));
    } finally {
      setOcupado(false);
    }
  };

  const guardarYSeguir = async (p: NonNullable<Pendiente>) => {
    setOcupado(true);
    const ok = await guardarEnNube();
    setOcupado(false);
    if (ok) void ejecutar(p);
    else setError(useNube.getState().mensaje || t('proyectos.errGuardarActual'));
  };

  const renombrar = async () => {
    if (!editando) return;
    const nombre = editando.nombre.trim();
    if (!nombre) return setEditando(null);
    try {
      await renombrarProyecto(editando.id, nombre);
      if (editando.id === proyectoActual) useNube.setState({ nombre });
      setEditando(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ErrorNube ? e.message : t('proyectos.errRenombrar'));
    }
  };

  return (
    <Ventana abierta={abierta} titulo={t('proyectos.titulo')} alCerrar={cerrar} ancho="max-w-xl">
      <button
        type="button"
        className="btn mb-3"
        onClick={() => pedir({ tipo: 'nuevo' })}
        disabled={ocupado}
      >
        {t('proyectos.nuevo')}
      </button>

      {pendiente && pendiente.tipo !== 'borrar' && (
        <div
          role="alert"
          className="mb-3 rounded-2xl border-[3px] border-[var(--aviso)] p-3 text-sm font-bold"
        >
          {t('proyectos.sinGuardar')}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn !min-h-10 !px-3 !text-base"
              onClick={() => void guardarYSeguir(pendiente)}
            >
              {t('proyectos.guardarSeguir')}
            </button>
            <button
              type="button"
              className="btn btn-detener !min-h-10 !px-3 !text-base"
              onClick={() => void ejecutar(pendiente)}
            >
              {t('proyectos.seguirSin')}
            </button>
            <button
              type="button"
              className="btn btn-suave !min-h-10 !px-3 !text-base"
              onClick={() => setPendiente(null)}
            >
              {t('comun.cancelar')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="m-0 mb-3 rounded-xl border-[3px] border-[var(--peligro)] p-2 text-sm font-bold"
        >
          {error}
        </p>
      )}

      {lista === null ? (
        <p className="m-0 font-bold">{t('proyectos.cargando')}</p>
      ) : lista.length === 0 && !error ? (
        <p className="m-0 font-bold">{t('proyectos.vacio')}</p>
      ) : (
        <ul className="m-0 flex max-h-80 list-none flex-col gap-2 overflow-y-auto p-0">
          {lista.map((p) => (
            <li
              key={p.id}
              className={`rounded-2xl border-[3px] p-2.5 ${p.id === proyectoActual ? 'border-[var(--primario)]' : 'border-[var(--borde)]'}`}
            >
              {editando?.id === p.id ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void renombrar();
                  }}
                >
                  <input
                    className="campo flex-1"
                    value={editando.nombre}
                    maxLength={60}
                    autoFocus
                    aria-label={t('proyectos.nuevoNombre')}
                    onChange={(e) => setEditando({ id: p.id, nombre: e.target.value })}
                  />
                  <button type="submit" className="btn !min-h-10 !px-3 !text-base">
                    {t('comun.listo')}
                  </button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="titulo truncate text-lg font-extrabold">
                      {p.nombre}{' '}
                      {p.id === proyectoActual && (
                        <span aria-label={t('proyectos.abiertoAhora')}>
                          {t('proyectos.abierto')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[var(--texto-suave)]">
                      {fechaAmable(p.actualizado)}
                    </div>
                  </div>
                  {pendiente?.tipo === 'borrar' && pendiente.id === p.id ? (
                    <span className="flex items-center gap-1.5 text-sm font-bold">
                      {t('proyectos.borrarPregunta')}
                      <button
                        type="button"
                        className="btn btn-detener !min-h-10 !px-3 !text-base"
                        onClick={() => void ejecutar(pendiente)}
                      >
                        {t('comun.si')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-suave !min-h-10 !px-3 !text-base"
                        onClick={() => setPendiente(null)}
                      >
                        {t('comun.no')}
                      </button>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn !min-h-10 !px-3 !text-base"
                        onClick={() => pedir({ tipo: 'abrir', id: p.id })}
                        disabled={ocupado}
                      >
                        {t('proyectos.abrir')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-suave !min-h-10 !px-3 !text-base"
                        onClick={() => setEditando({ id: p.id, nombre: p.nombre })}
                        aria-label={t('proyectos.renombrar', { nombre: p.nombre })}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn btn-suave !min-h-10 !px-3 !text-base"
                        onClick={() => setPendiente({ tipo: 'borrar', id: p.id })}
                        aria-label={t('proyectos.borrar', { nombre: p.nombre })}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Ventana>
  );
}
