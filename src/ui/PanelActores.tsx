import { useEffect, useState } from 'react';
import { FONDOS, PERSONAJES } from '../stage/biblioteca';
import { uriFondo, uriPersonaje } from '../stage/uris';
import { useIconos } from './useIconos';
import { runtime, seleccionarActor } from '../store/controlador';
import { useProyecto } from '../store/proyecto';
import { MAX_ACTORES, type ActorProyecto } from '../store/proyectoModelo';
import { useApp } from '../store/useApp';

/** Valores en vivo del actor mientras corre el programa. */
function useVivo(id: string, activo: boolean) {
  const [, repintar] = useState(0);
  useEffect(() => {
    if (!activo) return;
    const t = setInterval(() => repintar((n) => n + 1), 100);
    return () => clearInterval(t);
  }, [activo]);
  return activo ? runtime.actores.get(id) : undefined;
}

function Campo({
  etiqueta,
  valor,
  min,
  max,
  deshabilitado,
  alCambiar,
}: {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  deshabilitado: boolean;
  alCambiar: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5 text-xs font-bold text-[var(--texto-suave)]">
      {etiqueta}
      <input
        type="number"
        className="campo tabular-nums"
        value={Math.round(valor)}
        min={min}
        max={max}
        disabled={deshabilitado}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) alCambiar(Math.min(max, Math.max(min, v)));
        }}
      />
    </label>
  );
}

function PropiedadesActor({ actor }: { actor: ActorProyecto }) {
  useIconos();
  const editar = useProyecto((s) => s.editarActor);
  const quitar = useProyecto((s) => s.quitarActor);
  const total = useProyecto((s) => s.actores.length);
  const modo = useApp((s) => s.modo);
  const decir = useApp((s) => s.decir);
  const [confirmar, setConfirmar] = useState(false);
  const corriendo = modo !== 'detenido';
  const vivo = useVivo(actor.id, corriendo);
  const a = vivo ?? { ...actor, disfrazActual: actor.disfraz };
  const bloqueado = corriendo;

  useEffect(() => setConfirmar(false), [actor.id]);

  return (
    <div className="mt-3 rounded-2xl border-[3px] border-[var(--borde)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <img
          src={uriPersonaje(actor.personaje, a.disfrazActual)}
          alt=""
          width={52}
          height={52}
          className="rounded-xl bg-[var(--fondo)]"
        />
        <label className="flex-1 text-xs font-bold text-[var(--texto-suave)]">
          Nombre
          <input
            className="campo w-full text-base"
            value={actor.nombre}
            maxLength={20}
            disabled={bloqueado}
            onChange={(e) => editar(actor.id, { nombre: e.target.value })}
            onBlur={(e) => !e.target.value.trim() && editar(actor.id, { nombre: 'Actor' })}
          />
        </label>
      </div>

      <label className="mb-2 flex items-center gap-2 text-xs font-bold text-[var(--texto-suave)]">
        Personaje
        <select
          className="campo !w-auto flex-1"
          value={actor.personaje}
          disabled={bloqueado}
          onChange={(e) => editar(actor.id, { personaje: e.target.value })}
        >
          {PERSONAJES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-4 gap-2">
        <Campo
          etiqueta="x"
          valor={a.x}
          min={-240}
          max={240}
          deshabilitado={bloqueado}
          alCambiar={(x) => editar(actor.id, { x })}
        />
        <Campo
          etiqueta="y"
          valor={a.y}
          min={-180}
          max={180}
          deshabilitado={bloqueado}
          alCambiar={(y) => editar(actor.id, { y })}
        />
        <Campo
          etiqueta="dirección"
          valor={a.direccion}
          min={-180}
          max={180}
          deshabilitado={bloqueado}
          alCambiar={(direccion) => editar(actor.id, { direccion })}
        />
        <Campo
          etiqueta="tamaño %"
          valor={a.tamano}
          min={10}
          max={300}
          deshabilitado={bloqueado}
          alCambiar={(tamano) => editar(actor.id, { tamano })}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[var(--primario)]"
            checked={a.visible}
            disabled={bloqueado}
            onChange={(e) => editar(actor.id, { visible: e.target.checked })}
          />
          Visible
        </label>
        <button
          type="button"
          className="btn btn-suave !min-h-10 !px-3 !text-base"
          disabled={bloqueado}
          onClick={() => editar(actor.id, { disfraz: actor.disfraz === 0 ? 1 : 0 })}
          aria-label="Cambiar disfraz"
        >
          👕 Disfraz {(a.disfrazActual % 2) + 1}/2
        </button>
        {confirmar ? (
          <span className="ml-auto flex items-center gap-1.5 text-sm font-bold">
            ¿Quitar a {actor.nombre}?
            <button
              type="button"
              className="btn btn-detener !min-h-10 !px-3 !text-base"
              onClick={() => {
                quitar(actor.id);
                decir(`${actor.nombre} salió del escenario.`);
              }}
            >
              Sí
            </button>
            <button
              type="button"
              className="btn btn-suave !min-h-10 !px-3 !text-base"
              onClick={() => setConfirmar(false)}
            >
              No
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-suave ml-auto !min-h-10 !px-3 !text-base"
            disabled={total <= 1}
            title={total <= 1 ? 'Siempre debe quedar un actor' : 'Quitar este actor'}
            onClick={() => setConfirmar(true)}
          >
            🗑️ Quitar
          </button>
        )}
      </div>
      {bloqueado && (
        <p className="m-0 mt-2 text-xs font-bold text-[var(--texto-suave)]">
          Detén el programa (■) para editar al actor.
        </p>
      )}
    </div>
  );
}

function ListaActores() {
  useIconos();
  const actores = useProyecto((s) => s.actores);
  const seleccionado = useProyecto((s) => s.seleccionado);
  const abrir = useApp((s) => s.abrirBiblioteca);
  const actor = actores.find((a) => a.id === seleccionado) ?? actores[0];

  return (
    <>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {actores.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className="tarjeta-boton !p-1.5"
              aria-pressed={a.id === seleccionado}
              onClick={() => seleccionarActor(a.id)}
            >
              <img src={uriPersonaje(a.personaje, a.disfraz)} alt="" width={52} height={52} />
              <span className="max-w-[4.5rem] truncate text-xs font-extrabold">{a.nombre}</span>
            </button>
          </li>
        ))}
        {actores.length < MAX_ACTORES && (
          <li>
            <button
              type="button"
              className="tarjeta-boton !p-1.5 !border-dashed"
              onClick={() => abrir(true)}
              aria-label="Agregar un personaje"
            >
              <span className="grid h-[52px] w-[52px] place-items-center text-3xl text-[var(--primario)]">
                ＋
              </span>
              <span className="text-xs font-extrabold">Agregar</span>
            </button>
          </li>
        )}
      </ul>
      {actor && <PropiedadesActor actor={actor} />}
    </>
  );
}

