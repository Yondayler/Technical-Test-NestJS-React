# HypeBoard — Cartelera de Conocimiento

Una aplicación full-stack que procesa un mock de la API de YouTube y presenta los videos en una cartelera visual rankeada por **Nivel de Hype** — una métrica de engagement calculada a partir de likes, comentarios y vistas.

## Tecnologías

| Capa | Stack |
|---|---|
| Backend | NestJS · TypeScript · Node.js |
| Frontend | React 19 · TypeScript · Vite |
| Tests | Jest · NestJS Testing Module |

---

## Estructura del proyecto

```
app/
├── backend/               # API NestJS
│   ├── src/
│   │   └── videos/        # Feature module
│   │       ├── dto/
│   │       ├── interfaces/
│   │       ├── videos.controller.ts
│   │       ├── videos.service.ts
│   │       └── videos.service.spec.ts
│   └── mock-youtube-api.json
├── frontend/              # App React + Vite
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── types/
└── mock-youtube-api.json  # Datos de prueba originales
```

---

## Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior

Verifica tu versión:
```bash
node --version
npm --version
```

---

## Instalación y ejecución

### Opción A: Usando Docker (Recomendado 🐳)
Si tienes Docker y Docker Compose instalados, puedes levantar todo el stack con un solo comando:

```bash
docker-compose up --build
```
- Backend disponible en `http://localhost:3001`
- Frontend disponible en `http://localhost:5173`

### Opción B: Ejecución Manual

#### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <nombre-del-repo>
```

#### 2. Backend (NestJS)

```bash
cd app/backend
npm install
npm run start:dev
```

El servidor arranca en **`http://localhost:3001`**

Endpoint disponible:
```
GET http://localhost:3001/api/videos
```

### 3. Frontend (React + Vite)

En una terminal separada:

```bash
cd app/frontend
npm install
npm run dev
```

La aplicación se abre en **`http://localhost:5173`**

> **Importante:** El backend debe estar corriendo antes de abrir el frontend.

---

## Ejecutar tests unitarios

```bash
cd app/backend
npm test
```

Salida esperada:
```
PASS  src/videos/videos.service.spec.ts
  VideosService
    calculateHype()
      ✓ debería calcular el hype base correctamente (8ms)
      ✓ debería multiplicar x2 cuando el título contiene "Tutorial" (mayúsculas)
      ✓ debería multiplicar x2 cuando el título contiene "tutorial" (minúsculas)
      ✓ debería multiplicar x2 cuando el título contiene "TuToRiaL" (mixed case)
      ✓ debería retornar 0 cuando los comentarios están desactivados
      ✓ debería retornar 0 cuando viewCount es 0 (evitar división por cero)
      ✓ debería retornar 0 cuando comentarios desactivados aunque el título diga "Tutorial"
      ✓ debería procesar correctamente los valores tipo string del JSON
    getRelativeTime()
      ✓ debería retornar "Hace unos segundos" para fechas muy recientes
      ✓ debería retornar "Hace 1 minuto" para 90 segundos atrás
      ✓ debería retornar "Hace X minutos" para varios minutos atrás
      ✓ debería retornar "Hace 1 día" para 25 horas atrás
      ✓ debería retornar "Hace X días" para varios días atrás
      ✓ debería retornar "Hace 1 mes" para ~31 días atrás
      ✓ debería retornar "Hace X meses" para varios meses atrás
      ✓ debería retornar "Hace 1 año" para ~366 días atrás
      ✓ debería retornar "Hace X años" para varios años atrás

Tests: 17 passed, 17 total
```

---

## Respuesta del endpoint

```json
[
  {
    "id": "vid_003",
    "thumbnail": "https://via.placeholder.com/300x200/...",
    "title": "TailwindCSS errores comunes - Tutorial",
    "author": "JuniorDev99",
    "publishedAt": "Hace 2 años",
    "hypeLevel": 0.308
  }
]
```

---

## Funcionalidades destacadas

- **Joya de la Corona** — El video con mayor Hype se muestra en una card destacada con diseño especial
- **Dark / Light Mode** — Toggle persistente que respeta `prefers-color-scheme` del sistema
- **Estados de UI** — Skeleton loading, error con retry y estado vacío
- **Cálculo de Hype** — Fórmula con reglas de negocio: multiplicador x2 para tutoriales, Hype 0 si comentarios desactivados, protección contra división por cero
- **Fechas sin librerías externas** — Transformación a texto relativo implementada con JS nativo
