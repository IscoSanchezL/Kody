import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import * as En from 'blockly/msg/en';
import * as Es from 'blockly/msg/es';
import { configurarActores, configurarDatos, registrarBloques } from '../blocks/definiciones';
import { crearTema } from '../blocks/tema';
import {
  contenidoListas,
  contenidoMisBloques,
  contenidoVariables,
  crearToolbox,
} from '../blocks/toolbox';
import { sonidoEncaje } from '../audio';
import { idiomaActual, useT } from '../i18n';
import { guardarScriptActual, registrarEspacio } from '../store/controlador';
import { guardarYa, useProyecto } from '../store/proyecto';
import { SCRIPT_VACIO } from '../store/proyectoModelo';
import { useApp } from '../store/useApp';

/** Carga los bloques de un actor sin ensuciar el historial ni disparar guardados. */
function cargar(w: Blockly.WorkspaceSvg, json: object | undefined) {
  Blockly.Events.disable();
  try {
    Blockly.serialization.workspaces.load(json ?? SCRIPT_VACIO, w);
  } catch {
    w.clear(); // si un programa guardado está dañado, se empieza limpio
  } finally {
    Blockly.Events.enable();
  }
  w.clearUndo();
}

/** Borra las llamadas a bloques propios cuyo "definir" ya no existe. */
function quitarLlamadasHuerfanas(w: Blockly.WorkspaceSvg) {
  const vivos = new Set(
    w.getBlocksByType('fun_definir').map((b) => (b as unknown as { nombre: string }).nombre),
  );
  Blockly.Events.setGroup(true);
  for (const b of w.getBlocksByType('fun_llamar')) {
    if (!vivos.has((b as unknown as { nombre: string }).nombre)) b.dispose(true);
  }
  Blockly.Events.setGroup(false);
}

/**
 * Editor de bloques (Blockly con renderer "zelos", redondeado como Scratch 3).
 * Los textos de los bloques y de la propia librería salen en el idioma actual; para cambiar de
 * idioma, la aplicación vuelve a montar este componente (con `key`), que antes guarda los bloques
 * del alumno y al montarse los carga de nuevo.
 */
