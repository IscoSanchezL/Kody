import { initializeApp, type FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG, GOOGLE_DOMINIO, NUBE_CONFIGURADA } from './config';

let app: FirebaseApp | undefined;

/** Inicia Firebase la primera vez que se necesita (nunca si no está configurado). */
function iniciar(): FirebaseApp {
  if (!NUBE_CONFIGURADA) throw new Error('nube_sin_configurar');
  app ??= initializeApp(FIREBASE_CONFIG);
  return app;
}

export const autenticacion = (): Auth => getAuth(iniciar());
export const baseDatos = (): Firestore => getFirestore(iniciar());

export function proveedorGoogle(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({
    prompt: 'select_account',
    ...(GOOGLE_DOMINIO ? { hd: GOOGLE_DOMINIO } : {}),
  });
  return p;
}
