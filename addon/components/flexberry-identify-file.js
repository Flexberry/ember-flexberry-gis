import Ember from 'ember';
import layout from '../templates/components/flexberry-identify-file';
import CheckFileMixin from '../mixins/flexberry-check-file';
import { availableCoordinateReferenceSystemsCodesWithCaptions } from '../utils/available-coordinate-reference-systems-for-dropdown';

export default Ember.Component.extend(CheckFileMixin, {
  layout,
  mapApi: Ember.inject.service(),

  filePreview: false,
  systemCoordinates: null,

  /**
    Geometry field for csv/xls.

    @property geometryField1
    @type String
    @default null
  */
  geometryField1: null,

  /**
    Geometry field for csv/xls.

    @property geometryField2
    @type String
    @default null
  */
  geometryField2: null,

  needGeometryFieldName: false,

  importErrorMessage: 'Загруженный файл не соответствует требованиям: ',

  emptyErrorMessage: 'Файл не содержит геометрических объектов',

  badFileMessage: 'Сервер недоступен или импортируемый файл некорректен',

  emptyHeaderErrorMessage: 'Файл не содержит заголовков',

  typeGeometryErrorMessage: 'Указанный тип геометрии противоречит объектам в файле',

  warningMessageSRS: 'Укажите верную систему координат, указанную в загружаемом файле. ' +
  'При выборе ошибочной системы координат слой может некорректно отображаться на карте',

  warningMessageEmptyGeometry: 'В файле обнаружены объекты без геометрии. Дальнейшая загрузка будет осуществлена без них',

  emptyGeometryField: 'Укажите название поля с геометрией в файле (WKT/X,Y)',

  /**
   * We need to differentiate events from different instances, because we don't turn off event subscriptions
   *
  */
  suffix: Ember.computed('geomOnly', function () {
    let geomOnly = this.get('geomOnly');
    return geomOnly ? '-geom' : '';
  }),

  init() {
    this._super(...arguments);
    this.set('_geometryTypes', ['point','polyline','polygon']);
  },

  didInsertElement() {
    this._super(...arguments);

    this.set('systemCoordinates', this.get('systemCoordinates') || availableCoordinateReferenceSystemsCodesWithCaptions(this));
    this.set('coordinate', 'auto');

    this.send('clearFile');
  },

  willDestroyElement() {
    this._super(...arguments);
    this.clearAjax();
    this.set('coordinate', null);
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

  /**
    Observer that checks filling in the required fields.

    @method fieldsSet
  */
  fieldsSet: Ember.observer('file', 'needGeometryFieldName', 'geometryField1', 'geometryField2', function() {
    let file = this.get('file');
    if (this.get('needGeometryFieldName') && !Ember.isNone(file)) {
      let geometryField1 = this.get('geometryField1');
      let geometryField2 = this.get('geometryField2');
      let geometryFieldFile = Ember.isNone(geometryField1) ? '' : geometryField1 + (!Ember.isNone(geometryField2) ? ',' + geometryField2 : '');
      this.set('geometryFieldFile', geometryFieldFile);
    } else {
      this.set('geometryFieldFile', null);
    }
  }),

  /**
    Get headers fields from csv or xls file.

    @method getFieldsFromCsv
  */
  getFieldsFromCsv() {
    this.set('_showError', false);
    let config = Ember.getOwner(this).resolveRegistration('config:environment');
    let data = new FormData();
    let file = this.get('file');
    if (!Ember.isNone(file)) {
      data.append(file.name, file);
      Ember.$.ajax({
        url: `${config.APP.backendUrls.getFieldsUrl}`,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
      }).done((response) => {
        if (response && response.length) {
          const items = response.split(',');
          this.set('_availableFields', Ember.A(items));
          this.set('needGeometryFieldName', true);
        } else {
          this.set('_errorMessage', this.get('importErrorMessage') + this.get('emptyHeaderErrorMessage'));
          this.set('_showError', true);
          this.set('needGeometryFieldName', false);
          this.set('needGeometryType', false);
        }
      }).fail(() => {
        let message = this.get('badFileMessage');
        this.set('_errorMessage', this.get('importErrorMessage') + message);
        this.set('_showError', true);
        this.set('needGeometryFieldName', false);
        this.set('needGeometryType', false);
      });
    }
  },

  actions: {
    onCoordinateChange() {
      this.set('_showError', false);
      this.clearAjax();
    },

    clearFile() {
      this.set('file', null);
      this.set('coordinate', 'auto');
      this.set('needGeometryFieldName', false);
      this.set('needGeometryType', false);
      this.set('geometryField1', null);
      this.set('geometryField2', null);
      this.set('geometryFieldFile', null);
      this.set('_showError', false);
      this.set('_errorMessage', '');

      this.clearAjax();
      if (this.get('filePreview')) {
        this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:clear`);
        this.set('filePreview', false);
      }

      this.$('#' + this.get('idfile')).val('');
      this.$('.ui.button.upload').removeClass('hidden');
      this.$('.ui.button.remove').addClass('hidden');
    },

    clickFile(e) {
      let file = e.target.files[0];
      let fileName = file.name;
      let ext = fileName.substring(fileName.indexOf('.'), fileName.length);
      this.set('file', file);

      if (ext.toLowerCase() === '.csv' || ext.toLowerCase() === '.xls' || ext.toLowerCase() === '.xlsx') {
        this.set('needGeometryFieldName', true);
        this.getFieldsFromCsv();
        this.set('warningMessage', this.get('warningMessageSRS'));
      }

      if (ext.toLowerCase() === '.gpx') {
        this.set('needGeometryType', true);
      }

      this.clearAjax();
      this.$('.ui.button.upload').addClass('hidden');
      this.$('.ui.button.remove').removeClass('hidden');
    },

    showFileLayer() {
      if (this.get('filePreview')) {
        this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:clear`);
        this.set('filePreview', !this.get('filePreview'));
      } else {
        this.validateFileAndGetFeatures().then((response) => {
          if (response) {
            let layer = this.createLayer(response);
            if (layer) {
              this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:render`, { layer });
              this.set('filePreview', !this.get('filePreview'));
            }
          }
        }, (error) => this.showError(error));
      }
    },

    identificationFile() {
      if (this.get('needGeometryFieldName') && Ember.isEmpty(this.get('geometryFieldFile'))) {
        this.set('_errorMessage', this.get('emptyGeometryField'));
        this.set('_showError', true);
      } else {
        this.validateFileAndGetFeatures().then((response) => {
          if (response) {
            let layer = this.createLayer(response);
            if (layer) {
              let leafletMap = this.get('mapApi').getFromApi('leafletMap');
              leafletMap.fire(`flexberry-map-loadfile${this.get('suffix')}:identification`, { layer, geometryType: this.get('geometryType') });
            }
          }
        }, (error) => this.showError(error));
      }
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
