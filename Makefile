DUO = node_modules/.bin/duo
MOCHA = node_modules/.bin/mocha
MINSTACHE = node_modules/.bin/minstache

all: client/build.js client/default.js

client/build.js: client/duo-test.js
	@$(DUO) --global duotest $< > $@

client/default.js: client/default.html
	@$(MINSTACHE) < $< > $@

test:
	@$(MOCHA) \
		--harmony-generators \
		--require co-mocha \
		--timeout 10s \
		--reporter spec \
		--bail

clean:
	rm -f client/build.js
	rm -f client/default.js
	rm -rf components

.PHONY: test clean
