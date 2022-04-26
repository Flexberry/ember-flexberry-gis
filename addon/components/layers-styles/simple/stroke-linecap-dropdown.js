/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import Component from '@ember/component';
import layout from '../../../templates/components/layers-styles/simple/stroke-linecap-dropdown';

/**
  Dropdown component for 'stroke-linecap' SVG/Canvas attribute.

  @class SimpleLayersStyleStrokeLineCapDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({
  /**
    Available 'stroke-linecap' attribute values.

    @property _availableLineCaps
    @type String[]
    @default ['butt', 'round', 'square']
    @private
  */
  _availableLineCaps: Object.freeze(['butt', 'round', 'square']),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['ui', 'inline', 'dropdown', 'simple-layers-style-stroke-linecap-dropdown']
  */
  classNames: ['ui', 'selection', 'dropdown', 'simple-layers-style-stroke-linecap-dropdown'],

  /**
    Selected 'stroke-linecap' value.

    @property value
    @type String
    @default 'round'
  */
  value: 'round',

  /**
    Stroke color for 'stroke-linecap' samples.

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
