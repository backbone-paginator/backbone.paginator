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

    documentation: {
      "default": {
        files: {
          src: ["lib/backbone.paginator.js"]
        },
        options: {
          access: ['public', 'protected', 'private', 'undefined'],
          destination: "api"
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
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-documentation");

  grunt.registerTask("default", ["clean", "karma", "documentation", "uglify"]);
};
