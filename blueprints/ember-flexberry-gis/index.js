/* globals module */
module.exports = {
  afterInstall: function () {
    var _this = this;
    return this.addBowerPackagesToProject([
      // Leaflet.
      {
        name: 'leaflet',
        target: '1.0.1'
      },

      // Leaflet.Proj4.
      {
        name: 'proj4leaflet',
        target: '1.0.1'
      },

      // Leaflet.WFST.
      {
        name: 'Leaflet-WFST',
        target: 'develop'
      },

      // Leaflet.WMS.
      {
        name: 'leaflet.wms',
        target: 'gh-pages'
      },

      // Leaflet.Editable.
      {
        name: 'leaflet.editable',
        target: 'master'
      },

      // Leaflet history.
      {
        name: 'leaflet-history',
        source: 'https://github.com/Flexberry/leaflet-history.git',
        target: 'master'
      },

      // Leaflet.Editable.Measures.
      {
        name: 'leaflet.editable.measures',
        target: '0.1.0'
      },

      // Leaflet.Export & dependencies.
      {
        name: 'html2canvas',
        target: 'master'
      },
      {
        name: 'leaflet.export',
        source: 'https://github.com/Flexberry/Leaflet.Export.git',
        target: 'master'
      },

      // Leaflet-switch-scale-control.
      {
        name: 'leaflet-switch-scale-control',
        source: 'https://github.com/Flexberry/leaflet-switch-scale-control.git',
        target: 'master'
      },

      // Leaflet.zoomslider.
      {
        name: 'Leaflet.zoomslider',
        source: 'https://github.com/Flexberry/Leaflet.zoomslider.git',
        target: 'leaflet-1.0.1'
      },

      // Leaflet-MiniMap
      {
        name: 'leaflet-minimap',
        target: '3.4.0'
      },

      // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
      {
        name: 'osmtogeojson',
        target: '2.2.12'
      },

      // OSGeo ows.js library (implementing JS API for CSW services).
      {
        name: 'ows.js',
        target: '0.1.5'
      },

      // Bootstrap slider
      {
        name: 'seiyria-bootstrap-slider',
        target: '~6.0.6'
      },
      {
        name: 'js-beautify',
        target: '1.6.4'
      },

      // JQuery-plugin implementing color-picker.
      {
        name: 'jquery-minicolors',
        target: '2.2.6'
      }
    ]).then(function () {
      return _this.addAddonsToProject({
        packages: [{
            name: 'ember-block-slots',
            target: '1.1.3'
          },
          {
            name: 'ui-ember-slider',
            target: '0.5.0'
          }
        ]
      });
    });
  },

  normalizeEntityName: function () {}
};
