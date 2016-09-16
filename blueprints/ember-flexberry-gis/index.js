/* globals module */
module.exports = {
  afterInstall: function() {
    var _this = this;
    return this.addBowerPackagesToProject([
      { name: 'leaflet', target: '1.0.0-rc.3' },
      'https://github.com/kartena/Proj4Leaflet#leaflet-proj-refactor',
      'https://github.com/Leaflet/Leaflet.Editable.git#gh-pages',
      'https://github.com/Flexberry/Leaflet-WFST.git#develop',
    ]).then(function() {
      return _this.addAddonsToProject({
        packages: [
          { name: 'ember-block-slots', target: '1.1.3' }
        ]
      });
    }).then(function () {
      // Add any NPM-package like that:
      //return _this.addPackagesToProject([{
      //  name: 'some npm package',
      //  target: 'package version'
      //}]);
    });
  },

  normalizeEntityName: function() {
  }
};