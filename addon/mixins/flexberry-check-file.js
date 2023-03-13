import Ember from 'ember';
import { getLeafletCrs } from '../utils/leaflet-crs';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Mixin.create({
  mapApi: Ember.inject.service(),

  file: null,
  fileLoadAjax: null,

  _showError: false,
  _errorMessage: undefined,

  coordinate: null,
  geometryType: null,

  importErrorMessage: t('components.geometry-add-modes.import.import-error.message'),
  createLayerErrorMessage: t('components.geometry-add-modes.import.create-layer-error.message'),
  emptyErrorMessage: t('components.geometry-add-modes.import.empty-error.message'),

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

    let multiFeature = this.get('mapApi').getFromApi('mapModel').createMulti(response.features, true, true, true, 10000000000);
    let leafletLayer = L.geoJSON(multiFeature, {
      coordsToLatLng: coordsToLatLng.bind(this), style: {
        color: this.get('layerColor'),
      }
    }).getLayers();

    return leafletLayer[0];
  },

  createLayer(response) {
    let crs = getLeafletCrs('{ "code": "' + this.get('coordinate') + '", "definition": "" }', this);

    let layer = null;

    try {
      layer = this._createLayer(response, crs);
    }
    catch (ex) {
      this.showError({
        message: this.get('createLayerErrorMessage')
      });
    }

    return layer;
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

  clearAjax() {
    let ajax = this.get('fileLoadAjax');
    if (ajax) {
      ajax.abort();

      this.set('fileLoadAjax', null);
    }
  },

  _showHideLoader(show) {
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');

    if (show) {
      leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.file-loading') });
    } else {
      leafletMap.flexberryMap.loader.hide({ content: '' });
    }
  },

  validateFileAndGetFeatures() {
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

      this._showHideLoader(true);

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
          this._showHideLoader(false);
          if (response && response.features) {
            this.set('coordinate', response.definedCrs);
            this.set('geometryType', this.getGeometryType(response.features[0].geometry.type));

            resolve(response);
          } else {
            reject({
              message: this.get('emptyErrorMessage')
            });
          }
        }).fail((e) => {
          this._showHideLoader(false);
          let errorMessage = e.responseText || this.get('importErrorMessage');
          reject({
            message: errorMessage
          });
        }));
    });
  },

  showError(error) {
    if (error) {
      this.set('_errorMessage', error.message);
      this.set('_showError', true);
    }
  }
});

