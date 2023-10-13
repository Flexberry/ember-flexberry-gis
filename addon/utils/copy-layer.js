/**
  @module ember-flexberry-gis
*/

import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

/**
  Creates copy of the specified map layer.

  @for Utils.LayerCopy
  @method copyLayer
  @param {NewPlatformFlexberryGISMapLayer} layerModel
  @param {DS.Store} store Ember data store.
  @param {Boolean} ignoreLinks Indicate whether copying links.
  @return {NewPlatformFlexberryGISMapLayer} Layer model copy.
*/
let copyLayer = function(layerModel, store, ignoreLinks) {
  // Create empty layer model.
  let layerModelCopy = store.createRecord('new-platform-flexberry-g-i-s-map-layer', { id: generateUniqueId() });

  // Copy attibutes values into created empty model.
  copyAttributes(layerModel, layerModelCopy);

  if (!ignoreLinks) {
    // Copy 'layerLink' details into created empty model.
    copyLayerLinks(layerModel, layerModelCopy, store);
  }

  // Copy 'leafletObjectGetter' function into created empty model.
  copyLeafletObjectGetter(layerModel, layerModelCopy);

  return layerModelCopy;
};

let copyAttributes = function(model, modelCopy) {
  model.eachAttribute((attr) => {
    modelCopy.set(attr, model.get(attr));
  });
};

let copyLayerLinks = function(layerModel, layerModelCopy, store) {
  let linkModels = layerModel.get('layerLink');
  let linkModelsCopies = layerModelCopy.get('layerLink');

  linkModels.forEach((linkModel) => {
    // Create empty layer link model.
    let linkModelCopy = store.createRecord('new-platform-flexberry-g-i-s-layer-link', { id: generateUniqueId() });

    // Copy attibutes values into created empty model.
    copyAttributes(linkModel, linkModelCopy);

    // Copy reference to 'mapObjectSetting' master.
    linkModelCopy.set('mapObjectSetting', linkModel.get('mapObjectSetting'));

    // Copy 'parameters' details into created empty model.
    copyLinkParameters(linkModel, linkModelCopy, store);

    // Push created empty model into related details array.
    linkModelsCopies.pushObject(linkModelCopy);
  });
};

let copyLinkParameters = function(linkModel, linkModelCopy, store) {
  let parameterModels = linkModel.get('parameters');
  let parameterModelsCopies = linkModelCopy.get('parameters');

  parameterModels.forEach((parameterModel) => {
    // Create empty link parameter model.
    let parameterModelCopy = store.createRecord('new-platform-flexberry-g-i-s-link-parameter', { id: generateUniqueId() });

    // Copy attibutes values into created empty model.
    copyAttributes(parameterModel, parameterModelCopy);

    // Push created empty model into related details array.
    parameterModelsCopies.pushObject(parameterModelCopy);
  });
};

let copyLeafletObjectGetter = function(layerModel, layerModelCopy) {
  let leafletObjectGetter = layerModel.get('leafletObjectGetter');

  layerModelCopy.set('leafletObjectGetter', leafletObjectGetter);
};

export {
  copyLayer
};
