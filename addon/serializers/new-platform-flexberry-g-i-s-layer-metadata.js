/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import {
  Serializer as NewPlatformFlexberyGISLayerMetadataSerializerMixin
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-metadata';

/**
  Map layer metadata model serializer.

  @class NewPlatformFlexberryGISMap
  @extends OdataSerializer
  @uses NewPlatformFlexberyGISLayerMetadataSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(NewPlatformFlexberyGISLayerMetadataSerializerMixin, {
});
