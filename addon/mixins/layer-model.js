/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing additional logic for layer and layer-like models.

  @class LayerModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      try {
        let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
        let defaultSettings = layerClassFactory.createSettings();

        return Ember.$.extend(true, defaultSettings, JSON.parse(stringToDeserialize));
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
  canBeSearched: Ember.computed('isDeleted', 'type', 'settingsAsObject.searchSettings.canBeSearched', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
    let searchOperationIsAvailableForLayerClass = Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('search');
    let searchOperationIsAvailableForLayerInstance = this.get('settingsAsObject.searchSettings.canBeSearched') !== false;

    return searchOperationIsAvailableForLayerClass && searchOperationIsAvailableForLayerInstance;
  }),

  /**
    Flag: indicates whether 'context search' operation is available for this layer.

    @property canBeContextSearched
    @type Boolean
    @readOnly
  */
  canBeContextSearched: Ember.computed('isDeleted', 'type', 'settingsAsObject.searchSettings.canBeContextSearched', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
    let searchOperationIsAvailableForLayerClass = Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('search');
    let searchOperationIsAvailableForLayerInstance = this.get('settingsAsObject.searchSettings.canBeContextSearched') !== false;

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
    Collection of nested layers.

    @property layers
    @return {Array} collection of child layers
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
  }),

  /**
    Layer's latLngBounds.

    @property bounds
    @readonly
    @return <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a> this layer's latLngBounds.
  */
  bounds: Ember.computed('settingsAsObject.bounds', 'type', 'layers.@each.bounds', function () {
    let layers = this.get('layers');
    let type = this.get('type');

    let layerBounds;

    if (type === 'group' && layers.length > 0) {
      let earthBounds = L.latLngBounds([
        [-90, -180],
        [90, 180]
      ]);

      for (let layer of layers) {
        if (layerBounds && layerBounds.equals(earthBounds)) {
          break;
        }

        let bounds = layer.get('bounds');
        layerBounds = layerBounds ? layerBounds.extend(bounds) : L.latLngBounds(bounds);
      }
    } else {
      let bounds = this.get('settingsAsObject.bounds');
      layerBounds = L.latLngBounds(bounds);
    }

    return layerBounds;
  })
});
