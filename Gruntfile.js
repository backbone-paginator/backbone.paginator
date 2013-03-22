module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("m/d/yyyy") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>',
        process: true
      },
      dist: {
        src: 'lib/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        files: {
          'dist/backbone.paginator.min.js' : ['<%= concat.dist.dest %>']
        }
      }
    },
    mocha: {
      all: [ 'test/test*.html' ],
      options: {
        run: true
      }
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
        indent: 2,
        trailing: true,
        globals: {
          exports: true,
          module: false
        }
      },
      files: ['Gruntfile.js', 'lib/**/*.js', 'test/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');

  // Default task.
  grunt.registerTask('default', ['test', 'concat', 'uglify']);
  grunt.registerTask('test', ['jshint', 'mocha']);

};
