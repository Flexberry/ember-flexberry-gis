/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';
import layout from '../../../templates/components/charts/type-charts/line';
import BaseChartType from '../base-chart-type';

/**
  Component for type chart line.

  @class LineComponent
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

    let dataLabels = A([]);
    let datasetsLabel = A([]);
    isObject.forEach(obj => {
      let dlCopy = A([]);
      let dslCopy = A([]);
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
        fill: false,
        borderColor: '#7CB5EC',
        pointBackgroundColor: '#7CB5EC'
      }]
    };

    return {
      type,
      data,
      options
    };
  }
});
