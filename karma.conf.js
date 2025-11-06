// Karma configuration - force ChromeHeadless to run tests in a stable headless browser
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage')
    ],

    // When running in CI we want console-only output. The HTML reporter
    // is useful during dev, but for command-line runs use compact reporters.
    client: {
      // don't keep the Jasmine HTML output in the browser (not used in CLI)
      clearContext: true
    },

    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },

  // Use a concise console-friendly reporter by default.
  // Coverage reporter is configured above.
  reporters: ['dots', 'coverage'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    browsers: ['ChromeHeadlessNoSandbox'],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },

    singleRun: false,
    restartOnFileChange: true,

    concurrency: Infinity
  });
};
