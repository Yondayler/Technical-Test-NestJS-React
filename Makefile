.PHONY: up down build logs clean

# Detectar si es Windows (sin usar tabuladores en las condiciones)
ifeq ($(OS),Windows_NT)
IS_WINDOWS := 1
else
IS_WINDOWS := 0
endif

ifeq ($(IS_WINDOWS),1)
DOCKER_COMPOSE := docker compose
else
DOCKER_COMPOSE := sudo docker compose
endif

# Colores para la salida en consola
GREEN := \033[0;32m
NC := \033[0m

help:
	@echo "Comandos disponibles:"
	@echo "  make up      - Levanta los contenedores en segundo plano"
	@echo "  make down    - Apaga y elimina los contenedores"
	@echo "  make build   - Construye (o reconstruye) las imágenes limpiamente"
	@echo "  make logs    - Muestra los logs de los contenedores en tiempo real"
	@echo "  make clean   - Elimina contenedores, volúmenes e imágenes huérfanas"

up:
	@echo "$(GREEN)Levantando contenedores...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo ""
ifeq ($(IS_WINDOWS),1)
	@echo "------------------------------------------------"
	@echo "         HypeBoard esta listo!                  "
	@echo "------------------------------------------------"
	@echo "   Frontend  ->  http://localhost:5173          "
	@echo "   Backend   ->  http://localhost:3001          "
	@echo "------------------------------------------------"
else
	@echo "$(GREEN)╔══════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║        ✅  HypeBoard está listo!             ║$(NC)"
	@echo "$(GREEN)╠══════════════════════════════════════════════╣$(NC)"
	@echo "$(GREEN)║  🌐 Frontend  →  http://localhost:5173       ║$(NC)"
	@echo "$(GREEN)║  ⚙️  Backend   →  http://localhost:3001       ║$(NC)"
	@echo "$(GREEN)╚══════════════════════════════════════════════╝$(NC)"
endif
	@echo ""

down:
	@echo "$(GREEN)Apagando contenedores...$(NC)"
	$(DOCKER_COMPOSE) down

build:
	@echo "$(GREEN)Construyendo imágenes (esto puede tardar unos minutos)...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache

logs:
	$(DOCKER_COMPOSE) logs -f

clean:
	@echo "$(GREEN)Limpiando el sistema Docker del proyecto...$(NC)"
	$(DOCKER_COMPOSE) down -v --remove-orphans
