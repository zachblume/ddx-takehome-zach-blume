.DEFAULT_GOAL := reset

reset: stop start

start:
	docker compose up -d
	npm install
	npx prisma migrate deploy
	npx tsx prisma/seed.js
	npm run dev

stop:
	docker compose kill
	docker compose rm -f -v

nuke: stop

lint:
	npm run lint

test:
	npm run test
