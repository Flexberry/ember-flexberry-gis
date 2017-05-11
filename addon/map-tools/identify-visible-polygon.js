/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-polygon';
import IdentifyVisibleMixin from '../mixins/map-tools/identify-visible';

/**
  Identify map-tool that identifies all visible map layers.

  @class IdentifyAllVisiblePolygonMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyVisibleMixin, {
});
