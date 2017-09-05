import { Model as LinkParameterMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-link-parameter';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';

/**
  Link parameter model.

  @class NewPlatformFlexberryGISLinkParameterModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLinkParameterModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, LinkParameterMixin, {
});

defineProjections(Model);

export default Model;
