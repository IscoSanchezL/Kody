import { useEffect } from 'react';
import { guardarEnNube, useNube } from '../nube/guardado';
import { useSesion } from '../nube/sesion';
import { useApp } from '../store/useApp';
import { validarApodo } from '../nube/sesion';
import { DialogoTexto } from './DialogoTexto';

const CLAVE_APODO = 'kody.apodo-preguntado';

/** Pregunta el apodo (la primera vez que alguien entra con Google) y el nombre del proyecto al guardarlo. */
export function DialogosCuenta() {
  const perfil = useSesion((s) => s.perfil);
  const cambiarApodo = useSesion((s) => s.cambiarApodo);
  const apodoAbierto = useApp((s) => s.apodoAbierto);
  const nombreAbierto = useApp((s) => s.nombreAbierto);
  const abrirVentana = useApp((s) => s.abrirVentana);
  const decir = useApp((s) => s.decir);
  const nombreProyecto = useNube((s) => s.nombre);

  // Quien entra con Google aparece como "Explorador": se le invita a elegir un apodo.
  useEffect(() => {
    if (!perfil || perfil.nombre !== 'Explorador') return;
    try {
      if (sessionStorage.getItem(CLAVE_APODO)) return;
      sessionStorage.setItem(CLAVE_APODO, '1');
    } catch {
      /* sin almacenamiento */
    }
    abrirVentana('apodo', true);
  }, [perfil, abrirVentana]);

  return (
    <>
      <DialogoTexto
        abierta={apodoAbierto}
        titulo="¿Cómo te llamamos?"
        etiqueta="Tu apodo en Kody"
        ayuda="Puedes usar un apodo: no hace falta tu nombre completo. Solo se ve en tu cuenta."
        inicial={perfil && perfil.nombre !== 'Explorador' ? perfil.nombre : ''}
        alCerrar={() => abrirVentana('apodo', false)}
        alGuardar={async (v) => {
          const problema = validarApodo(v) ?? (await cambiarApodo(v));
          if (!problema) {
            abrirVentana('apodo', false);
            decir(`¡Mucho gusto, ${v.trim()}! 🦊`);
          }
          return problema;
        }}
      />
      <DialogoTexto
        abierta={nombreAbierto}
        titulo="Guardar en mi cuenta"
        etiqueta="Nombre de tu proyecto"
        inicial={nombreProyecto}
        maximo={60}
        boton="Guardar"
        alCerrar={() => abrirVentana('nombre', false)}
        alGuardar={async (v) => {
          if (!v.trim()) return 'Ponle un nombre a tu proyecto.';
          const ok = await guardarEnNube(v.trim());
          if (ok) {
            abrirVentana('nombre', false);
            decir('¡Guardado en tu cuenta! Desde ahora se guarda solo ☁️');
            return null;
          }
          return useNube.getState().mensaje || 'No se pudo guardar.';
        }}
      />
    </>
  );
}
