# ASE Athletics - Plataforma de Análisis de Fútbol

## Demostración en Vivo
- **Aplicación Frontend:** https://ase-athletics-assessment.vercel.app/
- **API Backend:** https://ase-athletics-backend.onrender.com
- **Documentación de API:** En desarrollo (Swagger UI próximamente)

## Resumen del Proyecto
Plataforma completa de análisis de fútbol que permite la gestión integral de jugadores, análisis estadísticos avanzados, comparación de rendimiento y sistema de reportes de scouting. La aplicación incluye un dashboard interactivo con visualizaciones de datos, funcionalidades CRUD completas para jugadores, herramientas de búsqueda y filtrado avanzado, y capacidades de exportación de datos.

## Stack Tecnológico

### Frontend
- Framework: React.js 19.1.0 + TypeScript
- Gestión de Estado: Context API
- Styling: Tailwind CSS 3.3.0
- Build Tool: Vite 4.4.0
- Routing: React Router 7.6.3
- Charts: Chart.js + Recharts
- HTTP Client: Axios
- Deployment: Vercel

### Backend
- Runtime: Node.js + Express + TypeScript
- Base de Datos: PostgreSQL + Prisma ORM 5.19.1
- Autenticación: JWT (JSON Web Tokens)
- Seguridad: Helmet, CORS, Rate Limiting
- Deployment: Render
- File Processing: Papaparse, XLSX

### Base de Datos
- PostgreSQL 16 (Hosted en Render)
- ORM: Prisma con migraciones automáticas
- Seed Data: Scripts automatizados con datos JSON proporcionados

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- PostgreSQL 14+
- Git

### Configuración de Desarrollo Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Daniher01/ase-athletics-assessment.git
cd ase-athletics-assessment
```

2. **Configurar Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
```

3. **Variables de entorno Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ase_athletics"
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

4. **Configurar Base de Datos:**
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Seed de datos
npm run db:seed
```

5. **Iniciar Backend:**
```bash
npm run dev
# Servidor corriendo en http://localhost:5000
```

6. **Configurar Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
```

7. **Variables de entorno Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

8. **Iniciar Frontend:**
```bash
npm run dev
# Aplicación corriendo en http://localhost:3000
```

## Estructura del Proyecto

```
ase-athletics-assessment/
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── common/        # Layout, Pagination, etc.
│   │   │   ├── dashboard/     # StatCard, Charts, etc.
│   │   │   ├── players/       # PlayersTable, PlayerForm, etc.
│   │   │   └── reports/       # ReportForm, ReportDetail, etc.
│   │   ├── pages/             # Páginas principales
│   │   │   ├── Dashboard/     # Panel de análisis
│   │   │   ├── Players/       # Gestión de jugadores
│   │   │   ├── PlayerComparison/ # Comparación de jugadores
│   │   │   └── Reports/       # Reportes de scouting
│   │   ├── services/          # API communication
│   │   ├── context/           # React Context (Auth, etc.)
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Funciones auxiliares
│   └── package.json
├── backend/                    # Servidor API Node.js
│   ├── src/
│   │   ├── controllers/       # Manejadores de rutas
│   │   ├── routes/            # Definiciones de rutas API
│   │   ├── middleware/        # Auth, validación, rate limiting
│   │   ├── services/          # Lógica de negocio
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Funciones auxiliares
│   ├── prisma/                # Schema y migraciones
│   ├── data/                  # Archivos JSON de seed
│   ├── seeds/                 # Scripts de siembra
│   └── package.json
├── README.md
└── .gitignore
```

## Características Principales

### ✅ Panel de Análisis Interactivo
- Dashboard con métricas clave de rendimiento
- Gráficos de distribución por posición
- Estadísticas de edad promedio por equipo
- Visualización de valores de mercado
- Top scorers y estadísticas de rendimiento

### ✅ Búsqueda y Filtrado Avanzado
- Búsqueda en tiempo real por nombre de jugador
- Filtros por posición, equipo, nacionalidad
- Filtros por rango de edad y valor de mercado
- Ordenamiento por múltiples criterios
- Paginación eficiente

### ✅ Herramienta de Comparación de Jugadores
- Selección múltiple de jugadores para comparar
- Vista lado a lado de estadísticas detalladas
- Gráficos de radar comparativos de atributos
- Exportación de comparaciones

