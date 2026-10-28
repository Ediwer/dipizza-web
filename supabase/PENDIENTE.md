# Estado actual del formulario de DiPizza

Comprobado el 28 de octubre de 2026:

| Componente | Estado |
|---|---|
| Proyecto Supabase `cdauxkkksubujtzxouwo` | activo y saludable |
| Tabla `public.enquiries` | creada; contiene 7 solicitudes al revisar |
| Edge Function `enquiry` | activa, versión 7 |
| Formulario web | guarda por Supabase; no saca al cliente de la página |
| Correo al cliente y al equipo | código conectado a Resend; falta comprobar/configurar secretos del remitente |

## Para habilitar los correos

1. En Resend, verifica un dominio que sea tuyo en **Domains**. El remitente debe ser de ese dominio. `onboarding@resend.dev` es solo para pruebas, no lo uses como remitente de clientes.
2. En Resend, crea una API key de envío.
3. En Supabase → proyecto `cdauxkkksubujtzxouwo` → **Edge Functions → Secrets**, agrega:

   | Nombre | Valor |
   |---|---|
   | `RESEND_API_KEY` | API key creada en Resend |
   | `MAIL_FROM` | `DiPizza <consultas@TU-DOMINIO-VERIFICADO>` |

   No compartas ni subas la API key a GitHub. Los secretos se cargan directamente en Supabase. Al guardarlos, la función puede leerlos sin volver a desplegarse.

4. Envía una consulta de prueba usando un correo tuyo como dirección del cliente. Confirma que llega el acuse y que las dos bandejas del equipo reciben el detalle.

La función envía el detalle a `dipizza00@gmail.com` y `ediwergraterol@gmail.com`, con el correo del cliente como dirección de respuesta. Al cliente le envía el acuse de que la solicitud se está procesando. Si Resend falla, la solicitud igualmente queda en Supabase y la web no afirma que el correo fue enviado.

## Ver las consultas desde el teléfono

Inicia sesión en Supabase y abre **Table Editor → public.enquiries**. El estado inicial es `new`; también existen `quoted`, `confirmed`, `done` y `lost`.
