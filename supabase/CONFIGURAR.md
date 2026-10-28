# Configuración actual de consultas DiPizza

El proyecto Supabase `cdauxkkksubujtzxouwo` y la tabla `public.enquiries` ya existen. La Edge Function `enquiry` está desplegada en versión 8.

## Avisos al equipo — FormSubmit

El formulario envía el registro completo a `dipizza00@gmail.com` y usa `_cc` para copiarlo a `ediwergraterol@gmail.com`. El email del cliente queda como dirección **Reply-To**, para responderle directamente.

En el primer envío FormSubmit pide activar la bandeja: si aparece **Check Your Email**, abre el mensaje de activación de `dipizza00@gmail.com` y pulsa **Activate Form**. Después, el cliente permanece en DiPizza mientras el envío se procesa dentro de un marco oculto.

## Acuse al cliente — Resend

La función de Supabase manda al correo del cliente un acuse de que la solicitud está en proceso. Para habilitarlo:

1. En [Resend → Domains](https://resend.com/domains), verifica un dominio tuyo.
2. En [Resend → API Keys](https://resend.com/api-keys), crea una clave de envío.
3. En Supabase → **Edge Functions → Secrets**, guarda estos dos valores:

   | Nombre exacto | Valor |
   |---|---|
   | `RESEND_API_KEY` | La clave de Resend |
   | `MAIL_FROM` | `DiPizza <consultas@tu-dominio-verificado.com>` |

Guarda la API key solo en Supabase; no la pongas en GitHub ni en el código web.

## Seguimiento y diagnóstico

La función guarda cada solicitud en `public.enquiries` y reporta si Resend aceptó el acuse. FormSubmit recibe los datos de presupuesto y notifica las dos bandejas. Si el acuse falla, la pantalla no afirma que se envió.

Para revisar consultas desde el teléfono, inicia sesión en Supabase y abre **Table Editor → public.enquiries**.