### ✅ Sistema de Reportes de Scouting
- Formulario completo de creación de reportes
- Lista y filtrado de reportes existentes
- Sistema de calificaciones y recomendaciones
- Vista detallada de reportes individuales

### ✅ Diseño Responsivo
- Optimizado para móvil, tablet y desktop
- Navegación adaptativa
- Tablas responsivas con scroll horizontal
- Gráficos optimizados para diferentes pantallas

### ✅ Funcionalidad de Exportación de Datos
- Exportación a CSV y Excel
- Filtros aplicados mantenidos en exportación
- Datos completos de jugadores y atributos

## Capturas de Pantalla

### Dashboard Principal
![Dashboard Analytics](docs/screenshots/dashboard_1.png)
*Vista general del dashboard con métricas clave y gráficos interactivos*

![Dashboard Estadísticas](docs/screenshots/dashboard_2.png)
*Visualización de estadísticas por posición y rendimiento*

### Gestión de Jugadores
![Lista de Jugadores](docs/screenshots/listado_jugadores.png)
*Tabla completa de jugadores con filtros, búsqueda y paginación*

![Detalle de Jugador](docs/screenshots/detalle_jugador.png)
*Vista detallada con estadísticas, atributos e información contractual*

### Comparación de Jugadores
![Comparación de Jugadores](docs/screenshots/comparacion_jugadores.png)
*Herramienta de comparación lado a lado con gráficos radar*

### Sistema de Reportes
![Crear Reporte](docs/screenshots/form_crear_reporte.png)
*Formulario de creación de reportes de scouting*

![Reportes de Scouting](docs/screenshots/reporte_scouting.png)
*Lista y gestión de reportes con filtros por jugador y scout*


## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener perfil del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Jugadores
- `GET /api/players` - Lista de jugadores con filtros y paginación
- `GET /api/players/search` - Búsqueda de jugadores
- `GET /api/players/:id` - Detalles de jugador específico
- `POST /api/players` - Crear nuevo jugador
- `PUT /api/players/:id` - Actualizar jugador existente
- `DELETE /api/players/:id` - Eliminar jugador

### Dashboard
- `GET /api/dashboard/stats` - Métricas generales del dashboard
- `GET /api/dashboard/stats/position` - Atributos agrupados por posición

### Reportes
- `GET /api/reports` - Lista de reportes con filtros y paginación
- `GET /api/reports/:id` - Detalles de reporte específico
- `POST /api/reports` - Crear nuevo reporte
- `PUT /api/reports/:id` - Actualizar reporte existente
- `DELETE /api/reports/:id` - Eliminar reporte

## Ejemplos de Uso de API

### Autenticación
```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@ase-athletics.com",
  "password": "demo123"
}

# Respuesta
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Demo User",
      "email": "demo@ase-athletics.com"
    }
  }
}
```

### Jugadores
```bash
# Obtener jugadores con filtros
GET /api/players?page=1&limit=10&position=Centre-Forward&team=Barcelona
Authorization: Bearer <token>

# Búsqueda de jugadores
GET /api/players/search?q=Messi
Authorization: Bearer <token>

# Crear nuevo jugador
POST /api/players
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nuevo Jugador",
  "position": "Centre-Forward",
  "age": 25,
  "team": "Real Madrid",
  "nationality": "Spain",
  "goals": 15,
  "assists": 8
}
```

### Dashboard
```bash
# Obtener estadísticas del dashboard
GET /api/dashboard/stats
Authorization: Bearer <token>

# Respuesta
{
  "success": true,
  "data": {
    "totalPlayers": 94,
    "averageAge": 26.5,
    "totalGoals": 456,
    "topScorer": {
      "name": "Harry Kane",
      "goals": 30
    }
  }
}
```
### Reportes
```bash
# Crear reporte de scouting
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "playerId": 1,
  "matchDate": "2025-01-15",
  "overallRating": 8.5,
  "strengths": "Excellent passing, Great vision",
  "weaknesses": "Could improve defending",
  "recommendation": "TRACK"
}
```

## Pruebas

### Estrategia de Testing End-to-End
La aplicación ha sido probada mediante **testing manual end-to-end** que valida la funcionalidad completa del sistema, cubriendo la integración entre frontend, backend y base de datos.

