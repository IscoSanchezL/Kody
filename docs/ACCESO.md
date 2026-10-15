# Acceso y cuentas en Kody

Kody guarda los proyectos de cada estudiante en **Supabase** (proyecto `CodeKid`, región us-west-2).

> ⚠️ **Supabase compartido con CodeKid.** Kody usa el mismo proyecto Supabase que CodeKid (`fomdxwpxydxtqkbjtozl`). Usuarios, clases, `profiles` y cupos del plan gratuito son comunes. Las tablas de Kody llevan el prefijo `kody_`.
> **No cambiar** en ese proyecto: Site URL, proveedor de correo, claves de API ni quitar Redirect URLs. Solo se pueden **agregar** redirecciones: `https://codekid-franksanloteam.vercel.app/**`, `https://iscosanchezl.github.io/Kody/**`, `http://localhost:3000/**`, `http://localhost:5173/**`.
> Los pasos de Google (cliente OAuth "Kody web" y proveedor Google) se configuran en el Supabase de CodeKid. Mientras la app de Google esté en "Prueba", solo entran los usuarios de prueba agregados.

Sin cuenta, todo sigue funcionando y los proyectos quedan solo en el navegador.

## Cómo entra cada persona

| Quién                                     | Cómo entra                                                                   | Qué ve                           |
| ----------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| Estudiante                                | Código de clase → elige su nombre → PIN de 4 números (si su docente lo puso) | Sus propios proyectos            |
| Estudiante o docente con cuenta de Google | Botón «Continuar con Google»                                                 | Sus propios proyectos            |
| Cualquiera                                | «Seguir sin cuenta»                                                          | Proyecto local en este navegador |

Kody solo muestra el **apodo** y un avatar. Nunca muestra el correo.
Quien entra con Google aparece como «Explorador» hasta que elige un apodo (no hace falta su nombre real).

## Seguridad (base de datos)

- La tabla `kody_projects` tiene seguridad por filas (RLS): cada persona ve, crea, edita y borra **solo lo suyo**.
- Su docente (de su clase), su tutor y el administrador pueden **leer** (no editar) sus proyectos.
- Sin sesión no se puede leer ni escribir nada.
- Máximo 30 proyectos por persona y 1,5 MB por proyecto.
- La clave que usa Kody en el navegador es la clave **publishable** (pública por diseño). La clave `service_role` **nunca** va en el código.
- En computadores compartidos, al salir Kody borra la sesión y el proyecto local.

## Activar «Continuar con Google» (lo haces tú una sola vez)

Mientras no esté activado, el botón aparece apagado con el texto «Muy pronto».

### 1. Google Cloud

1. Entra a https://console.cloud.google.com y crea o elige un proyecto (por ejemplo «Kody»).
2. **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Si el colegio usa Google Workspace for Education, elige tipo **Interno** (solo cuentas del colegio).
   - Si no, **Externo**. Nombre de la app: «Kody». Correo de soporte: el tuyo.
   - Permisos (scopes): solo `openid`, `email` y `profile` (los básicos).
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**:
   - **URI de redireccionamiento autorizados:** `https://fomdxwpxydxtqkbjtozl.supabase.co/auth/v1/callback`
   - Guarda el **ID de cliente** y el **Secreto de cliente**.

### 2. Supabase

1. https://supabase.com/dashboard/project/fomdxwpxydxtqkbjtozl/auth/providers → **Google** → activar.
   Pega el ID y el secreto de cliente y guarda.
2. https://supabase.com/dashboard/project/fomdxwpxydxtqkbjtozl/auth/url-configuration
   - **Site URL:** `https://iscosanchezl.github.io/Kody/`
   - **Redirect URLs:** agrega
     - `https://iscosanchezl.github.io/Kody/**`
     - `http://localhost:5173/**` (para desarrollar)

Listo: recarga Kody y el botón de Google se enciende solo (Kody pregunta a Supabase si está activo).

### 3. Si el colegio usa Google Workspace

Un administrador del dominio puede tener bloqueadas las apps de terceros. En la consola de administración:
**Seguridad → Controles de acceso y datos → Controles de API → Gestionar el acceso de apps de terceros**,
agrega el ID de cliente de Kody y márcalo como **De confianza**.

### Opcional: limitar a cuentas del colegio

En el archivo `.env` (o en el flujo de publicación) puedes poner `VITE_GOOGLE_HD=tucolegio.edu.co`.
Eso solo sugiere el dominio en la ventana de Google; para **impedir** otras cuentas hace falta una regla
en Supabase (por ejemplo un _Auth Hook_ que rechace correos de otro dominio).

## Roles

Cada perfil tiene un rol: `student`, `teacher`, `guardian` o `admin`.
Quien entra con Google es **estudiante** por defecto. Los correos de la tabla `admin_emails` son administradores.
Para convertir a alguien en docente hay que cambiar su rol (lo hace el administrador).

## Clases y estudiantes con código

Los estudiantes de una clase los crea el docente con la función `class-access` de Supabase
(crear estudiantes, poner PIN). Kody todavía **no tiene panel docente**: está planeado para la Fase 5.

## Privacidad de menores

Kody guarda solo: apodo, avatar, rol y los proyectos. Aun así, antes de usar Kody con estudiantes
confirma con el colegio que tienen la **autorización de los acudientes** para el uso de datos de
menores (en Colombia, Ley 1581 de 2012). Esto no es asesoría legal.
