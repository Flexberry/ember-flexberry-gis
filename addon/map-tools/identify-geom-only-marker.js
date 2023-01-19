/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-marker';
import GeomOnlyMixin from '../mixins/geom-only-map-tool';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllMarkerMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(GeomOnlyMixin, {
});
