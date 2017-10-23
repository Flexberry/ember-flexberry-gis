import Ember from 'ember';
import layout from '../../../templates/components/charts/type-charts/pie';

export default Ember.Component.extend({
  _captionSeries: null,

  _valueSeries: null,

  _val1: null,

  _val2: null,

  _layer: null,

  init() {
    this._super(...arguments);
    
    let arrTume1 = Ember.A([]);
    let geoJsonLayer = this.get('_layer');

    let feature = Ember.get(geoJsonLayer._layers[Object.keys(geoJsonLayer._layers)[0]], 'feature');
    let isObject = Object.keys(feature.properties);

    for (var i in isObject)
    {
      if (isFinite(feature.properties[isObject[i]])){
        arrTume1.pushObject (isObject[i]);
      }
    }

    this.set('_captionSeries', isObject);
    this.set('_valueSeries', arrTume1);
  },

  layout
});
