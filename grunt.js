module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("m/d/yyyy") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: ['<banner>', '<file_strip_banner:lib/<%= pkg.name %>.js>'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    mocha: {
      all: [ 'test/test.html' ]
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/backbone.paginator*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        // unfortunately JSHint can't enforce the indentation without also enforcing
        // Crockford's styleguide. see https://github.com/jshint/jshint/issues/655
        // This is already fixed in master: https://github.com/jshint/jshint/issues/667
        // As soon as it is released the following line can be uncommented
        //indent: 2,
        trailing: true
      },
      globals: {
        exports: true,
        module: false
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint mocha concat min');
  grunt.registerTask('test', 'lint mocha');

  // run `npm install grunt-mocha` in project root dir and uncomment this
  grunt.loadNpmTasks('grunt-mocha');
};
