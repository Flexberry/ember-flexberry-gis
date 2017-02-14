/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-flexberry-gis',

  isDevelopingAddon(){
    return true;
  },

  included: function(app) {
    this._super.included.apply(this._super, arguments);

    // Import extensions for jQuery 'hasClass' method ($('...').hasClass(...)).
    app.import('vendor/jquery/jquery.hasClass.extensions.js');

    // Import Leaflet library & it's resources.
    // Leaflet must be prepended (imported with prepend: true option),
    // because ember-addons depending on ember-flexberry-gis
    // (for example ember-flexberry-gis-yandex see https://github.com/Flexberry/ember-flexberry-gis-yandex),
    // will append their vendor dependencies earlier in the vendor.js file, but some of them needs leaflet to be already imported.
    var appImagesDirectory = '/assets/images';
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet-src.js', { type: 'vendor', prepend: true });
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet.css', { type: 'vendor', prepend: true });
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
    app.import(app.bowerDirectory + '/proj4/dist/proj4-src.js');
    app.import(app.bowerDirectory + '/Proj4Leaflet/src/proj4leaflet.js');

    // Leaflet-WFST.
    app.import(app.bowerDirectory + '/Leaflet-WFST/dist/Leaflet-WFST.src.js');

    // Leaflet-MiniMap.
    app.import(app.bowerDirectory + '/Leaflet-MiniMap/dist/Control.MiniMap.min.js');
    app.import(app.bowerDirectory + '/Leaflet-MiniMap/dist/Control.MiniMap.min.css');

    // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
    app.import(app.bowerDirectory + '/osmtogeojson/osmtogeojson.js');

    // OSGeo ows.js library (implementing JS API for CSW services) & it's dependencies.
    app.import(app.bowerDirectory + '/jsonix/dist/Jsonix-all.js');
    app.import('vendor/jsonix/jsonix.definitionFix.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/OWS_1_0_0.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/DC_1_1.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/DCT.js');
    app.import(app.bowerDirectory + '/w3c-schemas/scripts/lib/XLink_1_0.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/CSW_2_0_2.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/Filter_1_1_0.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/GML_3_1_1.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/SMIL_2_0_Language.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/SMIL_2_0.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_GCO_20060504.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_GMD_20060504.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/GML_3_2_1.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/GML_3_2_0.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_GTS_20060504.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_GSS_20060504.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_GSR_20060504.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_GMX_20060504.js');
    app.import(app.bowerDirectory + '/ogc-schemas/scripts/lib/ISO19139_SRV_20060504.js');
    app.import(app.bowerDirectory + '/ows.js/dist/ows.debug.js');

    // JS-code beautifier to format strings containing JS-code & represent in in user-friendly view.
    app.import(app.bowerDirectory + '/js-beautify/js/lib/beautify.js');

    // Leaflet Div Control
    app.import('vendor/leaflet.div-control.js');
  }
};
