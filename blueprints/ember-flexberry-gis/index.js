/* globals module */
module.exports = {
  afterInstall: function() {
    var _this = this;
    return this.addBowerPackagesToProject([
      // Leaflet.
      { name: 'leaflet', target: '1.0.1' },

      // Leaflet.Proj4.
      { name:'Proj4Leaflet', source: 'https://github.com/kartena/Proj4Leaflet.git', target: '1.0.1' },

      // Leaflet.WFST.
      { name: 'Leaflet-WFST', source: 'https://github.com/Flexberry/Leaflet-WFST.git', target: 'develop' },

      // Leaflet.WMS.
      { name: 'leaflet.wms', source: 'https://github.com/heigeo/leaflet.wms.git', target: 'gh-pages' },

      // Leaflet.Editable.
      { name: 'leaflet.editable', source: 'https://github.com/Leaflet/Leaflet.Editable.git', target: 'master' },

      // Leaflet history.
      { name: 'leaflet-history', source: 'https://github.com/Flexberry/leaflet-history.git', target: 'master' },

      // Leaflet.Editable.Measures.
      { name: 'leaflet.editable.measures', source: 'https://github.com/Flexberry/Leaflet.Editable.Measures.git', target: 'gh-pages' },

      // Leaflet.Export & dependencies.
      { name: 'html2canvas', source: 'https://github.com/niklasvh/html2canvas.git', target: 'master'},
      { name: 'leaflet.export', source: 'https://github.com/Flexberry/Leaflet.Export.git', target: 'master'},

      // Leaflet-MiniMap
      { name: 'Leaflet-MiniMap', source: 'https://github.com/Norkart/Leaflet-MiniMap.git', target: '3.4.0'},

      // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
      { name: 'osmtogeojson', target: '2.2.12' },

      // OSGeo ows.js library (implementing JS API for CSW services).
      { name: 'ows.js', target: '0.1.5' },

      // JS-code beautifier to format strings containing JS-code & represent in in user-friendly view.
      { name: 'js-beautify', target: '1.6.4' }
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
