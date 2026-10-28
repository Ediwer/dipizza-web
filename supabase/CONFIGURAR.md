# Configuración actual de DiPizza

El proyecto ya está creado y conectado a la web. La tabla `enquiries` y la función `enquiry` ya están desplegadas en Supabase.

## Configurar el envío por Resend

1. En [Resend → Domains](https://resend.com/domains), verifica un dominio que te pertenezca y elige una dirección de envío, por ejemplo `consultas@tu-dominio.com`. La dirección debe pertenecer al dominio verificado.
2. En [Resend → API Keys](https://resend.com/api-keys), crea una clave con permiso de envío.
3. En Supabase, abre el proyecto `cdauxkkksubujtzxouwo` y entra a **Edge Functions → Secrets**. Agrega:

   | Nombre | Valor |
   |---|---|
   | `RESEND_API_KEY` | La clave de Resend |
   | `MAIL_FROM` | `DiPizza <consultas@tu-dominio-verificado.com>` |

No pongas la clave en el código, en GitHub ni en la web. Debe quedarse en los secretos de Supabase. Al guardarla, la función la lee sin volver a desplegarse.

## Qué ocurre al enviar una consulta

La web envía los datos a la función `enquiry`, sin navegar fuera de DiPizza. La función guarda la solicitud en `public.enquiries` y, mediante Resend:

- envía el mensaje de confirmación “We're processing your DiPizza enquiry” al cliente;
- envía el detalle completo a `dipizza00@gmail.com` y `ediwergraterol@gmail.com`;
- permite responder al mensaje del cliente directamente desde el correo del equipo.

Si falla un correo, la consulta queda guardada en Supabase y el mensaje de la web no confirma falsamente que todos los correos salieron.

## Revisar solicitudes desde el teléfono

Abre Supabase Dashboard, inicia sesión y ve a **Table Editor → public.enquiries**. Ahí puedes revisar datos, fecha, estado y notas del presupuesto. Los estados disponibles son `new`, `quoted`, `confirmed`, `done` y `lost`.
