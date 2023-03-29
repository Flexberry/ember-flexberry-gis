/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-polyline';
import GeomOnlyMixin from '../mixins/geom-only-map-tool';
import RedrawBufferMixin from '../mixins/redraw-buffer';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllPolylineMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(GeomOnlyMixin, RedrawBufferMixin, {
});
