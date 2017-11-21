/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/charts/type-charts/column';

/**
  Component for type chart column.

  @class ColumnComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Available field name xAxis chart.

    @property _itemsName
    @type Object[]
    @default null
  */
  _itemsName: null,

  /**
    Available field value yAxis chart.

    @property _itemsValues
    @type Object[]
    @default null
  */
  _itemsValues: null,

  /**
    Selected field name xAxis chart.

    @property _valueName
    @type string
    @default null
  */
  _valueName: null,

  /**
    Selected field value yAxis chart.

    @property _valueValues
    @type float
    @default null
  */
  _valueValues: null,

  /**
    Inner hash string chart title.

    @property _titleChart
    @type string
    @default null
  */
  _titleChart: null,

  /**
    Inner hash string chart type.

    @property _chartType
    @type string
    @default null
  */
  _chartType: null,

  /**
    Inner hash containing settings object.

    @property _isObject
    @type Object[]
    @default null
  */
  _isObject: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let isObjectNumber = Ember.A([]);
    let isObject = this.get('_isObject');
    let propName = Object.keys(isObject[0] || {});

    for (var i in propName)
    {
      if (isFinite(isObject[i][propName[i]])) {
        isObjectNumber.pushObject(propName[i]);
      }
    }

    this.set('_itemsName', propName);
    this.set('_itemsValues', isObjectNumber);
    this.sendAction('onInit', this.getJsonCharts.bind(this));
  },

  /**
    Forms the json parameter object of the chart.

    @method getJsonCharts
  */
  getJsonCharts() {
    let xCategories = Ember.A([]);
    let dataSeries = Ember.A([]);
    let isObject = this.get('_isObject');

    let propName = this.get('_valueName');
    let propVal = this.get('_valueValues');

    for (var i in isObject)
    {
      xCategories.push(isObject[i][propName]);
      dataSeries.push(parseFloat(isObject[i][propVal]));
    }

    let chart = {
      type: this.get('_chartType')
    };
    let title = {
      text: this.get('_titleChart')
    };
    let xAxis = {
      categories: xCategories,
      crosshair: true
    };
    let tooltip = {
      headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
        '<td style = "padding:0"><b>{point.y:.1f} mm</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    };
    let plotOptions = {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    };
    let series = [{
      name: propVal,
      data: dataSeries
    }];

    return {
      chart,
      title,
      xAxis,
      tooltip,
      plotOptions,
      series
    };
  }
});
