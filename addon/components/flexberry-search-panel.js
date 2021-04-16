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
    'i18n.locale',
    function () {
      let currentLocale = this.get('i18n.locale');
      let localizedProperties = this.get(
        `_selectedLayer.settingsAsObject.displaySettings.` +
        `featuresPropertiesSettings.localizedProperties.${currentLocale}`) || {};
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

  queryStringObserver: Ember.observer('queryString', function() {
    this.set('queryStringEmpty', !Ember.isBlank(this.get('queryString')));
  }),

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
      let queryString =  this.get('queryString');
      let leafletMap = this.get('leafletMap');
      const regex = /^([-]?[0-9]+[.]?[0-9]*) ([-]?[0-9]+[.]?[0-9]*)/;
      if (regex.test(queryString)) {
        // Go to coordinates
        let coords = regex.exec(queryString);
        let latlng = new L.LatLng(coords[1], coords[2]);
        let xCaption = this.get('xCaption');
        let yCaption = this.get('yCaption');
        let popupContent =
          `${xCaption}: ${latlng.lat}; ` +
          `${yCaption}: ${latlng.lng}`;

        leafletMap.openPopup(popupContent, latlng);
        leafletMap.panTo(latlng);
      } else {
        // Сontext search and coordinate search
        let filter;
        let searchOptions = {
          queryString: queryString,
          maxResultsCount: this.get('maxResultsCount')
        };
        if (!this.get('attrVisible')) {
          filter = function(layerModel) {
            return layerModel.get('canBeContextSearched') && layerModel.get('visibility');
          };
        } else {
          searchOptions.propertyName = this.get('propertyName');
          let selectedLayer = this.get('_selectedLayer');
          filter = function(layerModel) {
            return layerModel === selectedLayer;
          };
        }

        let e = {
          latlng: leafletMap.getCenter(),
          searchOptions: searchOptions,
          context: !this.get('attrVisible'),
          filter: filter,
          results: Ember.A()
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
  }
});
