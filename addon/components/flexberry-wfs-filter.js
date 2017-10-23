import Ember from 'ember';
import layout from '../templates/components/flexberry-wfs-filter';

export default Ember.Component.extend({
  layout,

  smallButtonClass: 'smaller',

  biggerButtonClass: 'bigger',

  fields: ['example', 'example2', 'example3', 'example4', 'example', 'example2', 'example3', 'example4'],
  values: ['example', 'example2', 'example3', 'example4', 'example', 'example2', 'example3', 'example4'],
  _test: Ember.on('init', function() {
    console.log(this.parentView.attrs._leafletObject.values);
  })
});
