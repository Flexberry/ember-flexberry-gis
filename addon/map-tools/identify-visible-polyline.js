/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-polyline';
import IdentifyVisibleMixin from '../mixins/map-tools/identify-visible';

/**
  Identify map-tool that identifies all visible map layers.

  @class IdentifyAllVisiblePolylineMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyVisibleMixin, {
});
