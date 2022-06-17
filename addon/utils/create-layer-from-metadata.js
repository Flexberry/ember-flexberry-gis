/**
  @module ember-flexberry-gis
*/

import { isArray } from '@ember/array';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
/**
  Adds link parameters metadata to the layer link model.

  @method addLinkParametersMetadata
  @param {NewPlatformFlexberryGISLayerLink} layerLinkModel Layer link model.
  @param {NewPlatformFlexberryGISParameterMetadata} parameters Layer link parameters metadata collection.
  @private
*/
const addLinkParametersMetadata = function (layerLinkModel, parameters, store) {
  if (!isArray(parameters)) {
    return;
  }

  parameters.forEach((item) => {
    const newLinkParameter = store.createRecord('new-platform-flexberry-g-i-s-link-parameter', {
      id: generateUniqueId(),
      objectField: item.objectField,
      layerField: item.layerField,
      expression: item.expression,
      queryKey: item.queryKey,
      linkField: item.linkField,
    });

    layerLinkModel.get('parameters').pushObject(newLinkParameter);
  });
};

/**
  Adds link metadata to the layer model.

  @method addLinkMetadata
  @param {NewPlatformFlexberryGISMapLayer} layerModel Layer model.
  @param {NewPlatformFlexberryGISLinkMetadata} linkMetadata Link metadata collection.
  @private
*/
const addLinkMetadata = function (layerModel, linkMetadata, store) {
  if (!isArray(linkMetadata)) {
    return;
  }

  linkMetadata.forEach((item) => {
    const newLayerLink = store.createRecord('new-platform-flexberry-g-i-s-layer-link', {
      id: generateUniqueId(),
      allowShow: item.allowShow,
      mapObjectSetting: item.mapObjectSetting,
    });

    addLinkParametersMetadata(newLayerLink, item.parameters, store);
    layerModel.get('layerLink').pushObject(newLayerLink);
  });
};

/**
  Creates map layer from metadata.

  @for Utils.LayerCreate
  @method createLayerFromMetadata
  @param {NewPlatformFlexberryGISMapLayer} layerModel
  @return {NewPlatformFlexberryGISMapLayer} Layer model.
*/
const createLayerFromMetadata = function (metadata, store) {
  const mapLayer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', {
    id: generateUniqueId(),
    name: metadata.get('name'),
    description: metadata.get('description'),
    keyWords: metadata.get('keyWords'),
    type: metadata.get('type'),
    settings: metadata.get('settings'),
    scale: metadata.get('scale'),
    coordinateReferenceSystem: metadata.get('coordinateReferenceSystem'),
    boundingBox: metadata.get('boundingBox'),

    // If user has chosen to open metadata on map, then layer created on metadata basics must be visible by default.
    visibility: true,
  });

  addLinkMetadata(mapLayer, metadata.get('linkMetadata'), store);
  return mapLayer;
};

export {
  createLayerFromMetadata
};
