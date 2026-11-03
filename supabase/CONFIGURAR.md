# Formulario de consultas · cómo está montado

Proyecto Supabase `cdauxkkksubujtzxouwo`, tabla `public.enquiries`, Edge Function `enquiry`.

## El correo sale del servidor, no del navegador

La página **no** publica contra FormSubmit. Envía los datos del evento a la
Edge Function, y es la función la que manda el correo. El destinatario
(`dipizza00@gmail.com`), la copia (`ediwergraterol@gmail.com`), el asunto y el
texto del acuse al cliente son constantes de
`supabase/functions/enquiry/index.ts`.

Esto importa: antes esos campos eran `input hidden` en el HTML público.
Cualquiera podía cambiar `_cc` o `_autoresponse` y usar el formulario para
mandar correo con texto propio a quien quisiera, a nombre de DiPizza. Si
alguna vez vuelves a mover el envío al navegador, vuelves a abrir esa puerta.

El acuse al cliente lo genera `_autoresponse` de FormSubmit y requiere que el
captcha de FormSubmit siga habilitado en su panel.

## Qué tiene que superar una solicitud para entrar

En orden, dentro de la función:

1. **Trampa para robots.** Campo oculto `_honey`. Si llega con contenido se
   responde «recibido» y no se guarda nada. El robot no sabe que fracasó.
2. **Reto firmado con prueba de trabajo.** La página pide un reto a
   `GET /functions/v1/enquiry?challenge=1` en cuanto el cliente toca el
   formulario, y lo resuelve de fondo mientras escribe (unos 90 ms). El reto
   va firmado con HMAC-SHA256, caduca a los 20 minutos, **no vale antes de 3
   segundos** y es de **un solo uso**: la tabla `enquiry_nonces` lo impide.
   Un robot que solo haga POST no tiene reto, y uno que capture una solicitud
   válida no puede repetirla.
3. **Turnstile de Cloudflare**, si está configurado. Ver abajo.
4. **Límites por IP.** 3 solicitudes aceptadas por hora y 8 por día desde la
   misma IP; 30 intentos de cualquier tipo por hora, que es lo que corta a
   quien esté probando el reto a fuerza bruta. Tope global de 40 por hora,
   para que nadie pueda agotar la cuota de correo de FormSubmit y dejar sin
   entrar las consultas de clientes reales.
5. **Campos obligatorios**: nombre y un correo con forma de correo.
6. **Texto lleno de enlaces.** Más de dos URL o BBCode en el texto libre se
   descarta en silencio, igual que la trampa.
7. **Reenvío del mismo formulario** (mismo correo y mismo texto en diez
   minutos): se responde «recibido» sin volver a mandar el correo.

La IP nunca se guarda. Se guarda un HMAC truncado en `enquiry_guard`, que
sirve para contar y no para identificar a nadie. Se borra a los siete días.

## Activar Turnstile (recomendado)

Turnstile es la verificación antirrobot de Cloudflare: gratis, invisible en
la mayoría de los casos, y es lo que mejor frena robots y agentes
automáticos. Mientras no esté configurado, el resto de las capas siguen
activas; la función solo lo exige si encuentra el secreto.

1. Cloudflare → **Turnstile** → *Add widget*. Dominio
   `dipizzacatering.com`, modo **Managed**.
2. La **Site Key** va en `app.js`, en `const TURNSTILE_KEY = ""`.
3. La **Secret Key** va en Supabase → *Edge Functions* → *Secrets*, como
   `TURNSTILE_SECRET`.
4. Redespliega la función. La cabecera CSP de `vercel.json` ya permite
   `challenges.cloudflare.com`, así que no hay que tocarla.

## Secretos de la Edge Function

| Nombre | Para qué | ¿Obligatorio? |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | los pone Supabase | sí |
| `TURNSTILE_SECRET` | verificación antirrobot | no, muy recomendable |
| `CHALLENGE_SECRET` | firma de los retos | no; si falta usa la service_role |
| `CHALLENGE_BITS` | dificultad de la prueba de trabajo, por defecto 14 | no |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | aviso por Telegram | no |

## Desplegar

```bash
export SUPABASE_ACCESS_TOKEN=<token sbp_ con permiso de escritura>
npx supabase functions deploy enquiry --project-ref cdauxkkksubujtzxouwo --yes
```

El SQL de `schema.sql` es idempotente y se pega en *SQL Editor → Run*. La API
de gestión de Supabase ejecuta las consultas en modo solo lectura, así que el
DDL no se puede aplicar desde la línea de comandos con un token `sbp_`.

## Revisar consultas

Panel propio en `admin.html`, o Supabase → **Table Editor → public.enquiries**.
Los intentos rechazados quedan en `public.enquiry_guard` con el motivo en
`outcome`, que es por donde se mira si algo está bloqueando a un cliente real.
