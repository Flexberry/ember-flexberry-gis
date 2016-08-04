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
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.becameVisible:method"}}flexberry-maplayers component's 'becameVisible' action{{/crossLink}}.
      It mutates value of property with given name to true.

      @method actions.onMapLayerBecameVisible
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action (always true in this action handler).
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node with checkbox"
          visibility=layer.visibility
          becameVisible=(action "onMapLayerBecameVisible" "layer.visibility")
          becameInvisible=(action "onMapLayerBecameInvisible" "layer.visibility")
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
    onMapLayerBecameVisible(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxCheck');

      actionHandler.apply(this, args);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.becameInvisible:method"}}flexberry-maplayers component's 'becameInvisible' action{{/crossLink}}.
      It mutates value of property with given name to false.

      @method actions.onMapLayerBecameInvisible
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action (always false in this action handler).
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node with checkbox"
          visibility=layer.visibility
          becameVisible=(action "onMapLayerBecameVisible" "layer.visibility")
          becameInvisible=(action "onMapLayerBecameInvisible" "layer.visibility")
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
    onMapLayerBecameInvisible(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxUncheck');

      actionHandler.apply(this, args);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.addChild:method"}}flexberry-maplayers component's 'addChild' action{{/crossLink}}.
      It adds new child layer.

      @method actions.onMapLayerAddChild
      @param {String} layerPropertyPath Path to a layer, which to which child must be added on action.
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers 'addChild' action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          addChild=(action "onMapLayerAddChild" "layers.0")
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
    onMapLayerAddChild(...args) {
      let childLayersPropertyPath = args[0];
      Ember.assert(
        `Wrong type of \`childLayersPropertyPath\` argument: actual type is \`${Ember.typeOf(childLayersPropertyPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(childLayersPropertyPath) === 'string');

      let childLayers = this.get(childLayersPropertyPath);
      if (Ember.isNone(childLayers)) {
        childLayers = Ember.A();
        this.set(childLayersPropertyPath, childLayers);
      }

      Ember.assert(
        `Wrong type of \`${childLayersPropertyPath}\` property: actual type is \`${Ember.typeOf(childLayers)}\`, ` +
        `but \`Ember.NativeArray\` is expected`,
        Ember.isArray(childLayers) && Ember.typeOf(childLayers.pushObject) === 'function');

      let addChildLayer = (childLayer) => {
        Ember.assert(
          `Wrong type of \`childLayer\` argument: actual type is \`${Ember.typeOf(childLayer)}\`, ` +
          `but \`object\` or  \`instance\` is expected`,
          Ember.isNone(childLayer) || Ember.typeOf(childLayer) === 'object' || Ember.typeOf(childLayer) === 'instance');

        if (Ember.isNone(childLayer)) {
          return;
        }

        childLayers.pushObject(childLayer);
      };

      let createdLayer = this.createMapLayer();
      if (createdLayer instanceof Ember.RSVP.Promise) {
        createdLayer.then(addChildLayer);
      } else {
        addChildLayer(createdLayer);
      }
    },
  },

  createMapLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      resolve({
        name: 'New layer',
        type: 'wms',
        visibility: true
      });
    });
  },

  editMapLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      resolve({
        name: 'Edited layer',
      });
    });
  },

  removeMapLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      resolve(true);
    });
  },
});
