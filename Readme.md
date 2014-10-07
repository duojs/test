
## duo-test

  Duo's testing utility.

  See the [Demo](https://cloudup.com/c5qdleOudgZ).

#### Features

  - Stream results straight from Saucelabs.
  - Runs all tests in parallel.
  - Hook into the koa app using `--middleware`.
  - Run arbitrary shell commands on refresh using `--command`.
  - Easy Saucelabs browser descripions. (`chrome:35..stable`, `iphone:stable` etc..)
  - Supports all mocha reporters for Saucelabs and PhantomJS.
  - Nice API.

#### Quickstart

  See [simple](https://github.com/component/duo-test/tree/master/examples/simple) and [advanced](https://github.com/component/duo-test/tree/master/examples/advanced) examples to get started.

#### CLI

    Usage: duo-test <command> [options]

    Commands:

      saucelabs [options]
         run tests using saucelabs

      browser [name]
         run tests using a browser

      phantomjs
         run tests using phantomjs


    Options:

      -h, --help               output usage information
      -p, --pathname <path>    tests path, defaults to /test
      -c, --commands <list>    shell commands to run on refresh
      -m, --middleware <file>  a file that exposes a function that accepts koa app
      -t, --title <title>      set a title to your tests [test]
      -B, --build <path>       set the built file path when using the default.html [/build.js]
      -R, --reporter <name>    mocha reporter [dot]
      -P, --port <port>        port, defaults to `0`
      -V, --version            output the version number

### License

  (MIT)

