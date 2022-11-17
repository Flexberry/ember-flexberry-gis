import Ember from 'ember';

/**
 * Mixin with methods to control compare mode
 */
export default Ember.Mixin.create({
  /**
   * Service with main objects
   * @property
   */
  compare: Ember.inject.service(),

  /**
   * Flag for component to ignore compare mode
   * @property
   */
  ignoreCompareMode: false,

  /**
   * Toogle layer visibility on selected side
   * @param {Ember.Model} layer
   * @param {String} side
   * @param {L.Map} leafletMap
   */
  setLayerBySide(layer, side, leafletMap) {
    const layerId = Ember.get(layer, 'id');
    const leafletOriginalLayer = Ember.get(layer, '_leafletObjectFirst') || Ember.get(layer, '_leafletObject');
    let layersSideSettings = this.get(`compare.compareState.${side}`);
    let existedLayers = layersSideSettings.layers.filter(l => l.id === layerId);
    if (existedLayers.length > 0) {
      existedLayers.forEach(l => l.layer.remove());
      Ember.set(layersSideSettings, 'layers', layersSideSettings.layers.filter(l => l.id !== layerId));
      Ember.set(layersSideSettings, 'layerIds', layersSideSettings.layerIds.filter(l => l !== layerId));
    } else {
      if (layer.get('settingsAsObject.labelSettings.signMapObjects')) {
        const labelsOriginalLayer = layer.get('_leafletObject._labelsLayerMulti');
        if (labelsOriginalLayer) {
          layersSideSettings.layers.push({
            id: layerId,
            layer: labelsOriginalLayer.addTo(leafletMap)
          });
        }

        const labelsAdditionalOriginalLayer = layer.get('_leafletObject.additionalZoomLabel');
        if (labelsAdditionalOriginalLayer) {
          labelsAdditionalOriginalLayer.forEach(zoomLabels => {
            layersSideSettings.layers.push({
              id: layerId,
              layer: zoomLabels.addTo(leafletMap)
            });
          });
        }

        const labelsMultiOriginalLayer = layer.get('_leafletObject._labelsLayer');
        if (labelsMultiOriginalLayer) {
          layersSideSettings.layers.push({
            id: layerId,
            layer: labelsMultiOriginalLayer.addTo(leafletMap)
          });
        }
      }

      layersSideSettings.layers.push({
        id: layerId,
        layer: leafletOriginalLayer.addTo(leafletMap)
      });
      Ember.set(layersSideSettings, 'layers', layersSideSettings.layers.map(l => l));
      Ember.set(layersSideSettings, 'layerIds', [...layersSideSettings.layerIds, layerId]);
    }

    this.redrawSide(side);
  },

  /**
   * Toggle group layer on selected side
   * @param {Ember.Model} layer
   * @param {string} side
   * @param {L.Map} map
   */
  setGroupLayerBySide(layer, side, map) {
    const settings = this.get(`compare.compareState.${side}`);
    let sideGroupLayers = settings.groupLayersEnabled;
    let sideChildLayers = settings.childLayersEnabled;
    const isEnabled = !!sideGroupLayers.find(id => id === layer.get('id'));
    if (isEnabled) {
      sideGroupLayers = sideGroupLayers.filter(id => id !== layer.get('id'));
      Ember.set(settings, 'groupLayersEnabled', [...sideGroupLayers]);
      let disableLayers = sideChildLayers.filter(l => l.parentIds.includes(layer.get('id')));
      disableLayers.forEach((l) => this.setLayerBySide(l.layer, side, map));
    } else {
      sideGroupLayers.push(layer.get('id'));
      Ember.set(settings, 'groupLayersEnabled', [...sideGroupLayers]);
      let layersToEnable = sideChildLayers.filter(l => l.parentIds.includes(layer.get('id')) && this.parentLayersVisible(l.parentIds, side));
      layersToEnable.forEach((l) => this.setLayerBySide(l.layer, side, map));
    }
  },

  /**
   * Toggle child layer visibility on selected side
   * @param {Ember.Model} layer
   * @param {String} side
   * @param {L.Control.Map} map
   */
  setChildLayerBySide(layer, side, map) {
    const settings = this.get(`compare.compareState.${side}`);
    const sideLayers = settings.layers;
    let sideChildLayers = settings.childLayersEnabled;
    const layerEnabled = !!sideChildLayers.find(l => l.id === layer.get('id'));
    const layerShown = !!sideLayers.find(l => l.id === layer.get('id'));
    if (layerEnabled) {
      sideChildLayers = sideChildLayers.filter(l => l.id !== layer.get('id'));
      Ember.set(settings, 'childLayersEnabled', sideChildLayers);
      if (layerShown) {
        this.setLayerBySide(layer, side, map);
      }
    } else {
      const parentIds = this.parentLayersIds(layer, []);
      sideChildLayers = [...sideChildLayers, {
        id: layer.get('id'),
        parentIds: parentIds,
        layer: layer
      }];
      Ember.set(settings, 'childLayersEnabled', sideChildLayers);
      if (this.parentLayersVisible(parentIds, side)) {
        this.setLayerBySide(layer, side, map);
      }
    }
  },

  /**
   * Recursive get all parent layer ids
   * @param {Ember.Model} layer
   * @param {Array<String>} accum
   * @returns Array<String>
   */
  parentLayersIds(layer, accum) {
    let parent = layer.get('parent');
    if (parent) {
      accum.push(parent.get('id'));
      return this.parentLayersIds(parent, accum);
    }

    return accum;
  },

  /**
   * Check if all parent layers are visible.
   * @param {Array<String>} parentIds
   * @param {String} side
   * @returns Bool
   */
  parentLayersVisible(parentIds, side) {
    const settings = this.get(`compare.compareState.${side}`);
    let sideGroupLayers = settings.groupLayersEnabled;
    return parentIds.every(id => sideGroupLayers.includes(id));
  },

  /**
   * Set background layer by selected side
   * @param {Ember.Model} layer
   * @param {String} side
   * @param {L.Map} leafletMap
   */
  setBgLayerBySide(layer, side, leafletMap) {
    const layerId = layer.get('id');
    const leafletOriginalLayer = Ember.get(layer, '_leafletObject');
    const bgSideSettings = this.get(`compare.compareState.${side}.bgLayer`);
    if (bgSideSettings.layer) {
      bgSideSettings.layer.removeFrom(leafletMap);
    }

    const newLayer = L.Util.CloneLayer(leafletOriginalLayer).addTo(leafletMap);
    bgSideSettings.id = layerId;
    bgSideSettings.layer = newLayer;
    this.redrawSide(side);
  },

  /**
   * Get opposite side
   * @param {String} side
   * @returns String
   */
  getOppositeSide(side) {
    return (side === 'Left') ? 'Right' : 'Left';
  },

  /**
   * Refresh sideBySide side layers
   * @param {String} side
   */
  redrawSide(side) {
    const sideSettings = this.get(`compare.compareState.${side}`);
    const sbs = this.get('sideBySide');
    let layers = [sideSettings.bgLayer.layer, ...sideSettings.layers.map(l => l.layer)];
    switch (side) {
      case 'Left':
        sbs.setLeftLayers(layers);
        break;
      case 'Right':
        sbs.setRightLayers(layers);
        break;
    }
  },

  /**
   * Method to refresh compare mode
   * @param {L.Map} leafletMap
   */
  destroyCompare(leafletMap) {
    let compareState = this.get('compare.compareState');
    let leftLayers = [compareState.Left.bgLayer.layer, ...compareState.Left.layers.map(l => l.layer)].filter(l => l);
    let rightLayers = [compareState.Right.bgLayer.layer, ...compareState.Right.layers.map(l => l.layer)].filter(l => l);
    [...leftLayers, ...rightLayers].forEach(l => {
      if (l.getContainer && l.getContainer()) {
        l.getContainer().style.clip = '';
      }

      l.removeFrom(leafletMap);
    });
    Ember.set(this.get('sideBySide'), '_leftLayers', []);
    Ember.set(this.get('sideBySide'), '_rightLayers', []);
    Ember.set(this.get('compare'), 'compareState', {
      Left: {
        bgLayer: {},
        layers: [],
        layerIds: [],
        groupLayersEnabled: [],
        childLayersEnabled: [],
        sidebarState: [],
      },
      Right: {
        bgLayer: {},
        layers: [],
        layerIds: [],
        groupLayersEnabled: [],
        childLayersEnabled: [],
        sidebarState: [],
      }
    });
  },

  /**
   * Function to save and update sidebar state on each side
   * @param {String} side Next side
   */
  updateSidebar(side) {
    let currentSide = this.getOppositeSide(side);
    let currentState = [];

    // Get sidebar tree
    const tree = Ember.$('div[class^="treenodeember"]', '.flexberry-maplayers');

    // Get sidebar state and close accordions
    tree.each(function (index) {
      let element = Ember.$(this);
      currentState.push({
        'active': Ember.$('.title.active', element).length > 0,
        'index': index
      });
    });

    // Save sidebar state
    this.set(`compare.compareState.${currentSide}.sidebarState`, currentState);

    // Get next side state and open selected accordions
    let stateToSet = this.get(`compare.compareState.${side}.sidebarState`);
    if (stateToSet.length === 0) {
      tree.each(function () {
        let element = Ember.$(this);
        if (Ember.$('.title.active', element).length > 0) {
          Ember.$('.title.active', element)[0].click();
        }
      });
    }

    stateToSet.forEach(node => {
      let stateIsEqual = node.active === Ember.$(Ember.$('.title', tree[node.index])[0]).hasClass('active');
      if (!stateIsEqual) {
        Ember.$('.title', tree[node.index])[0].click();
      }
    });
  },

  actions: {

    /**
     * Set background or tree side
     * @param {String} variable 'side' or 'backgroundSide'
     * @param {String} value Left or Right
     */
    setSide(variable, value) {
      if (variable === 'side') {
        this.updateSidebar(value);
      }

      this.set(`compare.${variable}`, value);
    }
  }
});
