NAME := ft_transcendence
DOCKER_COMPOSE_FILE := ./docker-compose.yaml
DOCKER_COMPOSE_FILE_DEV := ./docker-compose.override.yaml
DOCKER_COMPOSE_FILE_TEST := ./docker-compose.test.yaml
DOCKER_COMPOSE_FILE_MONITORING := ./docker-compose.monitoring.yaml
.DEFAULT_GOAL = up
SERVICES := $(shell docker compose -f $(DOCKER_COMPOSE_FILE) config --services)
COMPOSE := docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE)

.PHONY: install
install:
	./hooks/install-hooks.sh
	./scripts/setup-node.sh
	npm install

.PHONY: build-monitoring
build-monitoring:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_MONITORING) build

.PHONY: up-monitoring
up-monitoring: verif-env
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_MONITORING) up -d

.PHONY: test
test: down build
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_TEST) up || (make down && exit 1)
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_TEST) run --rm test || (make down && exit 1)
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) down --remove-orphans

.PHONY: build
build:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) build

.PHONY: up
up: verif-env
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) up -d

.PHONY: debug
debug:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) up || make down

.PHONY: down
down:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) down --remove-orphans
	docker volume rm ft_transcendence_nginx_logs || true

.PHONY: sh-%
sh-%:
	docker exec -it $(patsubst sh-%, %, $@) sh

.PHONY: logs-%
logs-%:
	docker logs -f -t --details $(patsubst logs-%,%, $@)

.PHONY: format
format:
	npm run format
	
.PHONY: format-check
format-check:
	npm run format:check

.PHONY: build-dev
build-dev:
	rm -rf node_modules packages/*/node_modules services/*/app/node_modules
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_DEV) build

.PHONY: up-dev
up-dev: verif-env
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_DEV) up --remove-orphans || make down
	
.PHONY: reset-db
reset-db: down
	cd ~/goinfre/docker/volumes && docker volume rm * ; cd -

.PHONY: verif-env
verif-env:
	./scripts/check-env.sh