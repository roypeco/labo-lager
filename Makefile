.PHONY: setup up d ps

d:
	docker compose down
up:
	docker compose up -d front go db
setup:
	docker compose up -d
ps:
	docker compose ps
