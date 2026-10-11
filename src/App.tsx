import { useEffect } from 'react';
import { BarraSuperior } from './ui/BarraSuperior';
import { BibliotecaPersonajes } from './ui/BibliotecaPersonajes';
import { EditorBloques } from './ui/EditorBloques';
import { Mascota } from './ui/Mascota';
import { PanelActores } from './ui/PanelActores';
import { PanelEscenario } from './ui/PanelEscenario';
import { conectarTeclado } from './store/controlador';
import { useApp } from './store/useApp';

export default function App() {
  const tema = useApp((s) => s.tema);
  const escala = useApp((s) => s.escala);
  const grande = useApp((s) => s.escenarioGrande);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    document.documentElement.style.setProperty('--escala', String(escala));
  }, [tema, escala]);

  useEffect(() => conectarTeclado(), []);

  return (
    <div className="flex h-full flex-col">
      <BarraSuperior />
      <main
        className={`grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 lg:overflow-hidden ${
          grande
            ? 'lg:grid-cols-[minmax(0,1fr)_minmax(26rem,46rem)]'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)]'
        }`}
      >
        <section
          className="tarjeta relative min-h-[34rem] overflow-hidden lg:min-h-[24rem]"
          aria-label="Zona de bloques"
        >
          <EditorBloques />
        </section>
        <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto [&>*]:shrink-0">
          <PanelEscenario />
          <Mascota />
          <PanelActores />
        </aside>
      </main>
      <BibliotecaPersonajes />
    </div>
  );
}
