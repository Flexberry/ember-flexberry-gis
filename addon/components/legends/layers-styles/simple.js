import BaseLayerStyleLegendComponent from './-private/base';
import layout from '../../../templates/components/legends/layers-styles/simple';

/**
  Component representing legend for vector layer with 'simple' style.

  @class SimpleLayerStyleLegendComponent
  @extends BaseLayerStyleLegendComponent
*/
export default BaseLayerStyleLegendComponent.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Legend width (for image only, without label).

    @property width
    @type Number
    @default 24
  */
  width: 24,

  /**
    Legend height (for image only, without label).

    @property height
    @type Number

    @default 24
    Reference to component's template.
  */
  height: 24,

  /**
    Initializes component's DOM.
  */
  didInsertElement() {
    this._super(...arguments);

    let styleSettings = this.get('styleSettings');
    let canvas = this.$('canvas')[0];
    canvas.width = this.get('width');
    canvas.height = this.get('height');

    let layersStylesRenderer = this.get('_layersStylesRenderer');
    layersStylesRenderer.renderOnCanvas({
      styleSettings: styleSettings,
      canvas: canvas,
      target: 'legend'
    });
  }
});
