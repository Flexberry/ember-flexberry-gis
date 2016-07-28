/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from './flexberry-ddau-checkbox-actions-handler';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryLayersTreenodeComponent"}}flexberry-layerstreenode component's{{/crossLink}} actions.

  @class FlexberryLayersTreenodeActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  actions: {
    /**
      Handles {{#crossLink "FlexberryLayersTreenodeComponent/sendingActions.headerClick:method"}}flexberry-layerstreenode component's 'headerClick' action{{/crossLink}}.

      @method actions.onLayersTreenodeHeaderClick
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's 'headerClick' action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-layerstreenode
          name="Tree node"
          headerClick=(action "onLayersTreenodeHeaderClick")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

        export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onLayersTreenodeHeaderClick(...args) {
    },

    /**
      Handles {{#crossLink "FlexberryLayersTreenodeComponent/sendingActions.beforeExpand:method"}}flexberry-layerstreenode component's 'beforeExpand' action{{/crossLink}}.

      @method actions.onLayersTreenodeBeforeExpand
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's expanding.

      @example
      templates/my-form.hbs
      ```handlebars
        {{{flexberry-layerstreenode
          name="Tree node"
          beforeExpand=(action "onLayersTreenodeBeforeExpand")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

        export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onLayersTreenodeBeforeExpand(...args) {
    },

    /**
      Handles {{#crossLink "FlexberryLayersTreenodeComponent/sendingActions.beforeExpand:method"}}flexberry-layerstreenode component's 'beforeCollapse' action{{/crossLink}}.

      @method actions.onLayersTreenodeBeforeCollapse
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's collapsing.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-layerstreenode
          name="Tree node"
          beforeCollapse=(action "onLayersTreenodeBeforeCollapse")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

        export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onLayersTreenodeBeforeCollapse(...args) {
    },

    /**
      Handles {{#crossLink "FlexberryLayersTreenodeComponent/sendingActions.visiblilityChange:method"}}flexberry-layerstreenode component's 'visiblilityChange' action{{/crossLink}}.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onLayersTreenodeVisibilityChange
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-layerstreenode
          name="Tree node with checkbox"
          visibility=model.visibility
          visiblilityChange=(action "onLayersTreenodeVisibilityChange" "model.visibility")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

        export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onLayersTreenodeVisibilityChange(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxChange');

      actionHandler.apply(this, args);
    },

    /**
      Handles {{#crossLink "FlexberryLayersTreenodeComponent/sendingActions.becameVisible:method"}}flexberry-layerstreenode component's 'becameVisible' action{{/crossLink}}.
      It mutates value of property with given name to true.

      @method actions.onLayersTreenodeBecameVisible
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action (always true in this action handler).
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-layerstreenode
          name="Tree node with checkbox"
          visibility=model.visibility
          visiblilityChange=(action "onLayersTreenodeVisibilityChange" "model.visibility")
          becameVisible=(action "onLayersTreenodeBecameVisible" "model.visibility")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

        export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onLayersTreenodeBecameVisible(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxCheck');

      actionHandler.apply(this, args);
    },

    /**
      Handles {{#crossLink "FlexberryLayersTreenodeComponent/sendingActions.becameInvisible:method"}}flexberry-layerstreenode component's 'becameInvisible' action{{/crossLink}}.
      It mutates value of property with given name to false.

      @method actions.onLayersTreenodeBecameInvisible
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action (always false in this action handler).
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-layerstreenode
          name="Tree node with checkbox"
          visibility=model.visibility
          visiblilityChange=(action "onLayersTreenodeVisibilityChange" "model.visibility")
          becameVisible=(action "onLayersTreenodeBecameVisible" "model.visibility")
          becameInvisible=(action "onLayersTreenodeBecameInvisible" "model.visibility")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

        export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onLayersTreenodeBecameInvisible(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxUncheck');

      actionHandler.apply(this, args);
    }
  }
});
