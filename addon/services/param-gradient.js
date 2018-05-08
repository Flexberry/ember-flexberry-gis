/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Gradient styles load and renderer service.

  @class GradientStylesLoadRendererService
  @extends Ember.Service
*/
export default Ember.Service.extend({
  /**
    Inner hash containing settings gradient object.

    @property _isGradientList
    @type Object[]
    @default []
  */
  _isGradientList: [],

  /**
    Initializes service.
  */
  init() {
    this._super(...arguments);

    let owner = Ember.getOwner(this);
    let isGradients = owner.knownForType('gradient');
    for (let i in isGradients) {
      this.addGradientList(isGradients[i].name, isGradients[i].colorS, isGradients[i].colorE);
    }
  },

  /**
    Returns collection of object gradien list.

    @method getGradientList
    @returns Object[] collection
  */
  getGradientList() {
    return this.get('_isGradientList');
  },

  /**
    Add gradient to collection of object gradien list.

    @method addGradientList
    @param {String} name The name for gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
  */
  addGradientList(name, colorStart, colorEnd) {
    let gradient = this.get('_isGradientList');
    let existingGradientItem;

    if (!Ember.isNone(gradient)) {
      for (let i in gradient) {
        if (gradient[i].name === name) {
          existingGradientItem = name;
        }
      }
    }

    if (Ember.isNone(existingGradientItem)) {
      gradient.push({ 'name': name, 'colorS': colorStart, 'colorE': colorEnd, 'canName': name });
      this.set('_isGradientList', gradient);
    }
  },

  /**
    Gradient display.

    @method gradientDrawing
    @param {String} classCanvas The canvas class to apply a gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
    @param {Boolean} editGradient Forms edit gradient.
  */
  gradientDrawing(canvases, colorStart, colorEnd) {
    for (let i = 0; i < canvases.length; i++) {
      let ctx = canvases[i].getContext('2d');
      let w = canvases[i].width;
      let h = canvases[i].height;
      let grd = ctx.createLinearGradient(0, 0, w, 0);

      grd.addColorStop(0, colorStart);
      grd.addColorStop(1, colorEnd);

      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }

  },
});
