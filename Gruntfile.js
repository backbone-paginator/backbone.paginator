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
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: 'lib/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js',
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
      },
      files: ['grunt.js', 'lib/**/*.js', 'test/u.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');

  // Default task.
  grunt.registerTask('default', ['jshint', 'mocha', 'concat', 'replace-version', 'uglify']);
  grunt.registerTask('test', ['jshint', 'mocha']);


  grunt.registerTask('replace-version', 'replace the version placeholder in backbone.paginator.js', function() {
    var pkg = grunt.config.get('pkg');
    var filename = 'dist/' + pkg.name + '.js';
    var content = grunt.file.read(filename);
    var rendered = grunt.template.process(content, { pkg : pkg });
    grunt.file.write(filename, rendered);
  });
};
