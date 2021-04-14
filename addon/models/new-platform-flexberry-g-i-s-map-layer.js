/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Model as MapLayerMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-layer';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';
import LayerModelMixin from '../mixins/layer-model';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayerModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapLayerModelMixin
  @uses LayerModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, MapLayerMixin, LayerModelMixin, LeafletCrsMixin, {
  /**
    Leaflet layer related to layer model.

    @property _leafletObject
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @private
  */
  _leafletObject: null,

  _anyTextChanged: Ember.on('init', Ember.observer('name', 'description', 'keyWords', function() {
    Ember.run.once(this, '_anyTextCompute');
  })),

  anyTextCompute() {
    return `${this.get('name') || ''} ${this.get('description') || ''} ${(this.get('keyWords') || '').replace(/,/g, ' ')}`;
  },

  /**
   Flag indicates that layer components was created and ready for render and handle other ui logic

   @property layerInitialized
   @type boolean
  */
  layerInitialized: null
});

defineProjections(Model);

export default Model;
