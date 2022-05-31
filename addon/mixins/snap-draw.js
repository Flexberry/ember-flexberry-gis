import { isNone } from '@ember/utils';
import { computed, get } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
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
  _snapLeafletLayers: computed('_snapLayers', function () {
    const layers = [];
    const featuresByLayer = this.get('_snapLayers');
    featuresByLayer.forEach((layer) => {
      layers.push(...featuresByLayer[layer]);
    });

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
    const snapMarker = this.get('_snapMarker');
    if (snapMarker) {
      snapMarker.remove();
    }
  },

  _setSnappingFeatures(e) {
    if (e) {
      const features = [];
      e.target.eachLayer((layer) => {
        features.pushObject(layer);
      });
      const propId = e.target._leaflet_id;
      this.set(`_snapLayers.${propId}`, features);
    } else {
      this.set('_snapLayers', {});
      const snapLayers = this.get('_snapLayersGroups');

      if (!Array.isArray(snapLayers) || snapLayers.length === 0) {
        return;
      }

      snapLayers.forEach((leafletObject) => {
        const features = [];
        leafletObject.eachLayer((layer) => {
          features.pushObject(layer);
        });
        const propId = leafletObject._leaflet_id;
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
    const leafletMap = this.get('leafletMap') || this.get('mapApi').getFromApi('leafletMap');

    const snapList = this.get('_snapLeafletLayers');
    if (!Array.isArray(snapList) || snapList.length === 0) {
      return;
    }

    const isDraw = isNone(e.vertex);
    const snapMarker = e.vertex || this.get('_snapMarker');

    const snapDistance = this.get('_snapDistance');
    const snapOnlyVertex = this.get('_snapOnlyVertex');

    const point = leafletMap.latLngToLayerPoint(e.latlng);
    const topLeftPoint = leafletMap.layerPointToLatLng(L.point(point.x - snapDistance, point.y - snapDistance));
    const bottomRightPoint = leafletMap.layerPointToLatLng(L.point(point.x + snapDistance, point.y + snapDistance));
    const pointBounds = L.latLngBounds(topLeftPoint, bottomRightPoint);

    const closestLayer = this._findClosestLayer(e.latlng, pointBounds, snapList);

    const previousSnap = this.get('_snapLatLng') || {};

    if (closestLayer && closestLayer.distance < snapDistance) {
      const isMarker = closestLayer.layer instanceof L.Marker || closestLayer.layer instanceof L.CircleMarker;
      const currentSnap = (isMarker || snapOnlyVertex ? closestLayer.latlng : this._checkSnapToVertex(closestLayer)) || {};

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
    const snapMarker = this.get('_snapMarker');
    const isSnap = !isNone(get(snapMarker, '_map'));
    if (isSnap) {
      const latlng = snapMarker.getLatLng();
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
    const leafletMap = this.get('leafletMap') || this.get('mapApi').getFromApi('leafletMap');
    const segmentPointA = closestLayer.segment[0];
    const segmentPointB = closestLayer.segment[1];

    const snapPoint = closestLayer.latlng;
    const distanceA = this._getPixelDistance(leafletMap, segmentPointA, snapPoint);
    const distanceB = this._getPixelDistance(leafletMap, segmentPointB, snapPoint);

    const closestVertex = distanceA < distanceB ? segmentPointA : segmentPointB;
    const shortestDistance = distanceA < distanceB ? distanceA : distanceB;

    const priorityDistance = this.get('_snapDistance');

    // The latlng we need to snap to.
    const snapResult = shortestDistance < priorityDistance ? closestVertex : snapPoint;

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

    layers.filter((l) => l._bounds.intersects(bounds)).forEach((layer) => {
      const layerDistance = this._calculateDistance(latlng, layer);

      if (isNone(closestLayer.distance) || layerDistance.distance < closestLayer.distance) {
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
    const map = this.get('leafletMap') || this.get('mapApi').getFromApi('leafletMap');
    const snapOnlyVertex = this.get('_snapOnlyVertex');
    const isMarker = layer instanceof L.Marker || layer instanceof L.CircleMarker;
    const isPolygon = layer instanceof L.Polygon;

    // The coords of the layer.
    const latlngs = isMarker ? layer.getLatLng() : layer.getLatLngs();

    if (isMarker) {
      return {
        latlng: Object.assign({}, latlngs),
        distance: this._getPixelDistance(map, latlngs, latlng),
      };
    }

    let closestSegment;
    let closestPoint;
    let shortestDistance;

    const loopThroughCoords = (coords) => {
      coords.forEach((coord, index) => {
        if (coord instanceof Array) {
          loopThroughCoords(coord);
          return;
        }

        const segmentPointA = coord;
        let segmentPointB;
        let distance;
        if (snapOnlyVertex) {
          distance = this._getPixelDistance(map, latlng, segmentPointA);
        } else {
          let x;
          if (coords.length) {
            if (isPolygon) {
              x = 0;
            } else {
              x = undefined;
            }
          } else {
            x = index + 1;
          }

          const nextIndex = index + 1 === x;
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

    const closestSegmentPoint = snapOnlyVertex ? closestPoint : this._getClosestPointOnSegment(map, latlng, closestSegment[0], closestSegment[1]);

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

    const point = map.project(latlng, maxzoom);
    const segmentPointA = map.project(firstlatlng, maxzoom);
    const segmentPointB = map.project(secondlatlng, maxzoom);
    const closest = L.LineUtil.closestPointOnSegment(point, segmentPointA, segmentPointB);
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
    const point = map.latLngToLayerPoint(latlng);
    const segmentPointA = map.latLngToLayerPoint(firstlatlng);
    const segmentPointB = map.latLngToLayerPoint(secondlatlng);
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
  },
});
