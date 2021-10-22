/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';
import layout from '../../../templates/components/charts/type-charts/bar';
import BaseChartType from '../base-chart-type';

/**
  Component for type chart column.

  @class ColumnComponent
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
    const isObject = this.get('isObject');

    const propName = this.get('_selectedXAxisProperty');
    const propVal = this.get('_selectedYAxisProperty');

    const dataLabels = A([]);
    const datasetsLabel = A([]);
    isObject.forEach((obj) => {
      const dlCopy = A([]);
      const dslCopy = A([]);
      dlCopy.push(obj[propName]);
      dataLabels.push(dlCopy);
      dslCopy.push(obj[propVal]);
      datasetsLabel.push(dslCopy);
    });

    const type = this.get('chartType');
    const options = {
      title: {
        display: true,
        text: this.get('titleChart').toString(),
      },
      tooltips: {
        backgroundColor: '#F8F8F8',
        bodyFontColor: '#000',
      },
      legend: {
        display: false,
      },
      animation: {
        duration: 0,
      },
    };

    const data = {
      labels: dataLabels,
      datasets: [{
        label: this.get(`localizedProperties.${propVal}`) || propVal,
        data: datasetsLabel,
        backgroundColor: '#7CB5EC',
      }],
    };

    return {
      type,
      data,
      options,
    };
  },
});
