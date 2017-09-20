/* globals module */
module.exports = {
  afterInstall: function () {
    var _this = this;
    return this.addBowerPackagesToProject([
      // Leaflet.
      {
        name: 'leaflet',
        target: '1.2.0'
      },

      // Leaflet.Proj4.
      {
        name: 'proj4leaflet',
        target: '1.0.2'
      },

      // leaflet-wfst.
      {
        name: 'leaflet-wfst',
        target: '2.0.1-beta.1'
      },

      // Leaflet-WMS.
      {
        name: 'leaflet-wms',
        target: '1.2.0-beta.1'
      },

      // Leaflet.WMS.
      {
        name: 'leaflet.wms',
        target: 'gh-pages'
      },

      // Leaflet.Editable.
      {
        name: 'leaflet.editable',
        target: '1.1.0'
      },

      // Leaflet.Editable.Measures.
      {
        name: 'leaflet-editable-measures',
        target: '0.2.0-beta.1'
      },

      // Leaflet.Export & dependencies.
      {
        name: 'html2canvas',
        target: '0.5.0-beta4'
      },
      {
        name: 'leaflet-export',
        target: '0.2.1-beta.1'
      },

      // Leaflet history.
      {
        name: 'leaflet-history',
        source: 'https://github.com/Flexberry/leaflet-history.git',
        target: 'leaflet-1.2.0'
      },

      // Leaflet-switch-scale-control.
      {
        name: 'leaflet-switch-scale-control',
        target: '0.1.1-beta.1'
      },

      // Leaflet.zoomslider.
      {
        name: 'Leaflet.zoomslider',
        source: 'https://github.com/Flexberry/Leaflet.zoomslider.git',
        target: 'leaflet-1.2.0'
      },

      // Leaflet-MiniMap.
      {
        name: 'leaflet-minimap',
        target: '3.4.0'
      },

      // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
      {
        name: 'osmtogeojson',
        target: '2.2.12'
      }
    ]).then(function () {
      return _this.addAddonsToProject({
        packages: [{
            name: 'ember-promise-helpers',
            target: '1.0.2'
          }, {
            name: 'ember-prop-types',
            target: '2.5.6'
          }
        ]
      });
    });
  },

  normalizeEntityName: function () {}
};
