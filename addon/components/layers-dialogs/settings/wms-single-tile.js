/**
  @module ember-flexberry-gis
*/

import WmsLayerSettingsComponent from './wms';
import layout from '../../../templates/components/layers-dialogs/settings/wms-single-tile';

// Regular expression used to derive whether settings' url is correct.
let urlRegex = '(https?|ftp)://(-\.)?([^\s/?\.#-]+\.?)+(/[^\s]*)?';

/**
  Settings-part of WMS single tile layer modal dialog.

  @class WmsSingleTileLayerSettingsComponent
  @extends WmsLayerSettingsComponent
*/
export default WmsLayerSettingsComponent.extend({
  /**
    Reference to component's url regex.
  */
  urlRegex,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Editing layer deserialized type-related settings.

    @property settings
    @type Object
    @default null
  */
  settings: null
});
