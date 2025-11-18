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

  class: 'layer-export-dialog',

  layer: null,

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
    GPX: 'GPX',
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
    'ESRI Shapefile': 'shp',
    'MapInfo File': 'mif',
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

  intervalID: null,
  intervalTime: 1000,

  init() {
    this._super(...arguments);

    const layer = this.get('layer');
    const crs = layer.get('crs.code');

    this.set('selectedCRS', crs);
  },

  start(param) {
    Ember.$.ajax({
      url: `${config.APP.backendUrls.exportApi}`,
      type: 'POST',
      data: JSON.stringify(param),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
    })
      .done((response) => {
        const exportID = response;
        const intervalID = setInterval(() => this.poll(exportID), this.get('intervalTime'));
        this.set('intervalID', intervalID);
        this.send('onExecute');
      })
      .fail((error) => {
        console.error({
          url: config.APP.backendUrls.exportApi,
          message: error.message,
          error,
        });

        this.send('onError');
      });
  },

  poll(exportID) {
    const intervalID = this.get('intervalID');

    Ember.$.ajax({
      url: `${config.APP.backendUrls.exportApi}/${exportID}/status`,
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
        if (response.status === ExportStatus.FAILED || response.status === ExportStatus.CANCELLED || response.status === ExportStatus.TIMEDOUT) {
          console.error({ message: response.errorMessage || 'Unexpected export polling error', response: response });
          clearInterval(intervalID);
          this.send('onError');
          return;
        }

        // Успешное завершение
        if (response.status === ExportStatus.COMPLETED) {
          this.download(exportID);
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
  },

  download(exportID) {
    Ember.$.ajax({
      url: `${config.APP.backendUrls.exportApi}/${exportID}/file`,
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
      let settings = this.get('layer.settingsAsObject');

      if (this.get('layer.type') === 'wms-wfs') {
        settings = settings.wfs;
      }

      const data = {
        OutputFormat: this.get('format'),
        LayerName: `${settings.typeNS}:${settings.typeName}`,
        SourceSrs: this.get('selectedCRS') ? this.get('layer.crs.code') : null,
        TargetSrs: this.get('selectedCRS'),
        LayerType: this.get('layer.type'),
        AdditionalArguments: ` -unsetFid -noNativeData -nomd --config GDAL_HTTP_UNSAFESSL YES --config GDAL_HTTP_VERIFYSSL NO -dsco FORMAT=GML3 -oo EXPOSE_GML_ID=NO`,
        //geometryField: this.layer.get('settingsAsObject.geometryField'),
      };

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
