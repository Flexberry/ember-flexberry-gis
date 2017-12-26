/**
  @module ember-flexberry-gis
*/

/**
  Create map layer from metadata
  @for Utils.LayerCreate
  @method createLayerFromMetadata
  @param {NewPlatformFlexberryGISMapLayer} layerModel
  @return {NewPlatformFlexberryGISMapLayer} Layer model.
*/

let createLayerFromMetadata = function(metadata) {
    let mapLayer = {
      name: metadata.get('name'),
      description: metadata.get('description'),
      keyWords: metadata.get('keyWords'),
      type: metadata.get('type'),
      settings: metadata.get('settings'),
      scale:metadata.get('scale'),
      coordinateReferenceSystem:metadata.get('coordinateReferenceSystem'),
      boundingBox:metadata.get('boundingBox'),
      layerLink: []
    };

    addLinkMetadata(mapLayer, metadata.get('linkMetadata'));
    return mapLayer;
};

let addLinkMetadata = function(layerModel, linkMetadata) {
  linkMetadata.forEach((item) => {
    let newLayerLink = {
      allowShow: item.get('allowShow'),
      mapObjectSetting: item.get('mapObjectSetting'),
      parameters:[{ name: 'test' }]
    };
    addLinkParametersMetadata(newLayerLink, item.get('parameters'));
    layerModel.layerLink.push(newLayerLink);
  });
};

let addLinkParametersMetadata = function(layerLinkModel, parameters) {
  parameters.forEach((item) => {
    let newLinkParameter = {
      objectField: item.get('objectField'),
      layerField: item.get('layerField'),
      expression: item.get('expression'),
      queryKey: item.get('queryKey'),
      linkField: item.get('linkField')
    };
    layerLinkModel.parameters.push(newLinkParameter);
  });
};

export {
  createLayerFromMetadata
};
