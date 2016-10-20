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
    let featuresPropertiesSettings = Ember.get(layer, 'settingsAsObject.searchSettings.featuresPropertiesSettings') || {};

    let getFeatureFirstAvailableProperty = function(feature) {
      let featureProperties = Ember.get(feature, 'properties') || {};
      let displayPropertyName = Object.keys(featureProperties)[0];
      return featureProperties[displayPropertyName];
    };

    let getFeatureDisplayProperty = function(feature, featuresPropertiesSettings) {
      let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
      let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');

      if (Ember.typeOf(displayProperty) !== 'string') {
        // Retrieve first available property.
        return getFeatureFirstAvailableProperty(feature);
      }

      if (!displayPropertyIsCallback) {
        // Return defined property (or first available if defined property doesn't exist).
        let featureProperties = Ember.get(feature, 'properties') || {};
        return featureProperties.hasOwnProperty(displayProperty) ?
          featureProperties[displayProperty] :
          getFeatureFirstAvailableProperty(feature);
      }

      // Defined displayProperty is a serialized java script function, which can calculate display property.
      let calculateDisplayProperty = eval(`(${displayProperty})`);
      Ember.assert(
        'Property \'settings.searchSettings.featuresPropertiesSettings.displayProperty\' ' +
        'in layer \'' + layerName + '\' is not a valid java script function',
        Ember.typeOf(calculateDisplayProperty) === 'function');

      return calculateDisplayProperty(feature);
    };

    // Clear previous features.
    let featuresLayer = this.get('featuresLayer');
    featuresLayer.clearLayers();

    // Show new features.
    features.forEach((feature) => {
      let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
      if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
        leafletLayer.setStyle({ color: 'yellow' });
      }

      if (Ember.typeOf(leafletLayer.bindPopup) === 'function') {
        leafletLayer.bindPopup(() => {
          return '' + getFeatureDisplayProperty(feature, featuresPropertiesSettings);
        });
      }

      leafletLayer.addTo(featuresLayer);
    });

    let leafletMap = this.get('leafletMap');
    leafletMap.fitBounds(featuresLayer.getBounds());
  }
});
