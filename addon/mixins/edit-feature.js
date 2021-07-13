
import Ember from 'ember';

export default Ember.Mixin.create({

  /**
    Leaflet.Editable drawing tools instance.

    @property _editTools
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Ediatble</a>
    @default null
    @private
  */
  _editTools: null,

  /**
    Returns Leaflet.Editable instance.
  */
  _getEditTools() {
    let leafletMap = this.get('leafletMap');

    let editTools = this.get('_editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      this.set('_editTools', editTools);
    }

    return editTools;
  },

  /**
    Overrides {{#crosslink "LeafletZoomToFeatureMixin/_prepareLayer:method"}} to make a copy of passed layer
    and apply a style to the layer to make it more visible.
    @method _prepareLayer
    @param {Object} layer
    @return {<a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} Prepared layer.
    @private
  */
  _prepareLayer: function _prepareLayer(layer) {
    let leafletMap = this.get('leafletMap');
    let pane = leafletMap.getPane('zoomto');
    if (!pane || Ember.isNone(pane)) {
      pane = leafletMap.createPane('zoomto');
      pane.style.pointerEvents = 'none';
    }

    return L.geoJson(layer.toGeoJSON(), {
      pane: 'zoomto'
    }).setStyle({
      color: 'salmon',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    });
  }
});
