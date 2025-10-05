.DEFAULT_GOAL := help

IMAGE ?= qr-code-generator:local
CONTAINER ?= qr-code-generator
PORT ?= 8080

.PHONY: help build run stop logs open shell clean rebuild

help:
	@echo "Make targets:"
	@echo "  make build     - Build Docker image ($(IMAGE))"
	@echo "  make run       - Run container ($(CONTAINER)) on http://localhost:$(PORT)"
	@echo "  make stop      - Stop and remove the running container"
	@echo "  make logs      - Tail logs from the running container"
	@echo "  make open      - Open app in default browser (macOS)"
	@echo "  make shell     - Open a shell inside the running container"
	@echo "  make clean     - Remove the Docker image"
	@echo "  make rebuild   - Clean and build again"

build:
	docker build -t $(IMAGE) .

run: stop
	docker run -d --name $(CONTAINER) -p $(PORT):80 $(IMAGE)
	@echo "App running at: http://localhost:$(PORT)"

stop:
	-@docker rm -f $(CONTAINER) 2>/dev/null || true

logs:
	docker logs -f $(CONTAINER)

open:
	open http://localhost:$(PORT)

shell:
	docker exec -it $(CONTAINER) sh

clean:
	-@docker rm -f $(CONTAINER) 2>/dev/null || true
	-@docker rmi $(IMAGE) 2>/dev/null || true

rebuild: clean build
