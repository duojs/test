
client/build.js: client/saucelabs.js
	@duo --global saucelabs $< $@

test:
	@node_modules/.bin/mocha \
		--harmony-generators \
		--require co-mocha \
		--timeout 100s \
		--reporter spec

clean:
	rm -rf client/build.js
	rm -rf components

.PHONY: test clean
