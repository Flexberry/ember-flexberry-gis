import Ember from 'ember';
import layout from '../templates/components/flexberry-wfs-filter';

export default Ember.Component.extend({
  layout,

  smallButtonClass: 'smaller',

  biggerButtonClass: 'bigger',

  _leafletObject: null,

  fields: [],

  values: [],

  _test: Ember.on('init', function() {
    let _leafletObject = this.get('_leafletObject');
    let fields = this.get('fields');

    for (let layer in _leafletObject._layers) {
      let properties = _leafletObject._layers[layer].feature.properties;
      for (let property in properties) {
        if (!(fields.includes(property))) {
          fields.push(property);
        }
      }
    }

    this.set('fields', fields);
  })
});
