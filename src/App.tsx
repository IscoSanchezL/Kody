import { useEffect } from 'react';
import { BarraSuperior } from './ui/BarraSuperior';
import { EditorBloques } from './ui/EditorBloques';
import { Mascota } from './ui/Mascota';
import { PanelActor } from './ui/PanelActor';
import { PanelEscenario } from './ui/PanelEscenario';
import { useApp } from './store/useApp';

export default function App() {
  const tema = useApp((s) => s.tema);
  const escala = useApp((s) => s.escala);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    document.documentElement.style.setProperty('--escala', String(escala));
  }, [tema, escala]);

  return (
    <div className="flex h-full flex-col">
      <BarraSuperior />
      <main className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)]">
        <section
          className="tarjeta relative min-h-[22rem] overflow-hidden"
          aria-label="Zona de bloques"
        >
          <EditorBloques />
        </section>
        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <PanelEscenario />
          <Mascota />
          <PanelActor />
        </aside>
      </main>
    </div>
  );
}
