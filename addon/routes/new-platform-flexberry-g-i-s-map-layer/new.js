/**
  @module ember-flexberry-gis
*/

import EditFormNewRoute from 'ember-flexberry/routes/edit-form-new';

export default EditFormNewRoute.extend({
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

  /**
    Name of template to be rendered.

    @property templateName
    @type String
    @default 'ember-flexberry-dummy-suggestion-edit'
  */
  templateName: 'new-platform-flexberry-g-i-s-map-layer-edit'
});
