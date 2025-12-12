import Ember from 'ember';
import layout from '../templates/components/layer-export';
import { downloadBlob } from '../utils/download-file';

const ExportStatus = {
  PENDING: 0,
  RUNNING: 1,
  COMPLETED: 2,
  FAILED: 3,
  CANCELLED: 4,
  TIMEDOUT: 5,
};

export default Ember.Component.extend({
  layout,

  visible: false,

  modalMessage: Ember.inject.service(),
  i18n: Ember.inject.service(),

  store: Ember.inject.service(),

  session: Ember.inject.service('session'),

  class: 'layer-export-dialog',

  layer: null,
  filter: null,
  count: 0,

  types: {
    withoutGeometry: 'Без геометрии',
    withGeometry: 'С геометрией',
  },

  type: 'withGeometry',

  formats: Ember.computed('type', function () {
    return this.type === 'withGeometry' ? this.get('geometryFormats') : this.get('noGeometryFormats');
  }),

  geometryFormats: {
    GeoJSON: 'JSON',
    CSV: 'CSV',
    GML2: 'GML2',
    GML3: 'GML3',
    KML: 'KML',
    'ESRI Shapefile': 'Shape Zip',
    'MapInfo File': 'MIF',
  },

  noGeometryFormats: {
    XLSX: 'Excel (без геометрии)',
  },

  fileExtensions: {
    GeoJSON: 'geojson',
    CSV: 'csv',
    GML2: 'gml',
    GML3: 'gml',
    KML: 'kml',
    'ESRI Shapefile': 'zip',
    'MapInfo File': 'zip',
    GPX: 'gpx',
    XLSX: 'xlsx',
  },

  format: 'GeoJSON',

  CRS: {
    'EPSG:3857': 'WGS 84 / Pseudo-Mercator (EPSG:3857)',
    'EPSG:4326': 'WGS 84 (EPSG:4326)',
    'EPSG:32640': 'WGS 84 / UTM zone 40N (EPSG:32640)',
    'EPSG:59001': 'МСК-59 зона 1 (EPSG:59001)',
    'EPSG:59002': 'МСК-59 зона 2 (EPSG:59002)',
    'EPSG:59003': 'МСК-59 зона 3 (EPSG:59003)',
    'EPSG:200001': 'МСК-2 зона 1 (EPSG:200001)',
    'EPSG:200002': 'МСК-2 зона 2 (EPSG:200002)',
    'EPSG:11004': 'МСК-11 зона 4 (EPSG:11004)',
    'EPSG:11005': 'МСК-11 зона 5 (EPSG:11005)',
    'EPSG:18002': 'МСК-18 зона 2 (EPSG:18002)',
    'EPSG:43003': 'МСК-43 зона 3 (EPSG:43003)',
    'EPSG:66001': 'МСК-66 зона 1 (EPSG:66001)',
  },

  selectedCRS: 'EPSG:4326',

  intervalTime: 2000,

  init() {
    this._super(...arguments);

    const layer = this.get('layer');
    const crs = layer.get('crs.code');

    this.set('selectedCRS', crs);

    const settings = this.get('layer.settingsAsObject') || {};

    // GPX format only polyline and marker
    if (settings.typeGeometry === 'polyline' || settings.typeGeometry === 'marker') {
      this.geometryFormats['GPX'] = 'GPX';
    }
  },

  getExportApiURL(param, config) {
    let exportApiUrl = config.APP.backendUrls.exportApi;

    if (this.get('layer.type') === 'odata-vector') {
      const url = new URL(exportApiUrl);

      // Изменяем путь, добавляя нужный сегмент перед '/api/exports'
      exportApiUrl = param.odataUrl.replace('/odata', '') + url.pathname;
    }

    return exportApiUrl;
  },

  getHeader() {
    let result = {};
    const locale = this.get('i18n.locale');
    const getAttributesOptions = this.get('layer._attributesOptions');
    const fields = this.get('layer._leafletObject.readFormat.featureType.fields');

    if (Ember.isNone(getAttributesOptions)) {
      return null;
    }

    return getAttributesOptions().then(({ object, settings }) => {
      const localizedProperties = Ember.get(settings, `localizedProperties.${locale}`) || {};
      let excludedProperties = Ember.get(settings, `excludedProperties`);
      excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();

      for (let propertyName in fields) {
        if (excludedProperties.contains(propertyName)) {
          continue;
        }

        let propertyCaption = Ember.get(localizedProperties, propertyName);

        result[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
      }

      return result;
    });
  },

  start(param) {
    const config = Ember.getOwner(this).resolveRegistration('config:environment');
    const exportApiUrl = this.getExportApiURL(param, config);
    const accessToken = this.get('session.data.authenticated.access_token');
    const headers = { Authorization: `Bearer ${accessToken}` };
    let intervalID = null;

    const poll = (exportID) => {
      Ember.$.ajax({
        url: `${exportApiUrl}/${exportID}/status`,
        type: 'GET',
        cache: false,
        dataType: 'json',
      })
        .done((response) => {
          if (!response) {
            console.error({ message: 'No response' });
            clearInterval(intervalID);
            this.send('onError');
            return;
          }

          // TODO: errorMessage может появиться для статуса ExportStatus.running - исправить
          if (
            response.status === ExportStatus.FAILED ||
            response.status === ExportStatus.CANCELLED ||
            response.status === ExportStatus.TIMEDOUT ||
            response.errorMessage
          ) {
            console.error({ message: response.errorMessage || 'Unexpected export polling error', response: response });
            clearInterval(intervalID);
            this.send('onError');
            return;
          }

          // Успешное завершение
          if (response.status === ExportStatus.COMPLETED) {
            this.download(exportApiUrl, exportID);
            clearInterval(intervalID);
            return;
          }

          // Продолжаем опрашивать статус
        })
        .fail((e) => {
          console.error(e);
          clearInterval(intervalID);
          this.send('onError');
        });
    };

    if (this.get('layer.type') === 'odata-vector') {
      const adapter = this.get('store').adapterFor('rgispk');
      const odataExportActionUrl = config.APP.backendActions.export;

      adapter.callAction(
        odataExportActionUrl,
        { exportRequest: JSON.stringify(param) },
        param.odataUrl,
        null,
        (response) => {
          intervalID = setInterval(() => poll(response.value), this.get('intervalTime'));
          this.send('onExecute');
        },
        (error) => {
          console.error({
            url: odataExportActionUrl,
            odataUrl: param.odataUrl,
            message: error.message,
            error,
          });

          this.send('onError');
        }
      );
      return;
    }

    Ember.$.ajax({
      url: `${exportApiUrl}`,
      type: 'POST',
      data: JSON.stringify(param),
      dataType: 'json',
      headers: headers,
      contentType: 'application/json; charset=utf-8',
    })
      .done((exportID) => {
        intervalID = setInterval(() => poll(exportID), this.get('intervalTime'));
        this.send('onExecute');
      })
      .fail((error) => {
        console.error({
          url: exportApiUrl,
          message: error.message,
          error,
        });

        this.send('onError');
      });
  },

  download(exportApiUrl, exportID) {
    Ember.$.ajax({
      url: `${exportApiUrl}/${exportID}/file`,
      method: 'GET',
      cache: false,
      xhrFields: {
        responseType: 'blob',
      },

      success: (blob) => {
        const layerName = this.get('layer.name');
        const fileExtension = Ember.get(this.get('fileExtensions'), this.get('format'));
        const fileName = layerName + '.' + fileExtension;

        downloadBlob(fileName, blob);
        this.send('onSuccess');
      },
      error: (error) => {
        console.error({ message: error });
        this.send('onError');
      },
    });
  },

  actions: {
    onApprove() {
      const data = {
        outputFormat: this.get('format'),
        sourceSrs: this.get('selectedCRS') ? this.get('layer.crs.code') : null,
        targetSrs: this.get('selectedCRS'),
      };
      let settings = this.get('layer.settingsAsObject');

      if (this.get('layer.type') === 'odata-vector') {
        Object.assign(data, {
          odataQueryName: settings.odataClass,
          odataProjectionName: settings.projectionName,
          odataUrl: settings.odataUrl,
        });
      } else {
        if (this.get('layer.type') === 'wms-wfs') {
          settings = settings.wfs;
        }

        Object.assign(data, {
          layerNS: settings.typeNS,
          layerName: settings.typeName,
        });
      }

      // Добавляем доп. параметры для сервиса экспорта
      if (data.outputFormat === 'GML2') {
        Object.assign(data, { dsco: { FORMAT: 'GML2' }, outputFormat: 'GML' });
      }

      if (data.outputFormat === 'GML3') {
        Object.assign(data, { dsco: { FORMAT: 'GML3' }, outputFormat: 'GML' });
      }

      if (data.outputFormat === 'XLSX') {
        this.getHeader().then((header) => {
          Object.assign(data, { header: header ? JSON.stringify(header) : null });
          this.start(data);
        });
        return;
      }

      // Приводим время в UTC для отправки на сервер
      const filter = this.get('filter');
      const toUTC = (value) => {
        const condition = value.type;
        const type = value.filterType;

        if (type !== 'date' && type !== 'dateTime') {
          return;
        }

        value.dateFrom = new Date(value.dateFrom).toISOString();

        if (condition === 'inRange') {
          value.dateTo = new Date(value.dateTo).toISOString();
        }
      };
      Object.entries(filter).forEach(([key, value]) => {
        let isMultiFilter = Ember.isPresent(value.conditions) && Ember.isArray(value.conditions);
        if (isMultiFilter) {
          value.conditions.forEach((multiValue) => toUTC(multiValue));
          return;
        }

        toUTC(value);
      });

      Object.assign(data, { filter: !Ember.isNone(filter) && Object.keys(filter).length > 0 ? JSON.stringify(filter) : null });

      this.start(data);
    },

    onTypeChange(newValue) {
      if (newValue === 'withoutGeometry') {
        this.set('format', 'XLSX');
        this.set('selectedCRS', null);
      }

      if (newValue === 'withGeometry') {
        this.set('format', 'JSON');
        this.set('selectedCRS', 'EPSG:3857');
      }
    },

    onError() {
      this.get('modalMessage').showModal({
        title: 'Внимание',
        text: `Слой не удалось выгрузить по техническим причинам. Попробуйте еще раз позднее. Если проблема повторится, обратитесь в техподдержку`,
        autoClose: false,
        modalIconClass: 'icon-guideline-circle-info red',
      });
    },

    onSuccess() {
      this.get('modalMessage').showModal({
        title: '',
        modalIconClass: 'icon-guideline-circle-check green',
        text: `Экспорт данных успешно завершён`,
        autoClose: false,
      });
    },

    onExecute() {
      this.get('modalMessage').showModal({
        title: '',
        text: `Экспорт данных запущен`,
        modalIconClass: 'icon-guideline-circle-more orange',
        autoClose: false,
      });
    },
  },
});
