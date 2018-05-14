.env: .env.dist
	@if [ -f .env ]; \
	then\
		echo '\033[1;41m/!\ The .env.dist file has changed. Please check your .env file (this message will not be displayed again).\033[0m';\
		touch .env;\
		exit 1;\
	else\
		echo cp .env.dist .env;\
		cp .env.dist .env;\
fi

node_modules: package.json
	yarn install

assets: node_modules
	./node_modules/.bin/encore dev

start:
	docker-compose up -d --remove-orphans --build

install: .env node_modules assets start

.PHONY: start install