export function EditorBloques() {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const ws = useRef<Blockly.WorkspaceSvg | null>(null);
  const tema = useApp((s) => s.tema);
  const seleccionado = useProyecto((s) => s.seleccionado);
  const revision = useProyecto((s) => s.revision);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // Mensajes de la propia librería (menú contextual, zoom, papelera…) en el idioma elegido.
    Blockly.setLocale((idiomaActual() === 'en' ? En : Es) as unknown as Record<string, string>);
    registrarBloques();
    // "¿tocando a …?" ofrece a los demás actores del proyecto.
    configurarActores(() => {
      const { actores, seleccionado: yo } = useProyecto.getState();
      return actores.filter((a) => a.id !== yo).map((a) => [a.nombre, a.id] as [string, string]);
    });

    // Variables y listas del proyecto (se leen al abrir cada lista desplegable).
    configurarDatos({
      variables: () => useProyecto.getState().variables,
      listas: () => useProyecto.getState().listas,
    });

    const t0 = useApp.getState().tema;
    const w = Blockly.inject(el, {
      renderer: 'zelos',
      theme: crearTema('kody-' + t0, t0 !== 'claro'),
      toolbox: crearToolbox(),
      sounds: false, // los sonidos son propios (Web Audio), así no dependemos de internet
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.05,
        minScale: 0.5,
        maxScale: 1.8,
        scaleSpeed: 1.2,
      },
      grid: { spacing: 28, length: 3, colour: t0 === 'claro' ? '#cbd5e1' : '#4338ca', snap: true },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: false },
      media: `${import.meta.env.BASE_URL}blockly-media/`,
    });
    ws.current = w;
    w.registerToolboxCategoryCallback('KODY_VARIABLES', () => contenidoVariables() as never);
    w.registerToolboxCategoryCallback('KODY_LISTAS', () => contenidoListas() as never);
    w.registerToolboxCategoryCallback(
      'KODY_MIS_BLOQUES',
      () => contenidoMisBloques(w as never) as never,
    );
    w.registerButtonCallback('KODY_CREAR_BLOQUE', () => useApp.getState().abrirBloquePropio(true));
    const abrir = useApp.getState().abrirDatos;
    w.registerButtonCallback('KODY_CREAR_VARIABLE', () =>
      abrir({ tipo: 'variable', accion: 'crear' }),
    );
    w.registerButtonCallback('KODY_BORRAR_VARIABLE', () =>
      abrir({ tipo: 'variable', accion: 'borrar' }),
    );
    w.registerButtonCallback('KODY_CREAR_LISTA', () => abrir({ tipo: 'lista', accion: 'crear' }));
    w.registerButtonCallback('KODY_BORRAR_LISTA', () => abrir({ tipo: 'lista', accion: 'borrar' }));
    // Cuando cambian los nombres, la paleta abierta se vuelve a dibujar.
    let antes = useProyecto.getState();
    const dejarDeEscuchar = useProyecto.subscribe((s) => {
      if (s.variables === antes.variables && s.listas === antes.listas) return;
      antes = s;
      w.getToolbox()?.refreshSelection();
    });
    // Solo en desarrollo: facilita depurar el editor desde la consola y en las pruebas.
    if (import.meta.env.DEV) (window as unknown as { __kodyWs?: unknown }).__kodyWs = w;
    registrarEspacio(w);

    let pendiente: ReturnType<typeof setTimeout> | undefined;
    w.addChangeListener((e: Blockly.Events.Abstract) => {
      // "Imán": sonido y vibración leve cuando un bloque encaja.
      if (e.type === Blockly.Events.BLOCK_MOVE) {
        const m = e as Blockly.Events.BlockMove;
        if (m.newParentId && m.newParentId !== m.oldParentId) sonidoEncaje();
      }
      // Mis bloques: la paleta se actualiza al crear o borrar una definición, y al borrar una
      // definición también se quitan sus llamadas.
      if (e.type === Blockly.Events.BLOCK_CREATE || e.type === Blockly.Events.BLOCK_DELETE) {
        const json = e as { json?: { type?: string }; oldJson?: { type?: string } };
        const def = json.json ?? json.oldJson;
        if (def?.type === 'fun_definir') {
          if (e.type === Blockly.Events.BLOCK_DELETE) quitarLlamadasHuerfanas(w);
          w.getToolbox()?.refreshSelection();
        }
      }
      if (e.isUiEvent) return;
      clearTimeout(pendiente);
      pendiente = setTimeout(guardarScriptActual, 500);
    });

    const alSalir = () => {
      guardarScriptActual();
      guardarYa();
    };
    window.addEventListener('beforeunload', alSalir);
    const oculta = () => document.visibilityState === 'hidden' && alSalir();
    document.addEventListener('visibilitychange', oculta);

    const ro = new ResizeObserver(() => Blockly.svgResize(w));
    ro.observe(el);

    return () => {
      clearTimeout(pendiente);
      guardarScriptActual(); // lo que hay en pantalla pasa al proyecto antes de destruir el editor
      dejarDeEscuchar();
      window.removeEventListener('beforeunload', alSalir);
      document.removeEventListener('visibilitychange', oculta);
      ro.disconnect();
      registrarEspacio(null);
      ws.current = null;
      w.dispose();
    };
  }, []);

  // Al cambiar de actor (o abrir otro proyecto) se cargan sus bloques.
  useEffect(() => {
    const w = ws.current;
    if (!w) return;
    cargar(w, useProyecto.getState().scripts[seleccionado]);
  }, [seleccionado, revision]);

  useEffect(() => {
    ws.current?.setTheme(crearTema('kody-' + tema, tema !== 'claro'));
  }, [tema]);

  return (
    <div
      ref={host}
      className="absolute inset-0"
      role="application"
      aria-label={t('app.editorBloques')}
    />
  );
}
