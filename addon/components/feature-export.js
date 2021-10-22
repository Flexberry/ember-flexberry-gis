import $ from 'jquery';
import { isNone } from '@ember/utils';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { computed, observer } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/feature-export';
import { downloadFile, downloadBlob } from '../utils/download-file';
import { getCrsByName } from '../utils/get-crs-by-name';

import {
  translationMacro as t
} from 'ember-i18n';

/**
 * Default seettings.
 */
const defaultOptions = {
  format: 'JSON',
  coordSystem: 'EPSG:4326'
};

/**
 * Export dialog of map feaure to file.
 */
let FeatureExportDialogComponent = Component.extend({
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
   * All availble crs name.
   */
  _allCRSNames: null,

  /**
   * Request dialog to show.
   */
  _dialogRequested: false,

  /**
   * Current crs.
   */
  _crs: computed('_options.coordSystem', function() {
    let _options = this.get('_options');
    let factories = this.get('availableCRS');

    return factories.filter((factory) => factory.name === _options.coordSystem)[0];
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
  _GPXFormat: observer('result', function() {
    let result = this.get('result');
    let layer = result.layerModel;
    let type = layer.get('settingsAsObject.typeGeometry');
    let formats = this.get('_availableFormats');
    if (type === 'polyline' || type === 'marker') {
      formats.push('GPX');
      this.set('_availableFormats', formats);
    } else {
      let ind = formats.indexOf('GPX');
      if (ind !== -1) {
        formats.splice(ind);
        this.set('_availableFormats', formats);
      }
    }
  }),

  /**
   * Filter crs for difference formats
   */
  _filterCRS: observer('_options.format', function() {
    let selectedFormat = this.get('_options.format');
    if (selectedFormat === 'KML') {
      let crs4326Names = [];
      crs4326Names.push(defaultOptions.coordSystem);
      this.set('_crs4326Names', crs4326Names);
      this.set('availableCRSNames', this.get('_crs4326Names'));
      this.set('_options.coordSystem', defaultOptions.coordSystem);
    } else {
      this.set('availableCRSNames', this.get('_allCRSNames'));
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
      let layer = result.layerModel;
      let outputFormat = this.get('_options.format');
      let crsOuput = this.get('_crs');
      let crsLayer = getCrsByName(JSON.parse(layer.get('coordinateReferenceSystem')).code, this);
      let type = layer.get('type');
      let objectIds = result.features.map((feature) => {
        if (type !== 'odata-vector') {
          return feature.id;
        } else {
          return feature.properties.primarykey;
        }
      });

      let config = getOwner(this).resolveRegistration('config:environment');
      let url = config.APP.backendUrls.featureExportApi;
      let headers = {};

      this._requestDownloadFile(layer, objectIds, outputFormat, crsOuput, crsLayer, url, headers);
    }
  },

  _requestDownloadFile(layer, objectIds, outputFormat, crsOuput, crsLayer, url, headers) {
    downloadFile(layer, objectIds, outputFormat, crsOuput, crsLayer, url, headers)
    .then((res) => {
      downloadBlob(res.fileName, res.blob);
    })
    .catch((errorMessage) => {
      console.error('Layer upload error ' + layer.get('name') + ': ' + errorMessage);
      alert('When unloading a layer ' + layer.get('name') + ' an error occurred.');
    });
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Formats.
    this.set('_availableFormats', A([
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

    if (!isNone(factories)) {
      factories.forEach((factory) => {
        availableCRSNames.push(factory.name);
      });
    } else {
      availableCRSNames.push(defaultOptions.coordSystem);
    }

    this.set('availableCRSNames', availableCRSNames);
    this.set('_allCRSNames', availableCRSNames);
    this.set('_options', $.extend(true, {}, defaultOptions));
  },

  /**
   * When the first time show window, then his need to show.
   */
  visibleObserver: observer('visible', function() {
    let visible = this.get('visible');

    if (visible) {
      this.set('_options', $.extend(true, {}, defaultOptions));
      this.set('_dialogRequested', true);
    }
  })
});

export default FeatureExportDialogComponent;

