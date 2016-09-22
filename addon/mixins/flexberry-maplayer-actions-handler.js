/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from './flexberry-ddau-checkbox-actions-handler';

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
    onMapLayerHeaderClick(...args) {
    },

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
    onMapLayerBeforeExpand(...args) {
    },

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
    onMapLayerBeforeCollapse(...args) {
    },

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
      let parentLayerPath = args[0];
      Ember.assert(
        `Wrong type of \`parentLayerPath\` argument: actual type is \`${Ember.typeOf(parentLayerPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(parentLayerPath) === 'string');

      let { layerProperties } = args[args.length - 1];
      Ember.assert(
        `Wrong type of \`layerProperties\` property: actual type is \`${Ember.typeOf(layerProperties)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layerProperties) === 'object' || Ember.typeOf(layerProperties) === 'instance');

      let parentLayer = this.get(parentLayerPath);
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
        parentLayerPath: parentLayerPath,
        parentLayer: parentLayer,
        layerProperties: layerProperties
      });

      if (Ember.get(childLayer, 'type') === 'group' && !Ember.isArray(Ember.get(childLayer, 'layers'))) {
        Ember.set(childLayer, 'layers', Ember.A());
      }

      childLayers.pushObject(childLayer);
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

      let { layerProperties } = args[args.length - 1];
      Ember.assert(
        `Wrong type of \`layerProperties\` property: actual type is \`${Ember.typeOf(layerProperties)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layerProperties) === 'object' || Ember.typeOf(layerProperties) === 'instance');

      let layer = this.get(layerPath);
      Ember.assert(
        `Wrong type of \`layer\` property: actual type is \`${Ember.typeOf(layer)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layer) === 'object' || Ember.typeOf(layer) === 'instance');

      this.editLayer({
        layerPath: layerPath,
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
      let layerPath = args[0];
      Ember.assert(
        `Wrong type of \`layerPath\` argument: actual type is \`${Ember.typeOf(layerPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(layerPath) === 'string');

      let layer = this.get(layerPath);
      Ember.assert(
        `Wrong type of \`layer\` property: actual type is \`${Ember.typeOf(layer)}\`, ` +
        `but \`object\` or  \`instance\` is expected`,
        Ember.typeOf(layer) === 'object' || Ember.typeOf(layer) === 'instance');

      this.removeLayer({
        layerPath: layerPath,
        layer: layer
      });
    }
  },

  /**
    Creates new layer as specified layer's child.

    @method createLayer
    @param {Object} options Method options.
    @param {String} options.parentLayerPath Path to parent layer.
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
    @param {String} options.layerPath Path to editing layer.
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
    @param {String} options.layerPath Path to removing layer.
    @param {String} options.layer Removing layer itself.
    @returns {Object} Removed layer.
    @private
  */
  removeLayer(options) {
    options = options || {};
    let layer = Ember.get(options, 'layer');

    Ember.set(layer, 'isDeleted', true);
    return layer;
  }
});
