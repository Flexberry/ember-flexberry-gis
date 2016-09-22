/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import {
  Serializer as NewPlatformFlexberyGISMapSerializerMixin
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map';

/**
  Map model serializer.

  @class NewPlatformFlexberryGISMap
  @extends OdataSerializer
  @uses NewPlatformFlexberyGISMapSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(NewPlatformFlexberyGISMapSerializerMixin, {
});
