# DECISIONS.md — Criterio técnico y proceso de trabajo

## Enfoque general de la solución

El objetivo fue construir una solución que respete los principios que cualquier equipo de producto esperaría ver en código de producción: responsabilidades separadas, lógica de negocio testeable, y una UI que comunique claramente la jerarquía de datos.

El backend actúa como un colador: recibe el payload ruidoso del mock de YouTube, aplica las reglas de negocio, y entrega únicamente los 6 campos relevantes al frontend. El frontend no tiene ninguna lógica de cálculo — esa responsabilidad pertenece al backend.

---

## Decisiones técnicas principales

### Backend

**Arquitectura orientada a features (no a capas técnicas)**

Elegí organizar el código en un módulo `videos/` que contiene su propio controller, service, DTO e interfaces, en lugar de separar por capas (`controllers/`, `services/`). Esta estructura escala mejor porque toda la lógica relacionada con videos vive junta. Siguiendo el principio de cohesión del NestJS Style Guide oficial.

**DTO con `class-transformer` + `ValidationPipe` global**

Usé `@Exclude()` y `@Expose()` en `VideoResponseDto` para garantizar que el payload de YouTube nunca "se filtre" accidentalmente al cliente. El contrato de la API está definido explícitamente en el DTO, no implícito en lo que el servicio decida devolver.

Los DTOs de entrada (`VideoQueryDto`) usan decoradores de `class-validator` (`@IsIn`, `@IsString`, `@IsOptional`) para declarar las restricciones. Sin embargo, estos decoradores son **inerte sin un `ValidationPipe` activo** — NestJS no los ejecuta automáticamente. Por eso registré `ValidationPipe` globalmente en el bootstrap con `whitelist: true` (descarta propiedades no declaradas en el DTO) y `transform: true` (coerce de string a los tipos correctos). Esto hace que la API rechace un `sort=valor_inventado` con un 400 bien formado en lugar de silenciosamente ignorarlo, lo cual es el comportamiento correcto para una API de producción.


**Detección de comentarios desactivados**

El campo `commentCount` en la API de YouTube simplemente **no existe** cuando un video tiene los comentarios desactivados (no viene como `null` ni como `0`). Por eso usé el operador `in` de JavaScript (`'commentCount' in statistics`) en lugar de un simple falsy check, que hubiera fallado para videos con 0 comentarios reales.

**Fechas sin librerías externas**

Implementé `getRelativeTime()` con cálculos sobre `Date.now()` y un array de umbrales ordenados. El algoritmo es O(n) sobre ~6 umbrales — completamente suficiente. Decidí no usar `Intl.RelativeTimeFormat` porque, aunque es nativo, no es 100% consistente entre entornos de servidor y el enunciado pedía control total.

**CORS configurado desde el bootstrap**

Habilitado para `localhost:5173` (Vite) y `localhost:3000` para no bloquear el desarrollo del frontend. En producción esto se configuraría por variable de entorno.

**Swagger / OpenAPI con `@nestjs/swagger`**

Elegí documentar la API con Swagger en lugar de un README de texto plano porque es directamente ejecutable: el evaluador puede abrir `http://localhost:3001/api/docs`, ver el schema del modelo `VideoResponseDto` con sus descripciones y ejemplos reales, y ejecutar requests desde el browser sin necesidad de Postman ni `curl`. Las anotaciones viven en los mismos DTOs y controller que definen el contrato — no en un archivo YAML externo que puede quedar desactualizado.

### Frontend

**Custom hook `useVideos`**

Encapsula toda la lógica de fetching en un hook con flag `cancelled` para evitar actualizaciones de estado en componentes desmontados (race condition clásica con `useEffect`). El componente `App` solo consume estados — no sabe nada de `fetch`.

**Dark / Light mode con CSS Custom Properties**

Implementé el toggle usando `data-theme` en el `<html>` y un juego de variables CSS para cada tema. La ventaja frente a clases de Tailwind o estados de React es que la transición entre temas la maneja el browser de forma nativa y suave. El tema se persiste en `localStorage` y detecta `prefers-color-scheme` en la primera visita.

**Tipografía: Newsreader + Geist**

