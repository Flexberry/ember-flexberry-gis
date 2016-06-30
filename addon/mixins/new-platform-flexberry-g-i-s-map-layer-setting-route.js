/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin for {{#crossLink "DS.Route"}}Route{{/crossLink}} to support work
  of component {{#crossLink "NewPlatformFlexberryGISMapLayerSettingComponent"}}{{/crossLink}}.

  @class NewPlatformFlexberryGISMapLayerSettingRouteMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Ember data store.

    @property _store
    @private
    @type Service
  */
  _store: Ember.inject.service('store'),

  /**
    Current displayed on component record.

    @property _settingRecord
    @private
    @type DS.Model
  */
  _settingRecord: undefined,

  /**
    Name of field of model where changed value has to be written to.

    @property _saveValueToFieldName
    @private
    @type String
  */
  _saveValueToFieldName: undefined,

  actions: {
    /**
      It renders proper template depending on provided type.

      @method actions.renderMainTemplate
      @param {String} layerType Type of layer (depending on it rendered template will be chosen).
      @param {Object} objectToRender Object that will be displayed on rendered template.
      @param {String} renderInto Name of template into which new template will be rendered.
      @param {String} saveValueToFieldName Name of field of model where changed value has to be written to.
    */
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

  /**
    A hook you can use to reset controller values either when the model changes or the route is exiting.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_resetController).
  */
  resetController(controller, isExiting, transition) {
    this._super(controller, isExiting, transition);

    this._clearOldRecord();
  },

  /**
    It destroys the record that was displayed before, removes observers, etc.

    @method _clearOldRecord
    @private
  */
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

  /**
    It handles changes of displayed record and saves it to provided field.

    @method _createdModelChange
    @private
  */
  _createdModelChange() {
    let _settingRecord = this.get('_settingRecord');
    if (_settingRecord) {
      let changedObject = this._formObjectByModel(_settingRecord);
      let saveValueToFieldName = this.get('_saveValueToFieldName');
      let fullPropertyPath = 'controller.model.' + saveValueToFieldName;
      let changedObjectAsString = this._serializeJsonObjectIntoString(changedObject);
      this.set(fullPropertyPath, changedObjectAsString);
    }
  },

  /**
    It forms ember model of provided type by object.

    @method _formModelByObject
    @private

    @param {Object} currentObject Object that will be a basis for ember model.
    @param {String} modelType Type of ember model to create.
    @return {DS.Model} Created by object ember model of provided type.
  */
  _formModelByObject(currentObject, modelType) {
    Ember.assert('currentObject is not defined', currentObject);
    Ember.assert('modelType is not defined', modelType);

    let store = this.get('_store');
    return store.createRecord(modelType, currentObject);
  },

  /**
    It forms object from attributes of ember model.

    @method _formObjectByModel
    @private

    @param {DS.Model} currentModel Ember model from where attributes and its values will be taken.
    @return {Object} Created by ember model object.
  */
  _formObjectByModel(currentModel) {
    Ember.assert('currentModel is not defined', currentModel);

    let modelConstructor = currentModel.constructor;
    let result = {};
    Ember.get(modelConstructor, 'attributes').forEach((attribute) => {
      result[attribute.name] = currentModel.get(attribute.name);
    });

    return result;
  },

  /**
    It serializes object to string.

    @method _serializeJsonObjectIntoString
    @private

    @param {Object} jsonObjectToSerialize Object to serialize to string.
    @return {String} Serialized object.
  */
  _serializeJsonObjectIntoString(jsonObjectToSerialize) {
    return JSON.stringify(jsonObjectToSerialize);
  }
});
