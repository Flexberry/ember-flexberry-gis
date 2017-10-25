import Ember from 'ember';
import KMLLayer from 'ember-flexberry-gis/layers/kml';

export default Ember.Route.extend({
  model() {
    let layerSettings = KMLLayer.create().createSettings();
    Ember.set(layerSettings, 'searchSettings.searchFields', ['name']);
    Ember.set(layerSettings, 'displaySettings.featuresPropertiesSettings.displayProperty', ['name']);
    Ember.set(layerSettings, 'kmlUrl', 'sample/perm.kml');
    Ember.set(layerSettings, 'style', {
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    });
    return Ember.Object.extend({
      name: 'Region',
      settingsAsObject: layerSettings,
      layerLink: []
    }).create();
  }
});
