module.exports = function (grunt) {
  "use strict";

  // Auto-load the neede grunt tasks.
  // require('load-grunt-tasks')(grunt);
  require("load-grunt-tasks")(grunt, { pattern: ["grunt-*", "assemble"] });

	const sass = require('node-sass');

  var _ = {
    find: require("lodash.find"),
  };

  // Read the config file with all themes data.
  var config = grunt.file.readJSON("themes-config.json");

  var themes = config.themes;

  // Project configuration.
  grunt.initConfig({
    // Assemble convert .hbs to .html.
    // https://github.com/assemble/assemble/
    assemble: {
      build: {
        options: {
          partials: [
            config.prepFolder + "/<%= theme %>/assemble/includes/**/*.hbs",
          ],
          data: config.prepFolder + "/<%= theme %>/assemble/data/*.yml",
          production: true,
        },
        files: [
          {
            cwd: config.prepFolder + "/<%= theme %>/assemble",
            src: ["*.hbs"],
            dest: "build/<%= theme %>/",
            expand: true,
          },
        ],
      },
    },

    // https://github.com/sindresorhus/grunt-sass
    sass: {
      options: {
        outputStyle: "expanded",
        sourceMap: true,
        includePaths: [
          "bower_components/bootstrap/scss",
          "bower_components/bootstrap-sass-official/assets/stylesheets",
        ],
        implementation: sass,
      },
      build: {
        files: [
          {
            expand: true,
            cwd: "assets/sass/",
            src: "*.scss",
            ext: ".css",
            dest: config.tmpdir,
          },
        ],
      },
    },

    // Compass convert .scss to .css.
    // https://github.com/gruntjs/grunt-contrib-compass
    compass: {
      build: {
        options: {
          sassDir: config.prepFolder + "/<%= theme %>/sass",
          javascriptsDir: config.prepFolder + "/<%= theme %>/scripts",
          imagesDir: config.buildFolder + "/<%= theme %>/images",
          cssDir: config.buildFolder + "/<%= theme %>/stylesheets",
          importPath: [
            config.prepFolder +
              "/<%= theme %>/bower_components/bootstrap-sass-official/assets/stylesheets",
          ],
          environment: "production",
          outputStyle: "nested",
          noLineComments: true,
          relativeAssets: true,
          watch: false,
          debugInfo: false,
        },
        files: [
          {
            cwd: config.prepFolder + "/<%= theme %>/sass/",
            src: "{,*/}*.scss",
            dest: config.buildFolder + "/<%= theme %>/stylesheets",
            ext: ".css",
            expand: true,
          },
        ],
      },
    },

    // Parse CSS and add vendor-prefixed CSS properties using the Can I Use database. Based on Autoprefixer.
    // https://github.com/nDmitry/grunt-autoprefixer
    autoprefixer: {
      build: {
        files: [
          {
            cwd: config.buildFolder + "/<%= theme %>/stylesheets/",
            src: "*.css",
            dest: config.buildFolder + "/<%= theme %>/stylesheets",
            expand: true,
          },
        ],
      },
    },

    // RequireJS - build main js file.
    // https://github.com/gruntjs/grunt-contrib-requirejs
    requirejs: {
      build: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          baseUrl: config.prepFolder + "/<%= theme %>/scripts",
          mainConfigFile: config.prepFolder + "/<%= theme %>/scripts/main.js",
          out: config.buildFolder + "/<%= theme %>/js/main.js",
          name: "../bower_components/almond/almond",
          include: "main",
          optimize: "uglify2",
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true,
        },
      },
    },

    // Minimize CSS and replace the CSS and JS files with unique names (cache busting).
    // https://github.com/yeoman/grunt-usemin
    useminPrepare: {
      html: config.buildFolder + "/<%= theme %>/index.html",
      options: {
        dest: config.buildFolder + "/<%= theme %>",
      },
    },
    usemin: {
      html: [config.buildFolder + "/<%= theme %>/{,*/}*.html"],
      css: [config.buildFolder + "/<%= theme %>/stylesheets/{,*/}*.css"],
    },

    // Rename the files based on the content.
    // https://github.com/cbas/grunt-rev
    rev: {
      files: {
        src: [
          config.buildFolder + "/<%= theme %>/stylesheets/*.css",
          config.buildFolder + "/<%= theme %>/js/*.js",
        ],
      },
    },

    // Clean (remove) folders and files.
    // https://github.com/gruntjs/grunt-contrib-clean
    clean: {
      beforeThemeBuild: [
        config.buildFolder + "/<%= theme %>",
        config.prepFolder + "/<%= theme %>",
      ],
      afterBuild: [".tmp", ".sass-cache"],
    },

    // Copy tasks for copying multiple folders/files.
    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {
      srcMasterToPrepTheme: {
        files: [
          {
            cwd: "src/master",
            src: "**",
            dest: config.prepFolder + "/<%= theme %>",
            expand: true,
          },
        ],
      },
      srcThemeToPrepTheme: {
        files: [
          {
            cwd: "src/<%= theme %>",
            src: "**",
            dest: config.prepFolder + "/<%= theme %>",
            expand: true,
          },
        ],
      },
      prepThemeImagesToBuildThemeImages: {
        files: [
          {
            cwd: config.prepFolder + "/<%= theme %>/images",
            src: "**/*.{png,gif,jpg,jpeg,ico,svg}",
            dest: config.buildFolder + "/<%= theme %>/images",
            expand: true,
          },
        ],
      },
      prepThemeFontsToBuildThemeFonts: {
        files: [
          {
            cwd: config.prepFolder + "/<%= theme %>/bower_components",
            src: "bootstrap-sass-official/assets/fonts/bootstrap/*",
            dest: config.buildFolder + "/<%= theme %>/bower_components",
            expand: true,
          },
          {
            cwd: config.prepFolder + "/<%= theme %>",
            src: "fonts/*",
            dest: config.buildFolder + "/<%= theme %>",
            expand: true,
          },
        ],
      },
    },

    // Replace pieces of code.
    // https://github.com/yoniholmes/grunt-text-replace
    replace: {
      modifyDate: {
        src: config.prepFolder + "/<%= theme %>/assemble/includes/meta.hbs",
        overwrite: true,
        replacements: [
          {
            from: /^lastModified:.+?$/m,
            to: function () {
              return grunt.template.process(
                'lastModified: <%= grunt.template.today( "mmmm d, yyyy" ) %>'
              );
            },
          },
        ],
      },
    },
  });

  // Build process for single theme docs. Run multiple tasks.
  grunt.registerTask(
    "buildSingleTheme",
    "build docs files for a single theme",
    function (theme) {
      if (arguments.length < 1) {
        grunt.log.writeln(
          this.name +
            ", missing parameter! Correct call is: buildSingleTheme:name_of_the_theme"
        );
      } else {
        var selectedTheme = _.find(themes, function (currentTheme) {
          return currentTheme.name === theme;
        });

        grunt.config.set("theme", selectedTheme.name);
        grunt.config.set("themename", selectedTheme.themename);
        grunt.config.set("creationdate", selectedTheme.creationdate);
        grunt.config.set("tfurl", selectedTheme.tfurl);
        grunt.config.set("themeheadertext", selectedTheme.themeheadertext);
        grunt.config.set("shutterstockurl", selectedTheme.shutterstockurl);
        grunt.task.run([
          "clean:beforeThemeBuild",
          "copy",
          "replace:modifyDate",
          "assemble:build",
          "sass:build",
          // "compass:build",
          "autoprefixer:build",
          "requirejs:build",
          "useminPrepare",
          "concat", // Automatically configured by usemin.
          "cssmin", // Automatically configured by usemin.
          "rev",
          "usemin",
          "clean:afterBuild",
        ]);
      }
    }
  );

  // Build ALL theme docs files at once.
  grunt.registerTask(
    "buildAllThemes",
    "build docs files for all themes",
    function () {
      themes.forEach(function (theme) {
        grunt.task.run(["buildSingleTheme:" + theme.name]);
      });
    }
  );
};
