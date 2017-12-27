/**
  @module ember-flexberry-gis-csw
*/
import BaseEditMode from 'ember-flexberry-gis/edit-modes/-private/base';
/**

  Metadata based edit mode.
  @class MetadataEditMode
*/
export default Object.assign(BaseEditMode, {
  requiredProperties: ['leafletMap'],
  name: 'metadata-mode'
});
