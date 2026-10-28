# Lo que queda, en orden

Comprobado contra tu proyecto `cdauxkkksubujtzxouwo` el 28 de octubre:

| | Estado |
|---|---|
| Proyecto creado y clave válida | ✅ |
| Configuración puesta en la web | ✅ |
| **Tabla `enquiries`** | ❌ falta ejecutar el SQL |
| **Función `enquiry`** | ❌ falta desplegar |
| Secretos de Telegram | ❌ faltan |

Mientras esos tres estén pendientes el formulario **sigue funcionando**:
cae a Formsubmit automáticamente. No hay prisa, pero tampoco hay avisos
por Telegram ni datos en tu base.

---

## 1 · Crear las tablas · 1 minuto

Panel de Supabase → **SQL Editor** → **New query** → pega entero
[`schema.sql`](./schema.sql) → **Run**.

Comprueba en **Table Editor** que aparecen `enquiries` y `blocked_dates`.

---

## 2 · Guardar los secretos · 3 minutos

Primero el bot: habla con **@BotFather** en Telegram, `/newbot`, y guarda
el token. Para el chat id, escríbele algo a tu bot y abre:

```
https://api.telegram.org/bot<TU_TOKEN>/getUpdates
```

Busca `"chat":{"id":123456789`.

Luego, en **Project Settings → Edge Functions → Secrets**:

| Nombre | Valor |
|---|---|
| `TELEGRAM_BOT_TOKEN` | el token de @BotFather |
| `TELEGRAM_CHAT_ID` | el número de arriba |
| `TEAM_INBOX` | `ediwergraterol@gmail.com` |

El token **no me lo pases**. Lo pones tú aquí y ya.

---

## 3 · Desplegar la función · 2 minutos

En una terminal, dentro de `C:\Proyectos\DiPizza`:

```bash
npx supabase login
```

```bash
npx supabase link --project-ref cdauxkkksubujtzxouwo
```

```bash
npx supabase functions deploy enquiry
```

El `config.toml` ya lleva `verify_jwt = false` para esta función: la llama
el formulario público, que no tiene sesión iniciada y por tanto no puede
mandar un token de usuario. La validación la hace la función por dentro.

---

## 4 · Avísame

Yo compruebo que la función responde, que la tabla recibe y que el aviso
de Telegram llega. Si algo falla, lo vemos con los registros de la
función en el panel.

---

## Nota sobre tu clave

La que me pasaste es del formato nuevo de Supabase (`sb_publishable_…`),
no del antiguo (`eyJ…`). Funciona igual y es igual de pública — es la que
va en el código del navegador. La que **nunca** debe salir del panel es la
`secret` / `service_role`.
