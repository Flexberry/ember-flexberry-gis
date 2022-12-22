/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-file';
import IdentifyAllMixin from '../mixins/map-tools/identify-all';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllMarkerMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyAllMixin, {
});
