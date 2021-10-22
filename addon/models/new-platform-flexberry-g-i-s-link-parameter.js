import {
  Model as LinkParameterMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-link-parameter';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

/**
  Link parameter model.

  @class NewPlatformFlexberryGISLinkParameterModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLinkParameterModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, LinkParameterMixin, {
});

defineProjections(Model);

export default Model;
