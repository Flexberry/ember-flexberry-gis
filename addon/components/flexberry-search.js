/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import layout from '../templates/components/flexberry-search';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';

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
  @uses DynamicPropertiesMixin
*/
let FlexberrySearchComponent = Ember.Component.extend(DynamicPropertiesMixin, {
  /**
    Flag: indicates whether search type is 'category' or not.

    @property _isCategory
    @type Boolean
    @readOnly
    @private
  */
  _isCategory: Ember.computed('type', function () {
    let type = this.get('type');
    return Ember.typeOf(type) === 'string' && type.toLowerCase() === 'category';
  }),

  actions: {

    /**
      Action called when user press enter in search input
      Invokes {{#crossLink "FlexberrySearchComponent/sendingActions.enter:method"}}'enter' action{{/crossLink}}.
      @method actions.enter
    */
    enter() {
      if (this.get('_lastAction') && this.get('_lastAction') === 'select') {
        this.set('_lastAction', null);
        return;
      }

      let $component = this.$();
      if (Ember.isNone($component)) {
        return;
      }

      if (Ember.isNone(this.get('apiSettings'))) {
        return;
      }

      $component.search('cancel query');
      $component.search('hide results');

      if (this.get('_valueWasSelected')) {
        this.sendAction('select');
      } else {
        this.sendAction('enter');
      }
    },

    /**
      Action called when search input has received focus
      Invokes {{#crossLink "FlexberrySearchComponent/sendingActions.focus:method"}}'focus' action{{/crossLink}}.
      @method actions.focus
    */
    focusIn() {
      if (Ember.$('.flexberry-search.ui.search').hasClass('focus')) {
        this.sendAction('focusIn');
      }
    }
  },

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
    Names of component's properties used for init semantic search module
    @property semanticProperties
    @type String[]
   */
  semanticProperties: [
    'apiSettings',
    'type',
    'minCharacters',
    'fields',
    'showNoResults',
    'onResults',
    'maxResults'
  ],

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
    Maximum results to display when using local and simple search, maximum category count for category search

    @property maxResults
    @type Number
    @default 10
  */
  maxResults: 10,

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

  showNoResults: false,

  /**
    "Select" or something else
    Need to prevent "enter" action after "onSelect" event

    @property _lastAction
    @type String
    @default null
  */
  _lastAction: null,

  /**
    Flag: is value typed or selected

    @property _valueWasSelected
    @type Boolean
    @default false
  */
  _valueWasSelected: false,

  /**
    Clean _lastAction if user change value

    @method _valueChange
  */
  _valueChange:  Ember.observer('value',  function () {
    this.set('_lastAction', null);
    this.set('_valueWasSelected', false);
    }),

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

    if (Ember.isNone(this.get('apiSettings'))) {
      return;
    }

    let semanticProperties = {};

    this.get('semanticProperties').forEach((propertyName) => {
      var propertyValue = this.get(propertyName);
      if (!Ember.isNone(propertyValue)) {
        semanticProperties[propertyName] = propertyValue;
      }
    });

    let _this = this;
    let onSelect = function (element) {
      var field = semanticProperties.fields && semanticProperties.fields.title ? semanticProperties.fields.title : null;
      if (field) {
        _this.set('value', element[field]);
        _this.set('_lastAction', 'select');
        _this.set('_valueWasSelected', true);
        _this.sendAction('select', element);
      }
    };

    semanticProperties.onSelect = onSelect;

    let onSearchQuery = function (query) {
      _this.set('_lastAction', null);
    };

    semanticProperties.onSearchQuery = onSearchQuery;

    $component.search(semanticProperties);
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

  /**
    Component's action invoking when user press enter in search box
    @method sendingActions.enter
   */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberrySearchComponent.reopenClass({
  flexberryClassNames
});

export default FlexberrySearchComponent;
