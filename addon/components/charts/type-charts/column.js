import Ember from 'ember';
import layout from '../../../templates/components/charts/type-charts/column';

export default Ember.Component.extend({
  _itemsName: null,

  _itemsValues: null,

  _valueName: null,

  _valueValues: null,

  _layer: null,

  _captionChart: null,

  _selectedModeType: null,

  init() {
    this._super(...arguments);

    let isObjectNumber = Ember.A([]);
    let geoJsonLayer = this.get('_layer');

    let feature = Ember.get(geoJsonLayer._layers[Object.keys(geoJsonLayer._layers)[0]], 'feature');
    let isObject = Object.keys(feature.properties);

    for (var i in isObject)
    {
      if (isFinite(feature.properties[isObject[i]])){
        isObjectNumber.pushObject (isObject[i]);
      }
    }

    this.set('_itemsName', isObject);
    this.set('_itemsValues', isObjectNumber);
    this.sendAction('onInit', this.getJsonCharts.bind(this));
  },

  getJsonCharts() {
    let xCategories = Ember.A([]);
    let dataSeries = Ember.A([]);
    let geoJsonLayer = this.get('_layer');

    let propName = this.get('_valueName');
    let propVal = this.get('_valueValues');

    geoJsonLayer.eachLayer(function(layer) {
      let feature = Ember.get(layer, 'feature');
      let dsCopy = Ember.A([]);

      dsCopy.push(feature.properties[propName],
        parseFloat(feature.properties[propVal]));
      xCategories.push(dsCopy[0]);
      dataSeries.push(dsCopy[1]);
    });

    let chart = {
      type: this.get('_selectedModeType')
    };
    let title = {
      text: this.get('_captionChart')
    };
    let xAxis = {
      categories: xCategories,
      crosshair: true
    };
    let yAxis = {
      min: 0,
      title: {
        text: propVal
      }
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

    let json = {};
    json.chart = chart;
    json.title = title;
    json.tooltip = tooltip;
    json.xAxis = xAxis;
    json.yAxis = yAxis;
    json.series = series;
    json.plotOptions = plotOptions;

    return json;
  },

  layout
});
