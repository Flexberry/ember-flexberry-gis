import Ember from 'ember';
import layout from '../templates/components/feature-result-item';

export default Ember.Component.extend({
  actions: {
    selectFeature() {
      this.sendAction('selectFeature', this.get('feature'));
    },

    panTo() {
      this.sendAction('panTo', this.get('feature'));
    },

    zoomTo() {
      this.sendAction('zoomTo', this.get('feature'));
    },

    showInfo() {
      this.set('infoExpanded', !this.get('infoExpanded'));
    }
  },

  selectedFeature: null,

  layout,

  layerModel: null,

  infoExpanded: false,

  displayField: Ember.computed('layerModel', function () {
    return this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.displayProperty');
  }),

  excludedProperties: Ember.computed('layerModel', function () {
    return this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.excludedProperties');
  }),

  localizedProperties: Ember.computed('layerModel', function () {
    return this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.localizedProperties');
  })
});
