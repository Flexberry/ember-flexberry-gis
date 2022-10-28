/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-flexberry-gis',

  included: function (app) {
    this._super.included.apply(this._super, arguments);

    // Import extensions for jQuery 'hasClass' method ($('...').hasClass(...)).
    app.import('vendor/jquery/jquery.hasClass.extensions.js');

    // Import library allowing to detect DOM-elements resize.
    app.import(app.bowerDirectory + '/javascript-detect-element-resize/jquery.resize.js');

    // Import extensions for jQuery 'resize' method ($('...').resize(...)).
    app.import('vendor/jquery/jquery.resize.extensions.js');

    app.import('vendor/jquery/jquery.drag-resize.js');

    app.import('vendor/jquery/jquery.waitForImages.js');

    // Import Leaflet library & it's resources.
    // Leaflet must be prepended (imported with prepend: true option),
    // because ember-addons depending on ember-flexberry-gis
    // (for example ember-flexberry-gis-yandex see https://github.com/Flexberry/ember-flexberry-gis-yandex),
    // will append their vendor dependencies earlier in the vendor.js file, but some of them needs leaflet to be already imported.
    var appAssetsDirectory = '/assets';
    var appImagesDirectory = appAssetsDirectory + '/images';
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet-src.js', {
      type: 'vendor',
      prepend: true
    });
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet.css', {
      type: 'vendor',
      prepend: true
    });
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers-2x.png', {
      destDir: appImagesDirectory
    });
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers.png', {
      destDir: appImagesDirectory
    });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon-2x.png', {
      destDir: appImagesDirectory
    });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon.png', {
      destDir: appImagesDirectory
    });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-shadow.png', {
      destDir: appImagesDirectory
    });

    // Import leaflet plugins.

    // leaflet-areaselect.
    app.import(app.bowerDirectory + '/leaflet-areaselect/src/leaflet-areaselect.js');
    app.import(app.bowerDirectory + '/leaflet-areaselect/src/leaflet-areaselect.css');

    // Leaflet.Editable.
    app.import(app.bowerDirectory + '/leaflet.editable/src/Leaflet.Editable.js');

    // Leaflet history.
    app.import(app.bowerDirectory + '/leaflet-history/dist/leaflet-history.css');
    app.import(app.bowerDirectory + '/leaflet-history/dist/leaflet-history.js');

    // Leaflet.Editable.Measure.
    app.import(app.bowerDirectory + '/leaflet-editable-measures/src/leaflet_measure.js');
    app.import(app.bowerDirectory + '/leaflet-editable-measures/src/leaflet_measure.css');
    app.import(app.bowerDirectory + '/leaflet-editable-measures/images/popupMarker.png', {
      destDir: appImagesDirectory
    });

    // Leaflet.Export.
    app.import(app.bowerDirectory + '/html2canvas/dist/html2canvas.js');
    app.import(app.bowerDirectory + '/leaflet-export/leaflet_export.js');

    // Proj4Leaflet.
    app.import(app.bowerDirectory + '/proj4/dist/proj4-src.js');
    app.import(app.bowerDirectory + '/proj4leaflet/src/proj4leaflet.js');

    // leaflet-wfst.
    app.import(app.bowerDirectory + '/leaflet-wfst/dist/leaflet-wfst.src.js');

    // Leaflet-WMS.
    app.import(app.bowerDirectory + '/leaflet-wms/dist/Leaflet-WMS.js');

    // Leaflet.VectorGrid.
    app.import(app.bowerDirectory + '/leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js');

    // Leaflet.WMS.
    app.import(app.bowerDirectory + '/leaflet.wms/dist/leaflet.wms.js');

    // Leaflet-MiniMap.
    app.import(app.bowerDirectory + '/leaflet-minimap/dist/Control.MiniMap.min.js');
    app.import(app.bowerDirectory + '/leaflet-minimap/dist/Control.MiniMap.min.css');
    app.import(app.bowerDirectory + '/leaflet-minimap/dist/images/toggle.svg', {
      destDir: appImagesDirectory
    });

    // Leaflet-Omnivore.
    app.import(app.bowerDirectory + '/leaflet-omnivore/leaflet-omnivore.js');

    // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
    app.import(app.bowerDirectory + '/osmtogeojson/osmtogeojson.js');

    // Leaflet Div Control.
    app.import('vendor/leaflet/controls/leaflet.div-control.js');

    // Leaflet.WMS Overlay Extensions.
    app.import('vendor/leaflet/layers/leaflet.wms.overlay.js');

    // Leaflet.Util.CloneLayer.
    app.import('vendor/leaflet/utils/leaflet.util.cloneLayer.js');

    // Leaflet switch scale control.
    app.import(app.bowerDirectory + '/leaflet-switch-scale-control/src/L.Control.SwitchScaleControl.js');
    app.import(app.bowerDirectory + '/leaflet-switch-scale-control/src/L.Control.SwitchScaleControl.css');

    // Leaflet zoomslider control.
    app.import(app.bowerDirectory + '/leaflet.zoomslider/src/L.Control.Zoomslider.js');
    app.import(app.bowerDirectory + '/leaflet.zoomslider/src/L.Control.Zoomslider.css');

    // Load chartjs
    app.import(app.bowerDirectory + '/chart.js/dist/Chart.js');

    // ESRI.terraformer
    app.import(app.bowerDirectory + '/terraformer/terraformer.js');

    // Leaflet.markercluster
    app.import(app.bowerDirectory + '/leaflet.markercluster/dist/leaflet.markercluster.js');
    app.import(app.bowerDirectory + '/leaflet.markercluster/dist/MarkerCluster.css');
    app.import(app.bowerDirectory + '/leaflet.markercluster/dist/MarkerCluster.Default.css');
  }
};
