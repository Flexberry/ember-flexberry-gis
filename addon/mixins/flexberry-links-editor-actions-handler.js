/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry/mixins/flexberry-ddau-checkbox-actions-handler';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryLinksEditorComponent"}}flexberry-links-editor component's{{/crossLink}} actions.

  @class FlexberryLinksEditorActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Layer's links' property path.

    @property linksPropertyPath
    @type String
    @default ''
  */
  linksPropertyPath: '',

  /**
    Layer's links' model name.

    @property linksModelName
    @type String
    @default ''
  */
  linksModelName: '',

  /**
    Layer's links' parameters model name.

    @property linksParametersModelName
    @type String
    @default ''
  */
  linksParametersModelName: '',

  /**
    Layer's links' parameters model projection.

    @property linksParametersModelProjection
    @type String
    @default ''
  */
  linksParametersModelProjection: '',

  actions: {
    /**
      Adds empty layer link from current model's links collection.

      @method actions.addLayerLink
    */
    addLayerLink() {
      let model = this.get(this.get('linksPropertyPath'));
      let record = this.get('store').createRecord(this.get('linksModelName'), { id: generateUniqueId() });

      model.pushObject(record);
    },

    /**
      Removes specified layer link from current model's links collection.

      @method actions.removeLayerLink
      @param {Object} link Layer link object to be deleted from current model.
    */
    removeLayerLink(link) {
      link.deleteRecord();
    },

    /**
        Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.allowShowLayerLinkCheckboxChange:method"}}flexberry-links-editor component's 'allowShowLayerLinkCheckboxChange' action{{/crossLink}}.
        It mutates value of property with given name to value of action's event object 'newValue' property.

        @method actions.onLayerLinkChangeVisibility
        @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
        @param {Object} e Action's event object.
        @param {Object} e.newValue New value for a property, which value must be mutated on action.
        @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes checkbox input's 'change' event.

        @example
        templates/my-form.hbs
        ```handlebars
          {{flexberry-links-editor
            allowShowLayerLinkCheckboxChange=(action "onLayerLinkChangeVisibility" "model.allowShow")
          }}
        ```

        controllers/my-form.js
        ```javascript
          import Ember from 'ember';
          import FlexberryLinksEditorActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-links-editor-actions-handler';

          export default Ember.Controller.extend(FlexberryLinksEditorActionsHandlerMixin, {
          });
        ```
    */
    onLayerLinkChangeVisibility(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxChange');

      actionHandler.apply(this, args);
    }
  }
});
