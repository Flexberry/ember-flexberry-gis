/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import Component from '@ember/component';
import layout from '../../../templates/components/layers-styles/simple/stroke-linejoin-dropdown';

/**
  Dropdown component for 'stroke-linejoin' SVG/Canvas attribute.

  @class SimpleLayersStyleStrokeLineJoinDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({
  /**
    Available 'stroke-linejoin' attribute values.
    @property _availableLineJoins
    @type String[]
    @default ['miter', 'round', 'bevel']
    @private
  */
  _availableLineJoins: null,


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
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this._availableLineJoins = this._availableLineJoins || ['miter', 'round', 'bevel'];
  },

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    const $dropdown = this.$().dropdown({
      onChange: (newValue) => {
        this.set('value', newValue);
        this.sendAction('change', newValue);
      },
    });

    const initialValue = this.get('value');
    if (!isBlank(initialValue)) {
      $dropdown.dropdown('set selected', initialValue);
    }
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    this._super(...arguments);
    this.$().dropdown('destroy');
  },
});
