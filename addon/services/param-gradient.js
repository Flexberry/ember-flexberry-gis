/**
  @module ember-flexberry-gis
*/

import Service from '@ember/service';

/**
  Gradient styles load and renderer service.

  @class GradientStylesLoadRendererService
  @extends Ember.Service
*/
export default Service.extend({
  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.gradientList = this.gradientList || [
      {
        name: 'redYellowGradient',
        colorStart: '#ff0000',
        colorEnd: '#ffff00',
      },
      {
        name: 'blackWhiteGradient',
        colorStart: '#000000',
        colorEnd: '#ffffff',
      },
      {
        name: 'greenBlueGradient',
        colorStart: '#00ff00',
        colorEnd: '#0000ff',
      },
      {
        name: 'violetOrangeGradient',
        colorStart: '#6464c8',
        colorEnd: '#ff9616',
      },
      {
        name: 'brownVioletGradient',
        colorStart: '#8e707d',
        colorEnd: '#b992e0',
      }
    ];
  },

  /**
    Returns collection of object gradien list.

    @method getGradientList
    @returns Object[] collection
  */
  getGradientList() {
    return this.get('gradientList');
  },
});
