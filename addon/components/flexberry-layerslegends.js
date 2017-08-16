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
    Visible not group layers.

    @property visibleLayers
    @type Object[]
  */
  visibleLayers: Ember.computed('layers.[]', function() {
    let result = Ember.A();
    let getLayers = function(layers) {
      layers.forEach(function(layer) {
        if (layer.get('visibility') && !layer.get('isDeleted')) {
          if (layer.get('type') === 'group') {
            getLayers(layer.get('layers'));
          } else {
            result.push(layer);
          }
        }
      }, this);
    };

    let layers = this.get('layers');
    if (Ember.isArray(layers)) {
      getLayers(layers);
    }

    return result;
  }),

  actions: {
    /**
      Called when legends for one of the layers is loaded.

      @method actions.legendsLoaded
    */
    legendsLoaded(layerName, legends) {
      this.sendAction('legendsLoaded', layerName, legends);
    }
  }
});
