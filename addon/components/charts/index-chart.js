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
    },

    onModeTypeChange(item, key) {
      this.set('_selectedModeType', key);
    }
  }
});
