import Ember from 'ember';
import layout from '../templates/components/layer-export';

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
    'Shape Zip': 'Shape Zip',
    MIF: 'MIF',
  },

  noGeometryFormats: {
    Excel: 'Excel (без геометрии)',
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

  init() {
    this._super(...arguments);

    const layer = this.get('layer');

    if (layer) {
      this.set('selectedCRS', layer.get('crs.code'));
    }
  },

  actions: {
    onApprove() {
      const type = this.get('layer.type');
      let settings = this.get('layer.settingsAsObject');

      if (type === 'wms-wfs') {
        settings = settings.wfs;
      }

      const data = {
        OutputFormat: this.get('format'),
        LayerName: `${settings.typeNS}:${settings.typeName}`,
        TargetSrs: this.get('selectedCRS'),
        //SourceConnectionString: this.layer.get('settingsAsObject.url'),
        AdditionalArguments: '-limit 5 --config GDAL_HTTP_UNSAFESSL YES --config GDAL_HTTP_VERIFYSSL NO',
        //geometryField: this.layer.get('settingsAsObject.geometryField'),
      };

      Ember.$.ajax({
        url: `${config.APP.backendUrls.layerExportApi}`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
      })
        .done((response) => {
          if (response) {
            console.log(response);
          }
        })
        .fail(() => {
          this.get('modalMessage').showModal({
            title: 'Внимание',
            text: `Слой не удалось выгрузить по техническим причинам. Попробуйте еще раз позднее. Если проблема повторится, обратитесь в техподдержку`,
            autoClose: false,
            modalIconClass: 'icon-guideline-circle-info red',
          });
        });
    },

    onTypeChange(newValue) {
      if (newValue === 'withoutGeometry') {
        this.set('format', 'Excel');
        this.set('selectedCRS', null);
      }

      if (newValue === 'withGeometry') {
        this.set('format', 'JSON');
        this.set('selectedCRS', 'EPSG:3857');
      }
    },

    // this.get('modalMessage').showModal({
    //   title: 'Внимание',
    //   text: `Слой не удалось выгрузить по техническим причинам. Попробуйте еще раз позднее. Если проблема повторится, обратитесь в техподдержку`,
    //   autoClose: false,
    //   modalIconClass: 'icon-guideline-circle-info red',
    // });

    // this.get('modalMessage').showModal({
    //   title: '',
    //   text: `Экспорт данных запущен`,
    //   modalIconClass: 'icon-guideline-circle-more orange',
    //   autoClose: false,
    // });

    // this.get('modalMessage').showModal({
    //   title: '',
    //   modalIconClass: 'icon-guideline-circle-check green',
    //   text: `Экспорт данных успешно завершён`,
    //   autoClose: false,
    // });
  },
});
