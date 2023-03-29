/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import IdentifyMapTool from './identify-file';
import GeomOnlyMixin from '../mixins/geom-only-map-tool';
/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllMarkerMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(GeomOnlyMixin, {
  cursor: 'default',

  _enable() {
    this._super(...arguments);
    let leafletMap = this.get('leafletMap');

    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('flexberry-map-loadfile-geom:getIdentifyLayer', this._getIdentifyLayer, this);

      leafletMap.on('flexberry-map-loadfile-geom:getIdentifyLayer', this._getIdentifyLayer, this);
    }
  },

  willDestroy() {
    // сначала вызовем отключение подписок, поскольку в базовом методе очищается leafletMap
    if (!Ember.isNone(this.leafletMap)) {
      this.leafletMap.off('flexberry-map-loadfile-geom:getIdentifyLayer', this._getIdentifyLayer, this);
    }

    this._super(...arguments);
  },

  _getIdentifyLayer(e) {
    let workingLayer = this._getWorkingLayer(e);
    e.results.push(workingLayer);
  }
});
