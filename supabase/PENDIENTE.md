# Estado del flujo de consultas

Comprobado el 28 de octubre de 2026:

| Componente | Estado |
|---|---|
| Proyecto Supabase `cdauxkkksubujtzxouwo` | activo |
| Tabla `public.enquiries` | creada; guarda las solicitudes |
| Edge Function `enquiry` | activa, guarda la consulta y puede notificar por Telegram |
| FormSubmit | formulario configurado para `dipizza00@gmail.com`, copia a `ediwergraterol@gmail.com` y acuse al cliente |
| Dominio / hosting propio | no hacen falta; el sitio usa GitHub Pages |

## Acción pendiente del propietario

1. Enviar una consulta real o de prueba desde la página publicada.
2. Abrir el correo de activación de FormSubmit en `dipizza00@gmail.com` y pulsar **Activate Form** si el formulario todavía no está activado.
3. Confirmar que el detalle llega a `dipizza00@gmail.com` y `ediwergraterol@gmail.com`, y que el cliente recibe el acuse. Revisar Spam si no aparece.

FormSubmit conserva las solicitudes pendientes hasta confirmar el formulario y dice que las reenvía después de activarlo; su plazo de retención es 30 días. La confirmación visual en la web indica que FormSubmit aceptó el formulario, no que el mensaje ya esté en la bandeja de entrada.

## Revisar desde el teléfono

En Supabase Dashboard abre **Table Editor → public.enquiries**. Cada consulta empieza en estado `new`; los otros estados disponibles son `quoted`, `confirmed`, `done` y `lost`.
