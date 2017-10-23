import Ember from 'ember';
import layout from '../../templates/components/charts/index-chart';

export default Ember.Component.extend({

  _captionChart: 'Test chart',

  _availableTypes: null,

  _selectedModeType: 'pie',

  _geoJsonData: {
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "id":"1", "properties": { "name":"Tokyo", "name1":"New York1", "rainfall": "60.4", "countP": "100" }, "geometry": { "type": "Point", "coordinates": [175.2209316333,-37.8210922667 ] } },
      { "type": "Feature", "id":"2", "properties": { "name":"New York", "name1":"London1", "rainfall": "38.8", "countP": "200" }, "geometry": { "type": "Point", "coordinates": [175.2238417833,-37.80975435   ] } },
      { "type": "Feature", "id":"3", "properties": { "name":"London", "name1":"Berlin1", "rainfall": "52.4", "countP": "300"  }, "geometry": { "type": "Point", "coordinates": [175.2169955667,-37.818193     ] } },
      { "type": "Feature", "id":"4", "properties": { "name":"Berlin", "name1":"Perm1", "rainfall": "105.0", "countP": "400"  }, "geometry": { "type": "Point", "coordinates": [175.2240856667,-37.8216963    ] } },
      { "type": "Feature", "id":"5", "properties": { "name":"Perm", "name1":"Paris1","rainfall": "216.4", "countP": "500" }, "geometry": { "type": "Point", "coordinates": [175.2196982333,-37.8188702167 ] } },
      { "type": "Feature", "id":"6", "properties": { "name":"Paris", "name1":"Tokyo1", "rainfall": "33.2", "countP": "600"  }, "geometry": { "type": "Point", "coordinates": [175.2209942   ,-37.8192782833 ] } }
    ]
  },

  _geoJsonLayer: null,

  init() {
    this._super(...arguments);

    // Available layers types for related dropdown.
    let owner = Ember.getOwner(this);
    this.set('_availableTypes', owner.knownNamesForType('components/charts/type-chart'));

    let geoJsonLayer = L.geoJson(this.get('_geoJsonData'), {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.address);
      }
    });

    this.set('_geoJsonLayer', geoJsonLayer);
  },

  layout
});
