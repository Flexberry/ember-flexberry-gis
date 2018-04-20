import Ember from 'ember';

export default Ember.Service.extend({
  /**
    Inner hash containing settings gradient object.
    @property _isGradientList
    @type Object[]
    @default []
  */
  _isGradientList: [],

  /**
    Returns collection of object gradien list.

    @method getGradientList
    @returns Object[] collection
  */
  getGradientList(){
    return this.get('_isGradientList');
  },

  /**
    Returns collection of object gradien list.

    @method getGradientList
    @param {String} name The name for gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
  */
  addGradientList(name, colorS, colorE){
    let gradient = this.get('_isGradientList');
    gradient.push({ 'name': name, 'colorS': colorS, 'colorE': colorE, 'canName': 'grad'+ gradient.length });

    this.set('_isGradientList', gradient);
  },

  /**
    Gradient display.
    @method gradientDrawing
    @param {String} classCanvas The canvas class to apply a gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
    @param {Boolean} editGradient Forms edit gradient.
  */
  gradientDrawing(classCanvas, colorStart, colorEnd) {
    let ctx = Ember.$('.'+ classCanvas)[0].getContext('2d');
    let w = 300;
    let h = 150;

    let grd = ctx.createLinearGradient(0, 0, w, 0);
    grd.addColorStop(0, colorStart);
    grd.addColorStop(1, colorEnd);

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  },
});
