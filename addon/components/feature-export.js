import Ember from 'ember';
import layout from '../templates/components/feature-export';

import {
  translationMacro as t
} from 'ember-i18n';

/**
 * Default seettings.
 */
const defaultOptions = {
  format: 'JSON',
  coordSystem: 'EPSG:3857'
};

/**
 * Export dialog of map feaure to file.
 */
let FeatureExportDialogComponent = Ember.Component.extend({
  /**
   * Current settings.
   */
  _options: null,

  /**
    Dialog caption.

    @property caption
    @type String
    @default t('components.flexberry-export.caption')
  */
  caption: t('components.layer-result-list.flexberry-export.caption'),

  approveButtonCaption: t('components.layer-result-list.flexberry-export.approveButtonCaption'),

  denyButtonCaption: t('components.layer-result-list.flexberry-export.denyButtonCaption'),

  formatCaption: t('components.layer-result-list.flexberry-export.formatCaption'),

  crsCaption: t('components.layer-result-list.flexberry-export.crsCaption'),

  /**
   * Availble format.
   */
  _availableFormats: null,

  /**
   * Availble crs.
   */
  availableCRS: null,

  /**
   * Availble crs name.
   */
  _availableCRSNames: null,

  /**
   * Request dialog to show.
   */
  _dialogRequested: false,

  /**
   * Current crs.
   */
  _crs: Ember.computed('_options.coordSystem', function() {
    let _options = this.get('_options');
    let factories = this.get('availableCRS');

    return factories.filter((factory) => factory.name === _options.coordSystem)[0].crs;
  }),

  /**
   * Current data format.
   */
  _format: Ember.computed('_options.format', function() {
    let _options = this.get('_options');
    let crs = this.get('_crs');

    if (_options.format === 'JSON') {
      return new L.Format.GeoJSON({ crs: crs });
    }

    let format = new L.Format.Base({ crs: crs });

    format.outputFormat = _options.format;

    if (_options.format === 'Shape Zip') {
      format.outputFormat = 'Shape';
    }

    return format;
  }),

  /**
   * Upload file extension.
   */
  _fileExt: Ember.computed('_options.format', function() {
    let _options = this.get('_options');

    switch (_options.format) {
      case 'JSON':
        return 'json';
      case 'GML2':
      case 'GML3':
        return 'xml';
      case 'KML':
        return 'kml';
      case 'CSV':
        return 'csv';
      case 'GPX':
      case 'Shape Zip':
      case 'MIF':
        return 'zip';
      default:
        return 'txt';
    }
  }),

  /**
   * Layer settings
  */
  _layerSettings: Ember.computed('result', function() {
    let result = this.get('result');
    let layer = result.layerModel;
    let type = layer.get('type');

    switch (type) {
      case 'wms-wfs':
        return layer.get('settingsAsObject').wfs;
      case 'wfs':
        return layer.get('settingsAsObject');
      default:
        return null;
    }
  }),

  /**
   * Layout.
   */
  layout,

  /**
   * Style.
   */
  class: 'feature-export-dialog',

  /**
   * Dialog visibility.
   */
  visible: false,

  /**
   * Data to upload.
   */
  result: null,

  /**
   * GPX format only polyline and marker
   */
  _GPXFormat: Ember.observer('result', function() {
    let result = this.get('result');
    let layer = result.layerModel;
    let type = layer.get('settingsAsObject.typeGeometry');
    let formats = this.get('_availableFormats');
    if (type === 'polyline' || type === 'marker') {
      this.set('_availableFormats', formats.push('GPX'));
    } else {
      let ind = formats.indexOf('GPX');
      if (ind !== -1) {
        this.set('_availableFormats', formats.splice(ind));
      }
    }
  }),

  actions: {
    /**
     * Approve and start of export.
     * @param {object} e Event parameter.
     */
    onApprove(e) {
      // Objects for unloading.
      let result = this.get('result');
      let layerSettings = this.get('_layerSettings');
      let readFormat = this.get('_format');
      let crs = this.get('_crs');
      let layer = result.layerModel;
      let type = layer.get('type');
      let req = null;
      let headers = {};

      if (type !== 'odata-vector') {
        let wfsLayer = new L.WFS({
          crs: crs,
          url: layerSettings.url,
          typeNS: layerSettings.typeNS,
          typeName: layerSettings.typeName,
          geometryField: layerSettings.geometryField,
          showExisting: false
        }, readFormat);

        let filters = result.features.map((feature) => new L.Filter.GmlObjectID(feature.id));
        let allfilters = new L.Filter.Or(...filters);
        req = wfsLayer.getFeature(allfilters);
        headers = wfsLayer.options.headers;

      } else {
        let doc = document.implementation.createDocument('', '', null);
        let odataElem = doc.createElement('odata');
        odataElem.setAttribute('outputFormat', this.get('_options.format'));
        let layerElem = doc.createElement("layer");
        layerElem.setAttribute('layerName', result.name);
        let modelName = null;
        $.ajax({
          url: 'assets/flexberry/models/' + layer.get('_leafletObject.modelName') + '.json',
          async: false,
          success: function(data) {
            modelName = data.className;
          }
        });

        layerElem.setAttribute('modelName', modelName);
        layerElem.setAttribute('srsName', crs.code);
        let pkListElem = doc.createElement("pkList");

        result.features.forEach((feature) => {
          let pkElem = doc.createElement('pk');
          pkElem.setAttribute('primarykey', feature.properties.primarykey);
          pkListElem.appendChild(pkElem);
        });

        layerElem.appendChild(pkListElem);
        odataElem.appendChild(layerElem);
        req = odataElem;
      }

      let config = Ember.getOwner(this).resolveRegistration('config:environment');

      this.request({
        url: config.APP.backendUrls.featureExportApi,
        data: L.XmlUtil.serializeXmlDocumentString(req),
        headers: headers || {},
        success: (blob) => {
          let ext = this.get('_fileExt');
          this.downloadBlob(result.name + '.' + ext, blob);
        },
        error: (errorMessage) => {
          console.log('Layer upload error ' + result.name + ': ' + errorMessage);
          alert('When unloading a layer ' + result.name + ' an error occurred.');
        }
      });
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Formats.
    this.set('_availableFormats', Ember.A([
      'JSON',
      'CSV',
      'GML2',
      'GML3',
      'KML',
      'Shape Zip',
      'MIF'
    ]));

    // CRS.
    let factories = this.get('availableCRS');
    let availableCRSNames = [];

    if (!Ember.isNone(factories)) {
      factories.forEach((factory) => {
        availableCRSNames.push(factory.name);
      });
    } else {
      availableCRSNames.push(defaultOptions.coordSystem);
    }

    this.set('availableCRSNames', availableCRSNames);

    this.set('_options', Ember.$.extend(true, {}, defaultOptions));
  },

  /**
   * When the first time show window, then his need to show.
   */
  visibleObserver: Ember.observer('visible', function() {
    let visible = this.get('visible');

    if (visible) {
      this.set('_dialogRequested', true);
    }
  }),

  /**
   * Data loading.
   * @param {string} filename File name.
   * @param {Blob} blob Data array.
   */
  downloadBlob(filename, blob) {
    let element = document.createElement('a');

    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  },

  /**
   * Data request.
   * @param {object} options Download settings.
   */
  request(options) {
    // Default settings.
    options = L.extend({
      async: true,
      method: 'POST',
      data: '',
      params: {},
      headers: {},
      url: '',
      success: function (data) {
        console.log(data);
      },
      error: function (data) {
        console.log('Ajax request fail');
        console.log(data);
      },
      complete: function () {
      }
    }, options);

    Ember.$.ajax({
      async: options.async,
      method: options.method,
      url: options.url + L.Util.getParamString(options.params, options.url),
      data: options.data,
      contentType: 'text/xml',
      headers: options.headers,
      dataType: 'blob',
      success: function(blob) {
        options.success(blob);
      },
      error: function(data) {
        options.error(data);
      },
    });
  },
});

export default FeatureExportDialogComponent;

