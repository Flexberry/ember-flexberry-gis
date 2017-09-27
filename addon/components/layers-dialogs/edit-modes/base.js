/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryEditLayerMapComponent from '../../flexberry-edit-layermap';

/**
  Flexberry add layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class BaseModeComponent
  @extends Ember.Component
*/
export default Ember.Component.extend({
  bindingProperties: [],

  /**
    Initialize DOM-related properties.

    @method didInsertElement
  */
  didInsertElement() {
    this._super(...arguments);
    this.bindProperties();
  },

  /**
    Binds current component's properties from parentView.

    @method bindProperties
  */
  bindProperties() {
    let findEditLayerMapComponent = (component) => {
      let result = component.get('parentView');
      if (result instanceof FlexberryEditLayerMapComponent) {
        return result;
      } else {
        return findEditLayerMapComponent(result);
      }
    };

    // Instance of flexberry-edit-layermap component.
    let parent = findEditLayerMapComponent(this);
    let bindingProperties = this.get('bindingProperties');

    bindingProperties.forEach((property) => {
      this.set(property, parent.get(property));
    }, this);
  }

  /**
    Component's action invoking when inner editing process is finished.

    @method sendingActions.editingFinished
    @param {Object} layer Editable object.
  */
});
