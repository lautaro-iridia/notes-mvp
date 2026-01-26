.PHONY: help dev prod build down logs clean db-shell

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up --build

prod: ## Start production environment
	docker compose up --build -d

build: ## Build all containers
	docker compose build

down: ## Stop all containers
	docker compose down
	docker compose -f docker-compose.dev.yml down

logs: ## Show logs from all containers
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all
	docker compose -f docker-compose.dev.yml down -v --rmi all

db-shell: ## Open PostgreSQL shell
	docker compose exec db psql -U iridia -d iridia_notes

migrate: ## Run database migrations
	docker compose exec backend alembic upgrade head

migration: ## Create new migration (usage: make migration msg="migration message")
	docker compose exec backend alembic revision --autogenerate -m "$(msg)"

# Frontend commands
fe-install: ## Install frontend dependencies
	cd frontend && npm install

fe-dev: ## Run frontend dev server locally
	cd frontend && npm run dev

fe-build: ## Build frontend for production
	cd frontend && npm run build

fe-lint: ## Run frontend linter
	cd frontend && npm run lint

# Backend commands
be-install: ## Install backend dependencies
	cd backend && pip install -r requirements.txt

be-dev: ## Run backend dev server locally
	cd backend && uvicorn app.main:app --reload
