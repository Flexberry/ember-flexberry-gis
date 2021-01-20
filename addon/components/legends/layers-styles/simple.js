import Ember from 'ember';
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
  _geometriesCanBeDisplayed: Ember.computed('legendSettings.geometriesCanBeDisplayed', function() {
    return this.get('legendSettings.geometriesCanBeDisplayed') !== false;
  }),

  /**
    Flag: indicates whether to show point objects on legend or not.

    @property _markersCanBeDisplayed
    @type Boolean
    @private
    @readOnly
  */
  _markersCanBeDisplayed: Ember.computed('legendSettings.markersCanBeDisplayed', function() {
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
      let canvas = this.$('canvas.geometries')[0];

      let layersStylesRenderer = this.get('_layersStylesRenderer');
      let legendStyle = this.parentView.layer.legendStyle;
      if (!Ember.isNone(legendStyle)) {
        styleSettings = layersStylesRenderer.getDefaultStyleSettings('simple');
        for (let opt in legendStyle.style.path) {
          styleSettings.style.path[opt] = legendStyle.style.path[opt];
        }
      }

      layersStylesRenderer.renderOnCanvas({
        styleSettings: styleSettings,
        canvas: canvas,
        target: 'legend'
      });
    }

    if (this.get('_markersCanBeDisplayed')) {
      let styleSettings = Ember.isNone(this.parentView.layer.legendStyle) ? this.get('styleSettings.style.marker') : this.parentView.layer.legendStyle;
      let canvas = this.$('canvas.markers')[0];

      let markersStylesRenderer = this.get('_markersStylesRenderer');
      markersStylesRenderer.renderOnCanvas({
        styleSettings: styleSettings,
        canvas: canvas,
        target: 'legend'
      });
    }
  }
});
