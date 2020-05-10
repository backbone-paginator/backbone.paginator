// Karma configuration
// Generated on Wed Mar 09 2016 13:20:18 GMT+0000 (GMT)

const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const istanbul = require("rollup-plugin-istanbul");

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["qunit", "sinon"],


    // list of files / patterns to load in the browser
    files: [
      "test/setup/*.js",
      {
        pattern: "test/*.js",
        watched: false
      },
    ],

    client: {
      qunit: {
        noglobals: true
      }
    },

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "src/backbone.paginator.js": ["coverage"],
      "test/setup/*.js": ["rollup"],
      "test/*.js": ["rollup"]
    },

    rollupPreprocessor: {
      plugins: [
        resolve(),
        commonjs(),
        istanbul({
          include: [
            "src/**/*.js"
          ]
        })
      ],
      output: {
        format: "iife"
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress", "coverage"],

    coverageReporter: {
      type: "html",
      dir: "test/coverage"
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Chrome", "Firefox", "Safari"],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    browserNoActivityTimeout: 30000
  });
};
