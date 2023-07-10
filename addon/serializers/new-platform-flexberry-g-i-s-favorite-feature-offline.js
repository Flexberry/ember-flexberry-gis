/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as FavoriteFeatureSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-favorite-feature-offline';
import __ApplicationSerializer from './application-offline';

/**
  Favorite feature offline serializer.
  @class NewPlatformFlexberryGISFavoriteFeatureOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISFavoriteFeatureOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(FavoriteFeatureSerializer, {
});
