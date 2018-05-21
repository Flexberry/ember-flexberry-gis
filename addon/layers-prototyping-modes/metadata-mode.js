/**
  @module ember-flexberry-gis-csw
*/
import BaseEditMode from 'ember-flexberry-gis/layers-prototyping-modes/-private/base';

/**
  Metadata based layers-prototyping-modes.

  @class MetadataEditMode
*/
export default BaseEditMode.extend({
  requiredProperties: ['leafletMap'],
  name: 'metadata-mode'
});
