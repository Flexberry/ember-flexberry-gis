/**
  @module ember-flexberry-gis
*/

import FlexberryButton from 'ember-flexberry/components/flexberry-button';

/**
  Registers options for custom 'flexberry-button' type.

  @for ApplicationInitializer
  @method flexberryButton.initialize
*/
export function initialize() {

  FlexberryButton.reopen({
    /**
      Components attributes bindings.

      @property attributeBindings
      @type String[]
      @default ['tooltip:title']
    */
    attributeBindings: ['tooltip:title', 'data-action']
  });
}

export default {
  name: 'flexberry-button',
  initialize,
};
