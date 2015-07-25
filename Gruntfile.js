module.exports = function(grunt) {
	
  grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
		
        concat : {
            wizard : {
                src: ['namespace.js', 'utils.js', 'process-manager.js', 'model.js', 'message-center.js', 'portal.js', 'step.js'
                	, 'adapters/step-bar.js', 'adapters/fee.js', 'adapters/filter.js', 'adapters/grid.js'
                	, 'adapters/slider.js', 'adapters/switch.js', 'adapters/carousel.js', 'handlers/grid.js', 'handlers/resource-delivery.js'
                	, 'handlers/button.js', 'handlers/button-group.js', 'handlers/domain.js', 'handlers/datacenter.js', 'handlers/compute-resource.js'
                	, 'handlers/network.js', 'handlers/summary.js', 'steps/domain.js', 'steps/datacenter.js', 'steps/compute-resource.js'
                	, 'steps/network.js', 'steps/summary.js', 'wizard.js'],
                dest: 'dest/wizard.js'
            }
        },
		
		uglify: {  
            js: {  
                files: {
                    'dest/wizard2.0.js': ['dest/wizard.js']
                }  
            }  
        }  
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
	
};