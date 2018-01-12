/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/charts/index-chart';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component for charting.

  @class IndexChartComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Editing chart type.

    @property _captionChart
    @type string
    @default t(`components.charts.index-chart.default-caption`)
  */
  _captionChart: t(`components.charts.index-chart.default-caption`),

  /**
    Selected chart type.

    @property _selectedModeType
    @type string
    @default 'pie'
  */
  _selectedModeType: 'pie',

  /**
    Localized properties names.

    @property _localizedProperties
    @type Object
    @default null
  */
  _localizedProperties: null,

  /**
    Inner hash containing settings object.

    @property _isObjProperties
    @type Object[]
    @default null
  */
  _isObjProperties: null,

  selectedModeType: Ember.computed('i18n.locale', '_selectedModeType', function() {
    let type = this.get('_selectedModeType');
    return this.get('i18n').t(`components.charts.type-charts.${type}.name`).toString();
  }),

  /**
    Available chart type.

    @property _availableTypes
    @type Object[]
  */
  _availableTypes: Ember.computed('i18n.locale', function() {
    let result = {};
    let owner = Ember.getOwner(this) || {};
    if (owner.knownNamesForType) {
      let types = owner.knownNamesForType('components/charts/type-chart');
      types.forEach(type => {
        result[type] = this.get('i18n').t(`components.charts.type-charts.${type}.name`).toString();
      }, this);
    }

    return result;
  }),

  /**
    Reference to 'charts-renderer' service.

    @property _chartsRenderer
    @type LayersStylesRendererService
    @private
  */
  _chartsRenderer: Ember.inject.service('charts-render'),

  /**
    Canvas charts.

    @property _chartsCanvas
    @type <a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>
    @default null
    @private
  */
  _chartsCanvas: null,

  /**
    Renderes charts preview on canvas.

    @method _renderChartsCanvas
    @private
  */
  _renderChartsCanvas() {
    let json = this.get('getJsonCharts')();
    let canvas = this.get('_chartsCanvas');
    this.get('_chartsRenderer').renderOnChartsCanvas({
      canvas: canvas,
      json: json
    });
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    let chartsCanvas = document.getElementById("containerCR");
    this.set('_chartsCanvas', chartsCanvas);
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    this.set('_chartsCanvas', null);
  },

  actions: {

    /**
      Handles {{#crossLink "type-chart/sendingActions.onInit:method"}}'pie/column/line' component's 'onInit' action{{/crossLink}}.

      @method actions.initJsonCharts
    */
    initJsonCharts(getJsonCharts) {
      this.set('getJsonCharts', getJsonCharts);
    },

    /**
      Handles clicks on button.
      Invokes {{#crossLink "type-chart/sendingActions.onGenerateChart:method"}}'onGenerateChart' action{{/crossLink}}.

      @method actions.onGenerateChart
    */
    onGenerateChart() {
      this._renderChartsCanvas();
    },

    onModeTypeChange(item, key) {
      this.get('_chartsRenderer').clearcharts()
      this.set('_selectedModeType', key);
    }
  }
});
