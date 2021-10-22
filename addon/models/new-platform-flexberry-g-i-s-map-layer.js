/**
  @module ember-flexberry-gis
*/

import { on } from '@ember/object/evented';
import { once } from '@ember/runloop';
import { observer } from '@ember/object';
import { buildValidations } from 'ember-cp-validations';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';
import LayerModelMixin from '../mixins/layer-model';
import LeafletCrsMixin from '../mixins/leaflet-crs';
import {
  Model as MapLayerMixin,
  defineProjections,
  ValidationRules
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-layer';

const Validations = buildValidations(ValidationRules, {
  dependentKeys: ['model.i18n.locale'],
});

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayerModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapLayerModelMixin
  @uses LayerModelMixin
  @uses LeafletCrsMixin
*/
const Model = EmberFlexberryDataModel.extend(OfflineModelMixin, MapLayerMixin, LayerModelMixin, LeafletCrsMixin, Validations, {
  /**
    Leaflet layer related to layer model.

    @property _leafletObject
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @private
  */
  _leafletObject: null,

  _anyTextChanged: on('init', observer('name', 'description', 'keyWords', function () {
    once(this, '_anyTextCompute');
  })),

  anyTextCompute() {
    return `${this.get('name') || ''} ${this.get('description') || ''} ${(this.get('keyWords') || '').replace(/,/g, ' ')}`;
  },

  /**
   Flag indicates that layer components was created and ready for render and handle other ui logic

   @property layerInitialized
   @type boolean
  */
  layerInitialized: null,
});

defineProjections(Model);

export default Model;
