module.exports = function(grunt) {

	grunt.initConfig({
		// Import package manifest
		pkg: grunt.file.readJSON("content-edit.jquery.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author.name %>\n" +
				" *  Under <%= pkg.licenses[0].type %> License\n" +
				" */\n"
		},

		// Concat definitions
		concat: {
			dist: {
				src: ["src/content.js", "src/plugin.js"],
				dest: "dist/jquery.content-edit.js"
			},
			options: {
				banner: '(function($){ "use strict";',
				footer: "})(jQuery,document,window);"
			}
		},

		// Lint definitions
		jshint: {
			files: ["dist/*.js", "!dist/*.min.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			my_target: {
				src: ["dist/jquery.content-edit.js"],
				dest: "dist/jquery.content-edit.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

    watch: {
      scripts: {
        files: "src/*.js",
        tasks: ['concat']
      }
    }

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["concat", "jshint", "uglify"]);
	grunt.registerTask("test", ["jshint"]);

};
