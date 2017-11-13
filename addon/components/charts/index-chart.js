/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/charts/index-chart';

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
    @default 'Сhart title'
  */
  _captionChart: 'Сhart title',

  /**
    Available chart type.

    @property _availableTypes
    @type Object[]
    @default null
  */
  _availableTypes: null,

  /**
    Selected chart type.

    @property _selectedModeType
    @type string
    @default 'pie'
  */
  _selectedModeType: 'pie',

  /**
    Inner hash containing settings object.

    @property _isObjProperties
    @type Object[]
    @default null
  */
  _isObjProperties: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Available layers types for related dropdown.
    let owner = Ember.getOwner(this);
    this.set('_availableTypes', owner.knownNamesForType('components/charts/type-chart'));
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
      let json = this.get('getJsonCharts')();

      this.$('.containerCR').highcharts(json);
    }
  }
});
