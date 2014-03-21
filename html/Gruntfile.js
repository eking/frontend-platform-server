/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>*/\n',
    
    // concat: {
    //   options: {
    //     banner: '<%= banner %>',
    //     stripBanners: true
    //   },
    //   dist: {
    //     src: ['src/<%= pkg.name %>.js'],
    //     dest: 'build/<%= pkg.name %>.js'
    //   }
    // },
    // uglify: {
    //   options: {
    //     banner: '<%= banner %>'
    //   },
    //   dist: {
    //     src: '<%= concat.dist.dest %>',
    //     dest: 'build/<%= pkg.name %>.min.js'
    //   },
    //   json: {
    //     src: 'dev/json2.js',
    //     dest: 'build/json2.js'
    //   }
    // },
    // jshint: {
    //   options: {
    //     jshintrc : true
    //   },
    //   gruntfile: {
    //     src: 'Gruntfile.js'
    //   },
    //   // lib_test: {
    //   //   src: ['lib/**/*.js', 'test/**/*.js']
    //   // }
    //   devjs: {
    //     src : ['dev/test.js']
    //   }
    // },
    watch: {
      // gruntfile: {
      //   files: '<%= jshint.gruntfile.src %>',
      //   tasks: ['jshint:gruntfile']
      // },
      // lib_test: {
      //   files: '<%= jshint.lib_test.src %>',
      //   tasks: ['jshint:lib_test', 'nodeunit']
      // }
      // devjs: {
      //   files : '<%= jshint.devjs.src %>',
      //   tasks : ['jshint:devjs']
      // },
      // html: {
      //   files: 'index.html'
      // },
      livereload: {
        options: {livereload: true},
        files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.less']
      }
    },
    connect: {
      server:{
        options : {
          port : 1377,
          debug : true,
          livereload : true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'uglify']);
  grunt.registerTask('dev', ['connect', 'watch']);
};