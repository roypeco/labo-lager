.PHONY: setup up d b ps node

d:
	docker compose down
up:
	docker compose up -d
ps:
	docker compose ps
