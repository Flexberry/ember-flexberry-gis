/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry/mixins/flexberry-ddau-checkbox-actions-handler';
import FlexberryDdauSliderActionsHandlerMixin from 'ember-flexberry/mixins/flexberry-ddau-slider-actions-handler';
import { getRecord } from 'ember-flexberry/utils/extended-get';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryMaplayerComponent"}}flexberry-maplayer component's{{/crossLink}} actions.

  @class FlexberryMaplayerActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  actions: {
    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.headerClick:method"}}flexberry-maplayers component's 'headerClick' action{{/crossLink}}.

      @method actions.onMapLayerHeaderClick
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's 'headerClick' action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node"
          headerClick=(action "onMapLayerHeaderClick")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerHeaderClick(...args) {},

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.beforeExpand:method"}}flexberry-maplayers component's 'beforeExpand' action{{/crossLink}}.

      @method actions.onMapLayerBeforeExpand
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's expanding.

      @example
      templates/my-form.hbs
      ```handlebars
        {{{flexberry-maplayers
          name="Tree node"
          beforeExpand=(action "onMapLayerBeforeExpand")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerBeforeExpand(...args) {},

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.beforeExpand:method"}}flexberry-maplayers component's 'beforeCollapse' action{{/crossLink}}.

      @method actions.onMapLayerBeforeCollapse
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's collapsing.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node"
          beforeCollapse=(action "onMapLayerBeforeCollapse")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerBeforeCollapse(...args) {},

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.visiblilityChange:method"}}flexberry-maplayers component's 'visiblilityChange' action{{/crossLink}}.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onMapLayerVisibilityChange
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node with checkbox"
          visibility=layer.visibility
          changeVisiblility=(action "onMapLayerChangeVisibility" "layer.visibility")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerChangeVisibility(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxChange');

      actionHandler.apply(this, args);

      // Save changes to local storage.
      let mutablePropertyPath = args[0];
      let e = args[args.length - 1];
      this.mutateStorage('visibility', mutablePropertyPath, e.newValue);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.changeOpacity:method"}}flexberry-maplayers component's 'changeOpacity' action{{/crossLink}}.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onMapLayerChangeOpacity
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node with slider"
          opacity=layer.options.opacity
          changeOpacity=(action "onMapLayerChangeOpacity" "layer.options.opacity")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerChangeOpacity(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauSliderActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onSliderChange');

      actionHandler.apply(this, args);

      // Save changes to local storage.
      let mutablePropertyPath = args[0];
      let e = args[args.length - 1];
      this.mutateStorage('opacity', mutablePropertyPath, e.newValue);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.fitBounds:method"}}flexberry-maplayers component's 'fitBounds' action{{/crossLink}}.
      Fits leaflet map to bounds of selected maplayer.

      @method actions.onMapLayerFitBounds
      @param {String} boundsPropertyPath Path to a property, which value must be used within action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node fit bounds button"
          opacity=layer.options.opacity
          fitBounds=(action "onMapLayerFitBounds" "layer.options.bounds")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerFitBounds(boundsPropertyPath) {
      let leafletMap = this.get('leafletMap');

      if (leafletMap) {
        let bounds = getRecord(this, boundsPropertyPath);

        let layerBounds = L.latLngBounds(bounds);

        let earthBounds = L.latLngBounds([
          [-90, -180],
          [90, 180]
        ]);

        // Check if bounds are valid and are not 'full extent' (earth) bounds.
        if (!layerBounds.isValid() || layerBounds.equals(earthBounds)) {
          // Set it to map's bounds.
          layerBounds = leafletMap.maxBounds;
        }

        // Fit map to bounds.
        leafletMap.fitBounds(layerBounds && layerBounds.isValid() ? layerBounds : earthBounds);
      }
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.addChild:method"}}flexberry-maplayers component's 'addChild' action{{/crossLink}}.
      It adds new child layer.

      @method actions.onMapLayerAdd
      @param {String} layerPath Path to a parent layers, to which new child layer must be added on action.
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing properties of new child layer.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          add=(action "onMapLayerAdd" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerAdd(...args) {
      let rootPath = 'model.mapLayer';

      let parentLayerPath = args[0];
      Ember.assert(
        `Wrong type of \`parentLayerPath\` argument: actual type is \`${Ember.typeOf(parentLayerPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(parentLayerPath) === 'string');

      let {
        layerProperties
      } = args[args.length - 1];
      Ember.assert(
        `Wrong type of \`layerProperties\` property: actual type is \`${Ember.typeOf(layerProperties)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layerProperties) === 'object' || Ember.typeOf(layerProperties) === 'instance');

      let parentLayer = getRecord(this, parentLayerPath);
      Ember.assert(
        `Wrong type of \`parentLayer\` property: actual type is \`${Ember.typeOf(parentLayer)}\`, ` +
        `but \`array\` or \`object\` or  \`instance\` is expected`,
        Ember.isArray(parentLayer) || Ember.typeOf(parentLayer) === 'object' || Ember.typeOf(parentLayer) === 'instance');

      let childLayers = Ember.isArray(parentLayer) ? parentLayer : Ember.get(parentLayer, 'layers');
      if (Ember.isNone(childLayers)) {
        childLayers = Ember.A();
        Ember.set(parentLayer, 'layers', childLayers);
      }

      Ember.assert(
        `Wrong type of \`parentLayer.layers\` property: actual type is \`${Ember.typeOf(childLayers)}\`, ` +
        `but \`Ember.NativeArray\` is expected`,
        Ember.isArray(childLayers) && Ember.typeOf(childLayers.pushObject) === 'function');

      let childLayer = this.createLayer({
        parentLayer: parentLayer,
        layerProperties: layerProperties
      });

      if (Ember.get(childLayer, 'type') === 'group' && !Ember.isArray(Ember.get(childLayer, 'layers'))) {
        Ember.set(childLayer, 'layers', Ember.A());
      }

      childLayers.pushObject(childLayer);

      let rootArray = this.get(rootPath);
      rootArray.pushObject(childLayer);

      this.setIndexes(rootArray);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.edit:method"}}flexberry-maplayers component's 'edit' action{{/crossLink}}.
      It edits existing layer.

      @method actions.onMapLayerEdit
      @param {String} layerPath Path to a layer, which must be edited on action.
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing edited layer properties, which must be merged to layer on action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          edit=(action "onMapLayerEdit" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerEdit(...args) {
      let layerPath = args[0];
      Ember.assert(
        `Wrong type of \`layerPath\` argument: actual type is \`${Ember.typeOf(layerPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(layerPath) === 'string');

      let {
        layerProperties
      } = args[args.length - 1];
      Ember.assert(
        `Wrong type of \`layerProperties\` property: actual type is \`${Ember.typeOf(layerProperties)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layerProperties) === 'object' || Ember.typeOf(layerProperties) === 'instance');

      let layer = getRecord(this, layerPath);
      Ember.assert(
        `Wrong type of \`layer\` property: actual type is \`${Ember.typeOf(layer)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layer) === 'object' || Ember.typeOf(layer) === 'instance');

      this.editLayer({
        layer: layer,
        layerProperties: layerProperties
      });
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.remove:method"}}flexberry-maplayers component's 'remove' action{{/crossLink}}.
      It removes specified layer.

      @method actions.onMapLayerRemove
      @param {String} layerPath Path to a layer, which must be removed on action.
      @param {Object} e Action's event object.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          remove=(action "onMapLayerRemove" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerRemove(...args) {
      let rootPath = 'model.mapLayer';
      let layerPath = args[0];
      Ember.assert(
        `Wrong type of \`layerPath\` argument: actual type is \`${Ember.typeOf(layerPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(layerPath) === 'string');

      let layer = getRecord(this, layerPath);
      Ember.assert(
        `Wrong type of \`layer\` property: actual type is \`${Ember.typeOf(layer)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layer) === 'object' || Ember.typeOf(layer) === 'instance');

      this.removeLayer({
        layer: layer
      });

      let rootArray = this.get(rootPath);

      this.setIndexes(rootArray);
    }
  },

  /**
    Creates new layer as specified layer's child.

    @method createLayer
    @param {Object} options Method options.
    @param {String} options.parentLayer Parent layer.
    @param {Object} options.layerProperties Object containing new layer properties.
    @returns {Object} Created layer.
    @private
  */
  createLayer(options) {
    options = options || {};
    let layerProperties = Ember.get(options, 'layerProperties');

    return layerProperties;
  },

  /**
    Updates specified layer in hierarchy with given properties.

    @method editLayer
    @param {Object} options Method options.
    @param {String} options.layer Editing layer.
    @param {Object} options.layerProperties Object containing edited layer properties.
    @returns {Object} Edited layer.
    @private
  */
  editLayer(options) {
    options = options || {};
    let layerProperties = Ember.get(options, 'layerProperties');
    let layer = Ember.get(options, 'layer');

    Ember.set(layer, 'type', Ember.get(layerProperties, 'type'));
    Ember.set(layer, 'name', Ember.get(layerProperties, 'name'));
    Ember.set(layer, 'coordinateReferenceSystem', Ember.get(layerProperties, 'coordinateReferenceSystem'));
    Ember.set(layer, 'settings', Ember.get(layerProperties, 'settings'));
    return layer;
  },

  /**
    Removes specified layer from layers hierarchy.

    @method removeLayer
    @param {Object} options Method options.
    @param {String} options.layer Removing layer itself.
    @returns {Object} Removed layer.
    @private
  */
  removeLayer(options) {
    options = options || {};
    let layer = Ember.get(options, 'layer');

    let childLayers = Ember.get(layer, 'layers');

    if (Ember.isArray(childLayers)) {
      childLayers.forEach((item) => {
        this.removeLayer({
          layer: item
        });
      }, this);
    }

    Ember.set(layer, 'isDeleted', true);
    return layer;
  },

  /**
    Sets indexes for layers hierarchy.

    @method setIndexes
    @param {Array} rootArray Array of layers to set indexes.
  */
  setIndexes(rootArray) {
    let hierarchy = this.get('model.hierarchy');

    // Filter root array to avoid gaps in indexes.
    let index = rootArray.filter(layer => layer.get('isDeleted') === false).length;

    this._setIndexes(hierarchy, index);
  },

  /**
    Sets indexes for layers hierarchy.

    @method _setIndexes
    @param {Array} layers Hierarchy of layers to set indexes.
    @param {Int} index Max index.
    @returns {Int} Min index.
    @private
  */
  _setIndexes(layers, index) {
    if (Ember.isArray(layers) && index > 0) {
      layers.forEach((layer) => {
        if (!layer.get('isDeleted')) {
          layer.set('index', index);
          index--;
          if (Ember.isArray(layer.get('layers'))) {
            index = this._setIndexes(layer.get('layers'), index);
          }
        }
      }, this);
    }

    return index;
  }
});
