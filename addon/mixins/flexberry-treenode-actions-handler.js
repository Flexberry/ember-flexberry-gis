/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from './flexberry-ddau-checkbox-actions-handler';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component's{{/crossLink}} actions.

  @class FlexberryTreenodeActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  actions: {
    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.headerClick:method"}}flexberry-treenode component's 'headerClick' action{{/crossLink}}.

      @method actions.onTreenodeHeaderClick
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's 'headerClick' action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-treenode
          caption="Tree node"
          headerClick=(action "onTreenodeHeaderClick")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';

        export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onTreenodeHeaderClick(...args) {
    },

    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeExpand:method"}}flexberry-treenode component's 'beforeExpand' action{{/crossLink}}.

      @method actions.onTreenodeBeforeExpand
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's expanding.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-treenode
          caption="Tree node"
          beforeExpand=(action "onTreenodeBeforeExpand")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';

        export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onTreenodeBeforeExpand(...args) {
    },

    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeCollapse:method"}}flexberry-treenode component's 'beforeCollapse' action{{/crossLink}}.

      @method actions.onTreenodeBeforeCollapse
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's collapsing.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-treenode
          caption="Tree node"
          beforeCollapse=(action "onTreenodeBeforeCollapse")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';

        export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onTreenodeBeforeCollapse(...args) {
    },

    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.checkboxChange:method"}}flexberry-treenode component's 'checkboxChange' action{{/crossLink}}.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onTreenodeCheckboxChange
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-treenode
          caption="Tree node with checkbox"
          showCheckbox=true
          checkboxValue=model.nodeIsChecked
          checkboxChange=(action "onTreenodeCheckboxChange" "model.nodeIsChecked")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';

        export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onTreenodeCheckboxChange(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxChange');

      actionHandler.apply(this, args);
    },

    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.checkboxCheck:method"}}flexberry-treenode component's 'checkboxCheck' action{{/crossLink}}.
      It mutates value of property with given name to true.

      @method actions.onTreenodeCheckboxCheck
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action (always true in this action handler).
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-treenode
          caption="Tree node with checkbox"
          showCheckbox=true
          checkboxValue=model.nodeIsChecked
          checkboxCheck=(action "onTreenodeCheckboxCheck" "model.nodeIsChecked")
          checkboxUncheck=(action "onTreenodeCheckboxUncheck" "model.nodeIsChecked")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';

        export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onTreenodeCheckboxCheck(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxCheck');

      actionHandler.apply(this, args);
    },

    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.checkboxUncheck:method"}}flexberry-treenode component's 'checkboxUncheck' action{{/crossLink}}.
      It mutates value of property with given name to false.

      @method actions.onTreenodeCheckboxUncheck
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action (always false in this action handler).
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-treenode
          caption="Tree node with checkbox"
          showCheckbox=true
          checkboxValue=model.nodeIsChecked
          checkboxCheck=(action "onTreenodeCheckboxCheck" "model.nodeIsChecked")
          checkboxUncheck=(action "onTreenodeCheckboxUncheck" "model.nodeIsChecked")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';

        export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
        });
      ```
    */
    onTreenodeCheckboxUncheck(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxUncheck');

      actionHandler.apply(this, args);
    }
  }
});
