/**
  @module ember-flexberry-gis
*/

import layout from '../templates/components/flexberry-links-editor';
import FlexberryLookupCompatibleComponent from 'ember-flexberry/mixins/flexberry-lookup-compatible-component';
import FlexberryBaseComponent from 'ember-flexberry/components/flexberry-base-component';
import {
  translationMacro as t
} from 'ember-i18n';

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
let FlexberryLinksEditorComponent = FlexberryBaseComponent.extend(FlexberryLookupCompatibleComponent, {

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

  /**
    Layer link's 'Map object setting' field's caption.

    @property mosCaption
    @type String
    @default t('components.flexberry-links-editor.map-object-setting-textbox.caption')
  */
  mosCaption: t('components.flexberry-links-editor.map-object-setting-textbox.caption'),

  /**
    Layer link's 'Allow show' field's caption.

    @property allowShowCaption
    @type String
    @default t('components.flexberry-links-editor.allow-show-textbox.caption')
  */
  allowShowCaption: t('components.flexberry-links-editor.allow-show-textbox.caption'),

  actions: {
    /**
      Update relation value at model.
      @method actions.updateLookupValue
      @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
    */
    updateLookupValue(updateData) {
      this.sendAction('updateLookupValue', updateData);
    },

    /**
      Handles {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}'flexberry-ddau-checkbox' component's 'change' action{{/crossLink}}.

      @method actions.onVisibilityCheckboxChange
      @param {Object} e eventObject Event object from {{#crossLink "FlexberryDdauCheckbox/sendingActions.change:method"}}'flexberry-ddau-checkbox' component's 'change' action{{/crossLink}}.
    */
    onVisibilityCheckboxChange(...args) {
      this.sendAction('changeVisibility', ...args);
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLinksEditorComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLinksEditorComponent;
