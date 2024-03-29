/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-rectangle';
import GeomOnlyMixin from '../mixins/geom-only-map-tool';
import RedrawBufferMixin from '../mixins/redraw-buffer';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllRectangleMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(GeomOnlyMixin, RedrawBufferMixin, {
});
