import $ from 'jquery';
import { isNone } from '@ember/utils';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { computed, observer } from '@ember/object';
import Component from '@ember/component';
import {
  translationMacro as t
} from 'ember-i18n';
import layout from '../templates/components/feature-export';
import { downloadFile, downloadBlob } from '../utils/download-file';
import { getCrsByName } from '../utils/get-crs-by-name';


/**
 * Default seettings.
 */
const defaultOptions = {
  format: 'JSON',
  coordSystem: 'EPSG:4326',
};

/**
 * Export dialog of map feaure to file.
 */
const FeatureExportDialogComponent = Component.extend({
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
  _crs: computed('_options.coordSystem', function () {
    const _options = this.get('_options');
    const factories = this.get('availableCRS');

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
  _GPXFormat: observer('result', function () {
    const result = this.get('result');
    const layer = result.layerModel;
    const type = layer.get('settingsAsObject.typeGeometry');
    const formats = this.get('_availableFormats');
    if (type === 'polyline' || type === 'marker') {
      formats.push('GPX');
      this.set('_availableFormats', formats);
    } else {
      const ind = formats.indexOf('GPX');
      if (ind !== -1) {
        formats.splice(ind);
        this.set('_availableFormats', formats);
      }
    }
  }),

  /**
   * Filter crs for difference formats
   */
  _filterCRS: observer('_options.format', function () {
    const selectedFormat = this.get('_options.format');
    if (selectedFormat === 'KML') {
      const crs4326Names = [];
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
      const result = this.get('result');
      const layer = result.layerModel;
      const outputFormat = this.get('_options.format');
      const crsOuput = this.get('_crs');
      const crsLayer = getCrsByName(JSON.parse(layer.get('coordinateReferenceSystem')).code, this);
      const type = layer.get('type');
      const objectIds = result.features.map((feature) => {
        if (type !== 'odata-vector') {
          return feature.id;
        }

        return feature.properties.primarykey;
      });

      const config = getOwner(this).resolveRegistration('config:environment');
      const url = config.APP.backendUrls.featureExportApi;
      const headers = {};

      this._requestDownloadFile(layer, objectIds, outputFormat, crsOuput, crsLayer, url, headers);
    },
  },

  _requestDownloadFile(layer, objectIds, outputFormat, crsOuput, crsLayer, url, headers) {
    downloadFile(layer, objectIds, outputFormat, crsOuput, crsLayer, url, headers)
      .then((res) => {
        downloadBlob(res.fileName, res.blob);
      })
      .catch((errorMessage) => {
        console.error(`Layer upload error ${layer.get('name')}: ${errorMessage}`);
        alert(`When unloading a layer ${layer.get('name')} an error occurred.`);
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
    const factories = this.get('availableCRS');
    const availableCRSNames = [];

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
  visibleObserver: observer('visible', function () {
    const visible = this.get('visible');

    if (visible) {
      this.set('_options', $.extend(true, {}, defaultOptions));
      this.set('_dialogRequested', true);
    }
  }),
});

export default FeatureExportDialogComponent;
