/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import {
  Serializer as NewPlatformFlexberyGISMapLayerSerializerMixin
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-layer';

/**
  Map layer model serializer.

  @class NewPlatformFlexberryGISMap
  @extends OdataSerializer
  @uses NewPlatformFlexberyGISMapLayerSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(NewPlatformFlexberyGISMapLayerSerializerMixin, {
});
