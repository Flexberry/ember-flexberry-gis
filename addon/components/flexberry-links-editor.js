/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-links-editor';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-links-editor').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-links-editor').
  @readonly
  @static

  @for FlexberryLinksEditorComponent
*/
const flexberryClassNamesPrefix = 'flexberry-links-editor';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry links editor component with [Semantic UI segment](http://semantic-ui.com/modules/button.html) style.

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{flexberry-button
    caption="My button"
    click=(action "onMyButtonClick")
  }}
  ```

  controllers/my-form.js
  ```javascript
  actions: {
    onMyButtonClick(e) {
      // Log jQuery 'click' event object triggered after checkbox input was clicked.
      console.log('My button clicked. jQuery \'click\' event-object: ', e.originalEvent);
    }
  }
  ```

  @class FlexberryLinksEditorComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryLinksEditorComponent = Ember.Component.extend({

  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-button
      class="red"
      caption="My red button"
      click=(action "onMyRedButtonClick")
    }}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-button', 'ui', 'segment']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'segment'],

  /**
    Components class names bindings.

    @property classNameBindings
    @type String[]
    @default ['readonly:disabled', '_hasIconOnly:icon']
  */
  classNameBindings: ['readonly:disabled', '_hasIconOnly:icon'],

  /**
    Components attributes bindings.

    @property attributeBindings
    @type String[]
    @default ['tooltip:title']
  */
  attributeBindings: ['tooltip:title'],

  /**
    Component's caption.

    @property caption
    @type String
    @default null
  */
  caption: null,

  /**
    Component's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default null
  */
  tooltip: null,

  /**
    Component's icon CSS-class names.

    @property iconClass
    @type String
    @default null
  */
  iconClass: null,

  /**
    Flag: indicates whether component is in readonly mode.

    @property readonly
    @type Boolean
    @default false
  */
  readonly: false,

  actions: {
    /**
      Handles action from lookup choose action.

      @method actions.showLookupDialog
      @param {Object} chooseData Lookup parameters (projection name, relation name, etc).
    */
    showLookupDialog(chooseData) {
      this.sendAction('showLookupDialog', chooseData);
    },

    /**
      Handlers action from FlexberryLookup remove action.
      @method actions.removeLookupValue
      @param {Object} removeData Lookup parameters: { relationName, modelToLookup }.
    */
    removeLookupValue(removeData) {
      this.sendAction('removeLookupValue', removeData);
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLinksEditorComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLinksEditorComponent;
