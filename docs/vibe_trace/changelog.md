# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### En progreso
- **feat(auth):** Login con Google OAuth2 (dominio empresarial, auto-vinculación por email)

---

## [0.3.0] — 2026-04-01

### Agente Iris — diagnóstico y estabilización

#### Diagnóstico completo del error CopilotKit
- El agente Iris (LangGraph + CopilotKit + Claude Sonnet 4.6) estaba implementado pero inactivo.
- Causa raíz identificada: `ANTHROPIC_API_KEY` no configurada → endpoint `/api/copilotkit` nunca se registraba → 404.
- Causa secundaria (bug upstream): `LangGraphAGUIAgent.dict_repr()` en `copilotkit<=0.1.83` llama a `super().dict_repr()` pero `ag_ui_langgraph.LangGraphAgent` no implementa ese método → `AttributeError` en runtime.

#### Acciones tomadas
- Creado `.env` raíz con `ANTHROPIC_API_KEY` configurada.
- Actualizado `copilotkit==0.1.79` → `0.1.83` en `requirements.txt`.
- Corregido `VITE_API_URL` en `.env` (apuntaba al puerto del frontend en vez del backend).
- Implementado workaround en `backend/app/agent/runtime.py`: subclase `_IrisAgent` que sobrescribe `dict_repr()` sin llamar `super()`.
- Investigada integración directa con `ag_ui_langgraph.add_langgraph_fastapi_endpoint` (descartada: frontend habla protocolo CopilotKit Hub, no AG-UI directo → 422).

#### Feature temporalmente oculta
- CopilotKit deshabilitado en `frontend/src/App.tsx` (imports y hooks comentados, `<CopilotSidebar>` removido).
- El backend (`backend/app/agent/`) permanece intacto con el workaround listo.
- Documentado en memoria del proyecto para retomar con `make down && make dev` (rebuild limpio).

---

## [0.2.0] — 2026-01-27

### UI Refactor — shadcn/ui

- Refactor completo de la UI usando componentes shadcn/ui.
- Corrección de markdown preview, layout de categorías y vinculación de notas.
- Agregado `@tailwindcss/typography` para renderizado correcto de headers en markdown.

---

## [0.1.0] — 2026-01-26

### Infraestructura y deploy

- Fix: resolver 307 redirect en rutas `/api/v1/notes` y `/api/v1/categories` (FastAPI `redirect_slashes=False`).
- Fix: auto-detección de DNS resolver para Docker y Railway (nginx dinámico con `envsubst`).
- Fix: soporte IPv6 en DNS resolver de nginx.
- Fix: `pgvector` como extensión opcional (Railway no la tiene por defecto).
- Fix: dimensiones del vector embedding 1536 → 1024.

---

## [0.0.1] — 2026-01-26

### MVP inicial

- Stack: FastAPI + PostgreSQL + React + TypeScript.
- Auth con JWT (access + refresh tokens, bcrypt).
- CRUD de notas (tipos: `note`, `thought`, `idea`), categorías y links bidireccionales.
- UI con glass morphism, colores de marca Iridia Labs, dark/light mode.
- Deploy en Railway con nginx como proxy reverso.
