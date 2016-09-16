/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../mixins/required-actions';
import DomActionsMixin from '../mixins/dom-actions';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import layout from '../templates/components/flexberry-button';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-button').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-button').
  @readonly
  @static

  @for FlexberryDdauCheckboxComponent
*/
const flexberryClassNamesPrefix = 'flexberry-button';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry button component with [Semantic UI button](http://semantic-ui.com/modules/button.html) style.

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

  @class FlexberryButtonComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DomActionsMixin
  @uses DynamicActionsMixin
  @uses DynamicPropertiesMixin
*/
let FlexberryButtonComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DomActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin, {

    /**
      Flag: indicates whether button has caption or not.

      @property _hasCaption
      @type Boolean
      @readOnly
      @private
    */
    _hasCaption: Ember.computed('caption', function () {
      let caption = this.get('caption');
      return Ember.typeOf(caption) === 'string' && Ember.$.trim(caption) !== '' ||
        Ember.typeOf(Ember.String.isHTMLSafe) === 'function' && Ember.String.isHTMLSafe(caption) && Ember.$.trim(Ember.get(caption, 'string')) !== '' ||
        caption instanceof Ember.Handlebars.SafeString && Ember.$.trim(Ember.get(caption, 'string')) !== '';
    }),

    /**
      Flag: indicates whether button has icon or not.

      @property _hasIcon
      @type Boolean
      @readOnly
      @private
    */
    _hasIcon: Ember.computed('iconClass', function () {
      let iconClass = this.get('iconClass');
      return Ember.typeOf(iconClass) === 'string' && Ember.$.trim(iconClass) !== '';
    }),

    /**
      Flag: indicates whether button has icon only (without caption).

      @property _hasIconOnly
      @type Boolean
      @readOnly
      @private
    */
    _hasIconOnly: Ember.computed('_hasIcon', '_hasCaption', function () {
      return this.get('_hasIcon') && !this.get('_hasCaption');
    }),

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
      Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
      to force <label> to be a component's wrapping element.

      @property tagName
      @type String
      @default 'label'
    */
    tagName: 'label',

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
      @default ['flexberry-button', 'ui', 'button']
    */
    classNames: [flexberryClassNames.wrapper, 'ui', 'button'],

    /**
      Components class names bindings.

      @property classNameBindings
      @type String[]
      @default ['readonly:disabled', '_hasIconOnly:icon']
    */
    classNameBindings: ['readonly:disabled', '_hasIconOnly:icon'],

    /**
      Component's caption.

      @property caption
      @type String
      @default null
    */
    caption: null,

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
    readonly: false
  });

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryButtonComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryButtonComponent;
