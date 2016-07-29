/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/dynamic-components-placeholder';

/**
  Dynamic components placeholder.
  Component has no wrapper and only plays a role of renderer for specified dynamic components.

  Usage:

  Define component that will be dynamically added to some other component's specified place.
  templates/components/my-button.hbs
  ```handlebars
  {{caption}}
  ```

  components/my-button.js
  ```javascript
  import Ember from 'ember';
  import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
  import DynamicActionsMixin from 'ember-flexberry-gis/mixins/dynamic-actions';
  import DynamicProxyActionsMixin from 'ember-flexberry-gis/mixins/dynamic-proxy-actions';
  import layout from '../templates/components/my-button';

  export default Ember.Component.extend(DynamicPropertiesMixin, DynamicActionsMixin, DynamicProxyActionsMixin, {
    layout,

    tagName: 'button',

    caption: null
  });
  ```

  Define component to which dynamic components will be added.
  templates/components/my-component-with-dynamic-buttons.hbs
  ```handlebars
  <div class="buttons-panel">
    {{my-button class="add-button" caption="Add" click=(action "onAddButonClick")}}
    {{my-button class="remove-button" caption="Remove" click=(action "onRemoveButonClick")}}
    {{dynamic-components-placeholder name="buttonsPanel"}}
  </div>
  <div class="content">
    {{yield}}
  </div>
  ```

  components/my-component-with-dynamic-buttons.js
  ```javascript
  import Ember from 'ember';
  import DynamicComponentsMixin from 'ember-flexberry-gis/mixins/dynamic-components';
  import layout from '../templates/components/my-component-with-dynamic-buttons';

  export default Ember.Component.extend(DynamicComponentsMixin, {
    layout,

    actions: {
      onAddButonClick() {
        this.sendAction('addButtonClick');
      },

      onRemoveButonClick() {
        this.sendAction('removeButtonClick');
      }
    }
  });
  
  ```

  Place component on your form and add "Edit" dynamic button's to it's buttons panel.
  templates/components/my-component-with-dynamic-buttons.hbs
  ```handlebars
  {{#my-component-with-dynamic-buttons
    dynamicComponents=(array
      (hash
        to="buttonsPanel"
        componentName="my-button"
        componentProperties=(hash
          caption="Edit"
          dynamicProxyActions=(array
            (hash
              on="click"
              actionName="editButtonClick"
            )
          )
        )
      )
    )
    addButtonClick=(action "onAddButtonClick")
    removeButtonClick=(action "onRemoveButtonClick")
    editButtonClick=(action "onEditButtonClick")
  }}
    Some content...
  {{/my-component-with-dynamic-buttons}}
  ```

  components/my-component-with-dynamic-buttons.js
  ```javascript
  import Ember from 'ember';

  export default Ember.Controller.extend({
    actions: {
      onAddButonClick() {
        alert('Add button clicked');
      },

      onRemoveButonClick() {
        alert('Remove button clicked');
      },

      onEditButtonClick() {
        alert('Dynamically added edit button clicked');
      }
    }
  });
  
  ```

  @class DynamicComponentsPlaceholderComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Dynamic components defined in placeholder's parent component & related to this placeholder
    (by plaseholder's {{#crossLink "DynamicComponentsPlaceholderComponent/name:property"}}'name'{{/crossLink}}).

    @property _dynamicComponentsRelatedToPlaceholder
    @type DynamicComponentObject[]
    @readonly
    @private
  */
  _dynamicComponentsRelatedToPlaceholder: Ember.computed('targetObject._dynamicComponents', 'name', function() {
    let name = this.get('name');
    Ember.assert(
    `Wrong type of \`dynamic-components-placeholder\` \`name\` property: ` +
    `actual type is ${Ember.typeOf(name)}, but \`string\` is expected.`,
    Ember.typeOf(name) === 'string');

    let dynamicComponentsRelatedToPlaceholder = this.get(`targetObject._dynamicComponents.${name}`);
    Ember.assert(
      `Wrong type of \`dynamic-components-placeholder\` parent component\`s \`_dynamicComponents.${name}\` propery: ` +
      `actual type is ${Ember.typeOf(dynamicComponentsRelatedToPlaceholder)}, but \`array\` is expected.`,
      Ember.isNone(dynamicComponentsRelatedToPlaceholder) || Ember.isArray(dynamicComponentsRelatedToPlaceholder));

    return dynamicComponentsRelatedToPlaceholder || Ember.A();
  }),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Placeholder name.
    If name is equals to one of {{#crossLink "DynamicComponentObject"}}dynamic component's{{/crossLink}}
    (in {{#crossLink "DynamicComponentsMixin:dynamicComponents:property"}}parent's 'dynamicConponents'{{/crossLink}})
    {{#crossLink "DynamicComponentObject"}}'to' property{{/crossLink}} then component will be rendered inside this placeholder.

    @property name
    @type String
    @default ''
  */
  name: null
});
