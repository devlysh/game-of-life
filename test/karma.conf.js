module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/src/lib/vendor/g.js',
      // 'app/src/index.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Firefox', 'Chrome', 'Safari'],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-jasmine'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};