/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-polygon';
import IdentifyAllMixin from '../mixins/map-tools/identify-all';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllPolygonMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyAllMixin, {
});
