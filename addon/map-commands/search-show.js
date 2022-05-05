/**
  @module ember-flexberry-gis
*/

import { run } from '@ember/runloop';

import { assert } from '@ember/debug';
import { typeOf, isNone, isEmpty } from '@ember/utils';
import { get } from '@ember/object';

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
    const features = get(options, 'features');
    const layer = get(options, 'layer') || {};
    const layerName = get(layer, 'name');
    const featuresPropertiesSettings = get(layer, 'settingsAsObject.displaySettings.featuresPropertiesSettings') || {};

    const getFeatureFirstAvailableProperty = function (feature) {
      const featureProperties = get(feature, 'properties') || {};
      const displayPropertyName = Object.keys(featureProperties)[0];
      return featureProperties[displayPropertyName];
    };

    const getFeatureDisplayProperty = function (feature) {
      const displayPropertyIsCallback = get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
      const displayProperty = get(featuresPropertiesSettings, 'displayProperty');

      if ((typeOf(displayProperty) !== 'array' && !displayPropertyIsCallback)) {
        return getFeatureFirstAvailableProperty(feature);
      }

      if ((typeOf(displayProperty) !== 'string' && displayPropertyIsCallback)) {
        return getFeatureFirstAvailableProperty(feature);
      }

      if (!displayPropertyIsCallback) {
        const featureProperties = get(feature, 'properties') || {};

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.prototype.hasOwnProperty.call(prop)) {
            const value = featureProperties[prop];
            if (isNone(displayValue) && !isNone(value) && !isEmpty(value)) {
              displayValue = value;
            }
          }
        });

        return !isNone(displayValue) ? displayValue : getFeatureFirstAvailableProperty(feature);
      }

      // Defined displayProperty is a serialized java script function, which can calculate display property.
      const calculateDisplayProperty = this.eval(`(${displayProperty})`);
      assert(
        `${'Property \'settings.displaySettings.featuresPropertiesSettings.displayProperty\' '
        + 'in layer \''}${layerName}' is not a valid java script function`,
        typeOf(calculateDisplayProperty) === 'function'
      );

      return calculateDisplayProperty(feature);
    };

    // Clear previous features.
    const featuresLayer = this.get('featuresLayer');

    // Clear previous features & add new.
    // Leaflet clear's layers with some delay, add if we add again some cleared layer (immediately after clear),
    // it will be removed after delay (by layer's id),
    // so we will use timeout until better solution will be found.
    run(() => {
      featuresLayer.clearLayers();
      let minimalVisibleZoom = features[0].leafletLayer.minZoom;
      setTimeout(() => {
        // Show new features.
        features.forEach((feature) => {
          const leafletLayer = get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
          if (typeOf(leafletLayer.setStyle) === 'function') {
            leafletLayer.setStyle({ color: 'yellow', });
          }

          if (typeOf(leafletLayer.bindPopup) === 'function') {
            leafletLayer.bindPopup(getFeatureDisplayProperty(feature, featuresPropertiesSettings));
          }

          if (leafletLayer.minZoom > minimalVisibleZoom) {
            minimalVisibleZoom = leafletLayer.minZoom;
          }

          leafletLayer.addTo(featuresLayer);
        });

        const leafletMap = this.get('leafletMap');
        const layearBounds = featuresLayer.getBounds();

        if (leafletMap.getBoundsZoom(layearBounds) < minimalVisibleZoom) {
          leafletMap.setView(layearBounds.getCenter(), minimalVisibleZoom);
        } else {
          leafletMap.fitBounds(layearBounds);
        }
      }, 10);
    });
  },
});
