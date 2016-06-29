import Ember from 'ember';

export default Ember.Mixin.create({
  _store: Ember.inject.service('store'),

  _settingRecord: undefined,

  actions: {
    renderMainTemplate(layerType, objectToRender, renderInto) {
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

      this._clearOldRecord();

      if (modelName) {
        let modelToRender = this._formModelByObject(objectToRender, modelName);
        renderOptions.model = modelToRender;
        this.set('_settingRecord', modelToRender);

        let modelConstructor = modelToRender.constructor;
        Ember.get(modelConstructor, 'attributes').forEach((attribute) => {
          this.addObserver('_settingRecord.' + attribute.name, this, this._createdModelChange);
        });
      }

      this.render(templateName, renderOptions);
    }
  },

  resetController(controller, isExiting, transition) {
    this._super(...arguments);

    this._clearOldRecord();
  },

  _clearOldRecord() {
    let oldRecord = this.get('_settingRecord');
    if (oldRecord) {
      let modelConstructor = oldRecord.constructor;
      Ember.get(modelConstructor, 'attributes').forEach((attribute) => {
        this.removeObserver('_settingRecord.' + attribute.name, this, this._createdModelChange);
      });

      this.set('_settingRecord', undefined);
      oldRecord.destroyRecord();
    }
  },

  _createdModelChange() {
    let _settingRecord = this.get('_settingRecord');
    if (_settingRecord) {
      let changedObject = this._formObjectByModel(_settingRecord);
      alert('test');
    }
  },

  _formModelByObject(currentObject, modelType) {
    Ember.assert('currentObject is not defined', currentObject);
    Ember.assert('modelType is not defined', modelType);

    let store = this.get('_store');
    return store.createRecord(modelType, currentObject);
  },

  _formObjectByModel(currentModel) {
    let modelConstructor = currentModel.constructor;
    let result = {};
    Ember.get(modelConstructor, 'attributes').forEach((attribute) => {
      result[attribute.name] = currentModel.get(attribute.name);
    });

    return result;
  }
});
