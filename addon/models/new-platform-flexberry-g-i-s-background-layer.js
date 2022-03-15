import {
  defineNamespace,
  defineProjections,
  Model as BackgroundLayerMixin
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-background-layer';

import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, BackgroundLayerMixin, {
});

defineNamespace(Model);
defineProjections(Model);

export default Model;
