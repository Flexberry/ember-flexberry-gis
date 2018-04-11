/**
  @module ember-flexberry-gis-csw
*/
import BaseEditMode from 'ember-flexberry-gis/layers-prototyping-modes/-private/base';

/**
  Metadata based layers-prototyping-modes.

  @class MetadataEditMode
*/
export default Object.assign(BaseEditMode, {
  requiredProperties: ['leafletMap'],
  name: 'metadata-mode'
});
