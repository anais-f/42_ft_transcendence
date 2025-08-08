NAME := ft_transcendence
DOCKER_COMPOSE_FILE := ./docker-compose.yaml
.DEFAULT_GOAL = up

.PHONY: test
test:
	npm test

.PHONY: install
install:
	npm install

.PHONY: build
build:
	npm run build
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) build

.PHONY: up
up:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) up -d


.PHONY: down
down:
	docker compose -p $(NAME) -f $(DOCKER_COMPOSE_FILE) down

.PHONY: sh-%
sh-%:
	docker exec -it $(patsubst sh-%, %, $@) sh

.PHONY: logs-%
logs-%:
	docker logs -f -t --details $(patsubst logs-%, %, $@)