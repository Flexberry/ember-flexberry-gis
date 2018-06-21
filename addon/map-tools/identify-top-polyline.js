/**
  @module ember-flexberry-gis
*/

import IdentifyAllVisibleMapTool from './identify-visible-polyline';
import IdentifyTopMixin from '../mixins/map-tools/identify-top';

/**
  Identify map-tool that identifies only top visible map layer.

  @class IdentifyTopVisiblePolylineMapTool
  @extends IdentifyAllVisibleMapTool
*/
export default IdentifyAllVisibleMapTool.extend(IdentifyTopMixin, {
});
