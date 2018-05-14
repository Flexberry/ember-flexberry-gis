/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Charts renderer service.

  @class ChartsRendererService
  @extends Ember.Service
*/
export default Ember.Service.extend({

  /**
    Hash containing chartjs object

    @property _chart
    @type Object
    @default null
    @private
  */
  _chart: null,

  /**
    Render charts on the specified canvas element.

    @method renderOnChartsCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which charts-style preview must be rendered.
    @param {Object} options.json Hash containing json parameter object of the chart.
  */
  renderOnChartsCanvas({ canvas, json }) {

    let chart = this.get('_chart');
    if (!Ember.isNone(chart)) {
      chart.destroy();
    }

    var ctx = canvas;
    chart = new Chart(ctx, json);
    this.set('_chart', chart);
  },

  clearcharts() {
    let chart = this.get('_chart');
    if (!Ember.isNone(chart)) {
      chart.destroy();
    }
  }
});
