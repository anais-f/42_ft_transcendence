NAME := ft_transcendence
DOCKER_COMPOSE_FILE := ./docker-compose.yaml
.DEFAULT_GOAL = up

.PHONY: install
install:
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

.PHONY: setup
setup:
	./hooks/install-hooks.sh
	@bash -lc ' \
	  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash; \
	  NVM_DIR="$${HOME}/.nvm"; \
	  if [ -s "$$NVM_DIR/nvm.sh" ]; then \
	    . "$$NVM_DIR/nvm.sh"; \
	  fi; \
	  nvm install 22.20.0; \
	  nvm use 22.20.0; \
	  nvm alias default 22.20.0; \
	  npm install -g ts-node; \
	'
