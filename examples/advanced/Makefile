
#
# we add `-c make` to duo-test(1)
# because we want duo to run `make`
# on refresh
#

T=../../bin/duo-test -c make

build.js: test/test.js
	@duo $< > build.js

test:
	@$(T) browser

phantomjs:
	@$(T) phantomjs

saucelabs:
	@$(T) -b safari:6..7 saucelabs

.PHONY: test saucelabs phantomjs
