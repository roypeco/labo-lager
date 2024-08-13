.PHONY: setup up d ps

d:
	ENV_FILE=./variables.env.local docker compose down
up:
	ENV_FILE=./variables.env.local docker-compose up -d
ps:
	docker compose ps
