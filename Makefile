ci: clean npm validate test

npm:
	npm prune
	npm install

validate: npm security-check

test:
	npm test

security-check:
	./node_modules/.bin/retire -n

.PHONY: all npm validate test security-check clean
