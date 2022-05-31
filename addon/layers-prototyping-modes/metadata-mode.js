/**
  @module ember-flexberry-gis-csw
*/
import BaseEditMode from 'ember-flexberry-gis/layers-prototyping-modes/-private/base';

/**
  Metadata based layers-prototyping-modes.

  @class MetadataEditMode
*/
export default BaseEditMode.extend({
  name: 'metadata-mode',

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.requiredProperties = this.requiredProperties || ['leafletMap'];
  },
});
