/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapCommand from './base';

/**
  Search map-command.

  @class SearchMapCommand
  @extends BaseMapCommand
*/
export default BaseMapCommand.extend({
  /**
    Layer group for founded features.

    @property featuresLayer
    @type <a href="http://leafletjs.com/reference-1.0.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  featuresLayer: null,

  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    let featuresLayer = this.get('featuresLayer');
    Ember.assert(
      `Wrong type of \`featuresLayer\` property:` +
      ` actual is \`${Ember.typeOf(featuresLayer)}\` but L.LayerGroup is expected`,
      featuresLayer instanceof L.LayerGroup);

    if (!leafletMap.hasLayer(featuresLayer)) {
      featuresLayer.addTo(leafletMap);
    }
  },

  /**
    Destroys map-command.
  */
  willDestroy() {
    this._super(...arguments);

    let featuresLayer = this.get('featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
      featuresLayer.remove();
    }

    this.set('featuresLayer', null);
  }
});
