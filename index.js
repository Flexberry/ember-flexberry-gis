/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-flexberry-gis',

  included: function (app) {
    this._super.included.apply(this._super, arguments);

    // Import extensions for jQuery 'hasClass' method ($('...').hasClass(...)).
    app.import('vendor/jquery/jquery.hasClass.extensions.js');

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

    // Import leaflet plugins

    // Leaflet.Editable
    app.import(app.bowerDirectory + '/leaflet.editable/src/Leaflet.Editable.js');

    // Leaflet history
    app.import(app.bowerDirectory + '/leaflet-history/dist/leaflet-history.css');
    app.import(app.bowerDirectory + '/leaflet-history/dist/leaflet-history.js');

    // Leaflet.Editable.Measure
    app.import(app.bowerDirectory + '/leaflet-editable-measures/src/leaflet_measure.js');
    app.import(app.bowerDirectory + '/leaflet-editable-measures/src/leaflet_measure.css');
    app.import(app.bowerDirectory + '/leaflet-editable-measures/images/popupMarker.png', {
      destDir: appImagesDirectory
    });

    // Leaflet.Export
    app.import(app.bowerDirectory + '/html2canvas/dist/html2canvas.js');
    app.import(app.bowerDirectory + '/leaflet-export/leaflet_export.js');

    // Proj4Leaflet.
    app.import(app.bowerDirectory + '/proj4/dist/proj4-src.js');
    app.import(app.bowerDirectory + '/proj4leaflet/src/proj4leaflet.js');

    // Leaflet-WFST.
    app.import(app.bowerDirectory + '/Leaflet-WFST/dist/leaflet-wfst.src.js');

    // Leaflet-WMS.
    app.import(app.bowerDirectory + '/leaflet-wms/dist/Leaflet-WMS.js');

    // Leaflet.WMS.
    app.import(app.bowerDirectory + '/leaflet.wms/dist/leaflet.wms.js');

    // Leaflet-MiniMap.
    app.import(app.bowerDirectory + '/leaflet-minimap/dist/Control.MiniMap.min.js');
    app.import(app.bowerDirectory + '/leaflet-minimap/dist/Control.MiniMap.min.css');
    app.import(app.bowerDirectory + '/leaflet-minimap/dist/images/toggle.svg', {
      destDir: appImagesDirectory
    });

    // OSM to GeoJSON library (used to convert geocoder-osm-overpass-layer geocoding results into GeoJSON format).
    app.import(app.bowerDirectory + '/osmtogeojson/osmtogeojson.js');

    // JS-code beautifier to format strings containing JS-code & represent in in user-friendly view.
    app.import(app.bowerDirectory + '/js-beautify/js/lib/beautify.js');

    // UI-slider control
    app.import(app.bowerDirectory + '/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js');

    // JQuery-minicolors plugin required for flexberry-colorpicker component.
    app.import(app.bowerDirectory + '/jquery-minicolors/jquery.minicolors.js');
    app.import(app.bowerDirectory + '/jquery-minicolors/jquery.minicolors.css');
    app.import(app.bowerDirectory + '/jquery-minicolors/jquery.minicolors.png', {
      destDir: appAssetsDirectory
    });

    // Leaflet Div Control.
    app.import('vendor/leaflet/controls/leaflet.div-control.js');

    // Leaflet ImageOverlay Extensions.
    app.import('vendor/leaflet/layers/leaflet.imageoverlay.js');

    // Leaflet.WMS Overlay Extensions.
    app.import('vendor/leaflet/layers/leaflet.wms.overlay.js');

    // Leaflet.Util.CloneLayer.
    app.import('vendor/leaflet/utils/leaflet.util.cloneLayer.js');

    // Leaflet switch scale control
    app.import(app.bowerDirectory + '/leaflet-switch-scale-control/src/L.Control.SwitchScaleControl.js');
    app.import(app.bowerDirectory + '/leaflet-switch-scale-control/src/L.Control.SwitchScaleControl.css');

    // Leaflet zoomslider control
    app.import(app.bowerDirectory + '/leaflet.zoomslider/src/L.Control.Zoomslider.js');
    app.import(app.bowerDirectory + '/leaflet.zoomslider/src/L.Control.Zoomslider.css');
  }
};
