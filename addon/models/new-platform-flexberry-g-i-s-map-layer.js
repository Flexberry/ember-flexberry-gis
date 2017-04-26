/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import {
  Model as NewPlatformFlexberyGISMapLayerModelMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-layer';
import {
  Projection
} from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayer
  @extends Model
  @uses NewPlatformFlexberyGISMapLayerModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(NewPlatformFlexberyGISMapLayerModelMixin, LeafletCrsMixin, {
  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      try {
        return JSON.parse(stringToDeserialize);
      } catch (e) {
        Ember.Logger.error(`Computation of 'settingsAsObject' property for '${this.get('name')}' layer has been failed: ${e}`);
      }
    }

    return {};
  }),

  /**
    Flag: indicates whether layer can be identified.

    @property canBeIdentified
    @type Boolean
    @readOnly
  */
  canBeIdentified: Ember.computed('isDeleted', 'type', 'settingsAsObject.identifySettings.canBeIdentified', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
    let identifyOperationIsAvailableForLayerClass = Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('identify');
    let identifyOperationIsAvailableForLayerInstance = this.get('settingsAsObject.identifySettings.canBeIdentified') !== false;

    return identifyOperationIsAvailableForLayerClass && identifyOperationIsAvailableForLayerInstance;
  }),

  /**
    Flag: indicates whether 'search' operation is available for this layer.

    @property canBeSearched
    @type Boolean
    @readOnly
  */
  canBeSearched: Ember.computed('isDeleted', 'type', 'settingsAsObject.identifySettings.canBeSearched', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
    let searchOperationIsAvailableForLayerClass = Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('search');
    let searchOperationIsAvailableForLayerInstance = this.get('settingsAsObject.searchSettings.canBeSearched') !== false;

    return searchOperationIsAvailableForLayerClass && searchOperationIsAvailableForLayerInstance;
  }),

  /**
   Checks whether layer should be shown on minimap.

    @property showOnMinimap
    @type {Boolean} Flag: indicates whether layer should be shown on minimap.
    @readOnly
  */
  showOnMinimap: Ember.computed('settingsAsObject.showOnMinimap', function () {
    return this.get('settingsAsObject.showOnMinimap');
  }),

  /**
    Flag: layer's whether layer's legend can be displayed.

    @property hasLegend
    @type Boolean
    @readOnly
  */
  legendCanBeDisplayed: Ember.computed('isDeleted', 'type', 'settingsAsObject.legendSettings.legendCanBeDisplayed', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
    let legendIsAvailableForLayerClass = Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('legend');
    let legendIsAvailableForLayerInstance = this.get('settingsAsObject.legendSettings.legendCanBeDisplayed') !== false;

    return legendIsAvailableForLayerClass && legendIsAvailableForLayerInstance;
  }),

  /**
   * contains collection of nested layers
   * @property layers
   * @return {Array} collection of child layers
  */
  layers: Ember.computed('map', 'map.mapLayer', function () {
    try {
      let layers = this.get('map.mapLayer');
      if (layers) {
        let id = this.get('id');
        if (!Ember.isBlank(id)) {
          return layers.filterBy('parent.id', id);
        }
      }
    } catch (e) {
      Ember.Logger.error(`Computation of 'layers' property for '${this.get('name')}' layer has been failed: ${e}`);
    }

    return Ember.A();
  })
});

defineProjections(Model);

export default Model;
