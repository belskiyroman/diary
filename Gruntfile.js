module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            jst: {
                files: {
                    'htdocs/js/templates-min.js': 'htdocs/js/templates.js'
                }
            }
        },

        watch: {
            scripts: {
                files: ['htdocs/templates/*.html'],
                tasks: ['jst']
            }
        },

        jst: {
            compile: {
                options: {
                    processName: function(filepath) {
                        return filepath.replace('htdocs/templates/', '');
                    }
                },
                files: {
                    "htdocs/js/templates.js": ["htdocs/templates/*.html"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jst');

    grunt.registerTask('watchJST', ['watch']);
    grunt.registerTask('compileJST', ['jst', 'uglify']);

};
