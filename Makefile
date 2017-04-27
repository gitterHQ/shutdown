ci: clean npm validate test

npm:
	npm prune
	npm install

validate: npm lint security-check

test:
	npm test

lint:
	npm run lint

security-check:
	./node_modules/.bin/retire -n

.PHONY: all npm validate test security-check clean
