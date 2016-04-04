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

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
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

    uglify: {
      options: {
        mangle: true,
        compress: {},
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
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-documentation");
  grunt.loadNpmTasks("grunt-karma");

  grunt.registerTask("default", ["clean", "karma", "documentation", "uglify"]);
};
