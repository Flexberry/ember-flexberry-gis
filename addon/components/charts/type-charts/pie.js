/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/charts/type-charts/pie';
import BaseChartType from '../base-chart-type';

/**
  Component for type chart pie.

  @class PieComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default BaseChartType.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Forms the json parameter object of the chart.

    @method getJsonCharts
  */
  getJsonCharts() {
    let dataSeries = Ember.A([]);
    let isObject = this.get('_isObject');

    let propName = this.get('_selectedXAxisProperty');
    let propVal = this.get('_selectedYAxisProperty');

    isObject.forEach(obj => {
      let dsCopy = Ember.A([]);
      dsCopy.push(obj[propName], parseFloat(obj[propVal]));
      dataSeries.push(dsCopy);
    });

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
      name: this.get(`_localizedProperties.${propVal}`) || propVal,
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
