/**
  @module ember-flexberry-gis
*/

import { schedule, later } from '@ember/runloop';

import { isArray, A } from '@ember/array';
import { isNone, isBlank } from '@ember/utils';
import { computed, get } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/layers-styles/categorized/layer-property-dropdown';

/**
  Dropdown component to select one of available layer properties.

  @class CategorizedLayersStyleLayerPropertyDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({

  /**
    Related leaflet layer.

    @property leafletLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @default null
  */
  leafletLayer: null,

  /**
    Hash containing available layer's properties and their captions related to current locale an display settings.

    @property _availableLayerProperties
    @type String
    @private
    @readOnly
  */
  _availableLayerProperties: computed('leafletLayer', 'propertyType', 'displaySettings.featuresPropertiesSettings', 'i18n.locale', function () {
    const availableLayerProperties = {};

    const propertyType = this.get('propertyType');
    const layerFieldTypes = this.get('leafletLayer.readFormat.featureType.fieldTypes');
    if (isNone(layerFieldTypes)) {
      return availableLayerProperties;
    }

    const layerProperties = Object.keys(layerFieldTypes);
    const localizedProperties = this.get(`displaySettings.featuresPropertiesSettings.localizedProperties.${this.get('i18n.locale')}`) || {};
    let excludedProperties = this.get('displaySettings.featuresPropertiesSettings.excludedProperties');
    excludedProperties = isArray(excludedProperties) ? A(excludedProperties) : A();

    for (let i = 0, len = layerProperties.length; i < len; i++) {
      const propertyName = layerProperties[i];
      if (excludedProperties.contains(propertyName) || (!isBlank(propertyType) && layerFieldTypes[propertyName] !== propertyType)) {
        continue;
      }

      const propertyCaption = get(localizedProperties, propertyName);
      availableLayerProperties[propertyName] = !isBlank(propertyCaption) ? propertyCaption : propertyName;
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
    const leafletLayer = this.get('leafletLayer');
    if (!isNone(leafletLayer)) {
      return;
    }

    // Leaflet layer is loaded.
    // Allow items to be computed, and then set initial value and show dropdow menu.
    schedule('afterRender', () => {
      later(() => {
        const $dropdown = this.get('_$dropdown');
        const initialValue = this.get('value');
        if (!isBlank(initialValue)) {
          $dropdown.dropdown('set selected', initialValue);
        }

        $dropdown.dropdown('show');
      }, 100);
    });
  },

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    const $dropdown = this.$().dropdown({
      onChange: (newValue) => {
        this.set('value', newValue);
        this.sendAction('change', newValue);
      },
    });

    const initialValue = this.get('value');
    if (!isBlank(initialValue)) {
      $dropdown.dropdown('set selected', initialValue);
    }

    this.set('_$dropdown', $dropdown);
    window.$dropdown = $dropdown;
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    const $dropdown = this.get('_$dropdown');
    $dropdown.dropdown('destroy');
    this.set('_$dropdown', null);

    this._super(...arguments);
  },
});
