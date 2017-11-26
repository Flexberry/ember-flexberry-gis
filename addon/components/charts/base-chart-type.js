/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

const {
  assert
} = Ember;

/**
  Component for base chart type.

  @class BaseChartTypeComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Ember.Component.extend({
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
      if (isFinite(isObject[0][propName[i]])) {
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
    assert('BaseChartType\'s \'getJsonCharts\' should be overridden.');
  }
});
