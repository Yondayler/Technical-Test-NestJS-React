Prueba Técnica

El Reto: La Cartelera de Hype Tecnológico
Hemos extraído un volcado de datos simulado de la API de YouTube. Tu misión es crear un backend en NestJS que procese estos datos y un frontend en ReactJS que los consuma.
User Story:
"Como developer, quiero acceder a mi 'Cartelera de Conocimiento' para ver los últimos videos. No quiero ver el payload crudo y lleno de basura de datos que manda YouTube; quiero que nuestro sistema actúe como un colador. Necesito que me entregue un JSON limpio con solo la miniatura, el título, el autor, el tiempo relativo de publicación y un 'Nivel de Hype' calculado por nosotros.
En la pantalla, el video que tenga el mayor Hype debe mostrarse como la 'Joya de la Corona', destacando y diferenciándose visualmente del resto de los mortales."

⚙️ Criterios de Aceptación Técnicos:

1. Backend (NestJS):
Crea un endpoint GET /api/videos que lea el archivo JSON adjunto abajo (simulando que es la respuesta de un proveedor externo).
El Nivel de Hype: Es un valor numérico. La fórmula base es: (likes + comentarios) / vistas.

Modificadores de Hype (Reglas de negocio):
Si el título del video contiene la palabra "Tutorial" (sin importar si está en mayúsculas o minúsculas), el Nivel de Hype final se multiplica por 2.

Si los comentarios están desactivados en el video (la data no trae la propiedad de comentarios), el Hype es automáticamente 0.
Transformación de Fecha: El backend debe devolver la fecha de publicación transformada a un texto amigable (ej. "Hace 2 meses", "Hace 5 días"). Restricción estricta: No uses librerías de fechas (como moment.js o date-fns), usa Javascript nativo.

2. Frontend (ReactJS):
Consume tu endpoint de NestJS.
Muestra los videos en un formato de grilla.
El video con el Hype más alto (La Joya de la Corona) debe renderizarse de una forma especial (puede ocupar más espacio, tener un borde brillante, etc.).

Maneja correctamente los estados de carga (Loading) y de error en la petición.

Datos de prueba (Mock JSON)
JSON Adjunto

¿Cómo entregar la prueba?
Sube tu código a un repositorio público en GitHub.
Adjunta en este google forms el link de github: 

Tu repositorio debe incluir:
README.md

Con instrucciones claras para:
instalar dependencias
ejecutar backend y frontend
levantar el proyecto localmente
DECISIONS.md

Con una breve explicación sobre:

Enfoque general de la solución
Decisiones técnicas principales
Organización del proyecto
Supuestos o simplificaciones realizadas
Problemas encontrados y cómo los resolviste
Prompts más relevantes utilizados, en caso de haber usado Herramientas de IA
El objetivo de este documento es ayudarnos a entender tu criterio técnico y tu proceso de trabajo, no evaluar el uso de IA como algo positivo o negativo por sí mismo.

📤 Entrega

Para enviarnos tu solución:

Sube tu código a un repositorio público en GitHub
Completa este formulario con el link de tu repositorio:
👉 Sueblo acá!
📎 Adjuntos
Incluimos un documento con el mock de datos de YouTube que necesitarás para desarrollar la prueba.

Tip: Menos copy-paste, más intención 💡 Queremos ver tu sello personal en la solución.
Tip: Si decides incluir tests, estructura o buenas prácticas adicionales, definitivamente lo vamos a notar 😉