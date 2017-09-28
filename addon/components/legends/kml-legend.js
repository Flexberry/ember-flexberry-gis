import Ember from 'ember';
import BaseLegendComponent from '../legends/base-legend';

/**
  Component representing map layer's legend for KML-layers.

  @class KmlLegendComponent
  @extends BaseLegendComponent
*/
export default BaseLegendComponent.extend({
  /**
    Array of legend's for layer.
    Every legend is an object with following structure { src: ... },
    where 'src' is legend's image source (url or base64-string).

    @property _legends
    @type Object[]
    @private
    @readOnly
  */
  _legends: Ember.computed(function() {
    // TODO: Implement client-side legends rendering for KML-layers & extend.
    return Ember.A();
  })
});
