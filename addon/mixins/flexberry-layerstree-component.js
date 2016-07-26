/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

export default Ember.Mixin.create({
  getIconClassByType(type) {
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
  }
});
