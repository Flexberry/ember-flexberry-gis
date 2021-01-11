import Ember from 'ember';

export default Ember.Mixin.create({
  /**
    GroupLayers for snap (wfs, odata)

    @property _snapLayersGroups
    @type Array
  */
  _snapLayersGroups: null,

  /**
    Leaflet layers group by group layer id.

    @property _snapLayers
    @type Object
  */
  _snapLayers: null,

  /**
    Minimum distance for snapping in pixels.

    @property _snapDistance
    @type Number
    @default 20
  */
  _snapDistance: 20,

  /**
  Snap only vertex / snap vertex and segment

  @property _snapOnlyVertex
  @type Boolean
  @default true
*/
  _snapOnlyVertex: true,

  /**
    @property _snapLeafletLayers
    @type Array
    @readOnly
  */
  _snapLeafletLayers: Ember.computed('_snapLayers', function () {
    let layers = [];
    let featuresByLayer = this.get('_snapLayers');
    for (var layer in featuresByLayer) {
      layers.push(...featuresByLayer[layer]);
    }

    return layers;
  }),

  /**
    Cleaning after snapping.
    @method _cleanupSnapping
    @private
  */
  _cleanupSnapping() {
    this.set('_snapLayersGroups', null);
    this.set('_snapLayers', {});
    this.set('_snapOnlyVertex', true);
    this.set('_editedFeatureId', null);
    let snapMarker = this.get('_snapMarker');
    if (snapMarker) {
      snapMarker.remove();
    }
  },

  _setSnappingFeatures(e) {
    if (e) {
      let features = [];
      e.target.eachLayer((layer) => {
        features.pushObject(layer);
      });
      let propId = e.target._leaflet_id;
      this.set(`_snapLayers.${propId}`, features);
    } else {
      this.set('_snapLayers', {});
      let snapLayers = this.get('_snapLayersGroups');

      if (!Array.isArray(snapLayers) || snapLayers.length === 0) {
        return;
      }

      snapLayers.forEach((leafletObject, i) => {
        let features = [];
        leafletObject.eachLayer((layer) => {
          features.pushObject(layer);
        });
        let propId = leafletObject._leaflet_id;
        this.set(`_snapLayers.${propId}`, features);
      });
    }
  },

  /**
    Handles snapping.
    @method _handleSnapping
    @param {Object} e Event object.
    @private
  */
  _handleSnapping(e) {
    let leafletMap = this.get('leafletMap') || this.get('mapApi').getFromApi('leafletMap');

    let snapList = this.get('_snapLeafletLayers');
    if (!Array.isArray(snapList) || snapList.length === 0) {
      return;
    }

    let isDraw = Ember.isNone(e.vertex);
    let snapMarker = e.vertex || this.get('_snapMarker');

    let snapDistance = this.get('_snapDistance');
    let snapOnlyVertex = this.get('_snapOnlyVertex');

    let point = leafletMap.latLngToLayerPoint(e.latlng);
    let topLeftPoint = leafletMap.layerPointToLatLng(L.point(point.x - snapDistance, point.y - snapDistance));
    let bottomRightPoint = leafletMap.layerPointToLatLng(L.point(point.x + snapDistance, point.y + snapDistance));
    let pointBounds = L.latLngBounds(topLeftPoint, bottomRightPoint);

    let closestLayer = this._findClosestLayer(e.latlng, pointBounds, snapList);

    let previousSnap = this.get('_snapLatLng') || {};

    if (closestLayer && closestLayer.distance < snapDistance) {

      let isMarker = closestLayer.layer instanceof L.Marker || closestLayer.layer instanceof L.CircleMarker;
      let currentSnap = (isMarker || snapOnlyVertex ? closestLayer.latlng : this._checkSnapToVertex(closestLayer)) || {};

      // snap the marker
      snapMarker.setLatLng(currentSnap);

      if (previousSnap.lat !== currentSnap.lat || previousSnap.lng !== currentSnap.lng) {
        this.set('_snapLatLng', currentSnap);
        if (isDraw) {
          snapMarker.addTo(leafletMap);
        }
      }
    } else if (previousSnap) {
      this.set('_snapLatLng', undefined);
      if (isDraw) {
        snapMarker.remove();
      }
    }
  },

  /**
  Handles clicks when drawing new geometry.
  @method _drawClick
  @param {Object} e Event object.
  @private
  */
  _drawClick(e) {
    let snapMarker = this.get('_snapMarker');
    let isSnap = !Ember.isNone(Ember.get(snapMarker, '_map'));
    if (isSnap) {
      var latlng = snapMarker.getLatLng();
      e.latlng.lat = latlng.lat;
      e.latlng.lng = latlng.lng;
    }
  },

  /**
    Check if vertex is in snap distance.
    @method _checkSnapToVertex
    @param {Object} closestLayer Snap layer.
    @private
  */
  _checkSnapToVertex(closestLayer) {
    let leafletMap = this.get('leafletMap') || this.get('mapApi').getFromApi('leafletMap');
    let segmentPointA = closestLayer.segment[0];
    let segmentPointB = closestLayer.segment[1];

    let snapPoint = closestLayer.latlng;
    let distanceA = this._getPixelDistance(leafletMap, segmentPointA, snapPoint);
    let distanceB = this._getPixelDistance(leafletMap, segmentPointB, snapPoint);

    let closestVertex = distanceA < distanceB ? segmentPointA : segmentPointB;
    let shortestDistance = distanceA < distanceB ? distanceA : distanceB;

    let priorityDistance = this.get('_snapDistance');

    // The latlng we need to snap to.
    let snapResult = shortestDistance < priorityDistance ? closestVertex : snapPoint;

    return Object.assign({}, snapResult);
  },

  /**
    Finds closest layer to the specified point.
    @method _findClosestLayer
    @param {Object} latlng Point's coordinates
    @param {Object} bounds Point's latLngBounds
    @param {Array} layers Array of layers for snapping.
    @private
  */
  _findClosestLayer(latlng, bounds, layers) {
    let closestLayer = {};

    layers.filter(l => l._bounds.intersects(bounds)).forEach((layer, index) => {
      let layerDistance = this._calculateDistance(latlng, layer);

      if (Ember.isNone(closestLayer.distance) || layerDistance.distance < closestLayer.distance) {
        closestLayer = layerDistance;
        closestLayer.layer = layer;
      }
    });

    return closestLayer;
  },

  /**
    Calculates distance between layer and point.
    @method _calculateDistance
    @param {Object} latlng Point's coordinates
    @param {Object} layer Leaflet layer.
    @private
  */
  _calculateDistance(latlng, layer) {
    let map = this.get('leafletMap') || this.get('mapApi').getFromApi('leafletMap');
    let snapOnlyVertex = this.get('_snapOnlyVertex');
    let isMarker = layer instanceof L.Marker || layer instanceof L.CircleMarker;
    let isPolygon = layer instanceof L.Polygon;

    // The coords of the layer.
    let latlngs = isMarker ? layer.getLatLng() : layer.getLatLngs();

    if (isMarker) {
      return {
        latlng: Object.assign({}, latlngs),
        distance: this._getPixelDistance(map, latlngs, latlng),
      };
    }

    let closestSegment;
    let closestPoint;
    let shortestDistance;

    let loopThroughCoords = (coords) => {
      coords.forEach((coord, index) => {
        if (coord instanceof Array) {
          loopThroughCoords(coord);
          return;
        }

        let segmentPointA = coord;
        let segmentPointB;
        let distance;
        if (snapOnlyVertex) {
          distance = this._getPixelDistance(map, latlng, segmentPointA);
        } else {
          let nextIndex = index + 1 === coords.length ? (isPolygon ? 0 : undefined) : index + 1;
          if (nextIndex) {
            segmentPointB = coords[nextIndex];
          }

          if (segmentPointB) {
            distance = this._getPixelDistanceToSegment(map, latlng, segmentPointA, segmentPointB);
          }
        }

        if (distance && (shortestDistance === undefined || distance < shortestDistance)) {
          shortestDistance = distance;
          if (segmentPointB) {
            closestSegment = [segmentPointA, segmentPointB];
          }

          closestPoint = segmentPointA;
        }
      });
    };

    loopThroughCoords(latlngs);

    let closestSegmentPoint = snapOnlyVertex ? closestPoint : this._getClosestPointOnSegment(map, latlng, closestSegment[0], closestSegment[1]);

    return {
      latlng: Object.assign({}, closestSegmentPoint),
      segment: closestSegment,
      distance: shortestDistance,
    };
  },

  /**
    Finds point on segment closest to the specified point.
    @method _getClosestPointOnSegment
    @param {Object} map Leaflet map.
    @param {Object} latlng Point's coordinates.
    @param {Object} firstlatlng Coordinates of first segment's point.
    @param {Object} secondlatlng Coordinates of second segment's point.
    @private
  */
  _getClosestPointOnSegment(map, latlng, firstlatlng, secondlatlng) {
    let maxzoom = map.getMaxZoom();
    if (maxzoom === Infinity) {
      maxzoom = map.getZoom();
    }

    let point = map.project(latlng, maxzoom);
    let segmentPointA = map.project(firstlatlng, maxzoom);
    let segmentPointB = map.project(secondlatlng, maxzoom);
    let closest = L.LineUtil.closestPointOnSegment(point, segmentPointA, segmentPointB);
    return map.unproject(closest, maxzoom);
  },

  /**
    Calculates distance in pixels between point and segment.
    @method _getPixelDistanceToSegment
    @param {Object} map Leaflet map.
    @param {Object} latlng Point's coordinates.
    @param {Object} firstlatlng Coordinates of first segment's point.
    @param {Object} secondlatlng Coordinates of second segment's point.
    @private
  */
  _getPixelDistanceToSegment(map, latlng, firstlatlng, secondlatlng) {
    let point = map.latLngToLayerPoint(latlng);
    let segmentPointA = map.latLngToLayerPoint(firstlatlng);
    let segmentPointB = map.latLngToLayerPoint(secondlatlng);
    return L.LineUtil.pointToSegmentDistance(point, segmentPointA, segmentPointB);
  },

  /**
    Calculates distance in pixels between two points.
    @method _getPixelDistance
    @param {Object} map Leaflet map.
    @param {Object} firstlatlng Coordinates of first segment's point.
    @param {Object} secondlatlng Coordinates of second segment's point.
    @private
  */
  _getPixelDistance(map, firstlatlng, secondlatlng) {
    return map.latLngToLayerPoint(firstlatlng).distanceTo(map.latLngToLayerPoint(secondlatlng));
  }
});
