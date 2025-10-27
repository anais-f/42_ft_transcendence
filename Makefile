NAME := ft_transcendence
DOCKER_COMPOSE_FILE := ./docker-compose.yaml
DOCKER_COMPOSE_FILE_DEV := ./docker-compose.override.yaml
.DEFAULT_GOAL = up
SERVICES := $(shell docker compose -f $(DOCKER_COMPOSE_FILE) config --services)
COMPOSE := docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE)

.PHONY: install
install:
	./hooks/install-hooks.sh
	./scripts/setup-node.sh
	npm install

.PHONY: test
test:
	npm test

.PHONY: build
build:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) build

.PHONY: up
up:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) up -d

.PHONY: debug
debug:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) up

.PHONY: down
down:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) down

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

.PHONY: dev-build
dev-build:
	rm -rf node_modules packages/*/node_modules services/*/app/node_modules
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_DEV) build

.PHONY: dev-up
dev-up:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_FILE_DEV) up