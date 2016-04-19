module.exports = function(grunt) {

	// Auto-load the neede grunt tasks.
	// require('load-grunt-tasks')(grunt);
	require( 'load-grunt-tasks' )( grunt, { pattern: ['grunt-*', 'assemble'] } );

	var config = {
		themes: [ 'buildpress', 'mentalpress', 'cargopress' ],
		prepFolder: 'prep',
		buildFolder: 'build'
	};

	// Project configuration.
	grunt.initConfig( {

		themes: config.themes,

		// Assemble convert .hbs to .html.
		// https://github.com/assemble/assemble/
		assemble: {
			build: {
				options: {
					partials:   [ config.prepFolder + '/<%= theme %>/assemble/includes/*.hbs' ],
					production: true,
				},
				files: [{
					expand: true,
					cwd:    config.prepFolder + '/<%= theme %>/assemble',
					src:    ['*.hbs'],
					dest:   'build/<%= theme %>/'
				}]
			}
		},

		// Compass convert .scss to .css.
		// https://github.com/gruntjs/grunt-contrib-compass
		compass: {
			build: {
				options: {
					sassDir:        config.prepFolder + '/<%= theme %>/sass',
					javascriptsDir: config.prepFolder + '/<%= theme %>/scripts',
					imagesDir:      config.buildFolder + '/<%= theme %>/images',
					cssDir:         config.buildFolder + '/<%= theme %>/stylesheets',
					environment:    'production',
					noLineComments: true,
					watch:          false,
					outputStyle:    'nested',
					relativeAssets: true,
					importPath:     [config.prepFolder + '/<%= theme %>/bower_components/bootstrap-sass-official/assets/stylesheets'],
					debugInfo:      false
				},
				files: [{
					expand: true,
					cwd:    config.prepFolder + '/<%= theme %>/sass/',
					src:    '{,*/}*.scss',
					dest:   config.buildFolder + '/<%= theme %>/stylesheets',
					ext:    '.css'
				}]
			}
		},

		// Parse CSS and add vendor-prefixed CSS properties using the Can I Use database. Based on Autoprefixer.
		// https://github.com/nDmitry/grunt-autoprefixer
		autoprefixer: {
			build: {
				files: [{
					expand: true,
					cwd:    config.buildFolder + '/<%= theme %>/stylesheets/',
					src:    '*.css',
					dest:   config.buildFolder + '/<%= theme %>/stylesheets'
				}]
			}
		},

		// RequireJS optimizer.
		// https://github.com/gruntjs/grunt-contrib-requirejs
		requirejs: {
			build: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					baseUrl:                 config.prepFolder + '/<%= theme %>/scripts',
					mainConfigFile:          config.prepFolder + '/<%= theme %>/scripts/main.js',
					optimize:                'uglify2',
					preserveLicenseComments: false,
					useStrict:               true,
					wrap:                    true,
					name:                    '../bower_components/almond/almond',
					include:                 'main',
					out:                     config.buildFolder + '/<%= theme %>/js/main.js'
				}
			}
		},

		// https://github.com/yeoman/grunt-usemin
		useminPrepare: {
			html: config.buildFolder + '/<%= theme %>/index.html',
			options: {
				dest: config.buildFolder +'/<%= theme %>'
			}
		},
		usemin: {
			html: [config.buildFolder + '/<%= theme %>/{,*/}*.html'],
			css:  [config.buildFolder + '/<%= theme %>/stylesheets/{,*/}*.css']
		},

		// Rename the files based on the content.
		// https://github.com/cbas/grunt-rev
		rev: {
			files: {
				src: [config.buildFolder + '/<%= theme %>/stylesheets/*.css', config.buildFolder + '/<%= theme %>/js/*.js']
			}
		},

		// Clean the build dir.
		// https://github.com/gruntjs/grunt-contrib-clean
		clean: {
			beforebuild: [config.buildFolder, config.prepFolder],
			afterBuild:  ['.tmp', '.sass-cache']
		},

		// Copy some files not handled by other tasks.
		// https://github.com/gruntjs/grunt-contrib-copy
		copy: {
			XtoY: {
				files: [{
					expand: true,
					cwd:    '<%= cwd %>',
					src:    '<%= src %>',
					dest:   '<%= dest %>'
				}]
			},
		},

		// https://github.com/yoniholmes/grunt-text-replace
		replace: {
			modifiedDate: {
				src:          'src/master/assemble/includes/meta.hbs',
				overwrite:    true,
				replacements: [{
					from: /^lastModified:.+?$/m,
					to:   function () {
						return grunt.template.process( 'lastModified: <%= grunt.template.today( "mmmm d, yyyy" ) %>' );
					}
				}],
			},
		}
	} );

	// Copy from cwd (root) folder with src files to dest (cwd, src and dest are given as parameters).
	grunt.registerTask( 'copyFromTo', 'copy from X into Y', function( cwd, src, dest ) {
		if ( arguments.length < 3 ) {
			grunt.log.writeln( this.name + ", missing parameters (cwd and/or src and/or dest)" );
		} else {
			grunt.log.writeln( this.name + ": from " + cwd + " with src: " + src + " to " + dest );
			grunt.config.set( 'cwd', cwd );
			grunt.config.set( 'src', src );
			grunt.config.set( 'dest', dest );

			grunt.task.run([
				'copy:XtoY'
			]);
		}
	});

	// Copy master content to all theme folders in the prep folder.
	grunt.registerTask( 'copyMasterToPrep', 'copy master folder to multiple theme folders in prep folder', function() {
		var themes = config.themes;
		grunt.log.writeln( "copying master folder to the following theme folders in prep folder:" );
		for (var i = 0; i < themes.length; i++) {
			grunt.log.writeln( themes[i] );

			grunt.task.run([
				'copyFromTo:src/master:**:' + config.prepFolder + '/' + themes[i]
			]);
		}
	});

	// Copy theme folders from src to all theme folders in the prep folder.
	grunt.registerTask( 'copyThemesToPrep', 'copy theme folders from src to all theme folders in prep folder', function() {
		var themes = config.themes;
		grunt.log.writeln( "copying theme folders from src to the theme folders in prep folder:" );
		for (var i = 0; i < themes.length; i++) {
			grunt.log.writeln( themes[i] );

			grunt.task.run([
				'copyFromTo:src/' + themes[i] + ':**:' + config.prepFolder + '/' + themes[i]
			]);
		}
	});

	// Copy all theme images from prep to all theme folders in the build folder.
	grunt.registerTask( 'copyPrepImagesToBuild', 'copy images from prep folder to theme folders in build folder', function() {
		var themes = config.themes;
		grunt.log.writeln( "copying images from prep folder to the build folder..." );
		for (var i = 0; i < themes.length; i++) {
			grunt.task.run([
				'copyFromTo:prep/' + themes[i] + '/images:**/*.{png,gif,jpg,jpeg,ico}:' + config.buildFolder + '/' + themes[i] + '/images'
			]);
		}
	});

	// Copy fonts from prep to all theme folders in the build folder.
	grunt.registerTask( 'copyFontsToBuild', 'copy fonts from prep folder to theme folders in build folder', function() {
		var themes = config.themes;
		grunt.log.writeln( "copying fonts from prep folder to the build folder..." );
		for (var i = 0; i < themes.length; i++) {
			grunt.task.run([
				'copyFromTo:prep/' + themes[i] + '/bower_components:bootstrap-sass-official/assets/fonts/bootstrap/*:' + config.buildFolder + '/' + themes[i] + '/bower_components'
			]);
		}
	});

	// Build docs for single theme. Run multiple tasks (theme is given as a parameter).
	grunt.registerTask( 'buildTheme', 'build docs files for a single theme', function( theme ) {
		if ( arguments.length < 1 ) {
			grunt.log.writeln( this.name + ", missing parameter (theme name)" );
		} else {
			grunt.config.set( 'theme', theme );
			grunt.task.run([
				'assemble:build',
				'compass:build',
				'autoprefixer:build',
				'requirejs:build',
				'useminPrepare',
				'concat', // Automatically configured by usemin.
				'cssmin', // Automatically configured by usemin.
				'rev',
				'usemin',
			]);
		}
	});

	// Build theme docs files.
	grunt.registerTask( 'buildAllThemes', 'build docs files for all themes', function() {
		var themes = config.themes;
		grunt.log.writeln( "building files for all themes..." );
		for (var i = 0; i < themes.length; i++) {
			grunt.task.run([
				'buildTheme:' + themes[i]
			]);
		}
	});

	// Build all theme docs.
	grunt.registerTask( 'build_docs', [
		'replace:modifiedDate',
		'clean:beforebuild',
		'copyMasterToPrep',
		'copyThemesToPrep',
		'copyPrepImagesToBuild',
		'copyFontsToBuild',
		'buildAllThemes',
		'clean:afterBuild'
	] );
};