function ListaFondos() {
  const fondo = useProyecto((s) => s.fondo);
  const fijar = useProyecto((s) => s.fijarFondo);
  const decir = useApp((s) => s.decir);
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {FONDOS.map((f) => (
        <li key={f.id}>
          <button
            type="button"
            className="tarjeta-boton w-full !p-1.5"
            aria-pressed={f.id === fondo}
            onClick={() => {
              fijar(f.id);
              decir(`Escenario: ${f.nombre} 🌄`);
            }}
          >
            <img
              src={uriFondo(f.id)}
              alt=""
              className="aspect-[4/3] w-full rounded-lg object-cover"
              loading="lazy"
            />
            <span className="text-xs font-extrabold">{f.nombre}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Panel inferior derecho: actores (con sus propiedades) y escenarios. */
export function PanelActores() {
  const panel = useApp((s) => s.panel);
  const setPanel = useApp((s) => s.setPanel);
  return (
    <section className="tarjeta p-3" aria-label="Actores y escenarios">
      <div role="tablist" className="mb-3 flex gap-2">
        {(
          [
            ['actores', '🦊 Actores'],
            ['fondos', '🏞️ Escenarios'],
          ] as const
        ).map(([id, texto]) => (
          <button
            key={id}
            role="tab"
            type="button"
            className="pestana"
            aria-selected={panel === id}
            onClick={() => setPanel(id)}
          >
            {texto}
          </button>
        ))}
      </div>
      {panel === 'actores' ? <ListaActores /> : <ListaFondos />}
    </section>
  );
}
