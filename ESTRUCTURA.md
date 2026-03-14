# Lineamientos de Estructura de Repositorio Fullstack

Este documento describe la estructura y convenciones del proyecto **Iridia Notes** para replicar en otros proyectos fullstack con React + FastAPI + PostgreSQL.

---

## 1. Estructura General del Repositorio

```
proyecto/
├── frontend/              # React + TypeScript SPA
├── backend/               # FastAPI Python API
├── docker/                # Dockerfiles por servicio
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── default.conf.template
│   └── backend/
│       └── Dockerfile
├── scripts/               # Entrypoints y utilidades
│   ├── entrypoint-backend.sh
│   ├── entrypoint-frontend.sh
│   ├── init-db.sh
│   └── 15-detect-dns-resolver.envsh
├── tests/                 # Tests separados del código fuente
│   ├── frontend/
│   └── backend/
├── docs/                  # Documentación del proyecto
├── docker-compose.yml     # Producción
├── docker-compose.dev.yml # Desarrollo
├── Makefile               # Comandos de orquestación
├── .env.example           # Template de variables de entorno
└── .claude/CLAUDE.md      # Instrucciones para Claude Code
```

---

## 2. Docker - Convenciones y Estrategia

### 2.1 Multi-Stage Builds

**Backend (`docker/backend/Dockerfile`):**
```dockerfile
# Stage 1: Builder - compila dependencias
FROM python:3.12-alpine AS builder
# Instala deps de compilación, crea venv, pip install

# Stage 2: Production - imagen mínima
FROM python:3.12-alpine
# Solo runtime deps, copia venv del builder
# Usuario no-root (appuser)
# Expone ${PORT} (configurable)
```

**Frontend (`docker/frontend/Dockerfile`):**
```dockerfile
# Stage 1: Builder - compila assets
FROM node:22-alpine AS builder
# npm ci, npm run build
# ARG VITE_API_URL para build-time

# Stage 2: Production - Nginx
FROM nginx:1.27-alpine
# Copia nginx.conf y template
# Copia /dist a /usr/share/nginx/html
```

### 2.2 Docker Compose - Dev vs Prod

| Aspecto | `docker-compose.dev.yml` | `docker-compose.yml` |
|---------|--------------------------|----------------------|
| Frontend target | `builder` (Node) | Production (Nginx) |
| Frontend puerto | 5173 (Vite) | 3000 (Nginx) |
| Volúmenes | Source mapeado (hot reload) | Sin volúmenes |
| Backend command | `uvicorn --reload` | Entrypoint script |
| API URL | Directa (`localhost:8000`) | Proxy (`/api`) |

### 2.3 Servicios Estándar

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    ports: ["3000:3000"]
    environment:
      - PORT=3000
      - BACKEND_URL=backend:8000
    depends_on: [backend]

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql+asyncpg://...
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: pgvector/pgvector:pg16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d dbname"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro

networks:
  app-network: {driver: bridge}

volumes:
  postgres_data:
