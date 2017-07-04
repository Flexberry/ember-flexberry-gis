/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layerslegends';

/**
  Component for render layers legends.

  @class FlexberryLayerslegendsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Layers hierarchy with extended information.

    @property layersExtend
    @type String[]
    @readOnly
  */
  layersExtend: Ember.computed('layers', function() {
    let layers = this.get('layers');

    for (var i = 0; i < layers.length; i++) {
      let layer = layers[i];
      let layerType = layer.get('type');

      Ember.set(layer, 'haveSubLayers', false);
      Ember.set(layer, 'subLayers', Ember.A());

      if (layerType === 'wms-single-tile' || layerType === 'wms') {
        let wmsSettings = layer.get('settingsAsObject');

        if (!Ember.isEmpty(wmsSettings)) {
          var subLayers = wmsSettings.layers.split(',');

          if (subLayers.length > 1) {
            Ember.set(layer, 'haveSubLayers', true);
            Ember.set(layer, 'subLayers', subLayers);
          }
        }
      }

    }

    return layers;
  })
});
