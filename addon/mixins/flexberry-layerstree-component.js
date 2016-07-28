/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

/**
  Mixin containing methods for
  {{#crossLink "FlexberryLayersTreenodeComponent"}}flexberry-layerstreenode component{{/crossLink}}.

  @class FlexberryLayersTreenodeComponentMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Convert layers's type to CSS-classes names for a tree node's icon.

    @method getIconClassByType
    @param {String} type Layers's type.
    @return {String} CSS-classes names for a tree node's icon.
  */
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
