import Ember from 'ember';
import $ from 'jquery';
import layout from '../templates/components/flexberry-identify-file';
import MapModelApiExpansionMixin from '../mixins/flexberry-map-model-api-expansion';
import { getLeafletCrs } from '../utils/leaflet-crs';
import { translationMacro as t } from 'ember-i18n';
import { availableCoordinateReferenceSystemsCodesWithCaptions } from '../utils/available-coordinate-reference-systems-for-dropdown';

export default Ember.Component.extend(MapModelApiExpansionMixin, {
  layout,
  mapApi: Ember.inject.service(),

  file: null,
  filePreview: false,
  fileLoadAjax: null,

  _showError: false,

  /**
    Current error caption.

    @property _errorCaption
    @type String
    @default undefined
    @private
  */
  _errorCaption: undefined,

  /**
    Current error message.

    @property _errorMessage
    @type String
    @default undefined
    @private
  */
  _errorMessage: undefined,

  systemCoordinates: null,

  coordinate: null,
  geometryType: null,

  importErrorMessage: t('components.geometry-add-modes.import.import-error.message'),

  emptyErrorCaption: t('components.geometry-add-modes.import.empty-error.caption'),

  emptyErrorMessage: t('components.geometry-add-modes.import.empty-error.message'),

  didInsertElement() {
    this._super(...arguments);
    this.set('systemCoordinates', this.get('systemCoordinates') || availableCoordinateReferenceSystemsCodesWithCaptions(this));
    this.set('coordinate', 'auto');
    this.set('filePreview', false);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.clearAjax();
  },

  _createLayer(response, crs) {
    let coordsToLatLng = function (coords) {
      return crs.unproject(L.point(coords));
    };

    response.features.forEach(element => {
      element.crs = {
        properties: {
          name: crs.code
        }
      };
    });

    let multiFeature = this.get('mapApi').getFromApi('mapModel').createMulti(response.features, true);
    let leafletLayer = L.geoJSON(multiFeature, {
      coordsToLatLng: coordsToLatLng.bind(this), style: {
        color: this.get('layerColor'),
      }
    }).getLayers();

    return leafletLayer[0];
  },

  createLayer(response) {
    let crs = getLeafletCrs('{ "code": "' + this.get('coordinate') + '", "definition": "" }', this);
    return this._createLayer(response, crs);
  },

  getGeometryType(type) {
    let geometryType = null;

    switch (type) {
      case 'Point':
        geometryType = 'point';
        break;
      case 'MultiLineString':
      case 'LineString':
        geometryType = 'polyline';
        break;
      case 'MultiPolygon':
      case 'Polygon':
        geometryType = 'polygon';
        break;
    }

    return geometryType;
  },

  validateFileAndGetFeatures() {
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');

    return new Ember.RSVP.Promise((resolve, reject) => {
      let file = this.get('file');
      if (!file) {
        reject();
      }

      let ajax = this.get('fileLoadAjax');
      if (ajax) {
        if (ajax.readyState === 4 && ajax.status === 200) {
          resolve(this.get('fileLoadAjax').responseJSON);
          return;
        }

        // если еще выполняется или успешно выполнен, то не будем ничего запускать
        if (ajax.readyState !== 4) {
          resolve();
          return;
        }
      }

      leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.file-loading') });

      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let url = `${config.APP.backendUrls.geomFileValidationUrl}?FileName=${file.name}`;
      let data = new FormData();
      data.append(file.name, file);
      data.append('crs', this.get('coordinate'));
      this.set('_showError', false);
      this.set('geometryType', null);

      this.set('fileLoadAjax',
        Ember.$.ajax({
          url: url,
          type: 'POST',
          data: data,
          cache: false,
          contentType: false,
          processData: false
        }).done((response) => {
          leafletMap.flexberryMap.loader.hide({ content: '' });
          if (response && response.features) {
            this.set('coordinate', response.definedCrs);
            this.set('geometryType', this.getGeometryType(response.features[0].geometry.type));

            resolve(response);
          } else {
            reject({
              caption: this.get('emptyErrorCaption'),
              message: this.get('emptyErrorMessage')
            });
          }
        }).fail((e) => {
          leafletMap.flexberryMap.loader.hide({ content: '' });
          let errorMessage = e.responseText || this.get('importErrorMessage');
          reject({
            message: errorMessage
          });
        }));
    });
  },

  sendFileToCache() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.$('input[type="file"]');
      let file = this.$('input[type="file"]')[0].files[0];
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let url = config.APP.fileCacheUrl;
      let data = new FormData();
      data.append(file.name, file);

      Ember.$.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false
      }).done((response) => {
        resolve(response);
      }).fail((e) => {
        let errorMessage = e.responseText || this.get('importErrorMessage');
        reject({
          message: errorMessage
        });
      });
    });
  },

  showError(error) {
    if (error) {
      this.set('_errorMessage', error.message);
      this.set('_showError', true);
    }
  },

  clearAjax() {
    let ajax = this.get('fileLoadAjax');
    if (ajax) {
      ajax.abort();

      this.set('fileLoadAjax', null);
    }
  },

  actions: {
    onCoordinateChange() {
      this.set('_showError', false);
      this.clearAjax();
    },

    clearFile() {
      this.set('file', null);
      this.set('_showError', false);

      this.clearAjax();
      if (this.get('filePreview')) {
        this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:clear');
        this.set('filePreview', false);
      }

      $('#fileinput').val('');
      $('.ui.button.upload').removeClass('hidden');
      $('.ui.button.remove').addClass('hidden');
    },

    clickFile(e) {
      let file = e.target.files[0];
      this.set('file', file);
      this.clearAjax();
      $('.ui.button.upload').addClass('hidden');
      $('.ui.button.remove').removeClass('hidden');
    },

    showFileLayer() {
      if (this.get('filePreview')) {
        this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:clear');
      } else {
        this.validateFileAndGetFeatures().then((response) => {
          if (response) {
            let layer = this.createLayer(response);
            this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:render', { layer });
          }
        }, (error) => this.showError(error));
      }

      this.set('filePreview', !this.get('filePreview'));
    },

    identificationFile() {
      this.validateFileAndGetFeatures().then((response) => {
        if (response) {
          let layer = this.createLayer(response);
          this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:identification', { layer });
        }
      }, (error) => this.showError(error));
    },

    createLayerByFile() {
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      this.validateFileAndGetFeatures().then(() => {
        this.sendFileToCache().then((response) => {
          let url = `${config.APP.createLayerFormUrl}?cacheFileId=${response.id}&crs=${this.get('coordinate')}&geometryType=${this.get('geometryType')}`;
          window.open(url, '_blank').focus();
        }, (error) => this.showError(error));
      }, (error) => this.showError(error));
    }
  }
});
