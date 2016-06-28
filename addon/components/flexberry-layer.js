import Ember from 'ember';
const { getOwner } = Ember;
import layout from '../templates/components/flexberry-layer';

export default Ember.Component.extend({
  layout,

  tagName: '',

  /*
  */
  layer: null,

  init: function () {
    this._super(...arguments);
    let metadata = getOwner(this).lookup('layer:' + this.get('layer.type'));
    if (!Ember.isNone(metadata)) {
      this.set('componentName', metadata.component);
    }
  }
});
