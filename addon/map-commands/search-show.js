/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import SearchMapCommand from './search';

/**
  Search show map-command.
  Shows results of previously executed search on map.

  @class SearchShowMapCommand
  @extends SearchMapCommand
*/
export default SearchMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    options = options || {};
    let features = Ember.get(options, 'features');
    let layer = Ember.get(options, 'layer') || {};
    let layerName = Ember.get(layer, 'name');
    let featuresPropertiesSettings = Ember.get(layer, 'settingsAsObject.displaySettings.featuresPropertiesSettings') || {};

    let getFeatureFirstAvailableProperty = function (feature) {
      let featureProperties = Ember.get(feature, 'properties') || {};
      let displayPropertyName = Object.keys(featureProperties)[0];
      return featureProperties[displayPropertyName];
    };

    let getFeatureDisplayProperty = function (feature, featuresPropertiesSettings) {
      let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
      let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');

      if ((Ember.typeOf(displayProperty) !== 'array' && !displayPropertyIsCallback)) {
        return getFeatureFirstAvailableProperty(feature);
      }

      if ((Ember.typeOf(displayProperty) !== 'string' && displayPropertyIsCallback)) {
        return getFeatureFirstAvailableProperty(feature);
      }

      if (!displayPropertyIsCallback) {
        let featureProperties = Ember.get(feature, 'properties') || {};

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
            let value = featureProperties[prop];
            if (Ember.isNone(displayValue) && !Ember.isNone(value) && !Ember.isEmpty(value)) {
              displayValue = value;
            }
          }
        });

        return !Ember.isNone(displayValue) ? displayValue : getFeatureFirstAvailableProperty(feature);
      }

      // Defined displayProperty is a serialized java script function, which can calculate display property.
      let calculateDisplayProperty = eval(`(${displayProperty})`);
      Ember.assert(
        'Property \'settings.displaySettings.featuresPropertiesSettings.displayProperty\' ' +
        'in layer \'' + layerName + '\' is not a valid java script function',
        Ember.typeOf(calculateDisplayProperty) === 'function');

      return calculateDisplayProperty(feature);
    };

    // Clear previous features.
    let featuresLayer = this.get('featuresLayer');

    // Clear previous features & add new.
    // Leaflet clear's layers with some delay, add if we add again some cleared layer (immediately after clear),
    // it will be removed after delay (by layer's id),
    // so we will use timeout until better solution will be found.
    Ember.run(() => {
      featuresLayer.clearLayers();
      let minimalVisibleZoom = features[0].leafletLayer.minZoom;
      setTimeout(() => {
        // Show new features.
        features.forEach((feature) => {
          let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
          if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
            leafletLayer.setStyle({ color: 'yellow' });
          }

          if (Ember.typeOf(leafletLayer.bindPopup) === 'function') {
            leafletLayer.bindPopup(getFeatureDisplayProperty(feature, featuresPropertiesSettings));
          }

          if (leafletLayer.minZoom > minimalVisibleZoom) {
            minimalVisibleZoom = leafletLayer.minZoom;
          }

          leafletLayer.addTo(featuresLayer);
        });

        let leafletMap = this.get('leafletMap');
        let layearBounds = featuresLayer.getBounds();

        if (leafletMap.getBoundsZoom(layearBounds) < minimalVisibleZoom) {
          leafletMap.setView(layearBounds.getCenter(), minimalVisibleZoom);
        } else {
          leafletMap.fitBounds(layearBounds);
        }
      }, 10);
    });
  }
});
