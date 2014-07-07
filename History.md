
0.2.1 / 2014-07-07
==================

 * duo-test-browser(1): commands fix

0.2.0 / 2014-07-03
==================

 * fix: ie6-8 and add tests
 * debugmode: listen on 3000
 * app: allow .listen(port)

0.1.3 / 2014-07-01
==================

 * wd-browser: update to 0.1 to get android and opera

0.1.2 / 2014-07-01
==================

 * fix: all --help
 * duo-test(1): show help if a command is omitted
 * tests: enable all
 * duo-test(1): fix some typos

0.1.1 / 2014-07-01
==================

 * saucelabs: support $BROWSER
 * tests: remove ie6-8 for now
 * tests: mocha-send.js -> saucelabs.js

0.1.0 / 2014-07-01
==================

 * phantomjs: add commands support
 * saucelabs: quit callback
 * saucelabs: speedup
 * saucelabs: add --name option
 * saucelabs: add debug mode
 * saucelabs: rename mocha-events.js to saucelabs.js, closes #8
 * saucelabs: dont quit before "end" event is received
 * fix: browser conf
 * saucelabs: remove queue timeout, maybe queue-component bug
 * saucelabs: dont send tests and suites array to keep requests small
 * saucelabs.js: use jsonp
 * saucelabs: make sure events are sent in order
 * add app.expose()

0.0.3 / 2014-06-25
==================

 * add default browser

0.0.1 / 2014-06-25
==================

 * add default browser
 * pass all args after -- to phantomjs
 * duo-test(1): test with phantomjs when no command is given
 * add open in browser commands
 * Initial commit
