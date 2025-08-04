NAME := ft_transcendence

.PHONY: test
test:
	cd config && npm test

.PHONY: install
install:
	npm --prefix ./config install

.PHONY: compile
compile:
	(cd config && npm run build)

.PHONY: logs-%
logs-%:
	docker logs -f -t --details $(patsubst logs-%, %, $@)

.DEFAULT_GOAL = up
