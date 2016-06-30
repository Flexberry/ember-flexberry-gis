import Ember from 'ember';

export default Ember.Mixin.create({
  _store: Ember.inject.service('store'),

  _settingRecord: undefined,

  _saveValueToFieldName: undefined,

  actions: {
    renderMainTemplate(layerType, objectToRender, renderInto, saveValueToFieldName) {
      Ember.assert('objectToRender is not defined', objectToRender);
      Ember.assert('renderInto is not defined', renderInto);
      Ember.assert('renderInto is not defined', saveValueToFieldName);

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
        this.setProperties({
          _settingRecord: modelToRender,
          _saveValueToFieldName: saveValueToFieldName
        });

        let modelConstructor = modelToRender.constructor;
        Ember.get(modelConstructor, 'attributes').forEach((attribute) => {
          this.addObserver('_settingRecord.' + attribute.name, this, this._createdModelChange);
        });
      }

      this.render(templateName, renderOptions);
    }
  },

  resetController(controller, isExiting, transition) {
    this._super(controller, isExiting, transition);

    this._clearOldRecord();
  },

  _clearOldRecord() {
    let oldRecord = this.get('_settingRecord');
    if (oldRecord) {
      let modelConstructor = oldRecord.constructor;
      Ember.get(modelConstructor, 'attributes').forEach((attribute) => {
        this.removeObserver('_settingRecord.' + attribute.name, this, this._createdModelChange);
      });

      this.setProperties({
        _settingRecord: undefined,
        _saveValueToFieldName: undefined
      });
      oldRecord.destroyRecord();
    }
  },

  _createdModelChange() {
    let _settingRecord = this.get('_settingRecord');
    if (_settingRecord) {
      let changedObject = this._formObjectByModel(_settingRecord);
      let saveValueToFieldName = this.get('_saveValueToFieldName');
      let fullPropertyPath = 'controller.model.' + saveValueToFieldName;
      let currentValueAsString = this.get(fullPropertyPath);
      let currentValueAsObject = this._deserializeJsonObjectFromString(currentValueAsString);
      if (currentValueAsObject) {
        changedObject = Ember.merge(currentValueAsObject, changedObject);
      }

      let changedObjectAsString = this._serializeJsonObjectIntoString(changedObject);
      this.set(fullPropertyPath, changedObjectAsString);
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
  },

  _serializeJsonObjectIntoString(jsonObjectToSerialize) {
    return JSON.stringify(jsonObjectToSerialize);
  },

  _deserializeJsonObjectFromString(stringToDeserialize) {
    if (stringToDeserialize) {
      return JSON.parse(stringToDeserialize);
    }
    return {};
  }
});
