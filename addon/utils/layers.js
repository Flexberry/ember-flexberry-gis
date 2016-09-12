/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Array containing available layers (available in app/layers/... catalog).
  Property is initialized inside {{#crossLink "AplicationInitializer/layers.initialize:method"}}'layers' initializer{{/crossLink}}.
  Each array item has the following structure: { type: ..., class: ... } where 'type' is string containing layer type name,
  'class' is layer class related to 'type'.

  @for Utils.Layers
  @property _availableLayerTypes
  @type Object[]
  @private
*/
let _availableLayers = [];

/**
  Remembers available layers.
  Method is used inside {{#crossLink "AplicationInitializer/layers.initialize:method"}}'layers' initializer{{/crossLink}}.

  @for Utils.Layers
  @method _setAvailableLayers
  @param {Object} availableLayers Object containing available layers (available in app/layers/... catalog)
  with the following structure: { 'type1': type1Class, 'type2': type2Class, ... }.
  Each key is string containing layer type name, each value is layer class related to layer type.
  @private
*/
let _setAvailableLayers = function(availableLayers) {
  _availableLayers = availableLayers;
};

/**
  Returns available layers.

  @for Utils.Layers
  @method getAvailableLayers
  @return {Object} Object containing available layers (available in app/layers/... catalog)
  with the following structure: { 'type1': type1Class, 'type2': type2Class, ... }.
  Each key is string containing layer type name, each value is layer class related to layer type.

  Usage:
  controllers/my-form.js
  ```javascript
    import { getAvailableLayers } from 'ember-flexberry-gis/utils/layers'

    // It will return: { 'group': { ... }, 'tile': {...}, 'wms': {...}] (if app/layers/ contains following modules: group.js, tile.js, wms.js).
    getAvailableLayers();

  ```
*/
let getAvailableLayers = function() {
  return _availableLayers;
};

/**
  Checks if layer type with given name is available.

  @for Utils.Layers
  @method layerIsAvailable
  @param {String} layerType Layer type name for which availability must be checked.
  @return {Boolean} Flag: indicates whether specified layer type is available (available in app/layers/... catalog) or not.

  Usage:
  controllers/my-form.js
  ```javascript
    import { layerIsAvailable } from 'ember-flexberry-gis/utils/layers'

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: true.
    layerIsAvailable('group');

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: true.
    layerIsAvailable('tile');

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: true.
    layerIsAvailable('wms');

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // It will return: false.
    layerIsAvailable('wfs');

  ```
*/
let layerIsAvailable = function(layerType) {
  let availableLayers = getAvailableLayers();
  return Ember.A(Object.keys(availableLayers)).contains(layerType);
};

/**
  Returns layer class related to specified layer type name.

  @for Utils.Layers
  @method getLayer
  @param {String} layerType Layer type name for which class must be returned.
  @return {Object} Layer class related to specified layer type name..

  Usage:
  controllers/my-form.js
  ```javascript
    import { getLayer } from 'ember-flexberry-gis/utils/layers'

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // And group.js has following structure { iconClass: 'folder icon', operations: ['add', 'edit', 'remove'] }.
    // It will return: { iconClass: 'folder icon', operations: ['add', 'edit', 'remove'] }.
    getLayer('group');

    // Catalog app/layers/ doesn't contain wfs.js module.
    // So it will throw an assertion exception.
    getLayer('wfs', 'add');

  ```
*/
let getLayer = function(layerType) {
  Ember.assert(
    `Wrong value of \`layerType\` parameter: \`${layerType}\`. ` +
    `Allowed values are: [\`${Object.keys(getAvailableLayers()).join(`\`, \``)}\`].`,
    layerIsAvailable(layerType));

  return getAvailableLayers()[layerType];
};

/**
  Checks if operation with given name is available for type with given name.

  @for Utils.Layers
  @method layerOperationIsAvailable
  @param {String} layerType Layer type name for which operation availability should be checked.
  @param {String} operation Operation name.
  @return {Boolean} Flag: indicates whether specified operation is available for layer type with given name.

  Usage:
  controllers/my-form.js
  ```javascript
    import { layerOperationIsAvailable } from 'ember-flexberry-gis/utils/layers'

    // Catalog app/layers/ contains following modules: group.js, tile.js, wms.js.
    // And group.js has following structure { iconClass: 'folder icon', operations: ['add', 'edit', 'remove'] }.
    // It will return: true.
    layerOperationIsAvailable('group', 'add');

    // It will return: true.
    layerOperationIsAvailable('group', 'edit');

    // It will return: true.
    layerOperationIsAvailable('group', 'remove');

    // Layer 'group' doesn't contain 'destroy' operation inside it's 'operations' array.
    // So, it will return: false.
    layerOperationIsAvailable('group', 'destroy');

    // Catalog app/layers/ doesn't contain wfs.js module.
    // So it will throw an assertion exception.
    layerIsAvailable('wfs', 'add');

  ```
*/
let layerOperationIsAvailable = function(layerType, operation) {
  let layer = getLayer(layerType);
  return Ember.A(layer.operations || []).contains(operation);
};

export { _setAvailableLayers, getAvailableLayers, layerIsAvailable, getLayer, layerOperationIsAvailable };
