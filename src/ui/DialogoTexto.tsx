import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { Ventana } from './Ventana';

/** Ventana con un campo de texto (apodo, nombre del proyecto...). `alGuardar` devuelve un error o null. */
export function DialogoTexto({
  abierta,
  titulo,
  etiqueta,
  ayuda,
  inicial,
  maximo = 40,
  boton,
  alGuardar,
  alCerrar,
}: {
  abierta: boolean;
  titulo: string;
  etiqueta: string;
  ayuda?: string;
  inicial: string;
  maximo?: number;
  boton?: string;
  alGuardar: (valor: string) => Promise<string | null>;
  alCerrar: () => void;
}) {
  const t = useT();
  const [valor, setValor] = useState(inicial);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (abierta) {
      setValor(inicial);
      setError('');
      setOcupado(false);
    }
  }, [abierta, inicial]);

  return (
    <Ventana abierta={abierta} titulo={titulo} alCerrar={alCerrar}>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setOcupado(true);
          const problema = await alGuardar(valor);
          setOcupado(false);
          if (problema) setError(problema);
        }}
      >
        <label className="text-sm font-bold text-[var(--texto-suave)]">
          {etiqueta}
          <input
            className="campo mt-1 text-lg"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            maxLength={maximo}
            autoFocus
            autoComplete="off"
          />
        </label>
        {ayuda && <p className="m-0 text-xs font-bold text-[var(--texto-suave)]">{ayuda}</p>}
        {error && (
          <p
            role="alert"
            className="m-0 rounded-xl border-[3px] border-[var(--peligro)] p-2 text-sm font-bold"
          >
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn flex-1" disabled={ocupado}>
            {ocupado ? t('dialogo.guardando') : (boton ?? t('comun.guardar'))}
          </button>
          <button type="button" className="btn btn-suave" onClick={alCerrar}>
            {t('dialogo.masTarde')}
          </button>
        </div>
      </form>
    </Ventana>
  );
}
