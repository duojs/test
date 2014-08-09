
client/build.js: client/saucelabs.js
	@duo --global saucelabs $< $@

test:
	@node_modules/.bin/mocha \
		--harmony-generators \
		--require co-mocha \
		--timeout 10s \
		--reporter spec \
		--bail

clean:
	rm -rf client/build.js
	rm -rf components

.PHONY: test clean
