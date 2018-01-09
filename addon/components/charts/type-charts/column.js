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
    let xCategories = Ember.A([]);
    let dataSeries = Ember.A([]);
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

    /*************   chartjs   **************      
    let bgcolor = Ember.A(['#F15C80', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC']);
    let bgColorPie = Ember.A([]);
    var j=0;   
    for(var i=0; i<isObject.length; i++){
      bgColorPie[i]=bgcolor[j];
      j++;       
      if(j==6){
        j=0;
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
        backgroundColor: bgColorPie,        
      }]          
    };

    return {
      type,
      data,
      options     
    };

   /* isObject.forEach(obj => {
      xCategories.push(obj[propName]);
      dataSeries.push(parseFloat(obj[propVal]));
    });

    let chart = {
      type: this.get('_chartType')
    };
    let title = {
      text: this.get('_titleChart')
    };
    let xAxis = {
      categories: xCategories,
      crosshair: true
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
      name: this.get(`_localizedProperties.${propVal}`) || propVal,
      data: dataSeries
    }];

    return {
      chart,
      title,
      xAxis,
      tooltip,
      plotOptions,
      series
    };*/
  }
});
