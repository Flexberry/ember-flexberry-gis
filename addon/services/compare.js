import Ember from 'ember';

export default Ember.Service.extend({
  /**
   * Flag if compare mode is enabled
   */
  compareLayersEnabled: false,

  /**
   * Object with state of compare mode
   * bgLayer : {
   *   id: String,
   *   layer: L.Layer
   * },
   * layers: [L.Layer, L.Layer, ...] - layers to show on the side
   * groupLayersEnabled: [String, String] - ids of enabled group layers
   * childLayersEnabled: [{
   *  id: String,
   *  parentIds: Array<String>,
   *  layer: Ember.Model
   * }]
   */
  compareState: {
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
    },
  },

  /**
   * Current selected side
   */
  side: 'Left',

  /**
   * Current selected background side
   */
  backgroundSide: 'Left'
});
