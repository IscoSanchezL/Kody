import { useEffect, useRef } from 'react';
import { BarraSuperior } from './ui/BarraSuperior';
import { Inicio } from './ui/Inicio';
import { Acceso } from './ui/Acceso';
import { BibliotecaPersonajes } from './ui/BibliotecaPersonajes';
import { DialogosCuenta } from './ui/DialogosCuenta';
import { MisProyectos } from './ui/MisProyectos';
import { conectarGuardado } from './nube/guardado';
import { useSesion } from './nube/sesion';
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

  // Cuenta: recuperar la sesión guardada y conectar el guardado automático.
  const iniciarSesion = useSesion((s) => s.iniciar);
  const perfil = useSesion((s) => s.perfil);
  const listo = useSesion((s) => s.listo);
  const pantalla = useApp((s) => s.pantalla);
  const setPantalla = useApp((s) => s.setPantalla);
  const decir = useApp((s) => s.decir);
  useEffect(() => {
    conectarGuardado();
    iniciarSesion();
  }, [iniciarSesion]);
  useEffect(() => {
    if (perfil) decir(`¡Hola, ${perfil.nombre}! 👋 Ya puedes guardar tus proyectos en tu cuenta.`);
    // Solo al entrar o salir una persona, no cada vez que cambia su apodo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.id]);

  // Con sesión se entra directo al editor; al salir de la cuenta se vuelve al inicio.
  const habiaPerfil = useRef(false);
  useEffect(() => {
    if (listo && perfil) setPantalla('editor');
    if (habiaPerfil.current && !perfil) setPantalla('inicio');
    habiaPerfil.current = !!perfil;
  }, [listo, perfil, setPantalla]);

  // Avisa a la red de seguridad de index.html que la aplicación sí arrancó.
  useEffect(() => {
    (window as unknown as { __kodyListo?: boolean }).__kodyListo = true;
  }, []);

  if (pantalla === 'inicio') {
    return (
      <>
        <Inicio />
        <Acceso />
      </>
    );
  }

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
      <Acceso />
      <MisProyectos />
      <DialogosCuenta />
    </div>
  );
}
