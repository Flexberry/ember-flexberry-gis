import Ember from 'ember';
import layout from '../templates/components/layer-result-item';

export default Ember.Component.extend({

  actions: {
    selectFeature(feature) {
      this.sendAction('selectFeature', feature, this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings'));
    },

    panTo(feature) {
      this.sendAction('panTo', feature, this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings'));
    },

    zoomTo(feature) {
      this.sendAction('zoomTo', feature, this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings'));
    }
  },

  selectedFeature: null,

  layout,

  features: null,

  layerModel: null,

  name: Ember.computed('layerModel', function () {
    return this.get('layerModel.name');
  }),

  displayField: Ember.computed('layerModel', function () {
    return this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.displayProperty');
  }),

  excludedProperties: Ember.computed('layerModel', function () {
    return this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.excludedProperties');
  }),

  localizedProperties: Ember.computed('layerModel', function () {
    return this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.localizedProperties');
  }),
});
