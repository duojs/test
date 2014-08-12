BIN := ./node_modules/.bin

all: client/build.js client/default.js

client/build.js: client/saucelabs.js
	@duo --global saucelabs $< $@

client/default.js: client/default.html
	@$(BIN)/minstache < $< > $@

test:
	@$(BIN)/gnode $(BIN)/_mocha

clean:
	rm -f client/build.js
	rm -f client/default.js
	rm -rf components

node_modules: package.json
	@npm install

.PHONY: test clean
