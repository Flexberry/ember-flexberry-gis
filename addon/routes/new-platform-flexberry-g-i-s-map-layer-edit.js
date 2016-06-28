/**
  @module ember-flexberry-gis
*/

import EditFormRoute from 'ember-flexberry/routes/edit-form';

export default EditFormRoute.extend({
  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'MapLayerE'
   */
  modelProjection: 'MapLayerE',

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map-layer'
   */
  modelName: 'new-platform-flexberry-g-i-s-map-layer',

  actions: {
    renderLayerTemplate(layerType) {
      let templateName = 'new-platform-flexberry-g-i-s-map-layer-unknown';
      switch(layerType) {
        case 'tile':
          templateName = 'new-platform-flexberry-g-i-s-map-layer-tile';
          break;
        case 'wms':
          templateName = 'new-platform-flexberry-g-i-s-map-layer-wms';
          break;
      }

      this.render(templateName, {
        outlet: 'new-platform-flexberry-g-i-s-map-layer-setting'
      });
    }
  }
});
