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
    let isObject = this.get('isObject');

    let propName = this.get('_selectedXAxisProperty');
    let propVal = this.get('_selectedYAxisProperty');

    let bgcolor = Ember.A(['#F15C80', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC']);
    let bgColorPie = Ember.A([]);
    var j = 0;
    for (var i = 0; i < isObject.length; i++) {
      bgColorPie[i] = bgcolor[j];
      j++;
      if (j === 6) {
        j = 0;
      }
    }

    let dataLabels = Ember.A([]);
    let datasetsLabel = Ember.A([]);
    isObject.forEach(obj => {
      let dlCopy = Ember.A([]);
      let dslCopy = Ember.A([]);
      dlCopy.push(obj[propName]);
      dataLabels.push(dlCopy);
      dslCopy.push(obj[propVal]);
      datasetsLabel.push(dslCopy);
    });
    let type = this.get('chartType');
    let options = {
      title: {
        display: true,
        text: this.get('titleChart').toString()
      },
      tooltips: {
        backgroundColor: '#F8F8F8',
        bodyFontColor: '#000'
      },
      legend:{
        display: false
      },
      animation: {
        duration: 0
      }
    };

    let data = {
      labels: dataLabels,
      datasets: [{
        label: this.get(`localizedProperties.${propVal}`) || propVal,
        data: datasetsLabel,
        backgroundColor: bgColorPie,
      }]
    };

    return {
      type,
      data,
      options
    };
  }
});
