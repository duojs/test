
## duo-test

  Duo's testing utility.

#### Getting started

  > TODO

#### CLI

    Usage: duo-test <command> [path] [options]

    Options:

      -h, --help     output usage information
      -V, --version  output the version number

    Commands:

      browser   [path] [name]   run the tests using your browser
      saucelabs [path]          run the tests using saucelabs
      phantomjs [path]          run the tests using phantomjs

#### API

  > TODO

#### Running Tests

  Login to your saucelabs account and grab your credentials:

  https://saucelabs.com/account

  Add them to your environment:

  https://docs.saucelabs.com/ci-integrations/travis-ci/

  Then run the tests with those variables:

  ```
  SAUCE_KEY=$SAUCE_ACCESS_KEY SAUCE_USER=$SAUCE_USERNAME make test
  ```

### License

  (MIT)

