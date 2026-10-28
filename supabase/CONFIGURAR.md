# Conectar DiPizza con Supabase

Todo el código está escrito. Lo que queda son cinco pasos en el navegador
y dos datos que me tienes que pasar.

---

## 1 · Crear el proyecto

En [supabase.com](https://supabase.com) → **New project**.

- **Name**: `dipizza`
- **Region**: la más cercana a Pensilvania — *East US (North Virginia)*
- **Database password**: genérala y **guárdala en tu gestor de contraseñas**.
  No la vas a usar a diario, pero recuperarla luego es un fastidio.

Tarda un par de minutos en levantar.

---

## 2 · Crear las tablas

**SQL Editor** → **New query** → pega entero el contenido de
[`schema.sql`](./schema.sql) → **Run**.

Debe decir *Success*. Si lo ejecutas dos veces no pasa nada, está escrito
para poder repetirse.

Comprueba en **Table Editor** que aparecen `enquiries` y `blocked_dates`.

---

## 3 · Crear el bot de Telegram

En Telegram, habla con **@BotFather**:

1. `/newbot`
2. Nombre: `DiPizza`
3. Usuario: algo libre acabado en `bot`, por ejemplo `dipizza_avisos_bot`
4. Te da un **token** con esta pinta: `7123456789:AAE...`

Ahora necesitas tu **chat id**: abre una conversación con tu bot nuevo,
escríbele cualquier cosa, y entra a esta dirección en el navegador
sustituyendo el token:

```
https://api.telegram.org/bot<TU_TOKEN>/getUpdates
```

Busca `"chat":{"id":123456789` — ese número es tu chat id.

> **El token no me lo pases por aquí.** Lo pones tú directamente en el
> paso 4. Si se filtra, cualquiera puede escribir en tu nombre.

---

## 4 · Guardar las claves

**Project Settings** → **Edge Functions** → **Secrets** → añade:

| Nombre | Valor |
|---|---|
| `TELEGRAM_BOT_TOKEN` | el token de @BotFather |
| `TELEGRAM_CHAT_ID` | el número que acabas de sacar |
| `TEAM_INBOX` | `ediwergraterol@gmail.com` *(para probar)* |

Opcional, para los correos — se puede dejar para más tarde:

| Nombre | Valor |
|---|---|
| `RESEND_API_KEY` | clave de [resend.com](https://resend.com) |
| `MAIL_FROM` | `DiPizza <onboarding@resend.dev>` |

Si no pones las de Resend, la función sigue funcionando: guarda la
solicitud y avisa por Telegram. Los correos simplemente no salen.

---

## 5 · Desplegar la función

En una terminal, dentro de `C:\Proyectos\DiPizza`:

```bash
npx supabase login
```

```bash
npx supabase link --project-ref TU_REF_DE_PROYECTO
```

*(la ref está en la URL del panel: `supabase.com/dashboard/project/`**`xxxxxxxx`**)*

```bash
npx supabase functions deploy enquiry
```

---

## 6 · Lo que necesito de ti

Dos datos, que son **públicos por diseño** y van en el código de la web:

- **Project URL** — `https://xxxxxxxx.supabase.co`
- **anon public key** — la clave larga que empieza por `eyJ...`

Los encuentras en **Project Settings → API**.

> Hay una tercera clave, **`service_role`**. Esa **nunca** me la pases ni
> la pongas en el repositorio: se salta toda la seguridad de la base.
> Supabase se la da a la función automáticamente, no hay que tocarla.

En cuanto me pases esos dos, cambio el formulario de Formsubmit a tu
función y lo probamos.

---

## Qué pasa cuando alguien rellena el formulario

```
web  →  función enquiry
            ├─ guarda en la tabla enquiries     ← esto no puede fallar
            ├─ te avisa por Telegram con botones
            ├─ manda el resumen al correo del equipo
            └─ manda acuse de recibo al cliente
```

Si Telegram o el correo fallan, **la solicitud ya está guardada**. Nunca se
pierde por un problema de avisos.

## Seguridad, en corto

- El público **no puede leer ni escribir** en la tabla. No hay política que
  se lo permita.
- Solo la función escribe, usando la clave de servicio, que vive en el
  servidor.
- El panel leerá con sesión iniciada.
- El formulario lleva un campo trampa oculto: si un robot lo rellena, la
  solicitud se descarta en silencio.
