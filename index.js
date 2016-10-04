/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-flexberry-gis',

  included: function(app) {
    this._super.included.apply(this._super, arguments);

    // Import extensions for jQuery 'hasClass' method ($('...').hasClass(...)).
    app.import('vendor/jquery.hasClass.extensions/jquery.hasClass.extensions.js');

    // Import Leaflet library & it's resources.
    var appImagesDirectory = '/assets/images';
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet-src.js');
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet.css');
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers-2x.png', { destDir: appImagesDirectory });
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers.png', { destDir: appImagesDirectory });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon-2x.png', { destDir: appImagesDirectory });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon.png', { destDir: appImagesDirectory });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-shadow.png', { destDir: appImagesDirectory });

    // Import leaflet plugins

    // Leaflet.Editable
    app.import(app.bowerDirectory + '/leaflet.editable/src/Leaflet.Editable.js');

    // Leaflet.Editable.Measure
    app.import(app.bowerDirectory + '/leaflet.editable.measures/leaflet_measure.js');
    app.import(app.bowerDirectory + '/leaflet.editable.measures/leaflet_measure.css');
    app.import(app.bowerDirectory + '/leaflet.editable.measures/leaflet_basemeasure.js');
    app.import(app.bowerDirectory + '/leaflet.editable.measures/images/popupMarker.png', { destDir: appImagesDirectory });

    // Leaflet.Export
    app.import(app.bowerDirectory + '/html2canvas/dist/html2canvas.js');
    app.import(app.bowerDirectory + '/leaflet.export/leaflet_export.js');

    // Proj4Leaflet.
    app.import(app.bowerDirectory + '/Proj4Leaflet/lib/proj4.js');
    app.import(app.bowerDirectory + '/Proj4Leaflet/src/proj4leaflet.js');

    // Leaflet-WFST.
    app.import(app.bowerDirectory + '/Leaflet-WFST/dist/Leaflet-WFST.src.js');

    // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
    app.import(app.bowerDirectory + '/osmtogeojson/osmtogeojson.js');
  }
};
