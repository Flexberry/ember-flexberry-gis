/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/charts/type-charts/pie';

/**
  Component for type chart pie.

  @class PieComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Available field name sector chart.

    @property _itemsName
    @type Object[]
    @default null
  */
  _itemsName: null,

  /**
    Available field value sector chart.

    @property _itemsValues
    @type Object[]
    @default null
  */
  _itemsValues: null,

  /**
    Selected field name sectora chart.

    @property _valueName
    @type string
    @default null
  */
  _valueName: null,

  /**
    Selected field value sectora chart.

    @property _valueValues
    @type float
    @default null
  */
  _valueValues: null,

  /**
    Inner hash containing settings object.

    @property _isObject
    @type Object[]
    @default null
  */
  _isObject: null,

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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let isObjectNumber = Ember.A([]);
    let isObject = this.get('_isObject');
    let propName = Object.keys(isObject[0]);

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
    let dataSeries = Ember.A([]);
    let isObject = this.get('_isObject');

    let propName = this.get('_valueName');
    let propVal = this.get('_valueValues');

    for (var i in isObject)
    {
      let dsCopy = Ember.A([]);
      dsCopy.push(isObject[i][propName], parseFloat(isObject[i][propVal]));
      dataSeries.push(dsCopy);
    }

    let chart = {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false
    };
    let title = {
      text: this.get('_titleChart')
    };
    let tooltip = {
      pointFormat: '{series.name}: <b>{point.y:.1f}</b>'
    };
    let plotOptions = {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',

        dataLabels: {
          enabled: true,
          format: '<b>{point.name}%</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    };
    let series = [{
      type: this.get('_chartType'),
      name: propVal,
      data: dataSeries
    }];

    return {
      chart,
      title,
      tooltip,
      plotOptions,
      series
    };
  }
});
