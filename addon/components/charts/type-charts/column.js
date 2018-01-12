/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/charts/type-charts/column';
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
    let isObject = this.get('_isObject');

    let propName = this.get('_selectedXAxisProperty');
    let propVal = this.get('_selectedYAxisProperty');

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

    let type = 'bar';//this.get('_chartType');
    let options = {
      title: {
        display: true,
        text: this.get('_titleChart')
      },
      tooltips: {
        backgroundColor: '#F8F8F8',
        bodyFontColor: '#000'
      },
      legend:{
        display: false
      }
    };

    let data = {
      labels: dataLabels,
      datasets: [{
        label: this.get(`_localizedProperties.${propVal}`) || propVal,
        data: datasetsLabel,
        backgroundColor: '#7CB5EC'
      }]
    };

    return {
      type,
      data,
      options
    };
  }
});
