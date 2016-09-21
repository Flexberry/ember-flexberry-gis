/* globals module */
module.exports = {
  afterInstall: function() {
    var _this = this;
    return this.addBowerPackagesToProject([
      // Leaflet.
      { name: 'leaflet', target: '1.0.0-rc.3' },

      // Leaflet.Proj4.
      'https://github.com/kartena/Proj4Leaflet#leaflet-proj-refactor',

      // Leaflet.WFST.
      'https://github.com/Flexberry/Leaflet-WFST.git#develop',

      // Leaflet.Editable.
      'https://github.com/Leaflet/Leaflet.Editable.git#master',

      // Leaflet.Editable.Measures.
      'https://github.com/Flexberry/Leaflet.Editable.Measures#gh-pages',

      // Leaflet.Export & dependencies.
      'https://github.com/niklasvh/html2canvas#master',
      'https://github.com/Flexberry/Leaflet.Export#master'
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