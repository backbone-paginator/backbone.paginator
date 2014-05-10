/*
  backbone.paginator
  http://github.com/backbone-paginator/backbone.paginator

  Copyright (c) 2013 Jimmy Yuen Ho Wong and contributors
  Licensed under the MIT license.
*/

// jshint globalstrict:true, node:true

"use strict";

module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    clean: {
      options: {
        force: true
      },
      api: [
        "api/**/*"
      ],
      "default": [
        "lib/*.min.*",
        "test/coverage/**/*"
      ]
    },
    qunit: {
      all: ["test/*.html"],
      options: {
        coverage: {
          src: ["lib/backbone.paginator.js"],
          instrumentedFiles: "test/coverage/temp",
          htmlReport: "test/coverage"
        }
      }
    },
    jsduck: {
      main: {
        src: ["lib/backbone.paginator.js"],
        dest: "api",
        options: {
          "external": ["Backbone.Model,Backbone.Collection,XMLHttpRequest"],
          "title": "backbone-pageable",
          "no-source": true,
          "categories": "categories.json",
          "warnings": "-no_doc",
          "pretty-json": true
        }
      }
    },
    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: "some"
      },
      "default": {
        files: {
          "lib/backbone.paginator.min.js": ["lib/backbone.paginator.js"]
        }
      }
    },
    connect: {
      server: {
        options: {
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-qunit-istanbul");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-jsduck");

  grunt.registerTask("default", ["clean", "qunit", "jsduck", "uglify"]);
};
