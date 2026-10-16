import { useSyncExternalStore } from 'react';
import { alCambiarIconos, revisionIconos } from '../stage/iconos3d';

/** Hace que el componente se redibuje cuando las imágenes de los personajes terminan de generarse. */
export function useIconos() {
  return useSyncExternalStore(alCambiarIconos, revisionIconos);
}
