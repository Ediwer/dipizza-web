# Estado del flujo de consultas

Comprobado el 28 de octubre de 2026:

| Componente | Estado |
|---|---|
| Proyecto Supabase `cdauxkkksubujtzxouwo` | activo |
| Tabla `public.enquiries` | creada; guarda las solicitudes |
| Edge Function `enquiry` | activa, versión 8 |
| FormSubmit para el equipo | puesto en la web: `dipizza00@gmail.com` + copia a `ediwergraterol@gmail.com` |
| Resend para el cliente | código activo; la prueba anterior no confirmó el envío |

## Para completar y verificar

1. En Supabase → proyecto `cdauxkkksubujtzxouwo` → **Edge Functions → Secrets**, confirma que estén los nombres exactos:
   - `RESEND_API_KEY`
   - `MAIL_FROM` con un remitente de tu dominio verificado, por ejemplo `DiPizza <consultas@tu-dominio.com>`.
2. En Resend, confirma que el dominio de `MAIL_FROM` tenga estado **Verified**. La API key y el remitente deben pertenecer al mismo proyecto/cuenta de Resend.
3. En FormSubmit, si todavía aparece **Check Your Email / This form needs Activation**, abre el mensaje de activación enviado a `dipizza00@gmail.com` y pulsa **Activate Form**. El panel de la bandeja es el destinatario principal; `_cc` copia el detalle a `ediwergraterol@gmail.com`.
4. Cuando Resend esté configurado y FormSubmit activo, envía una consulta marcada como prueba. Comprueba el acuse al correo de prueba y el detalle en las dos bandejas del equipo.

El envío FormSubmit usa un marco oculto, así que el cliente no sale de la web. Resend solo manda el acuse al cliente y Supabase conserva cada solicitud. La prueba anterior quedó marcada `lost` con una nota de que era una prueba interna, no un presupuesto real.

## Revisar desde el teléfono

En Supabase Dashboard abre **Table Editor → public.enquiries**. Cada consulta empieza en estado `new`; los otros estados disponibles son `quoted`, `confirmed`, `done` y `lost`.
