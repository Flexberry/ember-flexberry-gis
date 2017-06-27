/**
  @module ember-flexberry-gis
*/

import IdentifyAllVisibleMapTool from './identify-visible-polygon';
import IdentifyTopMixin from '../mixins/map-tools/identify-top';

/**
  Identify map-tool that identifies only top visible map layer.

  @class IdentifyTopVisiblePolygonMapTool
  @extends IdentifyAllVisibleMapTool
*/
export default IdentifyAllVisibleMapTool.extend(IdentifyTopMixin, {
});
