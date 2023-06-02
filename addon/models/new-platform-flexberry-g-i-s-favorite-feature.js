/**
  @module ember-flexberry-gis
*/

import { Model as FavoriteFeatureMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-favorite-feature';
import { Projection, Offline } from 'ember-flexberry-data';

/**
  Favorite feature model.

  @class NewPlatformFlexberryGISFavoriteFeatureModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISFavoriteFeatureModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, FavoriteFeatureMixin, {
});

defineProjections(Model);

export default Model;
