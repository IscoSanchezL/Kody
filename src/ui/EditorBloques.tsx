import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import * as Es from 'blockly/msg/es';
import { registrarBloques } from '../blocks/definiciones';
import { crearTema } from '../blocks/tema';
import { crearToolbox } from '../blocks/toolbox';
import { sonidoEncaje } from '../audio';
import { registrarEspacio } from '../store/controlador';
import { useApp } from '../store/useApp';

const CLAVE_GUARDADO = 'kody.proyecto.v1';

/** Programa de ejemplo para que el escenario cobre vida desde el primer segundo. */
const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } });
const EJEMPLO = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'evento_al_ejecutar',
        x: 40,
        y: 40,
        next: {
          block: {
            type: 'ap_decir_seg',
            inputs: {
              TEXTO: { shadow: { type: 'text', fields: { TEXT: '¡Hola! Soy Kody' } } },
              SEG: n(1),
            },
            next: {
              block: {
                type: 'ctrl_repetir',
                inputs: {
                  VECES: n(4),
                  CUERPO: {
                    block: {
                      type: 'mov_mover',
                      inputs: { PASOS: n(70) },
                      next: {
                        block: {
                          type: 'mov_girar_der',
                          inputs: { GRADOS: n(90) },
                          next: {
                            block: {
                              type: 'ap_sig_disfraz',
                              next: { block: { type: 'ctrl_esperar', inputs: { SEG: n(0.5) } } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

function cargarGuardado(ws: Blockly.Workspace) {
  let datos: object = EJEMPLO;
  try {
    const g = localStorage.getItem(CLAVE_GUARDADO);
    if (g) datos = JSON.parse(g);
  } catch {
    /* sin guardado previo */
  }
  Blockly.serialization.workspaces.load(datos, ws);
}

/** Editor de bloques (Blockly con renderer "zelos", redondeado como Scratch 3). */
export function EditorBloques() {
  const host = useRef<HTMLDivElement>(null);
  const ws = useRef<Blockly.WorkspaceSvg | null>(null);
  const tema = useApp((s) => s.tema);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    Blockly.setLocale(Es as unknown as Record<string, string>);
    registrarBloques();

    const w = Blockly.inject(el, {
      renderer: 'zelos',
      theme: crearTema('kody-' + tema, tema !== 'claro'),
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
      grid: {
        spacing: 28,
        length: 3,
        colour: tema === 'claro' ? '#cbd5e1' : '#4338ca',
        snap: true,
      },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: false },
      media: `${import.meta.env.BASE_URL}blockly-media/`,
    });
    ws.current = w;
    registrarEspacio(w);
    cargarGuardado(w);

    // "Imán": sonido y vibración leve cuando un bloque encaja.
    w.addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.BLOCK_MOVE) {
        const m = e as Blockly.Events.BlockMove;
        if (m.newParentId && m.newParentId !== m.oldParentId) sonidoEncaje();
      }
    });

    // Autoguardado cada 10 s (y al cerrar).
    const guardar = () => {
      try {
        localStorage.setItem(
          CLAVE_GUARDADO,
          JSON.stringify(Blockly.serialization.workspaces.save(w)),
        );
      } catch {
        /* sin almacenamiento */
      }
    };
    const t = setInterval(guardar, 10_000);
    window.addEventListener('beforeunload', guardar);

    const ro = new ResizeObserver(() => Blockly.svgResize(w));
    ro.observe(el);

    return () => {
      guardar();
      clearInterval(t);
      window.removeEventListener('beforeunload', guardar);
      ro.disconnect();
      registrarEspacio(null);
      w.dispose();
    };
    // El editor se crea una sola vez; el tema se actualiza en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ws.current?.setTheme(crearTema('kody-' + tema, tema !== 'claro'));
  }, [tema]);

  return (
    <div
      ref={host}
      className="absolute inset-0"
      role="application"
      aria-label="Editor de bloques"
    />
  );
}
