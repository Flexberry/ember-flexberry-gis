/**
  @module ember-flexberry-gis
*/

import Component from '@ember/component';
import FlexberryEditLayerMapComponent from '../../flexberry-edit-layermap';

/**
  Flexberry add layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class BaseModeComponent
  @extends Ember.Component
*/
export default Component.extend({
  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.bindingProperties = this.bindingProperties || [];
  },

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
    const findEditLayerMapComponent = (component) => {
      const result = component.get('parentView');
      if (result instanceof FlexberryEditLayerMapComponent) {
        return result;
      }

      return findEditLayerMapComponent(result);
    };

    // Instance of flexberry-edit-layermap component.
    const parent = findEditLayerMapComponent(this);
    const bindingProperties = this.get('bindingProperties');

    bindingProperties.forEach((property) => {
      this.set(property, parent.get(property));
    }, this);
  },

  /**
    Component's action invoking when inner editing process is finished.

    @method sendingActions.editingFinished
    @param {Object} layer Editable object.
  */
});
