# Configuración actual de consultas DiPizza

El proyecto Supabase `cdauxkkksubujtzxouwo` y la tabla `public.enquiries` ya existen. La Edge Function `enquiry` está desplegada en versión 9.

## Correos al equipo y acuse al cliente — FormSubmit

El formulario envía el registro completo a `dipizza00@gmail.com`, usa `_cc` para copiarlo a `ediwergraterol@gmail.com`, y manda al cliente un acuse automático a la dirección que escribió. El email del cliente queda como **Reply-To**, para responderle directamente al mensaje de consulta.

No se requiere dominio propio ni otro hosting: la página está publicada en GitHub Pages. El formulario es un POST normal dentro de un marco oculto para mantener al cliente en la página; el acuse usa `_autoresponse` y requiere que el captcha de FormSubmit siga habilitado.

En la primera consulta FormSubmit manda un correo para activar el formulario. Abre el mensaje que llega a `dipizza00@gmail.com` y pulsa **Activate Form**. FormSubmit indica que conserva los envíos pendientes hasta activar el formulario y los reenvía entonces; su retención es de 30 días.

## Seguimiento y diagnóstico

La función de Supabase guarda cada solicitud en `public.enquiries` y, opcionalmente, avisa por Telegram. FormSubmit distribuye el correo al equipo y el acuse al cliente. La página muestra éxito solo cuando FormSubmit regresa a la URL de confirmación; eso confirma que aceptó el formulario, no garantiza que el proveedor de correo lo entregue en bandeja principal.

Para revisar consultas desde el teléfono, inicia sesión en Supabase y abre **Table Editor → public.enquiries**.
