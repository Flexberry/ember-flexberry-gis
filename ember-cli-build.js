/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    jscsOptions: {
      enabled: true,
      esnext: true,
      configPath: './.jscsrc'
    },

    lessOptions: {
      paths: [
        'bower_components/semantic-ui'
      ]
    },

    SemanticUI: {
      import: {
        css: false,
        javascript: true,
        images: false,
        fonts: true
      }
    },

    fingerprint: {
      exclude: [
        'images/layers-2x.png',
        'images/layers.png',
        'images/marker-icon-2x.png',
        'images/marker-icon.png',
        'images/marker-shadow.png',
        'images/popupMarker.png',
        '**/leaflet.css'
      ]
    },

    // Disable processImport https://github.com/jakubpawlowicz/clean-css/issues/755.
    minifyCSS: {
      options: {
        processImport: false
      }
    }
  });

  app.import('vendor/font-icon.css');
  app.import('vendor/fonts/icons.eot', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/icons.otf', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/icons.svg', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/icons.ttf', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/icons.woff', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/icons.woff2', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/crim.eot', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/crim.svg', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/crim.ttf', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/crim.woff', { destDir: 'assets/fonts' });
  app.import('vendor/fonts/crim.woff2', { destDir: 'assets/fonts' });
  app.import('vendor/serviceImages/close.png', { destDir: 'assets/themes/blue-sky/assets/images' });
  app.import('vendor/serviceImages/close-hover.png', { destDir: 'assets/themes/blue-sky/assets/images' });
  app.import('vendor/serviceImages/plus.png', { destDir: 'assets/themes/blue-sky/assets/images' });
  app.import('vendor/serviceImages/minus.png', { destDir: 'assets/themes/blue-sky/assets/images' });
  app.import('vendor/serviceImages/header-bgw.png', { destDir: 'assets/themes/orange/assets/images' });
  app.import('vendor/serviceImages/bgw-head-calendar.png', { destDir: 'assets/themes/orange/assets/images' });

  app.import('vendor/api-tests/api-test-map.html', { destDir: 'assets/api-tests' });
  app.import('vendor/api-tests/api-test-odata-layer.html', { destDir: 'assets/api-tests' });

  // guideline-icons
  const ghostThemeAssetsDir = 'vendor';
  app.import(`${ghostThemeAssetsDir}/guideline-icons.css`);
  app.import(`${ghostThemeAssetsDir}/fonts/guideline-icons/guideline-icons.eot`, { destDir: 'assets/fonts/guideline-icons' });
  app.import(`${ghostThemeAssetsDir}/fonts/guideline-icons/guideline-icons.ttf`, { destDir: 'assets/fonts/guideline-icons' });
  app.import(`${ghostThemeAssetsDir}/fonts/guideline-icons/guideline-icons.woff`, { destDir: 'assets/fonts/guideline-icons' });
  app.import(`${ghostThemeAssetsDir}/fonts/guideline-icons/guideline-icons.woff2`, { destDir: 'assets/fonts/guideline-icons' });
  app.import(`${ghostThemeAssetsDir}/fonts/guideline-icons/guideline-icons.svg`, { destDir: 'assets/fonts/guideline-icons' });
  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
