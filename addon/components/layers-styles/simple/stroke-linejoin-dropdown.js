/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-styles/simple/stroke-linejoin-dropdown';

/**
  Dropdown component for 'stroke-linejoin' SVG/Canvas attribute.

  @class SimpleLayersStyleStrokeLineJoinDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Available 'stroke-linejoin' attribute values.

    @property _availableLineJoins
    @type String[]
    @default ['miter', 'round', 'bevel']
    @private
  */
  _availableLineJoins: ['miter', 'round', 'bevel'],

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['ui', 'inline', 'dropdown', 'simple-layers-style-stroke-linejoin-dropdown']
  */
  classNames: ['ui', 'selection', 'dropdown', 'simple-layers-style-stroke-linejoin-dropdown'],

  /**
    Selected 'stroke-linejoin' value.

    @property value
    @type String
    @default 'round'
  */
  value: 'round',

  /**
    Stroke color for 'stroke-linejoin' samples.

    @property strokeColor
    @type String
    @default '#000000'
  */
  strokeColor: '#000000',

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let $dropdown = this.$().dropdown({
      onChange: (newValue) => {
        this.set('value', newValue);
        this.sendAction('change', newValue);
      }
    });

    let initialValue = this.get('value');
    if (!Ember.isBlank(initialValue)) {
      $dropdown.dropdown('set selected', initialValue);
    }
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    this._super(...arguments);
    this.$().dropdown('destroy');
  }
});
