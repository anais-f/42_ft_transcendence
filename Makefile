NAME := ft_transcendence

.PHONY: test
test:
	npm test

.PHONY: install
install:
	npm install

.PHONY: compile
compile:
	npm run build

.PHONY: logs-%
logs-%:
	docker logs -f -t --details $(patsubst logs-%, %, $@)

.DEFAULT_GOAL = up
