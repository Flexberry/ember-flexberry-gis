import Ember from 'ember';

export default L.Canvas.extend({
  _updatePoly: function (layer, closed) {
    if (this._checkMapZoom(layer)) {
      L.Canvas.prototype._updatePoly.call(this, layer, closed);
    }
  },

  _updateCircle: function (layer) {
    if (this._checkMapZoom(layer)) {
      L.Canvas.prototype._updateCircle.call(this, layer);
    }
  },

  _checkMapZoom(layer) {
    const mapZoom = this._getMapZoom();
    const minZoom = this._getLayerOption(layer, 'minZoom');
    const maxZoom = this._getLayerOption(layer, 'maxZoom');
    return Ember.isNone(mapZoom) || Ember.isNone(minZoom) || Ember.isNone(maxZoom) || minZoom <= mapZoom && mapZoom <= maxZoom;
  },

  _getMapZoom() {
    const map = this._map;
    if (!Ember.isNone(map) && map.getZoom) {
      return map.getZoom();
    }

    return null;
  },

  _getLayerOption(layer, propName) {
    let zoomResult = Ember.get(layer, `${propName}`);
    if (Ember.isNone(zoomResult)) {
      const parentLayers = Ember.get(layer, '_eventParents');
      for (var key in parentLayers) {
        zoomResult = Ember.get(parentLayers, `${key}.${propName}`);
        if (!Ember.isNone(zoomResult)) {
          return zoomResult;
        }
      }
    }

    return zoomResult;
  }
});
