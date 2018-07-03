/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-marker';
import IdentifyVisibleMixin from '../mixins/map-tools/identify-visible';

/**
  Identify map-tool that identifies all visible map layers.

  @class IdentifyAllVisibleMarkerMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyVisibleMixin, {
});
