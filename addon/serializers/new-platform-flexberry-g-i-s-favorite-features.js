/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as FavoriteFeaturesSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-favorite-features';

/**
  Map layer serializer.

  @class NewPlatformFlexberryGISMapLayerSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapLayerSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(FavoriteFeaturesSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
