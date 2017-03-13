/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-dropdown';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-layers-dropdown').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-layers-dropdown').
  @readonly
  @static

  @for FlexberryLayersDropdownComponent
*/
const flexberryClassNamesPrefix = 'flexberry-layers-dropdown';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry layers dropdown component.

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{flexberry-layers-dropdown
    class="fluid"
    filter=(action filterLayers)
    layers=model.mapLayer
    value=selectedLayer
    layerChange=(action "onLayersDropdownLayerChange")
    availableLayersChange=(action "onLayersDropdownAvailableLayersChange")
  }}
  ```

  @class FlexberryLayersDropdownComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryLayersDropdownComponent = Ember.Component.extend({
    /**
      Array containing paths to observable layers hierarchy properties.

      @property _observableProperties
      @type String[]
      @default null
      @private
    */
    _observableProperties: null,

    /**
      Flat layers array containing layers retrieved for hierarchy & filtered.

      @property _layers
      @type Object[]
      @default null
      @private
    */
    _layers: null,

    /**
      Unique layers names.

      @property _availableLayersNames
      @type String[]
      @readOnly
      @private
    */
    _availableLayersNames: Ember.computed('_layers.@each.name', function() {
      let availableLayersNames = Ember.A();

      let layers = this.get('_layers');
      if (!Ember.isArray(layers)) {
        return availableLayersNames;
      }

      Ember.A(layers).forEach((layer, i) => {
        availableLayersNames.pushObject(`${i + 1} - ${Ember.get(layer, 'name')}`);
      });

      return availableLayersNames;
    }),

    /**
      Selected layer name.

      @property _selectedLayerName
      @type String
      @readOnly
      @private
    */
    _selectedLayerName: Ember.computed('_availableLayersNames.[]', 'value', function() {
      let layers = this.get('_layers');
      if (!Ember.isArray(layers)) {
        return null;
      }

      let layer = this.get('value');
      if (Ember.isNone(layer)) {
        return null;
      }

      let selectedLayerName = null;
      layers.forEach((availableLayer, i) => {
        if (availableLayer === layer) {
          selectedLayerName = this.get(`_availableLayersNames.${i}`);
          return false;
        }
      });

      return selectedLayerName;
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
      Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
      to disable component's wrapping <div>.

      @property tagName
      @type String
      @default ''
    */
    tagName: '',

    /**
      Component's wrapping <div> additional CSS-classes names.

      Any other CSS-classes can be added through component's 'class' property.
      ```handlebars
      {{flexberry-layers-dropdown
        class="fluid"
      }}
      ```

      @property class
      @type String
      @default ''
    */
    class: '',

    /**
      Layers hierarchy.

      @property layers
      @type Object[]
      @default null
    */
    layers: null,

    /**
      Selected layer.

      @property value
      @type Object
      @default null
    */
    value: null,

    /**
      Filter function for layers.

      @property filter
      @type Function
      @default null
    */
    filter: null,

    actions: {
      onChange(selectedLayerName) {
        let layer = null;
        this.get('_availableLayersNames').forEach((availableLayerName, i) => {
          if (selectedLayerName === availableLayerName) {
            // Retrieve layer by name & remember as selected.
            layer = this.get(`_layers.${i}`);
            return false;
          }
        });

        this.sendAction('layerChange', layer);
      }
    },

    /**
      Adds observer to layers hierarchy property.

      @method _addHierarchyObserver
      @param {String} propertyPath Observable property path.
    */
    _addHierarchyObserver(propertyPath) {
      let observableProperties = this.get('_observableProperties');
      if (!Ember.isArray(observableProperties)) {
        observableProperties = Ember.A();
        this.set('_observableProperties', observableProperties);
      }

      observableProperties.pushObject(propertyPath);
      Ember.addObserver(this, propertyPath, this._layersOrFilterDidChange);
    },

    /**
      Removes all previously added observers.

      @method _removeHierarchyObservers
    */
    _removeHierarchyObservers() {
      let observableProperties = this.get('_observableProperties');
      if (!Ember.isArray(observableProperties)) {
        return;
      }

      observableProperties.forEach((propertyPath) => {
        Ember.removeObserver(this, propertyPath, this._layersOrFilterDidChange);
      });

      observableProperties.clear();
      this.set('_observableProperties', null);
    },

    /**
      Observers changes in layers hierarchy & builds inner flat layers array,
      where layers are filtered.

      @method _layersOrFilterDidChange
      @private
    */
    _layersOrFilterDidChange: Ember.observer('layers.[]', 'filter', function() {
      Ember.run.once(this, '_buildInnerLayers');
    }),

    /**
      Builds inner flat layers array, where layers are filtered.

      @method _buildInnerLayers
      @private
    */
    _buildInnerLayers() {
      // Remove all previously added observers.
      this._removeHierarchyObservers();

      let layers = Ember.A(this.get('layers') || []);
      let filter = this.get('filter') || function(layer) { return true; };

      let getFilteredLayers = (layers, filter, path) => {
        let result = Ember.A();

        if (Ember.isArray(layers)) {
          layers.forEach((layer, i) => {
            let layerSatisfiesFilter = filter(layer) === true;

            if (layerSatisfiesFilter) {
              result.pushObject(layer);
            }

            let childLayers = Ember.get(layer, 'layers');
            let childLayersPath = `${path}.${i}.layers`;

            result.pushObjects(getFilteredLayers(childLayers, filter, childLayersPath));

            this._addHierarchyObserver(`${childLayersPath}.[]`);
            this._addHierarchyObserver(`${childLayersPath}.@each.isDeleted`);
            this._addHierarchyObserver(`${childLayersPath}.@each.settings`);
          });
        }

        return result;
      };

      let availableLayers = getFilteredLayers(layers, filter, 'layers');
      this.set('_layers', availableLayers);

      this.sendAction('availableLayersChange', availableLayers);

      let layer = this.get('value');
      if (!Ember.isNone(layer) && Ember.isArray(availableLayers) && !availableLayers.contains(layer)) {
        // Previously selected layer isn't available anymore, so selected layer must be null now.
        this.sendAction('layerChange', null);
      }
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this._layersOrFilterDidChange();
    },

    /**
      Destroys component.
    */
    willDestroy() {
      this._super(...arguments);

      this._removeHierarchyObservers();

      let layers = this.get('_layers');
      if (Ember.isArray(layers)) {
        layers.clear();
        this.set('_layers', null);
      }
    }

    /**
      Component's action invoking when selected layer changed.

      @method sendingActions.layerChange
      @param {Object} selectedLayer Selected layer.
    */

    /**
      Component's action invoking when available layers changed.

      @method sendingActions.availableLayersChange
      @param {Object} availableLayers Available layers.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLayersDropdownComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLayersDropdownComponent;
