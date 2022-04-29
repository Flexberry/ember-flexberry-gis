import Ember from 'ember';
import layout from '../templates/components/flexberry-search-panel';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  classNames: ['flexberry-search-panel'],

  layout,

  /**
    Selected layer.

    @property _layer
    @type Object
    @default null
    @private
  */
  _selectedLayer: null,

  /**
    Selected layer features localized properties to being displayed in search results table.

    @property _selectedLayerFeaturesLocalizedProperties
    @type String[]
    @readOnly
    @private
  */
  _selectedLayerFeaturesLocalizedProperties: Ember.computed(
    '_selectedLayer.settingsAsObject.displaySettings.featuresPropertiesSettings.localizedProperties',
    '_selectedLayer.settingsAsObject.searchSettings.searchFields',
    'i18n.locale',
    function () {
      let currentLocale = this.get('i18n.locale');
      let searchFields = this.get('_selectedLayer.settingsAsObject.searchSettings.searchFields') || [];
      let localizedProperties = this.get(
        `_selectedLayer.settingsAsObject.displaySettings.` +
        `featuresPropertiesSettings.localizedProperties.${currentLocale}`) || {};

      let searchProperties = {};

      // when Ember.isArray check this object (searchProperties), length is not null.
      // and ember thinks the object is an array. This is bad.
      searchFields.forEach((prop) => {
        Ember.set(searchProperties, prop === 'length' ? '_' + prop : prop,
          Ember.keys(localizedProperties).indexOf(prop) > -1 ?
          localizedProperties[prop] : prop);
      });

      this.set('_localizedValue', null);
      return searchProperties;
    }
  ),

  /**
    Filter method for available layers.

    @method _layerCanBeSearched
    @param {Object} layer Layer which must be checked for 'search' operation availability for it.
    @return {Boolean} Flag: indicates whether 'search' operation is available for the specified layer.
    @private
  */
  _layerCanBeSearched(layer) {
    return Ember.get(layer, 'canBeSearched');
  },

  /**
    Object with properties for which user can do search

    @property searchProperties
    @type Object
    @default null
  */
  searchProperties: null,

  /**
    String with property for which user do search

    @property propertyName
    @type String
    @default null
  */
  propertyName: null,

  /**
    Localized value with property for which user do search

    @property _localizedValue
    @type String
    @default null
  */
  _localizedValue: null,

  xCaption: t('map-commands.go-to.available-crs.latlng.xCaption'),
  yCaption: t('map-commands.go-to.available-crs.latlng.yCaption'),

  /**
    Object with search seettings

    @property _searchSettings
    @type Object
    @default null
  */
  _searchSettings: null,

  /**
    Flag: indicates whether to show error message or not.

    @property showErrorMessage
    @type Boolean
    @readOnly
  */
  showErrorMessage: false,

  /**
    Dialog's 'error-message' caption.

    @property errorMessageCaption
    @type String
    @default t('components.map-commands-dialogs.search.error-message-caption')
  */
  errorMessageCaption: t('components.flexberry-search.error-message-caption'),

  /**
    Error message.

    @property errorMessage
    @type String
    @default null
  */
  errorMessage: null,

  /**
    Flag: indicates whether to show clear button or not.

    @property queryStringEmpty
    @type String
    @default '''
  */
  queryStringEmpty: '',

  queryStringObserver: Ember.observer('queryString', function () {
    this.set('queryStringEmpty', !Ember.isBlank(this.get('queryString')));
  }),

  /**
    Transforms string of coordinate in degrees, minutes, seconds in coordinate in degrees.

    @method degreeMinSecToDegree
    @param {String} degMinSec String of coordinate in degrees, minutes, seconds.
    @return {Number} Coordinate in degrees.
    @private
  */
  degreeMinSecToDegree(degMinSec) {
    let degree = degMinSec.substring(0, degMinSec.indexOf('°'));
    let min = degMinSec.substring(degMinSec.indexOf('°') + 1, degMinSec.indexOf('\''));
    let sec = degMinSec.substring(degMinSec.indexOf('\'') + 1, degMinSec.indexOf('"'));
    let coord = Number(degree) + Number(min) / 60 + Number(sec) / 3600;
    return coord.toFixed(5);
  },

  /**
    Transforms string of coordinate in degrees, minutes, seconds in coordinate in degrees.

    @method goTo
    @param {Number} coord1 Latitude.
    @param {Number} coord1 Longitude.
    @return {Nothing} Go to coordinates.
    @private
  */
  goTo(coord1, coord2, degMinSec1, degMinSec2) {
    let latlng = new L.LatLng(coord1, coord2);
    let xCaption = this.get('xCaption');
    let yCaption = this.get('yCaption');
    let lat = !Ember.isNone(degMinSec1) ? degMinSec1 : latlng.lat;
    let lng = !Ember.isNone(degMinSec2) ? degMinSec2 : latlng.lng;
    let popupContent =
      `${xCaption}: ${lat}; ` +
      `${yCaption}: ${lng}`;

    let leafletMap = this.get('leafletMap');
    leafletMap.openPopup(popupContent, latlng);
    leafletMap.panTo(latlng);
  },

  actions: {
    querySearch() {
      if (this.get('attrVisible')) {
        if (Ember.isNone(this.get('_selectedLayer'))) {
          this.set('errorMessage', this.get('i18n').t('components.flexberry-search.error-message-empty-selected-layer'));
          this.set('showErrorMessage', true);
          return;
        } else if (Ember.isNone(this.get('propertyName'))) {
          this.set('errorMessage', this.get('i18n').t('components.flexberry-search.error-message-empty-attr-layer'));
          this.set('showErrorMessage', true);
          return;
        }
      }

      this.set('showErrorMessage', false);
      let queryString = this.get('queryString');
      let leafletMap = this.get('leafletMap');
      const regexDegree = /^([-]?[0-9]+[.]?[0-9]*) ([-]?[0-9]+[.]?[0-9]*)/;
      const regexDegreeMinSec = /^([-]?[0-9]+[°][0-9]+['][0-9]+[.]?[0-9]*["]) ([-]?[0-9]+[°][0-9]+['][0-9]+[.]?[0-9]*["])/;
      if (regexDegree.test(queryString)) {
        // Go to coordinates
        let coords = regexDegree.exec(queryString);
        this.goTo(coords[1], coords[2]);
      } else if (regexDegreeMinSec.test(queryString)) {
        // Go to coordinates with degree, minute, second
        let degMinSec = regexDegreeMinSec.exec(queryString);
        let coord1 = this.degreeMinSecToDegree(degMinSec[1]);
        let coord2 = this.degreeMinSecToDegree(degMinSec[2]);
        this.goTo(coord1, coord2, degMinSec[1], degMinSec[2]);
      } else {
        // Сontext search and coordinate search
        let filter;
        let selectedLayerId;
        let searchOptions = {
          queryString: queryString,
          maxResultsCount: this.get('maxResultsCount')
        };
        if (!this.get('attrVisible')) {
          filter = function (layerModel) {
            return layerModel.get('canBeContextSearched') && layerModel.get('visibility');
          };
        } else {
          searchOptions.propertyName = this.get('propertyName');
          let selectedLayer = this.get('_selectedLayer');
          selectedLayerId = selectedLayer.get('id');
          filter = function (layerModel) {
            return layerModel === selectedLayer;
          };
        }

        let e = {
          latlng: leafletMap.getCenter(),
          searchOptions: searchOptions,
          context: !this.get('attrVisible'),
          filter: filter,
          results: Ember.A(),
          selectedLayer: selectedLayerId
        };
        this.sendAction('querySearch', e);
      }
    },

    clearSearch() {
      this.set('queryString', null);
      this.set('_selectedLayer', null);
      this.set('_localizedValue', null);
      this.sendAction('clearSearch');
      let $clearSearch = Ember.$('.clear-search-button');
      if (!$clearSearch.hasClass('hidden')) {
        $clearSearch.addClass('hidden');
      }
    },

    attrSearch() {
      let attrVisible = !this.get('attrVisible');
      if (attrVisible) {
        this.set('attrVisible', attrVisible);
        let searchSettings = this.get('searchSettings');
        this.set('_searchSettings', searchSettings);
        this.set('searchSettings', null);
        this.sendAction('attrSearch', this.get('queryString'));
      } else {
        let _searchSettings = this.get('_searchSettings');
        this.set('searchSettings', _searchSettings);
        this.set('_searchSettings', null);
        this.set('attrVisible', attrVisible);
      }
    },

    onLayersDropdownLayerChange(selectedLayer) {
      this.set('_selectedLayer', selectedLayer);
    },

    onChange(selectedText) {
      let searchProperties = this.get('_selectedLayerFeaturesLocalizedProperties');
      for (var property in searchProperties) {
        if (searchProperties[property] === selectedText) {
          this.set('propertyName', property === '_length' ? 'length' : property);
        }
      }
    },

    /**
      Handler for error 'ui-message. component 'onShow' action.

      @method actions.onErrorMessageShow
    */
    onErrorMessageShow() {
    },

    /**
      Handler for error 'ui-message' component 'onHide' action.

      @method actions.onErrorMessageHide
    */
    onErrorMessageHide() {
      this.set('showErrorMessage', false);
    },

    /**
      Action called when search input has received focus
      Invokes {{#crossLink "FlexberrySearchComponent/sendingActions.focus:method"}}'focus' action{{/crossLink}}.
      @method actions.focus
    */
    focus() {
      let leafletMap = this.get('leafletMap');
      leafletMap.fire('flexberry-map:focusSearch', { focusSearch: 'focusSearch' });
    }
  }
});
