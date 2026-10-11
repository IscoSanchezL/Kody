/** Programas de ejemplo para que el escenario cobre vida desde el primer segundo. */
const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } });

/** Kody dice hola y recorre un cuadrado cambiando de disfraz. */
export const scriptEjemplo = {
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
                              next: {
                                block: { type: 'ctrl_esperar', inputs: { SEG: n(0.5) } },
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
      },
    ],
  },
};
