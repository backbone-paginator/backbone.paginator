module.exports = function(grunt) {

  //var log = grunt.log;

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
        eqnull: true
      },
      globals: {
        //exports: true,
        module: false,
        describe: false,
        it: false,
        beforeEach: false,
        afterEach: false,
        //console: true,
        sinon: false,
        expect: false,
        _: false,
        $: false,
        Backbone: false
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');
  grunt.registerTask('test', 'lint mocha');

  // run `npm install grunt-mocha` in project root dir and uncomment this
  grunt.loadNpmTasks('grunt-mocha');
};