Newsreader (serif) para el título editorial, Geist (sans-serif de Vercel) para la UI, y Geist Mono para datos numéricos. Diferencia la jerarquía de información visualmente sin requerir CSS adicional.

**Reemplazo de thumbnails rotos con `placehold.co`**

El mock de YouTube utiliza URLs de `via.placeholder.com` como miniaturas de prueba. Tras investigarlo, confirmé que **`via.placeholder.com` fue dado de baja definitivamente** — el servicio está desconectado y sus URLs ya no resuelven. Esto no es un fallo intermitente, es una condición permanente del dataset de prueba.

Dado que el evaluador proveyó estas URLs intencionalmente en el mock (simulando un proveedor externo), la solución no es modificar los datos de origen sino manejar la irregularidad en la capa de UI. `placehold.co` es el reemplazo oficial de `via.placeholder.com` y usa **exactamente la misma sintaxis de URL** — solo cambia el dominio. En lugar de usar un fallback con `onError` (lo cual obligaría al navegador a hacer un request que sabemos que va a fallar, ralentizando la carga), interceptamos y limpiamos la URL en el frontend *antes* de dársela al `<img>`. Esto mantiene los colores y textos definidos en el mock (`AWS`, `Redux`, etc.) asegurando una carga inmediata y óptima.

---

## Organización del proyecto

```text
app/
├── backend/   → NestJS API (puerto 3001)
├── frontend/  → React + Vite (puerto 5173)
docker-compose.yml → Orquestador para levantar el stack completo
```

Ambas apps son independientes y se desarrollan en paralelo. El único acoplamiento es la URL del endpoint, que en el frontend está en una constante fácilmente configurable (`API_URL` en `useVideos.ts`).

### Developer Experience (DX) 🐳
Se incluye una configuración completa de Docker en la raíz del proyecto, pensada para que cualquier evaluador pueda auditar y ejecutar el proyecto sin depender de versiones locales de Node.js.

**Multi-stage builds:** Ambos `Dockerfile` están implementados con dos etapas separadas:
- **Etapa `builder`**: instala dependencias y compila la aplicación (TypeScript → JS en el backend, Vite bundle en el frontend).
- **Etapa `production`**: imagen final mínima que solo contiene los artefactos compilados. El backend usa `node:20-slim` con únicamente las dependencias de producción (`npm ci --only=production`) y corre bajo el usuario `node` (no root). El frontend usa `nginx:latest` para servir los estáticos, lo cual es significativamente más eficiente que mantener Node.js activo solo para servir archivos.

**Orquestación con `docker-compose.yml`:** El backend incluye un `healthcheck` que verifica que la API esté respondiendo antes de iniciar el frontend (`depends_on: condition: service_healthy`), eliminando race conditions al levantar el stack.

**`Makefile` en la raíz:** Expone comandos de alto nivel (`make up`, `make down`, `make build`, `make logs`, `make clean`) para que la experiencia de instalación sea de un solo comando, sin necesidad de conocer la sintaxis interna de Docker Compose.

**GitHub Actions CI (`.github/workflows/ci.yml`):** Pipeline de integración continua con tres jobs:
- **`backend`**: instala dependencias con `npm ci` (reproducible), corre lint sin `--fix` (el `--fix` automático en CI puede enmascarar problemas reales — en CI queremos que el pipeline falle ruidosamente si hay code style issues), compila TypeScript y ejecuta los tests con reporte de cobertura. El coverage se sube como **artefacto de GitHub** (`actions/upload-artifact`) en lugar de versionarse en el repositorio — los reportes generados no son código fuente y contaminarían el historial de git.
- **`frontend`**: corre `eslint` para detectar errores de estilo, `tsc --noEmit` (type-check estricto sin emitir archivos) y `npm run build` (bundle de Vite). Garantiza que ningún error de tipos ni imports rotos lleguen a `main`.
- **`docker`** *(depende de que los dos anteriores pasen)*: construye ambas imágenes con `docker/build-push-action` sin hacer push al registry — valida que los `Dockerfile` sean correctos en cada PR antes de llegar a producción.

Todos los jobs corren sobre **Node.js 22** (LTS actual) y usan las últimas versiones de las GitHub Actions oficiales para evitar warnings de deprecación en el runner.

