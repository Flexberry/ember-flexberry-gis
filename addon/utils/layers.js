/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Array containing available layer types (available in app/layers/... catalog).
  Property is initialized inside {{#crossLink "AplicationInitializer/layers.initialize:method"}}'layers' initializer{{/crossLink}}.

  @for Utils.Layers
  @property _availableLayerTypes
  @type {String[]}
  @private
*/
let _availableLayerTypes = [];

/**
  Remembers available layers types.
  Method is used inside {{#crossLink "AplicationInitializer/layers.initialize:method"}}'layers' initializer{{/crossLink}}.

  @for Utils.Layers
  @method _setAvailableLayerTypes
  @param {String[]} availableTypes Array containing available layer types (available in app/layers/... catalog).
  @private
*/
let _setAvailableLayerTypes = function(availableTypes) {
  _availableLayerTypes = availableTypes;
};

/**
  Returns available layers types.

  @for Utils.Layers
  @method availableLayerTypes
  @return {String[]} Array containing available layer types (available in app/layers/... catalog).

  Usage:
  controllers/my-form.js
  ```javascript
    import { availableLayerTypes } from 'ember-flexberry-gis/utils/layers'

    // It will return: ['group', 'tile', 'wms'] (if app/layers/ contains following modules: group.js, tile.js, wms.js).
    availableLayerTypes();

  ```
*/
let availableLayerTypes= function() {
  return _availableLayerTypes;
};

/**
  Returns available layers types.

  @for Utils.Layers
  @method isAvailableLayerType
  @return {Boolean} Flag: indicates whether specified layer type is available (available in app/layers/... catalog) or not.

  Usage:
  controllers/my-form.js
  ```javascript
    import { isAvailableLayerType } from 'ember-flexberry-gis/utils/layers'

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: true.
    availableLayerTypes('group');

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: true.
    availableLayerTypes('tile');

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: true.
    availableLayerTypes('wms');

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: false.
    availableLayerTypes('wfs');

  ```
*/
let isAvailableLayerType = function(layerType) {
  return Ember.A(availableLayerTypes()).contains(layerType);
};

export { _setAvailableLayerTypes, availableLayerTypes, isAvailableLayerType };
