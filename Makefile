dev:
	bun run dev

build:
	bun run build

deploy:
	bash scripts/deploy.sh

ssh:
	ssh $(RDK_USER)@$(RDK_HOST)

health:
	curl http://localhost:3001/api/health | bun run -e "process.stdin|0"
