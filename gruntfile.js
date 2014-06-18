module.exports = function(grunt) {

	grunt.option.init ( grunt.file.readJSON('grunt.json') );
	grunt.log.write ( grunt.option('name') + ' ' + grunt.option('version') );

	if (grunt.file.exists('bower.json')) {
		var bower = grunt.file.readJSON('bower.json');
		var opt = grunt.option;
		var dependencies = opt('dependencies');
		for (var p in dependencies) {
			bower.dependencies[p] = dependencies[p].version;
		}
		grunt.file.write('bower.json', JSON.stringify(bower, null, 2)); //serialize it back to file
	}

	var Path = function() {
		function Vendor ( $path ) {
			var opt = grunt.option;
			var folder = opt('folder');
			var dependencies = opt('dependencies');
			var sources = [];
			for (var p in dependencies) {
				var source = dependencies[p].source;
				sources.push ( folder.vendor + '/**/' + source + '.' + $path );
				sources.push ( folder.vendor + '/**/' + source + '.min.' + $path );
			}
			var files = {
				cwd: folder.source,
				src: [ sources ],
				dest: folder.dist + '/' + $path + '/' + folder.vendor,
				expand: true, flatten: true, filter: 'isFile',
			};
			return files;
		}
		var Path = {};
		Path.Vendor = Vendor;
		return Path;
	}();

	grunt.registerTask('copyVendors', 'Copy Vendors Resources', function(arg) {
		var ext = arg || 'css';
		var msg = 'Copy Vendors Resources:';
		var opt = grunt.option;
		var folder = opt('folder');
		var dependencies = opt('dependencies');
		function copy($ext, $min) {
			$min = $min || '';
			for (var p in dependencies) {
				var source = dependencies[p].source;
				var _ext = $ext;
				if ($ext == 'map') {
					_ext = 'js';
				}
				var _in = 	p + '/**/' + source + $min + '.' + $ext;
				var _out = 	folder.dist + '/' + _ext + '/' + folder.vendor;
				try {
					var mapping = grunt.file.expandMapping( _in, _out, {
						cwd: folder.source + '/' + folder.vendor,
						flatten: true,
						rename: function(dest, matchedSrcPath, options) {
							if (p.indexOf('legacy') != -1) {
								return dest + '/legacy/' + matchedSrcPath;
							} else {
								return dest + '/' + matchedSrcPath;
							}
						}
					});
					var i = 0, t = mapping.length;
					while(i<t) {
						var src = typeof(mapping[i].src) == 'string' ? mapping[i].src : mapping[i].src[0];
						grunt.file.copy(src,mapping[i].dest);
						i++;
					}
					grunt.log.writeln('Copied ' + t + ' files');
				} catch ($e) {
					grunt.log.writeln($e);
				}
			}
		}
		copy(ext);
		copy(ext, '.min');
		if (ext == 'js') {
			copy('map', '.min');
		}
	});

	grunt.registerTask('copyV', 'Copy Vendors Resources', function(arg) {
		grunt.task.run('copyVendors:css');
		grunt.task.run('copyVendors:js');
	});

	grunt.initConfig({
	    // MAIN TASKS
		clean: {
			temp: {
				src: [ 'assets/temp/**/*.*' ]
			},
			all: {
				src: [ 'dist/css/**/*.css', 'dist/js/**/*.js', 'dist/fonts/**/*.*' ]
			},
			css: {
				src: [ 'dist/css/**/*.css' ]
			},
			js: {
				src: [ 'dist/js/**/*.css' ]
			},
			fonts: {
				src: [ 'dist/fonts/**/*.*' ]
			},
			html: {
				src: [ 'dist/**/*.html' ]
			},
			img: {
				src: [ 'dist/img/**/*.*' ]
			},
			removeUnusedCss: {
				src: [ 'dist/css/**/*.css', '!dist/css/main.min.css', '!dist/css/main-ie9.min.css' ]
			},
			removeUnusedJs: {
				src: [ 'dist/js/**/*.js', '!dist/js/vendor/**/*.js', '!dist/js/main.min.js' ]
			},
		},
		copy: {
			bootstrap: {
				cwd: 'assets',
				src: [ 'vendor/bootstrap/less/bootstrap.less', 'vendor/bootstrap/less/variables.less' ],
				dest: 'assets/main/bootstrap',
				expand: true, flatten: true, filter: 'isFile',
			},
			temp: {
				cwd: 'assets',
				src: [ 'vendor/bootstrap/less/**/*.less', '!vendor/bootstrap/less/bootstrap.less', '!vendor/bootstrap/less/variables.less', 'main/bootstrap/**/*.less' ],
				dest: 'assets/temp/bootstrap',
				expand: true, flatten: true, filter: 'isFile',
			},
			jqueryDevelopmentLegacy: {
				cwd: 'assets',
				src: [ 'vendor/jquery-legacy/jquery.js' ],
				dest: 'dist/js/vendor/legacy',
				expand: true, flatten: true, filter: 'isFile',
			},
			jqueryProductionLegacy: {
				cwd: 'assets',
				src: [ 'vendor/jquery-legacy/jquery.min.js',
					   'vendor/jquery-legacy/jquery.min.map' ],
				dest: 'dist/js/vendor/legacy',
				expand: true, flatten: true, filter: 'isFile',
			},
			jsDevelopmentVendor: {
				cwd: 'assets',
				src: [  'vendor/jquery-modern/dist/jquery.js',
						'vendor/bootstrap/dist/js/bootstrap.js',
						'vendor/html5shiv/dist/html5shiv.js',
						'vendor/respond/src/respond.js',
						'vendor/ua/dist/ua.js',
						'vendor/skrollr/src/skrollr.js' ],
				dest: 'dist/js/vendor',
				expand: true, flatten: true, filter: 'isFile',
			},
			jsProductionVendor: {
				cwd: 'assets',
				src: [  'vendor/jquery-modern/dist/jquery.min.js',
						'vendor/jquery-modern/dist/jquery.min.map',
						'vendor/bootstrap/dist/js/bootstrap.min.js',
						'vendor/html5shiv/dist/html5shiv.js',
						'vendor/respond/dest/respond.min.js',
						'vendor/ua/dist/ua.js',
						'vendor/skrollr/dist/skrollr.min.js' ],
				dest: 'dist/js/vendor',
				expand: true, flatten: true, filter: 'isFile',
			},
			css: {
				cwd: 'assets',
				src: [ 	'main/css/**/*.css' ],
				dest: 'dist/css',
				expand: true, flatten: true, filter: 'isFile',
			},
			js: {
				cwd: 'assets',
				src: [ 	'main/js/**/*.js' ],
				dest: 'dist/js',
				expand: true, flatten: true, filter: 'isFile',
			},
			fonts: {
				cwd: 'assets',
				src: [ 	'vendor/bootstrap/dist/fonts/*.*',
						'main/fonts/*.*' ],
				dest: 'dist/fonts',
				expand: true, flatten: true, filter: 'isFile',
			},
			img: {
				cwd: 'assets/main/img',
				src: [ 	'**/*.{png,jpg,gif,mpg,webm}'],
				dest: 'dist/img',
				expand: true, flatten: false, filter: 'isFile',
			},
		},
		watch: {
			options: {
				livereload: true
			},
			bootstrap: {
				files: ['assets/main/bootstrap/**/*.less'],
				tasks: ['dobootstrap']
			},
			less: {
				files: ['assets/main/less/**/*.less'],
				tasks: ['docss']
			},
			css: {
				files: ['assets/main/css/**/*.css'],
				tasks: ['docss']
			},
			js: {
				files: ['assets/main/js/**/*.js'],
				tasks: ['dojs']
			},
			fonts: {
				files: ['assets/main/fonts/**/*.*'],
				tasks: ['dofonts']
			},
			html: {
				files: ['assets/main/**/*.html'],
				tasks: ['dohtml']
			},
			json: {
				files: ['assets/main/json/stencil.json'],
				tasks: ['dohtml']
			},
			img: {
				files: ['assets/main/img/**/*.jpg', 'assets/main/img/**/*.png', 'assets/main/img/**/*.gif', 'assets/main/img/**/*.mp4', 'assets/main/img/**/*.webm'],
				tasks: ['doimage']
			}
	    },
	    exec: {
			bower: {
				cmd: 'npm install -g bower'
			},
			optipng: {
				cmd: 'npm install -g optipng'
			},
			jpegtran: {
				cmd: 'npm install -g jpegtran'
			},
			gifsicle: {
				cmd: 'npm install -g gifsicle'
			},
			dependancy: {
				cmd: 'bower install'
			},
			grant: {
				cmd: 'sudo chmod -R +rwx dist'
			}
	    },
		connect: {
			server: {
				options: {
					port: 9001,
	        		base: 'dist',
					hostname: '*',
					onCreateServer: function(server, connect, options) {
						/*
						var io = require('socket.io').listen(server);
						io.sockets.on('connection', function(socket) {
							// do something with socket
						});
						*/
					}
				}
			}
		},
		open: {
			delayed: {
				path: 'http://localhost:9001',
				app: 'Chrome',
				options: {
					openOn: 'serverListening'
				}
			},
	    	chrome : {
				path: 'http://localhost:9001',
				app: 'Chrome'
			},
			googleChrome : {
				path: 'http://localhost:9001',
				app: 'Google Chrome'
			},
			build : {
				path : 'http://google.com/',
				app: 'Firefox'
			},
			file: {
				path : '/etc/hosts'
			},
			custom: {
				path : function () {
					return grunt.option('path');
				}
			}
		},

		// STUFF TASKS
		less: {
			bootstrap: {
				options: {
					paths: ['assets/temp/bootstrap'],
					cleancss: false
				},
				files: {
					'dist/css/vendor/bootstrap.less.css': 'assets/temp/bootstrap/bootstrap.less'
				}
			},
			development: {
				options: {
					paths: ['assets/main/less']
				},
				files: {
					'dist/css/main.less.css': 'assets/main/less/main.less'
				}
			},
			mediaplayer: {
				options: {
					paths: ['assets/main/less']
				},
				files: {
					'dist/css/mediaplayer.css': 'assets/main/less/mediaplayer.less'
				}
			}
		},
		csslint: {
			lax: {
				options: {
					import: false
				},
				src: ['dist/css/**/*.css']
			}
		},
		stencil: {
			development: {
				options: {
					env: grunt.file.readJSON('assets/main/json/stencil.json'),
					partials: 'assets/main/partials',
					templates: 'assets/main/templates',
					dot_template_settings: { strip: false }
				},
				files: [{
					expand: true,
					cwd: 'assets/main/',
					src: ['**/*.dot.html', '!partials/**/*.dot.html', '!templates/**/*.dot.html'],
					dest: 'dist',
					ext: '.html',
					flatten: false
				}]
			},
			production: {
				options: {
					env: grunt.file.readJSON('assets/main/json/stencil.json'),
					partials: 'assets/main/partials',
					templates: 'assets/main/templates',
					dot_template_settings: { strip: false }
				},
				files: [{
					expand: true,
					cwd: 'assets/main/',
					src: ['**/*.dot.html', '!partials/**/*.dot.html', '!templates/**/*.dot.html'],
					dest: 'dist',
					ext: '.html',
					flatten: false
				}]
			}
		},
		modernizr: {
			development: {
			    // [REQUIRED] Path to the build you're using for development.
			    devFile : 'assets/vendor/modernizr/modernizr.js',
			    // [REQUIRED] Path to save out the built file.
			    outputFile : 'dist/js/vendor/modernizr.js',
			    // Based on default settings on http://modernizr.com/download/
			    extra : {
			        shiv : true,
			        printshiv : false,
			        load : true,
			        mq : false,
			        cssclasses : true
			    },
			    // Based on default settings on http://modernizr.com/download/
			    extensibility : {
			        addtest : false,
			        prefixed : false,
			        teststyles : false,
			        testprops : false,
			        testallprops : false,
			        hasevents : false,
			        prefixes : false,
			        domprefixes : false
			    },
			    // By default, source is uglified before saving
			    uglify : false,
			    // Define any tests you want to implicitly include.
			    tests : [],
			    // By default, this task will crawl your project for references to Modernizr tests.
			    // Set to false to disable.
			    parseFiles : true,
			    // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
			    // You can override this by defining a files array below.
			    files : {
			    	src: [ 'dist/js/**/*.js', 'dist/css/**/*.css' ]
			    },
			    // When parseFiles = true, matchCommunityTests = true will attempt to
			    // match user-contributed tests.
			    matchCommunityTests : false,
			    // Have custom Modernizr tests? Add paths to their location here.
			    customTests : []
			},
			production: {
			    // [REQUIRED] Path to the build you're using for development.
			    devFile : 'assets/vendor/modernizr/modernizr.js',
			    // [REQUIRED] Path to save out the built file.
			    outputFile : 'dist/js/vendor/modernizr.min.js',
			    // Based on default settings on http://modernizr.com/download/
			    extra : {
			        shiv : true,
			        printshiv : false,
			        load : true,
			        mq : false,
			        cssclasses : true
			    },
			    // Based on default settings on http://modernizr.com/download/
			    extensibility : {
			        addtest : false,
			        prefixed : false,
			        teststyles : false,
			        testprops : false,
			        testallprops : false,
			        hasevents : false,
			        prefixes : false,
			        domprefixes : false
			    },
			    // By default, source is uglified before saving
			    uglify : true,
			    // Define any tests you want to implicitly include.
			    tests : [],
			    // By default, this task will crawl your project for references to Modernizr tests.
			    // Set to false to disable.
			    parseFiles : true,
			    // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
			    // You can override this by defining a files array below.
			    files : {
			    	src: [ 'dist/js/**/*.js', 'dist/css/**/*.css' ]
			    },
			    // When parseFiles = true, matchCommunityTests = true will attempt to
			    // match user-contributed tests.
			    matchCommunityTests : false,
			    // Have custom Modernizr tests? Add paths to their location here.
			    customTests : []
			}
		},
		devcode: {
			options: {
				html: true,        // html files parsing?
				js: false,          // javascript files parsing?
				css: false,         // css files parsing?
				clean: false,
				block: {
					open: 'check', // open code block
					close: 'endcheck' // close code block
				},
				dest: 'dist'
			},
			development: {           // settings for task used with 'devcode:development'
				options: {
					source: 'dist',
					dest: 'dist',
					env: 'development'
				}
			},
			production: {             // settings for task used with 'devcode:production'
				options: {
					source: 'dist',
					dest: 'dist',
					env: 'production'
				}
			}
		},
		imagemin: {
			development: {
				options: {
					optimizationLevel: 2,
					progressive: true,
					interlaced: true
				},
				files: [{
					expand: true,
					cwd: 'assets/main/img/',
					src: ['**/*.{png,jpg,gif}'],
					dest: 'dist/img/'
				}]
			}
		},

	    // COMPRESSORS
		cssmin: {
			main: {
				files: {
			  		'dist/css/main.min.css': ['dist/css/vendor/**/*.css', 'dist/css/*.css', '!dist/css/main-ie9.css', '!dist/css/main.css', 'dist/css/main.css' ]
				}
			},
			mainIE: {
				files: {
			  		'dist/css/main-ie9.min.css': ['dist/css/main-ie9.css' ]
				}
			}
		},
		uglify: {
			build: {
				options: {
					mangle: false
				},
				files: {
					'dist/js/main.min.js': ['dist/js/**/*.js', '!dist/js/**/jquery*.js', '!dist/js/**/modernizr*.js', '!dist/js/**/ua.js', '!dist/js/main.js', 'dist/js/main.js' ]
				}
			}
		},
		prettify: {
			development: {
				files: [{
					expand: true,
					cwd: 'dist',
					src: '**/*.html',
					dest: 'dist',
					ext: '.html',
					flatten: false
				}]
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true
				},
			},
			development: {
				options: {
					curly: true,
					undef: true,
				},
				files: {
					src: [ 'dist/js/**/*.js', '!dist/js/vendor/**/*.js' ]
				},
			},
			production: {
				options: {
					curly: true,
					undef: true,
				},
				files: {
					src: [ 'dist/js/**/*.js' ]
				},
			}
		},
	});

	// MAIN TASKS
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// STUFF TASKS
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-stencil');
	grunt.loadNpmTasks("grunt-modernizr");
	grunt.loadNpmTasks('grunt-devcode');

	// COMPRESSORS
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-prettify');

  	// BATCHES
	grunt.registerTask('server', function () {
		var server = require('myServer');
			server.listen(3000, function (err) {
				if (!err) {
					grunt.log.writeln('Server started');
					grunt.event.emit('serverListening'); // triggers open:delayed
				}
		});
	});

	grunt.registerTask('browser', 'Launch browser.', function(arg) {
		var msg = 'Opening browser: ';
		function launch($browser, $callback) {
			try {
				grunt.verbose.write(msg + $browser);
				grunt.option('force', true);
        		grunt.task.run('open:' + $browser);
				grunt.verbose.ok();
			} catch ($e) {
				grunt.verbose.or.write(msg + $browser).error().error(e.message);
				grunt.fail.warn('Something went wrong.');
				$callback ? $callback() : null;
			}
		}
		launch('chrome', function(){
			launch('googleChrome');
		});
	});

	grunt.registerTask(
		'prepare',
		[ 'exec:optipng', 'exec:jpegtran', 'exec:gifsicle', 'bootstrap' ]
	);

	grunt.registerTask(
		'bootstrap',
		[ 'exec:dependancy', 'copy:bootstrap' ]
	);

	grunt.registerTask(
		'lessbootstrap',
		[ 'clean:temp', 'copy:temp', 'less:bootstrap' ]
	);

	grunt.registerTask(
		'dobootstrap',
		[ 'lessbootstrap', 'less:development', 'modernizr:development' ]
	);

	grunt.registerTask(
		'docopyDevelopment',
		[ 'copy:temp', 'copy:jqueryDevelopmentLegacy', 'copy:jsDevelopmentVendor', 'copy:css', 'copy:js', 'copy:fonts', 'copy:img' ]
	);

	grunt.registerTask(
		'docopyProduction',
		[ 'copy:temp', 'copy:jqueryProductionLegacy', 'copy:jsProductionVendor', 'copy:css', 'copy:js', 'copy:fonts', 'copy:img' ]
	);

	grunt.registerTask(
		'dohtml',
		[ 'clean:html', 'stencil:development', 'devcode:development', 'prettify', 'modernizr:development' ]
	);

	grunt.registerTask(
		'docss',
		[ 'clean:css', 'copy:css', 'lessbootstrap', 'less:development', 'less:mediaplayer', 'modernizr:development' ]
	);

	grunt.registerTask(
		'dojs',
		[ 'clean:js', 'copy:js', 'modernizr:development'/*, 'jshint:development'*/ ]
	);

	grunt.registerTask(
		'dofonts',
		[ 'clean:fonts', 'copy:fonts' ]
	);

	grunt.registerTask(
		'doimage',
		[ 'copy:img', /*'imagemin'*/ ]
	);

	grunt.registerTask(
		'development',
		[ 'clean:all', 'docopyDevelopment', 'lessbootstrap', 'less:development', 'less:mediaplayer'/*, 'csslint'*/, 'stencil:development', 'devcode:development', 'prettify', 'modernizr:development', 'copy:img'/*, 'jshint:development'*/, 'connect:server', 'browser', 'watch' ]
	);

	grunt.registerTask(
		'production',
		[ 'clean:all', 'docopyProduction', 'lessbootstrap', 'less:development', 'less:mediaplayer', 'cssmin', 'clean:removeUnusedCss', 'uglify', 'clean:removeUnusedJs', 'stencil:production', 'devcode:production', 'prettify', 'modernizr:production', 'clean:img', 'copy:img'/*, 'jshint:production'*/, 'connect:server', 'browser', 'watch' ]
	);

	grunt.registerTask('help', 'List of all available commands.', function(arg) {
		grunt.log.writeln('grunt prepare		(install global plugins & dependancy)');
		grunt.log.writeln('grunt development	(compile distribution for development, run watch & launch browser)');
		grunt.log.writeln('grunt production		(compile distribution for production)');
		grunt.log.writeln('grunt bootstrap		(prepare bootstrap custom folder)');
		grunt.log.writeln('grunt imagemin		(compress all pictures)');
		grunt.log.writeln('grunt watch			(check folders for modification & recompile stuff)');
	});

};
