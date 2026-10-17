# Cuentas y guardado en la nube

Kody guarda los proyectos de cada persona en **Firebase** (Authentication con Google + Firestore). Es un proyecto propio de Kody, separado de CodeKid y de cualquier otra plataforma.

## Cómo entra la gente

- **Con Google:** botón "Entrar con Google". Kody solo muestra un **apodo** (por defecto "Explorador", editable); nunca muestra el correo ni el nombre real.
- **Sin cuenta:** todo funciona igual, pero los proyectos solo quedan en el navegador de ese equipo.
- No hay acceso por código de clase ni PIN, ni panel de docente.

## Qué se guarda y quién lo ve

```
usuarios/{uid}                   → apodo y avatar
usuarios/{uid}/proyectos/{id}    → nombre, programa (texto JSON) y fecha
```

Las reglas de `firestore.rules` permiten que **cada persona lea y escriba solo lo suyo**; todo lo demás está cerrado. Límites: 30 proyectos por persona y 900 KB por proyecto.

Al salir, Kody borra la sesión y el proyecto local del equipo (importante en computadores compartidos). El autoguardado ocurre 3 segundos después de cada cambio.

## Puesta en marcha (una sola vez)

1. En https://console.firebase.google.com crea el proyecto **Kody** (sin Analytics).
2. **Authentication → Método de acceso:** activa **Google**.
3. **Authentication → Configuración → Dominios autorizados:** agrega `kody.iscosanchez.com` (y `kody-56d9b.web.app`).
4. **Firestore Database → Crear base de datos** (modo producción, región cercana).
5. **Firestore Database → Reglas:** pega el contenido de `firestore.rules` y pulsa **Publicar**.
6. **Configuración del proyecto → Tus apps → Web:** copia `apiKey`, `authDomain`, `projectId` y `appId` en `src/nube/config.ts` (son públicos por diseño; la seguridad la dan las reglas).

Mientras `src/nube/config.ts` no tenga esos valores, Kody funciona sin cuenta y muestra "Cuenta: muy pronto".

## Pasar la app de Google a producción

Google Cloud (el mismo proyecto de Firebase) → Google Auth Platform → **Público → Publicar app**. Requiere nombre, correo de asistencia, página principal (`https://iscosanchezl.github.io/Kody/`) y política de privacidad (`https://iscosanchezl.github.io/Kody/privacidad.html`). Con los alcances básicos no necesita verificación.

## Seguridad

- Las claves de `config.ts` son públicas por diseño.
- No pongas en el repositorio cuentas de servicio ni claves privadas.
- Las reglas de Firestore son la única barrera: no las abras ("allow read, write: if true").