El badge de estado del CI es lo primero visible en el README — una señal inmediata de que el código en `main` compila y pasa tests.


---

## Supuestos y simplificaciones

- **El mock JSON se lee desde disco** en cada petición. En producción esto sería una llamada a la API real de YouTube, con su propia lógica de cacheo y manejo de rate limits. El path del archivo se resuelve relativamente al directorio `dist` para que funcione tras el build.

- **Sin base de datos**: no era requerido y no añade valor dado que la fuente de datos es un archivo estático.

- **Sin autenticación**: el endpoint es público. En producción requeriría JWT o API key.

- **Los videos con `viewCount: "0"` retornan `hypeLevel: 0`** para evitar división por cero. Es un supuesto razonable — un video sin vistas no puede tener Hype significativo.

- **Los valores del mock vienen como strings** (ej. `"viewCount": "64076"`), igual que en la API real de YouTube. El servicio parsea todos los valores a `Number()` antes de operar.

---

## Problemas encontrados y soluciones

**Problema 1: Detección de comentarios desactivados**

En el primer intento usé `Object.prototype.hasOwnProperty.call(statistics, 'commentCount')`, que en los tests con datos mock pasaba porque el helper construía el objeto con la propiedad en `undefined`. El test correcto requería que la propiedad **no existiera en absoluto**. Cambié a `'commentCount' in statistics` que verifica la existencia de la propiedad en la cadena de prototipos, lo cual es más preciso para este caso de uso.

**Problema 2: Tests fallando por default values en el helper**

El helper `buildMockItem` usaba desestructuración con default `commentCount = '50'`, lo que hacía imposible pasar `undefined` como valor real. Refactoricé el helper para usar un flag explícito `disableComments: true` en lugar de pasar `undefined`, lo que hace la intención del test más legible.

---

## Estrategia de testing

Se implementaron tres niveles de tests, cada uno con una responsabilidad distinta:

**Nivel 1 — Unit tests del Service (`videos.service.spec.ts`)**

Prueba la lógica de negocio pura en aislamiento: `calculateHype()` y `getRelativeTime()`. No hay red, no hay disco, no hay framework — solo funciones con entrada y salida verificable. 17 tests cubren todos los edge cases del enunciado (tutorial x2, comentarios desactivados, división por cero, strings numéricos).

**Nivel 2 — Unit tests del Controller (`videos.controller.spec.ts`)**

Verifica que el controller cumple su único rol: recibir la query y delegarla al service sin transformarla. El service se mockea completamente. Esto garantiza que si el comportamiento del controller cambia (ej: empieza a modificar params antes de pasarlos), los tests lo detectan independientemente de la lógica del service. 6 tests, controller al 100% de cobertura.

**Nivel 3 — E2E tests (`test/app.e2e-spec.ts`)**

Levanta una instancia real de NestJS en memoria con `supertest` y hace requests HTTP reales contra el endpoint. Verifica el stack completo integrado: routing, ValidationPipe, ClassSerializerInterceptor, service y DTO. 9 tests cubren el contrato HTTP, ordenamiento, búsqueda, exclusión de campos internos y rechazo de inputs inválidos con 400.

La distinción clave: los niveles 1 y 2 pueden estar verdes aunque el `ValidationPipe` o el `ClassSerializerInterceptor` no estén configurados en el bootstrap — es el nivel 3 quien detecta esos fallos de integración.

---


## Uso de herramientas de IA

Usé **Antigravity (Google Gemini)** como asistente de pair programming durante el desarrollo. Los prompts más relevantes fueron:

- *"Implementa el módulo videos siguiendo NestJS best practices: feature module, constructor injection, DTO con class-transformer"* → generó la estructura base del módulo
- *"Escribe los tests unitarios para calculateHype y getRelativeTime cubriendo todos los edge cases del enunciado"* → generó el spec file, que luego reveló el bug real en la detección de `commentCount`
- *"Rediseña el CSS con estilo minimalista dark/light mode, sin neón, fuentes editoriales, siguiendo el skill minimalist-ui"* → generó el sistema de diseño CSS

En todos los casos revisé, corregí y tomé decisiones sobre el código generado. El bug de `commentCount` lo detectaron los propios tests — lo que valida que el proceso de TDD tiene valor real más allá del código generado.
