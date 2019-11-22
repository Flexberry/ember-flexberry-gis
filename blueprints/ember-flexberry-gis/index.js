/* globals module */
module.exports = {
  afterInstall: function () {
    var _this = this;
    return this.addBowerPackagesToProject([
      // Library allowing to detect DOM-elements resize.
      {
        name: 'javascript-detect-element-resize',
        target: '0.5.3'
      },

      // Leaflet.
      {
        name: 'leaflet',
        target: '1.5.1'
      },

      // Leaflet.Proj4.
      {
        name: 'proj4leaflet',
        target: '1.0.2'
      },

      // leaflet-wfst.
      {
        name: 'leaflet-wfst',
        target: '2.0.1-beta.14'
      },

      // Leaflet-WMS.
      {
        name: 'leaflet-wms',
        target: '1.2.0-beta.2'
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

      // Leaflet areaselect.
      {
        name: 'leaflet-areaselect',
        source: 'https://github.com/heyman/leaflet-areaselect.git',
        target: 'd0910cc4e74b59bbd9eead447d2353c29dfe84b1'
      },

      // Leaflet.Editable.Measures.
      {
        name: 'leaflet-editable-measures',
        target: '0.2.0-beta.2'
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
      },

      // Terrafotmer library (used in vector layers).
      {
        name: 'terraformer',
        target: '1.0.8'
      },

      // Leaflet-MarkerCluster (used in vector layers).
      {
        name: 'leaflet.markercluster',
        target: '1.1.0'
      },

      // Leaflet-Omnivore (used in vector layers).
      {
        name: 'leaflet-omnivore',
        target: '0.3.3'
      },

      // Load chart.js
      {
        name: 'chart.js',
        target: '2.7.1'
      },

      // Used in `gradients/gradient-edit` component.
      {
        name: 'jquery-minicolors',
        target: '2.3.4'
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
