/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/geoprovider';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-geoprovider').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-geoprovider').
  @property {String} flexberryClassNames.dialog Component's inner dialog CSS-class name ('flexberry-geometry-add-mode-geoprovider').
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-geometry-add-mode-geoprovider').
  @readonly
  @static

  @for FlexberryGeometryAddModeGeoProviderComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-geoprovider';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog',
  form: flexberryClassNamesPrefix + '-form'
};

let FlexberryGeometryAddModeGeoProviderComponent = Ember.Component.extend({
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
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Flag indicates whether geometry adding dialog has been already requested by user or not.

    @property _dialogHasBeenRequested
    @type Boolean
    @default false
    @private
  */
  _dialogHasBeenRequested: false,

  /**
    Flag indicates whether to show geometry adding dialog.

    @property _dialogVisible
    @type Boolean
    @default false
    @private
  */
  _dialogVisible: false,

  /**
    Flag indicates that provider request is running.

    @property _loading
    @type Boolean
    @default false
    @private
  */
  _loading: false,

  /**
    Object with field names that is invalid.

    @property _parsingErrors
    @type Object
    @default null
    @private
  */
  _parsingErrors: {},

  /**
    Address for request.

    @property address
    @type String
    @default null
  */
  address: null,

  /**
    Provider for geocode request.

    @property provider
    @type Object
    @default null
  */
  provider: null,

  _availableProviders: null,

  _availableProviderNames: null,

  actions: {
    /**
      Handles button click.
    */
    onButtonClick() {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeGeoProviderComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      // Prevent dialog from being closed.
      e.closeDialog = false;

      let parsedData = this.parseData();
      if (Ember.isNone(parsedData)) {
        return;
      }

      let providerName = parsedData.provider;
      if (Ember.isNone(this.get(`_availableProviders.${providerName}`))) {
        return;
      }

      this.set('_loading', true);
      let provider = this.get(`_availableProviders.${providerName}`);

      provider.executeGeocoding({ query: parsedData.address }).then((result) => {
        if (Ember.isBlank(result)) {
          this.set('_parsingErrors', { address: true });
          return;
        }

        // TODO geocoder may return a collection of elements.
        // user must select an appropriate element.
        // as for now - just selects the first.
        let addedLayer = this.getLayer(result[0]);

        this.sendAction('complete', addedLayer);

      }).catch(() => {
        console.log(arguments);
      }).finally(() => {
        this.set('_loading', false);
        this.set('address', null);
        this.set('provider', null);
        e.target.modal('hide');
      });
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny() {
      this.set('address', null);
      this.set('provider', null);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.initProviders();
  },

  /**
    Initialize available geoproviders.
  */
  initProviders() {
    let availableProviderNames = Ember.getOwner(this).knownNamesForType('geo-provider');
    if (Ember.isArray(availableProviderNames)) {
      let providers = {};
      let providerNames = [];
      availableProviderNames.forEach((name) => {
        if (!Ember.isEqual(name, 'base')) {
          providers[name] = Ember.getOwner(this).lookup(`geo-provider:${name}`);
          providerNames.push(name);
        }
      });
      this.set('_availableProviders', providers);
      this.set('_availableProviderNames', providerNames);
    }
  },

  /**
    Parses input data.

    @method parseData
    @return {Object} Parsed data if it is valid or null.
  */
  parseData() {
    let address = this.get('address');
    let provider = this.get('provider');
    let dataIsValid = true;
    let errors = {};

    if (Ember.isBlank(address)) {
      errors.address = true;
      dataIsValid = false;
    }

    if (Ember.isBlank(provider)) {
      errors.provider = true;
      dataIsValid = false;
    }

    this.set('_parsingErrors', errors);

    return dataIsValid ? { address, provider } : null;
  },

  getLayer(data) {
    switch (data.type) {
      case 'marker':
        let [lng, lat] = data.coordinates.split(' ');
        return L.marker([lat, lng]);
      default:
        return null;
    }
  },

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
  */
});

FlexberryGeometryAddModeGeoProviderComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeGeoProviderComponent;
