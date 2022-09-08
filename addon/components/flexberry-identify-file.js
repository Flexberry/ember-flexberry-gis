import Ember from 'ember';
import layout from '../templates/components/flexberry-identify-file';
import MapModelApiExpansionMixin from '../mixins/flexberry-map-model-api-expansion';
import { getLeafletCrs } from '../utils/leaflet-crs';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend(MapModelApiExpansionMixin, {
  layout,
  mapApi: Ember.inject.service(),
  stringFiles: '',
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

  systemCoordinats: {
    'EPSG:3857': 'WGS 84 / Pseudo-Mercator (EPSG:3857)',
    'EPSG:4326': 'WGS 84 (EPSG:4326)',
    'EPSG:32640': 'WGS 84 / UTM zone 40N (EPSG:32640)',
    'EPSG:59001': 'МСК-59 зона 1 (EPSG:59001)',
    'EPSG:59002': 'МСК-59 зона 2 (EPSG:59002)',
    'EPSG:59003': 'МСК-59 зона 3 (EPSG:59003)'
  },

  coordinate: 'WGS 84 / UTM zone 40N (EPSG:32640)',

  importErrorCaption: t('components.geometry-add-modes.import.import-error.caption'),

  importErrorMessage: t('components.geometry-add-modes.import.import-error.message'),

  emptyErrorCaption: t('components.geometry-add-modes.import.empty-error.caption'),

  emptyErrorMessage: t('components.geometry-add-modes.import.empty-error.message'),

  getCoordinate() {
    return Object.keys(this.systemCoordinats).find(key => this.systemCoordinats[key] === this.coordinate);
  },

  createLayer(response) {
    let crs = getLeafletCrs('{ "code": "' + this.getCoordinate() + '", "definition": "" }', this);
    let coordsToLatLng = function (coords) {
      return crs.unproject(L.point(coords));
    };

    let mapModel = this.get('mapApi').getFromApi('mapModel');
    response.features.forEach(element => {
      element.crs = response.crs;
    });

    let multiFeature = mapModel.createMulti(response.features, true);
    let leafletLayer = L.geoJSON(multiFeature, {
      coordsToLatLng: coordsToLatLng.bind(this), style: {
        color: '#0061D9',
      }
    }).getLayers();

    return leafletLayer[0];
  },

  actions: {
    setFiles(e) {
      this.$(e.target).blur();
      this.$('input[type="file"]').click();
    },

    uploadFile(e) {
      let stringFiles = '';
      for (let i = 0; i < e.target.files.length; i++) {
        stringFiles = stringFiles + e.target.files[i].name;
      }
      this.set('stringFiles', stringFiles);
    },

    showFileLayer() {
      this.$('input[type="file"]');
      let file = this.$('input[type="file"]')[0].files[0];
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let data = new FormData();
      data.append(file.name, file);

      Ember.$.ajax({
        url: `${config.APP.backendUrl}/controls/FileUploaderHandler.ashx?FileName=${file.name}`,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false
      }).done((response) => {
        if (response && response.features) {
          this.set('_showError', false);
          let layer = this.createLayer(response);
          this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:render', { layer });
        } else {
          this.set('_errorCaption', this.get('emptyErrorCaption'));
          this.set('_errorMessage', this.get('emptyErrorMessage'));
          this.set('_showError', true);
        }
      }).fail(() => {
        this.set('_errorCaption', this.get('importErrorCaption'));
        this.set('_errorMessage', this.get('importErrorMessage'));
        this.set('_showError', true);
      })
    },

    identificationFile() {
      this.$('input[type="file"]');
      let file = this.$('input[type="file"]')[0].files[0];
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let data = new FormData();
      data.append(file.name, file);

      Ember.$.ajax({
        url: `${config.APP.backendUrl}/controls/FileUploaderHandler.ashx?FileName=${file.name}`,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false
      }).done((response) => {
        if (response && response.features) {
          this.set('_showError', false);
          let layer = this.createLayer(response);
          this.get('mapApi').getFromApi('leafletMap').fire('flexberry-map-loadfile:identification', { layer });
        } else {
          this.set('_errorCaption', this.get('emptyErrorCaption'));
          this.set('_errorMessage', this.get('emptyErrorMessage'));
          this.set('_showError', true);
        }
      }).fail(() => {
        this.set('_errorCaption', this.get('importErrorCaption'));
        this.set('_errorMessage', this.get('importErrorMessage'));
        this.set('_showError', true);
      })
    }
  }
});
