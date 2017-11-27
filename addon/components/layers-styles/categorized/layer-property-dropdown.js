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
    Hash containing available layer's properties and their captions related to current locale an display settings.

    @property _availableLayerProperties
    @type String
    @private
    @readOnly
  */
  _availableLayerProperties: Ember.computed('propertyType', 'leafletLayer', 'displaySettings.featuresPropertiesSettings', 'i18n.locale', function() {
    let availableLayerProperties = {};

    let propertyType = this.get('propertyType');
    let layerFieldTypes = this.get('leafletLayer.readFormat.featureType.fieldTypes');
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
    Related leaflet layer.

    @property leafletLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @default null
  */
  leafletLayer: null,

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
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    this._super(...arguments);
    this.$().dropdown('destroy');
  }
});
