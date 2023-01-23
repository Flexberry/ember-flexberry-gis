import Ember from 'ember';
import layout from '../templates/components/flexberry-identify-file';
import MapModelApiExpansionMixin from '../mixins/flexberry-map-model-api-expansion';
import { getLeafletCrs } from '../utils/leaflet-crs';
import { translationMacro as t } from 'ember-i18n';
import { availableCoordinateReferenceSystemsCodesWithCaptions } from '../utils/available-coordinate-reference-systems-for-dropdown';

export default Ember.Component.extend(MapModelApiExpansionMixin, {
  layout,
  mapApi: Ember.inject.service(),
  fileName: '',
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

  importErrorCaption: t('components.geometry-add-modes.import.import-error.caption'),

  importErrorMessage: t('components.geometry-add-modes.import.import-error.message'),

  emptyErrorCaption: t('components.geometry-add-modes.import.empty-error.caption'),

  emptyErrorMessage: t('components.geometry-add-modes.import.empty-error.message'),

  didInsertElement() {
    this._super(...arguments);
    this.set('systemCoordinates', this.get('systemCoordinates') || availableCoordinateReferenceSystemsCodesWithCaptions(this));
    this.set('coordinate', this.get('coordinate') || this.get('i18n').t('components.geometry-add-modes.import.coordinates-auto').string);
  },

  getCoordinate() {
    return Object.keys(this.get('systemCoordinates')).find(key => this.get(`systemCoordinates.${key}`) === this.get('coordinate'));
  },

  setCoordinate(name) {
    let key = Object.keys(this.get('systemCoordinates')).find(key => key === name);
    this.set('coordinate', this.systemCoordinates[key]);
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

    let multiFeature = this.createMulti(response.features, true);
    let leafletLayer = L.geoJSON(multiFeature, {
      coordsToLatLng: coordsToLatLng.bind(this), style: {
        color: this.get('layerColor'),
      }
    }).getLayers();

    return leafletLayer[0];
  },

  createLayer(response) {
    let crs = getLeafletCrs('{ "code": "' + this.getCoordinate() + '", "definition": "" }', this);
    return this._createLayer(response, crs);
  },

  validateFileAndGetFeatures() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.$('input[type="file"]');
      let file = this.$('input[type="file"]')[0].files[0];
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let url = `${config.APP.backendUrls.geomFileValidationUrl}?FileName=${file.name}`;
      let data = new FormData();
      data.append(file.name, file);
      data.append('crs', this.getCoordinate());

      Ember.$.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false
      }).done((response) => {
        this.set('_showError', false);
        if (response && response.features) {
          this.setCoordinate(response.definedCrs);
          resolve(response);
        } else {
          reject({
            caption: this.get('emptyErrorCaption'),
            message: this.get('emptyErrorMessage')
          });
        }
      }).fail((e) => {
        let errorMessage = e.responseText || this.get('importErrorMessage');
        reject({
          caption: this.get('importErrorCaption'),
          message: errorMessage
        });
      });
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
          caption: this.get('importErrorCaption'),
          message: errorMessage
        });
      });
    });
  },

  showError(error) {
    this.set('_errorCaption', error.caption);
    this.set('_errorMessage', error.message);
    this.set('_showError', true);
  },

  actions: {
    setFiles(e) {
      this.$(e.target).blur();
      this.$('input[type="file"]').click();
    },

    uploadFile(e) {
      this.set('fileName', e.target.files[0] ? e.target.files[0].name : '');
    },

    showFileLayer() {
      this.validateFileAndGetFeatures()
      .then((response) => {
        let layer = this.createLayer(response);
        this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:render', { layer });
      }, (error) => this.showError(error));
    },

    identificationFile() {
      this.validateFileAndGetFeatures()
      .then((response) => {
        let layer = this.createLayer(response);
        this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:render', { layer });
        this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:identification', { layer });
      }, (error) => this.showError(error));
    },

    createLayerByFile() {
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      this.validateFileAndGetFeatures().then(() => {
        this.sendFileToCache().then((response) => {
          let url = `${config.APP.createLayerFormUrl}?cacheFileId=${response.id}&crs=${this.getCoordinate()}`;
          window.open(url, '_blank').focus();
        }, (error) => this.showError(error));
      }, (error) => this.showError(error));
    }
  }
});