### Casos de Prueba Ejecutados
- **Autenticación:** Login/logout, protección de rutas, manejo de errores
- **Dashboard:** Carga de métricas, gráficos interactivos, rendimiento
- **Gestión de Jugadores:** CRUD completo, búsqueda, filtros, paginación
- **Comparación:** Selección múltiple, visualización comparativa, gráficos radar
- **Reportes de Scouting:** Creación, listado, detalle, filtrado
- **Responsive Design:** Funcionalidad en móvil, tablet y desktop
- **Performance:** Tiempos de carga, respuesta de API, estabilidad

### Documentación de Testing
Los casos de prueba detallados y resultados están documentados en:
```
docs/Test_end-to-end.md
```

### Resultados
- ✅ **25+ casos de prueba** ejecutados exitosamente
- ✅ **Funcionalidades críticas** validadas
- ✅ **Integración frontend-backend** verificada
- ✅ **Responsive design** funcional en todos los dispositivos
- ✅ **Performance** optimizado (< 3 segundos de carga)

### Credenciales de Testing
- **Usuario:** admin@test.com
- **Contraseña:** admin123

## Notas de Despliegue

La estrategia de despliegue se enfocó en utilizar servicios gratuitos para optimizar costos y rendimiento:

- **Base de Datos:** PostgreSQL desplegada en Render para mantener baja latencia con el backend
- **Backend:** Desplegado en Render con despliegue continuo configurado desde GitHub
- **Frontend:** Desplegado en Vercel con auto-deploy en cada push a main
- **Optimización:** Los datos JSON se movieron dentro de la carpeta backend para permitir que Prisma acceda a ellos durante el proceso de migración en producción

Cada push al branch main desencadena automáticamente el redespliegue tanto en Render (backend) como en Vercel (frontend).

## Credenciales de Demostración

- **Usuario:** demo@ase-athletics.com
- **Contraseña:** demo123

## Consideraciones de Rendimiento

- **Rate Limiting:** Implementación de limitación de 1000 requests por usuario cada 15 minutos para seguridad adicional
- **Arquitectura de Tipos:** Uso de TypeScript types en lugar de models tradicionales para compatibilidad optimizada con la estructura de Prisma
- **Optimización de Consultas:** Índices de base de datos para búsquedas y filtrados eficientes
- **Paginación:** Implementada para manejar grandes volúmenes de datos
- **Compresión:** Middleware de compresión en el backend para reducir tamaño de respuestas
- **Cold Start en Render:** En la capa gratuita de Render, el servicio backend se suspende por inactividad tras 15 minutos. El primer request después de la suspensión puede tomar 30-60 segundos adicionales para despertar el servicio

## Mejoras Futuras

- **Containerización:** Implementación de Docker para facilitar despliegue en diferentes entornos
- **Microservicios:** División de la aplicación en microservicios para mejor escalabilidad
- **Cache:** Implementación de Redis para caching de consultas frecuentes
- **Análisis Avanzado:** Machine Learning para predicciones y análisis predictivo
- **Notificaciones en Tiempo Real:** WebSockets para actualizaciones en vivo
- **Testing Automatizado:** Expansión de test coverage con pruebas E2E automatizadas

---

## Autoría y Licencia

### 👨‍💻 Autor
**Daniel Hernández**  
Desarrollador Full Stack

### 📄 Propósito del Proyecto
Este proyecto fue desarrollado como **evaluación técnica** para **ASE Athletics** como parte de un proceso de selección para desarrollador full stack. El código demuestra competencias en:
- Desarrollo full stack con React + Node.js
- Arquitectura de aplicaciones escalables
- Integración de bases de datos y APIs RESTful
- Implementación de sistemas de autenticación y autorización
- Diseño responsive y experiencia de usuario

### 📜 Licencia
Copyright © 2025 Daniel Hernández. Todos los derechos reservados.

Este software y su código fuente están protegidos por derechos de autor. El uso, reproducción, distribución o modificación de este código para **fines comerciales** está **estrictamente prohibido** sin autorización expresa y por escrito del autor.

**Permisos permitidos:**
- ✅ Visualización del código con fines educativos
- ✅ Revisión técnica por parte de ASE Athletics
- ✅ Uso como referencia para aprendizaje personal

**Restricciones:**
- ❌ Uso comercial sin autorización
- ❌ Redistribución del código
- ❌ Creación de trabajos derivados para fines comerciales
- ❌ Eliminación de notificaciones de copyright

Para solicitudes de licenciamiento comercial o colaboraciones, contactar al autor.