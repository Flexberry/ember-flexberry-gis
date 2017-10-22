import Ember from 'ember';
import GeoJSONLayer from 'ember-flexberry-gis/layers/geojson';

export default Ember.Route.extend({
  model() {
    let layerSettings = GeoJSONLayer.create().createSettings();
    Ember.set(layerSettings, 'searchSettings.searchFields', ['NAME']);
    Ember.set(layerSettings, 'displaySettings.featuresPropertiesSettings.displayProperty', ['NAME']);
    Ember.set(layerSettings, 'url', 'sample/perm.json');
    Ember.set(layerSettings, 'style', {
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    });
    Ember.set(layerSettings, 'onEachFeature', 'function(feature, layer) { layer.bindPopup(feature.properties.NAME); }');

    return Ember.Object.extend({
      name: 'Region',
      settingsAsObject: layerSettings,
      layerLink: []
    }).create();
  }
});
