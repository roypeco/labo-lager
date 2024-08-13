.PHONY: up d ps start

d:
	ENV_FILE=./variables.env.local docker compose down
up:
	ENV_FILE=./variables.env.local docker-compose up -d
ps:
	docker ps
start:
	ENV_FILE=./variables.env.production docker-compose -f docker-compose.prod.yml up --build -d
