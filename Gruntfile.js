module.exports = function(grunt) {
	'use strict';

	// Auto-load the neede grunt tasks.
	// require('load-grunt-tasks')(grunt);
	require( 'load-grunt-tasks' )( grunt, { pattern: ['grunt-*', 'assemble'] } );

	var _ = require('lodash');

	// Read the config file with all themes data.
	var config = grunt.file.readJSON('themes-config.json');

	var themes = config.themes;

	// Escape colons ':' in all theme settings.
	themes = themes.map( function ( theme ) {
		return _.mapValues( theme, function ( value ) {
			return value.replace( ':', '\\:' );
		} );
	} );

	// Project configuration.
	grunt.initConfig( {

		// Assemble convert .hbs to .html.
		// https://github.com/assemble/assemble/
		assemble: {
			build: {
				options: {
					partials:   [ config.prepFolder + '/<%= theme %>/assemble/includes/**/*.hbs' ],
					data:       config.prepFolder + '/<%= theme %>/assemble/data/*.yml',
					production: true,
				},
				files: [{
					cwd:    config.prepFolder + '/<%= theme %>/assemble',
					src:    [ '*.hbs' ],
					dest:   'build/<%= theme %>/',
					expand: true,
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
					importPath:     [ config.prepFolder + '/<%= theme %>/bower_components/bootstrap-sass-official/assets/stylesheets' ],
					environment:    'production',
					outputStyle:    'nested',
					noLineComments: true,
					relativeAssets: true,
					watch:          false,
					debugInfo:      false,
				},
				files: [{
					cwd:    config.prepFolder + '/<%= theme %>/sass/',
					src:    '{,*/}*.scss',
					dest:   config.buildFolder + '/<%= theme %>/stylesheets',
					ext:    '.css',
					expand: true,
				}]
			}
		},

		// Parse CSS and add vendor-prefixed CSS properties using the Can I Use database. Based on Autoprefixer.
		// https://github.com/nDmitry/grunt-autoprefixer
		autoprefixer: {
			build: {
				files: [{
					cwd:    config.buildFolder + '/<%= theme %>/stylesheets/',
					src:    '*.css',
					dest:   config.buildFolder + '/<%= theme %>/stylesheets',
					expand: true,
				}]
			}
		},

		// RequireJS - build main js file.
		// https://github.com/gruntjs/grunt-contrib-requirejs
		requirejs: {
			build: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					baseUrl:                 config.prepFolder + '/<%= theme %>/scripts',
					mainConfigFile:          config.prepFolder + '/<%= theme %>/scripts/main.js',
					out:                     config.buildFolder + '/<%= theme %>/js/main.js',
					name:                    '../bower_components/almond/almond',
					include:                 'main',
					optimize:                'uglify2',
					preserveLicenseComments: false,
					useStrict:               true,
					wrap:                    true,
				}
			}
		},

		// Minimize CSS and replace the CSS and JS files with unique names (cache busting).
		// https://github.com/yeoman/grunt-usemin
		useminPrepare: {
			html: config.buildFolder + '/<%= theme %>/index.html',
			options: {
				dest: config.buildFolder +'/<%= theme %>'
			}
		},
		usemin: {
			html: [ config.buildFolder + '/<%= theme %>/{,*/}*.html' ],
			css:  [ config.buildFolder + '/<%= theme %>/stylesheets/{,*/}*.css' ]
		},

		// Rename the files based on the content.
		// https://github.com/cbas/grunt-rev
		rev: {
			files: {
				src: [ config.buildFolder + '/<%= theme %>/stylesheets/*.css', config.buildFolder + '/<%= theme %>/js/*.js' ]
			}
		},

		// Clean (remove) folders and files.
		// https://github.com/gruntjs/grunt-contrib-clean
		clean: {
			beforeThemeBuild: [ config.buildFolder + '/<%= theme %>', config.prepFolder + '/<%= theme %>' ],
			afterBuild:       [ '.tmp', '.sass-cache' ]
		},

		// Copy some files.
		// https://github.com/gruntjs/grunt-contrib-copy
		copy: {
			XtoY: {
				files: [{
					cwd:    '<%= cwd %>',
					src:    '<%= src %>',
					dest:   '<%= dest %>',
					expand: true,
				}]
			},
		},

		// Replace pieces of code.
		// https://github.com/yoniholmes/grunt-text-replace
		replace: {
			modifyDate: {
				src:          config.prepFolder  + '/<%= theme %>/assemble/includes/meta.hbs',
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
			grunt.log.writeln( this.name + ', missing parameters (cwd and/or src and/or dest)' );
		} else {
			grunt.config.set( 'cwd', cwd );
			grunt.config.set( 'src', src );
			grunt.config.set( 'dest', dest );

			grunt.task.run([
				'copy:XtoY'
			]);
		}
	});

	// Build process for single theme docs. Run multiple tasks.
	grunt.registerTask( 'buildSingleTheme', 'build docs files for a single theme', function( name, themename, creationdate, tfurl, themeheadertext, shutterstockurl ) {
		if ( arguments.length < 6 ) {
			grunt.log.writeln( this.name + ', missing parameter!' );
		} else {
			grunt.config.set( 'theme', name );
			grunt.config.set( 'themename', themename );
			grunt.config.set( 'creationdate', creationdate );
			grunt.config.set( 'tfurl', tfurl );
			grunt.config.set( 'themeheadertext', themeheadertext );
			grunt.config.set( 'shutterstockurl', shutterstockurl );
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

	// Build single theme docs (theme name is passed as the parameter).
	grunt.registerTask( 'buildTheme', 'build docs files for single theme', function( theme ) {
		var selectedTheme = _.find( themes, function ( currentTheme ) {
			return currentTheme.name === theme;
		} );

		grunt.config.set( 'theme', selectedTheme );

		grunt.task.run([
			// Clean theme folder in the build folder.
			'clean:beforeThemeBuild',
			// Copy master content to theme folder in the prep folder.
			'copyFromTo:src/master:**:' + config.prepFolder + '/' + selectedTheme.name,
			// Copy theme content from src to theme folder in the prep folder.
			'copyFromTo:src/' + selectedTheme.name + ':**:' + config.prepFolder + '/' + selectedTheme.name,
			// Copy all theme images from prep to theme folder in the build folder.
			'copyFromTo:prep/' + selectedTheme.name + '/images:**/*.{png,gif,jpg,jpeg,ico}:' + config.buildFolder + '/' + selectedTheme.name + '/images',
			// Copy fonts from prep to theme folder in the build folder.
			'copyFromTo:prep/' + selectedTheme.name + '/bower_components:bootstrap-sass-official/assets/fonts/bootstrap/*:' + config.buildFolder + '/' + selectedTheme.name + '/bower_components',
			// Replace lastModified date in the meta.hbs file.
			'replace:modifyDate',
			// Run the build process of the docs (escape the colon in url paremeters.
			'buildSingleTheme:' + selectedTheme.name + ':' + selectedTheme.themename + ':' + selectedTheme.creationdate + ':' + selectedTheme.tfurl + ':' + selectedTheme.themeheadertext + ':' + selectedTheme.shutterstockurl,
			// Clear unneeded temp files.
			'clean:afterBuild'
		]);
	});

	// Build ALL theme docs files at once.
	grunt.registerTask( 'buildAllThemes', 'build docs files for all themes', function() {
		themes.forEach( function ( theme ) {
			grunt.task.run([
				'buildTheme:' + theme.name
			]);
		} );
	});
};
