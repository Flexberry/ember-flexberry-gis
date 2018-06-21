/**
  @module ember-flexberry-gis
*/

import IdentifyAllVisibleMapTool from './identify-visible-marker';
import IdentifyTopMixin from '../mixins/map-tools/identify-top';

/**
  Identify map-tool that identifies only top visible map layer.

  @class IdentifyTopVisibleMarkerMapTool
  @extends IdentifyAllVisibleMapTool
*/
export default IdentifyAllVisibleMapTool.extend(IdentifyTopMixin, {
});
