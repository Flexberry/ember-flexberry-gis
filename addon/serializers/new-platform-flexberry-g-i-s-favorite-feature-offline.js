/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';
import { OfflineSerializer as FavoriteFeatureSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-favorite-feature-offline';

/**
  Favorite feature offline serializer.

  @class NewPlatformFlexberryGISFavoriteFeatureOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISFavoriteFeatureOfflineSerializerMixin
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, FavoriteFeatureSerializer, {
});
