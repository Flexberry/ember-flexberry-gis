/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import layout from '../templates/components/flexberry-layerstreenode';

let FlexberryLayersTreeNodeComponent = Ember.Component.extend(DynamicActionsMixin, {
  /**
    Reference to component's template.
  */
  layout,
  //tagName:'',

  name: undefined,
  type: undefined,
  visibility: undefined,
  settings: undefined,
  coordinateReferenceSystem: undefined,
  iconClass: Ember.computed('type', function() {
    let type = this.get('type');
    let iconClasses = 'world icon';
    switch (type) {
      case 'wms':
        iconClasses = 'sticky note icon';
        break;
      case 'tile':
        iconClasses = 'sticky note outline icon';
        break;
    }

    return iconClasses;
  })
});

export default FlexberryLayersTreeNodeComponent;