```

---

## 3. Nginx - Configuración

### 3.1 Estructura de Archivos

```
docker/frontend/
├── nginx.conf              # Config global (workers, gzip)
├── default.conf.template   # Config server con variables ${VAR}
└── default.conf            # Referencia estática (opcional)
```

### 3.2 Template con Variables Dinámicas

```nginx
server {
    listen ${PORT};
    root /usr/share/nginx/html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets estáticos
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API al backend
    location /api {
        resolver ${DNS_RESOLVER} valid=10s ipv6=off;
        set $backend http://${BACKEND_URL};
        proxy_pass $backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /health {
        return 200 "healthy\n";
    }
}
```

### 3.3 Auto-detección de DNS

Script `15-detect-dns-resolver.envsh` para compatibilidad con múltiples entornos:
- Docker local: `127.0.0.11`
- Railway/Cloud: DNS del contenedor
- Soporte IPv4 e IPv6

---

## 4. Frontend - Estructura

```
frontend/src/
├── api/                   # Capa HTTP (axios)
│   ├── client.ts          # Config axios, interceptores, tokens
│   ├── auth.ts            # Endpoints auth
│   ├── [recurso].ts       # Endpoints por recurso
│   └── index.ts           # Exportaciones
├── components/            # Componentes React
│   ├── ui/                # Componentes atómicos (shadcn/ui)
│   ├── auth/              # Componentes de autenticación
│   └── [Feature].tsx      # Componentes de feature
├── contexts/              # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── use[Recurso].ts    # React Query hooks
│   └── useLocalStorage.ts
├── lib/                   # Utilidades de librerías
│   └── utils.ts           # cn() para class merging
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utilidades de negocio
│   └── helpers.ts
├── App.tsx                # Componente raíz
├── main.tsx               # Entry point con providers
└── index.css              # Estilos globales
```

### 4.1 Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **State Management**: React Query (server) + Context (client)
- **Routing**: React Router
- **HTTP**: Axios con interceptores
- **UI**: Tailwind CSS + shadcn/ui
- **Notificaciones**: Sonner

### 4.2 Configuraciones Clave

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
})
```

**tailwind.config.js:**
- Colores de marca personalizados
- Fuentes custom
- Dark mode con `class` strategy
- Plugins: typography, animate

---

## 5. Backend - Estructura

```
backend/
├── app/
│   ├── main.py            # Entry point FastAPI
│   ├── config.py          # Pydantic Settings
│   ├── database.py        # SQLAlchemy async engine
│   ├── models/            # SQLAlchemy ORM models
│   │   ├── __init__.py    # Exporta todos
│   │   └── [modelo].py
│   ├── schemas/           # Pydantic schemas
│   │   ├── __init__.py
│   │   └── [recurso].py   # Base, Create, Update, Read
│   ├── core/              # Auth y dependencias
│   │   ├── security.py    # JWT, hashing
│   │   └── deps.py        # Depends: CurrentUser, DbSession
│   ├── api/
│   │   └── v1/            # Versionado de API
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── [recurso].py
│   └── services/          # Lógica de negocio (opcional)
├── alembic/               # Migraciones
│   ├── env.py
│   └── versions/
├── alembic.ini
└── requirements.txt
```

### 5.1 Stack Tecnológico

- **Framework**: FastAPI (async)
- **ORM**: SQLAlchemy 2.0 + asyncpg
- **Migraciones**: Alembic
- **Auth**: JWT (python-jose) + bcrypt
- **Validación**: Pydantic v2
- **Database**: PostgreSQL + pgvector

### 5.2 Patrón de Rutas API

```
/api/v1/{recurso}           # GET (list), POST (create)
/api/v1/{recurso}/{id}      # GET, PATCH, DELETE
/api/v1/{recurso}/{id}/{accion}  # Acciones específicas
```

### 5.3 Dependencias Estándar

```python
# deps.py
CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
```

---

## 6. Variables de Entorno

```bash
# ===== BACKEND =====
SECRET_KEY=                        # JWT signing (generar random)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000

# ===== DATABASE =====
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db

# ===== FRONTEND =====
VITE_API_URL=http://localhost:8000  # Dev: directo, Prod: vacío (proxy)
BACKEND_URL=backend:8000            # Para nginx proxy
DNS_RESOLVER=auto                   # Auto-detect
```

---

## 7. Makefile - Comandos Estándar

```makefile
# Docker
dev:    docker compose -f docker-compose.dev.yml up --build
prod:   docker compose up --build -d
down:   docker compose down
logs:   docker compose logs -f
clean:  docker compose down -v --rmi all

# Database
db-shell:  docker compose exec db psql -U user -d dbname
migrate:   docker compose exec backend alembic upgrade head
migration: docker compose exec backend alembic revision --autogenerate -m "msg"

# Frontend (local)
fe-dev:    cd frontend && npm run dev
fe-build:  cd frontend && npm run build
fe-lint:   cd frontend && npm run lint

# Backend (local)
be-dev:    cd backend && uvicorn app.main:app --reload
```

---

## 8. Convenciones de Nombrado

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| **Archivos componentes** | PascalCase | `NoteCard.tsx` |
| **Archivos hooks** | camelCase + `use` | `useNotes.ts` |
| **Archivos utils** | camelCase | `helpers.ts` |
| **Tablas DB** | snake_case | `users`, `note_links` |
| **Columnas FK** | `{tabla}_id` | `user_id` |
| **Columnas boolean** | `is_*` | `is_active` |
| **Timestamps** | `created_at`, `updated_at` | UTC con timezone |
| **Modelos Python** | PascalCase | `User`, `Note` |
| **Schemas Pydantic** | PascalCase + sufijo | `NoteCreate`, `NoteRead` |
| **Endpoints API** | lowercase | `/api/v1/notes` |
| **Query params** | snake_case | `?pinned_only=true` |

---

## 9. Scripts de Entrypoint

### Backend (`entrypoint-backend.sh`)
1. Espera a que DB esté lista (`pg_isready`)
2. Ejecuta migraciones (`alembic upgrade head`)
3. Inicia servidor (`uvicorn`)

### Frontend (`entrypoint-frontend.sh`)
1. Log de configuración
2. Inyección opcional de API URL en runtime
3. Nginx procesa templates automáticamente

### Init DB (`init-db.sh`)
1. Habilita extensiones (vector, uuid-ossp)
2. Concede permisos

---

## 10. Checklist para Nuevo Proyecto

- [ ] Crear estructura de carpetas base
- [ ] Configurar Dockerfiles multi-stage
- [ ] Crear docker-compose.yml y docker-compose.dev.yml
- [ ] Configurar Nginx con template dinámico
- [ ] Crear scripts de entrypoint
- [ ] Configurar Makefile con comandos estándar
- [ ] Crear .env.example con todas las variables
- [ ] Configurar frontend: Vite, Tailwind, path aliases
- [ ] Configurar backend: FastAPI, SQLAlchemy async, Alembic
- [ ] Implementar autenticación JWT
- [ ] Crear CLAUDE.md con instrucciones del proyecto

---

## Verificación

Para validar que la estructura funciona:

1. **Docker dev**: `make dev` - verificar hot reload en ambos servicios
2. **Docker prod**: `make prod` - verificar nginx proxy y assets
3. **Migraciones**: `make migrate` - verificar Alembic
4. **Health checks**: `curl localhost:3000/health` y `localhost:8000/health`
5. **API docs**: Acceder a `localhost:8000/docs` (Swagger UI)
