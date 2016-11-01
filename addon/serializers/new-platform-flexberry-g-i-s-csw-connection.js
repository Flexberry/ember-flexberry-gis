/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import {
  Serializer as NewPlatformFlexberyGISCswConnectionSerializerMixin
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-csw-connection';

/**
  Map model serializer.

  @class NewPlatformFlexberryGISCswConnectionSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberyGISCswConnectionSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(NewPlatformFlexberyGISCswConnectionSerializerMixin, {
});
