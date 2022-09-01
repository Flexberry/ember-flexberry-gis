import Ember from 'ember';
import layout from '../templates/components/flexberry-identify-file';
import MapModelApiExpansionMixin from '../mixins/flexberry-map-model-api-expansion';
import { getLeafletCrs } from '../utils/leaflet-crs';
export default Ember.Component.extend(MapModelApiExpansionMixin, {
  layout,
  mapApi: Ember.inject.service(),
  serviceLayer: null,
  layer: null,
  systemCoordinats: ['EPSG:32640', 'EPSG:3857', 'EPSG:4326', 'EPSG:59001', 'EPSG:59002', 'EPSG:59003'],
  coordinate: 'EPSG:32640',
  stringFiles: '',
 
  _type(type) {
    switch (type) {
      case 'urn:ogc:def:crs:EPSG::32640':
        return 'EPSG:32640';

      default:
        return type;
    }
  },

  renderLayer(response) {
    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }
    
    const serviceLayer = this.get('serviceLayer');

    let crs = getLeafletCrs('{ "code": "' + this._type(response.crs.properties.name) + '", "definition": "" }', this);
    let coordsToLatLng = function (coords) {
      return crs.unproject(L.point(coords));
    };

    let mapModel = this.get('mapApi').getFromApi('mapModel');
    response.features.forEach(element => {
      element.crs = response.crs;
    });

    let multiFeature = mapModel.createMulti(response.features, true);
    if (response.type === 'FeatureCollection') {
      let leafletLayer = L.geoJSON(multiFeature, {
        coordsToLatLng: coordsToLatLng.bind(this), style: {
          color: '#0061D9',
        }
      }).getLayers();
      this.set('layer', leafletLayer[0])
      serviceLayer.addLayer(leafletLayer[0]);
    }
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

    identification() {
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
        this.renderLayer(response);
      }).fail(() => {
      }).always(() => {
      });
    }
  },

  init(){
    this._super(...arguments);
    const serviceLayer = this.get('mapApi').getFromApi('serviceLayer');
    this.set('serviceLayer', serviceLayer);
  },

  willDestroyElement() {
    this._super(...arguments);
    const serviceLayer = this.get('serviceLayer');
    serviceLayer.removeLayer(this.get('layer'));
  }
});
