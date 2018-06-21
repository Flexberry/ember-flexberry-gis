/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-polyline';
import IdentifyAllMixin from '../mixins/map-tools/identify-all';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllPolylineMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyAllMixin, {
});
