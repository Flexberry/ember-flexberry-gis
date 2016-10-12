/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-search';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-search').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-search').
  @property {String} flexberryClassNames.wrapper Component's input CSS-class name ('flexberry-search-input').
  @property {String} flexberryClassNames.wrapper Component's results <div> CSS-class name ('flexberry-search-results').
  @readonly
  @static

  @for FlexberrySearchComponent
*/
const flexberryClassNamesPrefix = 'flexberry-search';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  inpit: flexberryClassNamesPrefix + '-input',
  results: flexberryClassNamesPrefix + '-results'
};

/**
  Flexberry search component with [Semantic UI search](http://semantic-ui.com/modules/search.html) style.

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{flexberry-search
    class="fluid"
    apiUrl='http//api.github.com/search/repositories?q={query}'
    apiOnResponse=(action "onFlexberrySearchApiOnResponse")
  }}
  ```

  @class FlexberrySearchComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberrySearchComponent = Ember.Component.extend({
  /**
    Flag: indicates whether search type is 'category' or not.

    @property _isCategory
    @type Boolean
    @readOnly
    @private
  */
  _isCategory: Ember.computed('type', function() {
    let type = this.get('type');
    return Ember.typeOf(type) === 'string' && type.toLowerCase() === 'category';
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
    Names of observable component's properties.
    Changes in these properties must trigger Semantic UI module's reinitialization.

    @property observableProperties
    @type String[]
    @default ['apiSettings', 'apiSettings.url']
  */
  observableProperties: ['apiSettings', 'apiSettings.url'],

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-icon
      class="map icon"
    }}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-search', 'ui', 'search']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'search'],

  /**
    Components class names bindings.

    @property classNameBindings
    @type String[]
    @default ['_isCategory:category']
  */
  classNameBindings: ['_isCategory:category'],

  /**
    Search type.

    @property type
    @type String
    @default 'standard'
  */
  type: 'standard',

  /**
    Minimum characters count to query for results.

    @property minCharacters
    @type Number
    @default 3
  */
  minCharacters: 3,

  /**
    Search API settings.
    See [Semantic UI examples](http://semantic-ui.com/modules/search.html#using-api-settings).

    @property apiSettings
    @type Object
    @default null
  */
  apiSettings: null,

  /**
    Hash describing rules how to map response into display content.

    @property fields
    @type Object
    @default null
  */
  fields: null,

  /**
    Value typed into input.

    @property value
    @type String
    @default null
  */
  value: null,

  /**
    Initializes Semantic UI search module.

    @method _initializeSearchModule
    @private
  */
  _initializeSearchModule() {
    let $component = this.$();
    if (Ember.isNone($component)) {
      return;
    }

    $component.search({
      type: this.get('type'),
      minCharacters: this.get('minCharacters'),
      apiSettings: this.get('apiSettings'),
      fields: this.get('fields')
    });
  },

  /**
    Destroys Semantic UI search module.

    @method _initializeSearchModule
    @private
  */
  _destroySearchModule() {
    let $component = this.$();
    if (Ember.isNone($component)) {
      return;
    }

    $component.search('destroy');
  },

  /**
    Handles changes in properties related to Semantic UI search module.

    @method _searchPropertiesDidChange
    @private
  */
  _searchPropertiesDidChange() {
    this._destroySearchModule();
    this._initializeSearchModule();
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI search module.
    this._initializeSearchModule();

    // Add observers to search-related properties.
    let observableProperties = this.get('observableProperties');
    if (Ember.isArray(observableProperties)) {
      observableProperties.forEach((propertyName) => {
        Ember.addObserver(this, propertyName, this._searchPropertiesDidChange);
      });
    }
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    // Destroy Semantic UI search module.
    this._destroySearchModule();

    // Remove observers from search-related properties.
    let observableProperties = this.get('observableProperties');
    if (Ember.isArray(observableProperties)) {
      observableProperties.forEach((propertyName) => {
        Ember.removeObserver(this, propertyName, this._searchPropertiesDidChange);
      });
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberrySearchComponent.reopenClass({
  flexberryClassNames
});

export default FlexberrySearchComponent;
