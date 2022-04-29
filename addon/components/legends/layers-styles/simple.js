import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import BaseLayerStyleLegendComponent from './-private/base';
import layout from '../../../templates/components/legends/layers-styles/simple';

/**
  Component representing legend for vector layer with 'simple' style.

  @class SimpleLayerStyleLegendComponent
  @extends BaseLayerStyleLegendComponent
*/
export default BaseLayerStyleLegendComponent.extend({
  /**
    Flag: indicates whether to show linear & polygonal objects on legend or not.

    @property _geometriesCanBeDisplayed
    @type Boolean
    @private
    @readOnly
  */
  _geometriesCanBeDisplayed: computed('legendSettings.geometriesCanBeDisplayed', function () {
    return this.get('legendSettings.geometriesCanBeDisplayed') !== false;
  }),

  /**
    Flag: indicates whether to show point objects on legend or not.

    @property _markersCanBeDisplayed
    @type Boolean
    @private
    @readOnly
  */
  _markersCanBeDisplayed: computed('legendSettings.markersCanBeDisplayed', function () {
    return this.get('legendSettings.markersCanBeDisplayed') !== false;
  }),

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
    Renderes legends each time component gets rendered.
  */
  didRender() {
    this._super(...arguments);

    if (this.get('_geometriesCanBeDisplayed')) {
      let styleSettings = this.get('styleSettings');
      const canvas = this.$('canvas.geometries')[0];

      const layersStylesRenderer = this.get('_layersStylesRenderer');
      const { legendStyle, } = this.parentView.layer;
      if (!isNone(legendStyle)) {
        styleSettings = layersStylesRenderer.getDefaultStyleSettings('simple');
        legendStyle.style.path.forEach((opt) => {
          styleSettings.style.path[opt] = legendStyle.style.path[opt];
        });
      }

      layersStylesRenderer.renderOnCanvas({
        styleSettings,
        canvas,
        target: 'legend',
      });
    }

    if (this.get('_markersCanBeDisplayed')) {
      const styleSettings = isNone(this.parentView.layer.legendStyle) ? this.get('styleSettings.style.marker') : this.parentView.layer.legendStyle;
      const canvas = this.$('canvas.markers')[0];

      const markersStylesRenderer = this.get('_markersStylesRenderer');
      markersStylesRenderer.renderOnCanvas({
        styleSettings,
        canvas,
        target: 'legend',
      });
    }
  },
});
