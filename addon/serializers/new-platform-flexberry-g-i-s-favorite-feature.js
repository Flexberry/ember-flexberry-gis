/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as FavoriteFeatureSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-favorite-feature';

/**
  Favorite feature serializer.

  @class NewPlatformFlexberryGISFavoriteFeatureSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapFavoriteFeatureSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(FavoriteFeatureSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
