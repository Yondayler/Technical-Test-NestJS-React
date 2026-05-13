.PHONY: up down build logs clean

# Colores para la salida en consola
GREEN := \033[0;32m
NC := \033[0m # No Color

help:
	@echo "Comandos disponibles:"
	@echo "  make up      - Levanta los contenedores en segundo plano"
	@echo "  make down    - Apaga y elimina los contenedores"
	@echo "  make build   - Construye (o reconstruye) las imágenes limpiamente"
	@echo "  make logs    - Muestra los logs de los contenedores en tiempo real"
	@echo "  make clean   - Elimina contenedores, volúmenes e imágenes huérfanas"

up:
	@echo "$(GREEN)Levantando contenedores...$(NC)"
	sudo docker compose up -d
	@echo ""
	@echo "$(GREEN)╔══════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║        ✅  HypeBoard está listo!             ║$(NC)"
	@echo "$(GREEN)╠══════════════════════════════════════════════╣$(NC)"
	@echo "$(GREEN)║  🌐 Frontend  →  http://localhost:5173       ║$(NC)"
	@echo "$(GREEN)║  ⚙️  Backend   →  http://localhost:3001       ║$(NC)"
	@echo "$(GREEN)╚══════════════════════════════════════════════╝$(NC)"
	@echo ""

down:
	@echo "$(GREEN)Apagando contenedores...$(NC)"
	sudo docker compose down

build:
	@echo "$(GREEN)Construyendo imágenes (esto puede tardar unos minutos)...$(NC)"
	sudo docker compose build --no-cache

logs:
	sudo docker compose logs -f

clean:
	@echo "$(GREEN)Limpiando el sistema Docker del proyecto...$(NC)"
	sudo docker compose down -v --remove-orphans
