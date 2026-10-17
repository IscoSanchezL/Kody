import { useEffect } from 'react';
import { guardarEnNube, useNube } from '../nube/guardado';
import { useT } from '../i18n';
import { esApodoInicial, useSesion } from '../nube/sesion';
import { useApp } from '../store/useApp';
import { validarApodo } from '../nube/sesion';
import { DialogoTexto } from './DialogoTexto';

const CLAVE_APODO = 'kody.apodo-preguntado';

/** Pregunta el apodo (la primera vez que alguien entra con Google) y el nombre del proyecto al guardarlo. */
export function DialogosCuenta() {
  const t = useT();
  const perfil = useSesion((s) => s.perfil);
  const cambiarApodo = useSesion((s) => s.cambiarApodo);
  const apodoAbierto = useApp((s) => s.apodoAbierto);
  const nombreAbierto = useApp((s) => s.nombreAbierto);
  const abrirVentana = useApp((s) => s.abrirVentana);
  const decir = useApp((s) => s.decir);
  const nombreProyecto = useNube((s) => s.nombre);

  // Quien entra con Google aparece como "Explorador": se le invita a elegir un apodo.
  useEffect(() => {
    if (!perfil || !esApodoInicial(perfil.nombre)) return;
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
        titulo={t('apodo.titulo')}
        etiqueta={t('apodo.etiqueta')}
        ayuda={t('apodo.ayuda')}
        inicial={perfil && !esApodoInicial(perfil.nombre) ? perfil.nombre : ''}
        alCerrar={() => abrirVentana('apodo', false)}
        alGuardar={async (v) => {
          const problema = validarApodo(v) ?? (await cambiarApodo(v));
          if (!problema) {
            abrirVentana('apodo', false);
            decir('apodo.hecho', { nombre: v.trim() });
          }
          return problema;
        }}
      />
      <DialogoTexto
        abierta={nombreAbierto}
        titulo={t('proyecto.guardarTitulo')}
        etiqueta={t('proyecto.etiquetaNombre')}
        inicial={nombreProyecto || t('proyecto.defecto')}
        maximo={60}
        boton={t('comun.guardar')}
        alCerrar={() => abrirVentana('nombre', false)}
        alGuardar={async (v) => {
          if (!v.trim()) return t('proyecto.errNombre');
          const ok = await guardarEnNube(v.trim());
          if (ok) {
            abrirVentana('nombre', false);
            decir('proyecto.guardado');
            return null;
          }
          return useNube.getState().mensaje || t('proyecto.errGuardar');
        }}
      />
    </>
  );
}
