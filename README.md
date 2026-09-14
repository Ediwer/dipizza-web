# DiPizza

Sitio estatico de DiPizza — catering de pizza al horno de lena.

## Estructura

    index.html    toda la pagina: estructura, estilos y logica
    images/       fotos del menu, la galeria, el logo y el hero

No hay build ni dependencias. Se abre `index.html` en el navegador y ya.

## Como cambiar cosas

Todo lo editable vive en bloques al principio del `<script>` de `index.html`:

- `DEFAULT_BRAND`   nombre, titular, textos de las secciones, Instagram
- `DEFAULT_CONTACT` correo, telefono, condiciones de reserva
- `PRESETS.forno`   los seis colores de los que sale toda la paleta
- `DEFAULT_MENU`    las quince pizzas: nombre, ingredientes, familia, etiquetas
- `REPLIES`         las respuestas del asistente de chat
- `PHOTOS`          que archivo de `images/` usa cada hueco
- `GALLERY`         las piezas de la galeria y sus pies de foto

Para cambiar la foto de una pizza, deja el archivo en `images/` y apunta
la clave correspondiente de `PHOTOS`.

## Pendiente antes de publicar

- [ ] Correo y telefono reales (ahora son marcadores)
- [ ] Fotos de las ocho pizzas que aun muestran ilustracion
- [ ] Enlace real de Instagram
- [ ] Conectar el formulario a un servicio de correo
- [ ] Dominio y despliegue
