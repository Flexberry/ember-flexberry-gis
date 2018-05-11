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
    Inner hash string chart title.

    @property titleChart
    @type string
    @default null
  */
  titleChart: null,

  /**
    Inner hash string chart type.

    @property chartType
    @type string
    @default null
  */
  chartType: null,

  /**
    Inner hash containing settings object.

    @property isObject
    @type Object[]
    @default null
  */
  isObject: null,

  /**
    Localized properties names.

    @property localizedProperties
    @type Object
    @default null
  */
  localizedProperties: null,

  /**
    Selected field name xAxis chart.

    @property _selectedXAxisProperty
    @type string
    @default null
  */
  _selectedXAxisProperty: null,

  /**
    Selected field value yAxis chart.

    @property _selectedYAxisProperty
    @type string
    @default null
  */
  _selectedYAxisProperty: null,

  /**
    Available field name xAxis chart.

    @property _propertiesForXAxis
    @type Object
  */
  _propertiesForXAxis: Ember.computed('localizedProperties', function() {
    let allProperties = {};
    let isObject = this.get('isObject');
    let properties = Object.keys(isObject[0] || {});
    let localizedProperties = this.get('localizedProperties');

    for (var i in properties)
    {
      allProperties[properties[i]] = localizedProperties[properties[i]] || properties[i];
    }

    return allProperties;
  }),

  /**
    Available field value yAxis chart.

    @property _propertiesForYAxis
    @type Object
  */
  _propertiesForYAxis: Ember.computed('localizedProperties', function() {
    let numberProperties = {};
    let isObject = this.get('isObject');
    let properties = Object.keys(isObject[0] || {});
    let localizedProperties = this.get('localizedProperties');

    for (var i in properties)
    {
      if (isFinite(isObject[0][properties[i]])) {
        numberProperties[properties[i]] = localizedProperties[properties[i]] || properties[i];
      }
    }

    return numberProperties;
  }),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.sendAction('onInit', this.getJsonCharts.bind(this));
  },

  /**
    Forms the json parameter object of the chart.

    @method getJsonCharts
  */
  getJsonCharts() {
    assert('BaseChartType\'s \'getJsonCharts\' should be overridden.');
  },

  actions: {
    /**
      Handles xAxis property change.

      @method actions.onXAxisPropertyChange
    */
    onXAxisPropertyChange(item, key) {
      this.set('_selectedXAxisProperty', key);
    },

    /**
      Handles yAxis property change.

      @method actions.onXAxisPropertyChange
    */
    onYAxisPropertyChange(item, key) {
      this.set('_selectedYAxisProperty', key);
    }
  }
});
