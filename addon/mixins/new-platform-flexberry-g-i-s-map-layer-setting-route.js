import Ember from 'ember';

export default Ember.Mixin.create({
  _store: Ember.inject.service('store'),

  actions: {
    renderMainTemplate(layerType, objectToRender, renderInto) {
      Ember.assert('layerType is not defined', layerType);
      Ember.assert('objectToRender is not defined', objectToRender);
      Ember.assert('renderInto is not defined', renderInto);

      let templateName = 'new-platform-flexberry-g-i-s-map-layer-unknown';
      let modelName;
      switch(layerType) {
        case 'tile':
          templateName = 'new-platform-flexberry-g-i-s-map-layer-tile';
          modelName = 'new-platform-flexberry-g-i-s-map-layer-tile';
          break;
        case 'wms':
          templateName = 'new-platform-flexberry-g-i-s-map-layer-wms';
          modelName = 'new-platform-flexberry-g-i-s-map-layer-wms';
          break;
      }

      let renderOptions = {
        outlet: 'new-platform-flexberry-g-i-s-map-layer-setting-outlet',
        into: renderInto,
        controller: 'new-platform-flexberry-g-i-s-map-layer-setting'
      };

      if (modelName) {
        let modelToRender = this._formModelByObject(objectToRender, modelName);
        renderOptions.model = modelToRender;
      }

      this.render(templateName, renderOptions);
    }
  },

  _formModelByObject(currentObject, modelType) {
    Ember.assert('currentObject is not defined', currentObject);
    Ember.assert('modelType is not defined', modelType);

    let store = this.get('_store');
    return store.createRecord(modelType, currentObject);
  }
});
