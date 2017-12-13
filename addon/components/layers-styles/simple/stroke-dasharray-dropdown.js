/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-styles/simple/stroke-dasharray-dropdown';

/**
  Dropdown component for dash array SVG/Canvas attribute.

  @class SimpleLayersStyleStrokeDashArrayDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Available 'dash-array' attribute values.

    @property _availableDashArrays
    @type String[]
    @default ['', '5,5', '5,10', '10,5', '5,1', '1,5', '1,1', '15,10,5,10', '5,5,1,5', '5,5,1,5,1,5']
    @private
  */
  _availableDashArrays: ['', '5,5', '5,10', '10,5', '5,1', '1,5', '1,1', '15,10,5,10', '5,5,1,5', '5,5,1,5,1,5'],

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['ui', 'inline', 'dropdown', 'simple-layers-style-stroke-dasharray-dropdown']
  */
  classNames: ['ui', 'selection', 'dropdown', 'simple-layers-style-stroke-dasharray-dropdown'],

  /**
    Selected 'dash-array' value.

    @property value
    @type String
    @default ''
  */
  value: '',

  /**
    Stroke color for 'dash-array' samples.

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
