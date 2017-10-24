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
    let dataSeries = Ember.A([]);
    let geoJsonLayer = this.get('_layer');

    let propName = this.get('_valueName');
    let propVal = this.get('_valueValues');

    geoJsonLayer.eachLayer(function(layer) {
      let feature = Ember.get(layer, 'feature');
      let dsCopy = Ember.A([]);

      dsCopy.push(feature.properties[propName],
                    parseFloat(feature.properties[propVal]));
      dataSeries.push(dsCopy);
    });

    let chart = {
             plotBackgroundColor: null,
             plotBorderWidth: null,
             plotShadow: false
          };
    let title = {
      text: this.get('_captionChart')
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
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor)||'black'
          }
        }
      }
    };
    let series = [{
      type: this.get('_selectedModeType'),
      name: propVal,
      data: dataSeries
    }];

    let json = {};
    json.chart = chart;
    json.title = title;
    json.tooltip = tooltip;
    json.series = series;
    json.plotOptions = plotOptions;

    return json;
  },

  layout
});
