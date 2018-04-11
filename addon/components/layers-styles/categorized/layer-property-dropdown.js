/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-styles/categorized/layer-property-dropdown';

/**
  Dropdown component to select one of available layer properties.

  @class CategorizedLayersStyleLayerPropertyDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Flag: indicates whether leaflet layer is loading now.

    @property _leafletLayerIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletLayerIsLoading: false,

  /**
    Related leaflet layer.

    @property _leafletLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @default null
    @private
  */
  _leafletLayer: null,

  /**
    Hash containing available layer's properties and their captions related to current locale an display settings.

    @property _availableLayerProperties
    @type String
    @private
    @readOnly
  */
  _availableLayerProperties: Ember.computed('_leafletLayer', 'propertyType', 'displaySettings.featuresPropertiesSettings', 'i18n.locale', function() {
    let availableLayerProperties = {};

    let propertyType = this.get('propertyType');
    let layerFieldTypes = this.get('_leafletLayer.readFormat.featureType.fieldTypes');
    console.log('11111');
    if (Ember.isNone(layerFieldTypes)) {
      return availableLayerProperties;
    }

    let layerProperties = Object.keys(layerFieldTypes);
    let localizedProperties = this.get(`displaySettings.featuresPropertiesSettings.localizedProperties.${this.get('i18n.locale')}`) || {};
    let excludedProperties = this.get(`displaySettings.featuresPropertiesSettings.excludedProperties`);
    excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();

    for (let i = 0, len = layerProperties.length; i < len; i++) {
      let propertyName = layerProperties[i];
      if (excludedProperties.contains(propertyName) || (!Ember.isBlank(propertyType) && layerFieldTypes[propertyName] !== propertyType)) {
        continue;
      }

      let propertyCaption = Ember.get(localizedProperties, propertyName);
      availableLayerProperties[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
    }

    return availableLayerProperties;
  }),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['ui', 'inline', 'dropdown', 'categorized-layers-style-layer-property-dropdown']
  */
  classNames: ['ui', 'selection', 'dropdown', 'categorized-layers-style-layer-property-dropdown'],

  /**
    Component's class names bindings.

    @property classNameBindings
    @type String[]
    @default ['_leafletLayerIsLoading:loading']
  */
  classNameBindings: ['_leafletLayerIsLoading:loading'],

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Hash containing layer display settings.

    @property displaySettings
    @type Object
    @default null
  */
  displaySettings: null,

  /**
    Related layer's type.

    @property layerType
    @type String
    @default null
  */
  layerType: null,

  /**
    Method returning related leaflet layer.

    @property leafletLayer
    @type Function
    @default null
  */
  getLeafletLayer: null,

  /**
    Selected layer property.

    @property value
    @type String
    @default null
  */
  value: null,

  /**
    Desired properties type ('string', 'number', 'date', ...).

    @property type
    @type String
    @default null
  */
  propertyType: null,

  /**
    Click event handler.
  */
  click() {
    let leafletLayer = this.get('_leafletLayer');
    if (!Ember.isNone(leafletLayer)) {
      return;
    }

    let getLeafletLayer = this.get('getLeafletLayer');
    if (typeof getLeafletLayer !== 'function') {
      return;
    }

    this.set('_leafletLayerIsLoading', true);
    getLeafletLayer().then((leafletLayer) => {
      this.set('_leafletLayer', leafletLayer);

      // Leaflet layer is loaded.
      // Allow items to be computed, and then set initial value and show dropdow menu.
      Ember.run.schedule('afterRender', () => {
        Ember.run.later(() => {
          let $dropdown = this.get('_$dropdown');
          let initialValue = this.get('value');
          if (!Ember.isBlank(initialValue)) {
            $dropdown.dropdown('set selected', initialValue);
          }

          $dropdown.dropdown('show');
        }, 100);
      });
    }).finally(() => {
      this.set('_leafletLayerIsLoading', false);
    });
  },

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let $dropdown = this.$().dropdown({
      onChange: (newValue) => {
        this.set('value', newValue);
        this.sendAction('change', newValue);
      }
    });

    let initialValue = this.get('value');
    if (!Ember.isBlank(initialValue)) {
      $dropdown.dropdown('set selected', initialValue);
    }

    this.set('_$dropdown', $dropdown);
    window.$dropdown = $dropdown;
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    let $dropdown = this.get('_$dropdown');
    $dropdown.dropdown('destroy');

    this.set('_$dropdown', null);
    this.set('_leafletLayer', null);

    this._super(...arguments);
  }
});
