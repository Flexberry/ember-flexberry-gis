/**
  @module ember-flexberry-gis
*/

import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

const copyAttributes = function (model, modelCopy) {
  model.eachAttribute((attr) => {
    modelCopy.set(attr, model.get(attr));
  });
};

const copyLinkParameters = function (linkModel, linkModelCopy, store) {
  const parameterModels = linkModel.get('parameters');
  const parameterModelsCopies = linkModelCopy.get('parameters');

  parameterModels.forEach((parameterModel) => {
    // Create empty link parameter model.
    const parameterModelCopy = store.createRecord('new-platform-flexberry-g-i-s-link-parameter', { id: generateUniqueId(), });

    // Copy attibutes values into created empty model.
    copyAttributes(parameterModel, parameterModelCopy);

    // Push created empty model into related details array.
    parameterModelsCopies.pushObject(parameterModelCopy);
  });
};

const copyLayerLinks = function (layerModel, layerModelCopy, store) {
  const linkModels = layerModel.get('layerLink');
  const linkModelsCopies = layerModelCopy.get('layerLink');

  linkModels.forEach((linkModel) => {
    // Create empty layer link model.
    const linkModelCopy = store.createRecord('new-platform-flexberry-g-i-s-layer-link', { id: generateUniqueId(), });

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

const copyLeafletObjectGetter = function (layerModel, layerModelCopy) {
  const leafletObjectGetter = layerModel.get('leafletObjectGetter');

  layerModelCopy.set('leafletObjectGetter', leafletObjectGetter);
};

/**
  Creates copy of the specified map layer.

  @for Utils.LayerCopy
  @method copyLayer
  @param {NewPlatformFlexberryGISMapLayer} layerModel
  @param {DS.Store} store Ember data store.
  @param {Boolean} ignoreLinks Indicate whether copying links.
  @return {NewPlatformFlexberryGISMapLayer} Layer model copy.
*/
const copyLayer = function (layerModel, store, ignoreLinks) {
  // Create empty layer model.
  const layerModelCopy = store.createRecord('new-platform-flexberry-g-i-s-map-layer', { id: generateUniqueId(), });

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

export {
  copyLayer
};
