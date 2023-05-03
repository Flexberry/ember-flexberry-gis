/**
  @module ember-flexberry-gis
*/

import { Model as FavoriteFeaturesMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-favorite-features';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';

/**
  Link parameter model.

  @class NewPlatformFlexberryGISFavoriteFeaturesModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISFavoriteFeaturesModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, FavoriteFeaturesMixin, {
});

defineProjections(Model);

export default Model;
