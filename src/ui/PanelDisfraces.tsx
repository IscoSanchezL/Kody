import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { useIconos } from './useIconos';
import { runtime } from '../store/controlador';
import { useProyecto } from '../store/proyecto';
import { MAX_DISFRACES, MAX_LARGO_DISFRAZ, disfrazActivo } from '../store/proyectoModelo';
import { useApp } from '../store/useApp';
import { uriPersonaje } from '../stage/uris';

/** Pestaña "Disfraces": los disfraces del actor elegido, con vista previa grande, para cambiarlos, agregarlos o quitarlos. */
export function PanelDisfraces() {
  const t = useT();
  useIconos();
  const actor = useProyecto((s) => s.actores.find((a) => a.id === s.seleccionado) ?? s.actores[0]);
  const poner = useProyecto((s) => s.ponerDisfraz);
  const quitar = useProyecto((s) => s.quitarDisfraz);
  const renombrar = useProyecto((s) => s.renombrarDisfraz);
  const agregarDuplicado = useProyecto((s) => s.agregarDisfraz);
  const abrirBiblioteca = useApp((s) => s.abrirBiblioteca);
  const corriendo = useApp((s) => s.modo) !== 'detenido';
  const decir = useApp((s) => s.decir);
  const [nombre, setNombre] = useState('');
  const [, repintar] = useState(0);

  // Mientras corre el programa, la vista previa sigue al disfraz que el programa va poniendo.
  useEffect(() => {
    if (!corriendo) return;
    const i = setInterval(() => repintar((n) => n + 1), 120);
    return () => clearInterval(i);
  }, [corriendo]);

  const vivo = corriendo && actor ? runtime.actores.get(actor.id) : undefined;
  const indice = vivo ? vivo.disfrazActual : (actor?.disfraz ?? 0);
  const actual = actor?.disfraces[indice] ?? actor?.disfraces[0];

  useEffect(() => setNombre(actual?.nombre ?? ''), [actual?.nombre, actor?.id, indice]);

  if (!actor || !actual) return null;
  const d = disfrazActivo(actor, indice);

  const confirmarNombre = () => {
    if (nombre.trim() === actual.nombre) return;
    if (!renombrar(actor.id, indice, nombre)) setNombre(actual.nombre);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--borde)] bg-[var(--fondo)]/60 p-3">
        <img
          src={uriPersonaje(d.personaje, d.variante)}
          alt={t('disfraz.vistaPreviaAlt', { nombre: actual.nombre })}
          width={132}
          height={132}
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--texto-suave)]">
            {t('biblioteca.vistaPrevia')} · {indice + 1}/{actor.disfraces.length}
          </span>
          <label className="text-xs font-bold text-[var(--texto-suave)]">
            {t('disfraz.nombre')}
            <input
              className="campo w-full text-base"
              value={nombre}
              maxLength={MAX_LARGO_DISFRAZ}
              disabled={corriendo}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={confirmarNombre}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-suave !min-h-9 !px-3 !text-sm"
              disabled={corriendo || actor.disfraces.length >= MAX_DISFRACES}
              onClick={() => {
                const hecho = agregarDuplicado(actor.id, d);
                if (hecho) decir('disfraz.agregado', { nombre: hecho });
              }}
            >
              {t('disfraz.duplicar')}
            </button>
            <button
              type="button"
              className="btn btn-suave !min-h-9 !px-3 !text-sm"
              disabled={corriendo || actor.disfraces.length <= 1}
              title={actor.disfraces.length <= 1 ? t('disfraz.siempreUno') : undefined}
              onClick={() => quitar(actor.id, indice)}
            >
              {t('disfraz.quitar')}
            </button>
          </div>
        </div>
      </div>

      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {actor.disfraces.map((c, i) => (
          <li key={`${i}-${c.nombre}`}>
            <button
              type="button"
              className="tarjeta-boton !p-1.5"
              aria-pressed={i === indice}
              disabled={corriendo}
              onClick={() => poner(actor.id, i)}
            >
              <span className="text-[0.65rem] font-extrabold text-[var(--texto-suave)]">
                {i + 1}
              </span>
              <img src={uriPersonaje(c.personaje, c.variante)} alt="" width={52} height={52} />
              <span className="max-w-[4.5rem] truncate text-xs font-extrabold">{c.nombre}</span>
            </button>
          </li>
        ))}
        {actor.disfraces.length < MAX_DISFRACES && (
          <li>
            <button
              type="button"
              className="tarjeta-boton !border-dashed !p-1.5"
              disabled={corriendo}
              onClick={() => abrirBiblioteca(true, 'disfraz')}
              aria-label={t('disfraz.agregarAria')}
            >
              <span className="grid h-[52px] w-[52px] place-items-center text-3xl text-[var(--primario)]">
                ＋
              </span>
              <span className="text-xs font-extrabold">{t('disfraz.agregarCorto')}</span>
            </button>
          </li>
        )}
      </ul>
      {corriendo && (
        <p className="m-0 text-xs font-bold text-[var(--texto-suave)]">{t('disfraz.detener')}</p>
      )}
    </div>
  );
}
