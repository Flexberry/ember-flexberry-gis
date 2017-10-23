import Ember from 'ember';

export default Ember.Controller.extend({

  _captionChart: "Test chart",

  _dataSeries: null,

  _captionSeries: null,

  _valueSeries: null,

  _val1: null,

  _val2: null,

  _geoJsonData: {
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "id":"1", "properties": { "name":"Tokyo", "name1":"New York1", "rainfall": "60.4", "countP": "100" }, "geometry": { "type": "Point", "coordinates": [175.2209316333,-37.8210922667 ] } },
      { "type": "Feature", "id":"2", "properties": { "name":"New York", "name1":"London1", "rainfall": "38.8", "countP": "200" }, "geometry": { "type": "Point", "coordinates": [175.2238417833,-37.80975435   ] } },
      { "type": "Feature", "id":"3", "properties": { "name":"London", "name1":"Berlin1", "rainfall": "52.4", "countP": "300"  }, "geometry": { "type": "Point", "coordinates": [175.2169955667,-37.818193     ] } },
      { "type": "Feature", "id":"4", "properties": { "name":"Berlin", "name1":"Perm1", "rainfall": "105.0", "countP": "400"  }, "geometry": { "type": "Point", "coordinates": [175.2240856667,-37.8216963    ] } },
      { "type": "Feature", "id":"5", "properties": { "name":"Perm", "name1":"Paris1","rainfall": "216.4", "countP": "500" }, "geometry": { "type": "Point", "coordinates": [175.2196982333,-37.8188702167 ] } },
      { "type": "Feature", "id":"6", "properties": { "name":"Paris", "name1":"Tokyo1", "rainfall": "33.2", "countP": "600"  }, "geometry": { "type": "Point", "coordinates": [175.2209942   ,-37.8192782833 ] } }
    ]
  },

  actions: {
    onLoad() {
      var geoJsonLayer = L.geoJson(this.get('_geoJsonData'), {
  			onEachFeature: function (feature, layer) {
  				layer.bindPopup(feature.properties.address);
  			}
  		});

      var arrTume = [];
      var arrTume1 = [];

      let feature = Ember.get(geoJsonLayer._layers[1], 'feature');

      for (var i in Object.keys(feature.properties))
      {
        let isObject = Object.keys(feature.properties)[i];

        if (isFinite(feature.properties[isObject])){
          arrTume1.push (isObject);
        }
        else {
          arrTume.push (isObject);
        }
      }

      this.set('_captionSeries', arrTume);
      this.set('_valueSeries', arrTume1);
    },

    onClick() {
      let dataSeries = [];
      // Пример geojson слоя для построения данных

    var geoJsonLayer = L.geoJson(this.get('_geoJsonData'), {
			onEachFeature: function (feature, layer) {
				layer.bindPopup(feature.properties.address);
			}
		});

    //Обход всех слоев для получения значений из  выбранных настроек слоя
    let propName = this.get('_val1');
    let propVal = this.get('_val2');

    geoJsonLayer.eachLayer(function(layer) {
        let feature = Ember.get(layer, 'feature');
        var arrTume = [];

        arrTume.push(feature.properties[propName],
                      parseFloat(feature.properties[propVal]));
        dataSeries.push(arrTume);
      });

      this.set('_dataSeries', dataSeries);

      var chart = {
               plotBackgroundColor: null,
               plotBorderWidth: null,
               plotShadow: false
            };
            var title = {
               text: this.get('_captionChart')
            };
            var tooltip = {
               pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            };
            var plotOptions = {
               pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',

                  dataLabels: {
                     enabled: true,
                     format: '<b>{point.name}%</b>: {point.percentage:.1f} %',
                     style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor)||
                        'black'
                     }
                  }
               }
            };
            var series = [{
               type: 'pie',
               name: propVal,
               data: this.get('_dataSeries')
            }];

            var json = {};
            json.chart = chart;
            json.title = title;
            json.tooltip = tooltip;
            json.series = series;
            json.plotOptions = plotOptions;

            Ember.$('.container111111111').highcharts(json);
    }
  }
});
