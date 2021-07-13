/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/geoprovider';
import { translationMacro as t } from 'ember-i18n';

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
    @property layer
    @type Leaflet layer
    @default null
    @private
  */
  layer: null,

  active: false,

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
    Available instances of geoproviders.

    @property _availableProviders
    @type Object
    @default null
    @private
  */
  _availableProviders: null,

  /**
    Names of the available geoproviders.

    @property _availableProviderNames
    @type Array
    @default null
    @private
  */
  _availableProviderNames: null,

  /**
    Geometry object to be added as layer.
  */
  _selectedGeoObject: null,

  /**
    The collection of geoObjects - result of geoprovider query.
  */
  _queryResults: null,

  /**
    Total count of query result items.
  */
  _queryResultsTotalCount: 0,

  addressLabel: t('components.geometry-add-modes.geoprovider.address-field-label'),

  providerLabel: t('components.geometry-add-modes.geoprovider.provider-field-label'),

  searchButtonCaption: t('components.geometry-add-modes.geoprovider.search-button-caption'),

  resultsLabel: t('components.geometry-add-modes.geoprovider.results-label'),

  resultsHeaderSelect: t('components.geometry-add-modes.geoprovider.results-header-select'),

  resultsHeaderName: t('components.geometry-add-modes.geoprovider.results-header-name'),

  resultsHeaderPosition: t('components.geometry-add-modes.geoprovider.results-header-position'),

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

  actions: {
    /**
      Handles search button click.
    */
    onSearchClick() {
      let options = { skip: 0, top: 5 };
      this._doSearch(options);
    },

    /**
      Handles row selection in query results table.
    */
    onRowSelect(rowId, { checked }) {
      // TODO set _selectedGeoObject
      if (checked) {
        this.set('_selectedRow', rowId);
      } else {
        this.set('_selectedRow', null);
      }
    },

    /**
      Handles 'getData' action from flexberry-table.

      @method actions.onResultsTableGetData
      @param {Object} options
    */
    onResultsTableGetData(options) {
      this._doSearch(options);
    },

    apply() {
      let _selectedRow = this.get('_selectedRow');

      if (Ember.isNone(_selectedRow)) {
        let errors = this.get('_parsingErrors');
        errors.results = true;
        this.set('_parsingErrors', errors);

        return;
      }

      let geoObject = this.get('_queryResults').find((row) => { return Ember.isEqual(_selectedRow, Ember.guidFor(row)); });

      if (Ember.isNone(geoObject)) {
        let errors = this.get('_parsingErrors');
        errors.results = true;
        this.set('_parsingErrors', errors);

        return;
      }

      let addedLayer = this.getLayer(geoObject);
      if (Ember.isNone(addedLayer)) {
        return;
      }

      let layer = this.get('layer');
      if (!Ember.isNone(layer)) {
        layer.setLatLng(addedLayer.getLatLng());

        layer.disableEdit();
        layer.enableEdit();

        addedLayer.remove();

        addedLayer = layer;
      }

      this._cleanUpForm();
      this.sendAction('updateLayer', addedLayer, true);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.initProviders();
  },

  initialSettings: Ember.on('init', Ember.observer('settings', function () {
    this._cleanUpForm();
  })),

  /**
    Makes a request to the selected geoprovider with specified options.

    @param {Object} options Search options.
  */
  _doSearch(options) {
    this.set('_selectedRow', null);

    let parsedData = this.parseData();
    if (Ember.isNone(parsedData)) {
      this.set('_queryResults', null);
      this.set('_queryResultsTotalCount', 0);
      return;
    }

    let providerName = parsedData.provider;
    if (Ember.isNone(this.get(`_availableProviders.${providerName}`))) {
      return;
    }

    this.set('_loading', true);
    let provider = this.get(`_availableProviders.${providerName}`);

    let searchOptions = Ember.$.extend(options, { query: parsedData.address });
    provider.executeGeocoding(searchOptions).then((result) => {
      if (Ember.isBlank(result)) {
        this.set('_parsingErrors', { address: true });
        return;
      }

      this.set('_queryResults', result.data);
      this.set('_queryResultsTotalCount', result.total);

    }).catch(() => {
      console.error(arguments);
    }).finally(() => {
      this.set('_loading', false);
    });
  },

  _cleanUpForm() {
    this.set('address', null);
    this.set('provider', null);
    this.set('_parsingErrors', null);
    this.set('_queryResults', null);
    this.set('_queryResultsTotalCount', 0);
    this.set('_selectedRow', null);
    this.set('_searchOptions', null);
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
        let latlng = data.position.split(' ');
        return L.marker([latlng[1], latlng[0]]);
      default:
        return null;
    }
  },

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
    @param {Object} options Actions options.
    @param {Boolean} options.panToAddedObject Flag indicating wheter to pan to added object.
  */
});

FlexberryGeometryAddModeGeoProviderComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeGeoProviderComponent;
