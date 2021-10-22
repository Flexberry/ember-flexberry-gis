import { A } from '@ember/array';
import { isBlank, isNone } from '@ember/utils';
import { computed, get, observer } from '@ember/object';
import Component from '@ember/component';
import { translationMacro as t } from 'ember-i18n';
import layout from '../templates/components/flexberry-search-panel';

export default Component.extend({
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
  _selectedLayerFeaturesLocalizedProperties: computed(
    '_selectedLayer.settingsAsObject.displaySettings.featuresPropertiesSettings.localizedProperties',
    'i18n.locale',
    function () {
      const currentLocale = this.get('i18n.locale');
      const localizedProperties = this.get(
        '_selectedLayer.settingsAsObject.displaySettings.'
        + `featuresPropertiesSettings.localizedProperties.${currentLocale}`
      ) || {};
      this.set('_localizedValue', null);
      return localizedProperties;
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
    return get(layer, 'canBeSearched');
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

  queryStringObserver: observer('queryString', function () {
    this.set('queryStringEmpty', !isBlank(this.get('queryString')));
  }),

  /**
    Transforms string of coordinate in degrees, minutes, seconds in coordinate in degrees.

    @method degreeMinSecToDegree
    @param {String} degMinSec String of coordinate in degrees, minutes, seconds.
    @return {Number} Coordinate in degrees.
    @private
  */
  degreeMinSecToDegree(degMinSec) {
    const degree = degMinSec.substring(0, degMinSec.indexOf('°'));
    const min = degMinSec.substring(degMinSec.indexOf('°') + 1, degMinSec.indexOf('\''));
    const sec = degMinSec.substring(degMinSec.indexOf('\'') + 1, degMinSec.indexOf('"'));
    const coord = Number(degree) + Number(min) / 60 + Number(sec) / 3600;
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
    const latlng = new L.LatLng(coord1, coord2);
    const xCaption = this.get('xCaption');
    const yCaption = this.get('yCaption');
    const lat = !isNone(degMinSec1) ? degMinSec1 : latlng.lat;
    const lng = !isNone(degMinSec2) ? degMinSec2 : latlng.lng;
    const popupContent = `${xCaption}: ${lat}; `
      + `${yCaption}: ${lng}`;

    const leafletMap = this.get('leafletMap');
    leafletMap.openPopup(popupContent, latlng);
    leafletMap.panTo(latlng);
  },

  actions: {
    querySearch() {
      if (this.get('attrVisible')) {
        if (isNone(this.get('_selectedLayer'))) {
          this.set('errorMessage', this.get('i18n').t('components.flexberry-search.error-message-empty-selected-layer'));
          this.set('showErrorMessage', true);
          return;
        }

        if (isNone(this.get('propertyName'))) {
          this.set('errorMessage', this.get('i18n').t('components.flexberry-search.error-message-empty-attr-layer'));
          this.set('showErrorMessage', true);
          return;
        }
      }

      this.set('showErrorMessage', false);
      const queryString = this.get('queryString');
      const leafletMap = this.get('leafletMap');
      const regexDegree = /^([-]?[0-9]+[.]?[0-9]*) ([-]?[0-9]+[.]?[0-9]*)/;
      const regexDegreeMinSec = /^([-]?[0-9]+[°][0-9]+['][0-9]+[.]?[0-9]*["]) ([-]?[0-9]+[°][0-9]+['][0-9]+[.]?[0-9]*["])/;
      if (regexDegree.test(queryString)) {
        // Go to coordinates
        const coords = regexDegree.exec(queryString);
        this.goTo(coords[1], coords[2]);
      } else if (regexDegreeMinSec.test(queryString)) {
        // Go to coordinates with degree, minute, second
        const degMinSec = regexDegreeMinSec.exec(queryString);
        const coord1 = this.degreeMinSecToDegree(degMinSec[1]);
        const coord2 = this.degreeMinSecToDegree(degMinSec[2]);
        this.goTo(coord1, coord2, degMinSec[1], degMinSec[2]);
      } else {
        // Сontext search and coordinate search
        let filter;
        const searchOptions = {
          queryString,
          maxResultsCount: this.get('maxResultsCount'),
        };
        if (!this.get('attrVisible')) {
          filter = function (layerModel) {
            return layerModel.get('canBeContextSearched') && layerModel.get('visibility');
          };
        } else {
          searchOptions.propertyName = this.get('propertyName');
          const selectedLayer = this.get('_selectedLayer');
          filter = function (layerModel) {
            return layerModel === selectedLayer;
          };
        }

        const e = {
          latlng: leafletMap.getCenter(),
          searchOptions,
          context: !this.get('attrVisible'),
          filter,
          results: A(),
        };
        this.sendAction('querySearch', e);
      }
    },

    clearSearch() {
      this.set('queryString', null);
      this.set('_selectedLayer', null);
      this.set('_localizedValue', null);
      this.sendAction('clearSearch');
    },

    attrSearch() {
      const attrVisible = !this.get('attrVisible');
      if (attrVisible) {
        this.set('attrVisible', attrVisible);
        const searchSettings = this.get('searchSettings');
        this.set('_searchSettings', searchSettings);
        this.set('searchSettings', null);
        this.sendAction('attrSearch', this.get('queryString'));
      } else {
        const _searchSettings = this.get('_searchSettings');
        this.set('searchSettings', _searchSettings);
        this.set('_searchSettings', null);
        this.set('attrVisible', attrVisible);
      }
    },

    onLayersDropdownLayerChange(selectedLayer) {
      this.set('_selectedLayer', selectedLayer);
    },

    onChange(selectedText) {
      const searchProperties = this.get('_selectedLayerFeaturesLocalizedProperties');
      for (const property in searchProperties) {
        if (searchProperties[property] === selectedText) {
          this.set('propertyName', property);
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
  },
});
