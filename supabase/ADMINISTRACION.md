# Acceso administrativo DiPizza

## Entrada oculta

En el chat de la web escribe exactamente `open door`. Se abre `admin.html`.

## Cuentas iniciales

Registra por separado `dipizza00@gmail.com` y `ediwergraterol@gmail.com`, confirma el enlace de Supabase Auth que recibas y vuelve al panel para iniciar sesión. La función `admin-access` habilita automáticamente esos dos correos únicamente después de validar la sesión y que el email esté confirmado.

Cualquier otro correo puede registrarse, pero queda pendiente. La solicitud queda guardada en `admin_access_requests`. La función avisa a `dipizza00@gmail.com` y copia a `ediwergraterol@gmail.com` mediante FormSubmit; una de las dos cuentas propietarias debe iniciar sesión en el panel y aprobarla. Los usuarios aprobados no pueden aprobar a otros.

## Operación

El panel permite revisar y filtrar consultas, cambiar su estado, guardar presupuesto/notas, bloquear fechas y retirar bloqueos. Permite cambiar la contraseña desde una sesión abierta. La tabla de solicitudes de acceso y la lista de administradores solo se manipulan desde la Edge Function con `service_role`; el navegador no recibe esa clave.

## Dependencias para probar

- Confirmación por correo de Supabase Auth debe estar activa.
- FormSubmit debe tener completada la activación de `dipizza00@gmail.com` para entregar las notificaciones de alta. La solicitud se conserva aunque FormSubmit aún no confirme el envío; los propietarios pueden revisarla en el panel.
- No se ha hecho una prueba real de correo ni de acceso: requiere registrar las cuentas y abrir el enlace de verificación desde sus bandejas.
