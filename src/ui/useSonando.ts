import { useCallback, useEffect, useRef, useState } from 'react';
import { detenerSonidos, tocarEfecto } from '../audio';
import { duracionSonido } from '../engine/sonidos';

/** Para escuchar sonidos de la biblioteca: guarda cuál suena (para mostrar las barritas) y cuándo termina. */
export function useSonando() {
  const [sonando, setSonando] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const escuchar = useCallback((id: string) => {
    clearTimeout(temporizador.current);
    detenerSonidos();
    tocarEfecto(id);
    setSonando(id);
    temporizador.current = setTimeout(() => setSonando(null), duracionSonido(id) * 1000 + 80);
  }, []);

  return { sonando, escuchar };
}
