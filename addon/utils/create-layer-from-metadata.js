/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
/**
  Creates map layer from metadata.

  @for Utils.LayerCreate
  @method createLayerFromMetadata
  @param {NewPlatformFlexberryGISMapLayer} layerModel
  @return {NewPlatformFlexberryGISMapLayer} Layer model.
*/
let createLayerFromMetadata = function(metadata, store) {
  let mapLayer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', {
      id: generateUniqueId(),
      name: metadata.get('name'),
      description: metadata.get('description'),
      keyWords: metadata.get('keyWords'),
      type: metadata.get('type'),
      settings: metadata.get('settings'),
      scale:metadata.get('scale'),
      coordinateReferenceSystem:metadata.get('coordinateReferenceSystem'),
      boundingBox:metadata.get('boundingBox'),

      // If user has chosen to open metadata on map, then layer created on metadata basics must be visible by default.
      visibility: true
    });

  addLinkMetadata(mapLayer, metadata.get('linkMetadata'), store);
  return mapLayer;
};

/**
  Adds link metadata to the layer model.

  @method addLinkMetadata
  @param {NewPlatformFlexberryGISMapLayer} layerModel Layer model.
  @param {NewPlatformFlexberryGISLinkMetadata} linkMetadata Link metadata collection.
  @private
*/
let addLinkMetadata = function(layerModel, linkMetadata, store) {
  if (!Ember.isArray(linkMetadata)) {
    return;
  }

  linkMetadata.forEach((item) => {
    let newLayerLink = store.createRecord('new-platform-flexberry-g-i-s-layer-link', {
      id: generateUniqueId(),
      allowShow: item.get('allowShow'),
      mapObjectSetting: item.get('mapObjectSetting')
    });

    addLinkParametersMetadata(newLayerLink, item.get('parameters'), store);
    layerModel.get('layerLink').pushObject(newLayerLink);
  });
};

/**
  Adds link parameters metadata to the layer link model.

  @method addLinkParametersMetadata
  @param {NewPlatformFlexberryGISLayerLink} layerLinkModel Layer link model.
  @param {NewPlatformFlexberryGISParameterMetadata} parameters Layer link parameters metadata collection.
  @private
*/
let addLinkParametersMetadata = function(layerLinkModel, parameters, store) {
  if (!Ember.isArray(parameters)) {
    return;
  }

  parameters.forEach((item) => {
    let newLinkParameter = store.createRecord('new-platform-flexberry-g-i-s-link-parameter', {
      id: generateUniqueId(),
      objectField: item.get('objectField'),
      layerField: item.get('layerField'),
      expression: item.get('expression'),
      queryKey: item.get('queryKey'),
      linkField: item.get('linkField')
    });

    layerLinkModel.get('parameters').pushObject(newLinkParameter);
  });
};

export {
  createLayerFromMetadata
};
