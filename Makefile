
test:
	@node_modules/.bin/mocha \
		--harmony-generators \
		--require co-mocha \
		--timeout 10s \
		--reporter spec

.PHONY: test
