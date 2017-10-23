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
      { "type": "Feature", "id":"1", "properties": { "name":"Tokyo","rainfall": "60.4"   }, "geometry": { "type": "Point", "coordinates": [175.2209316333,-37.8210922667 ] } },
      { "type": "Feature", "id":"2", "properties": { "name":"New York","rainfall": "38.8" }, "geometry": { "type": "Point", "coordinates": [175.2238417833,-37.80975435   ] } },
      { "type": "Feature", "id":"3", "properties": { "name":"London","rainfall": "52.4"  }, "geometry": { "type": "Point", "coordinates": [175.2169955667,-37.818193     ] } },
      { "type": "Feature", "id":"4", "properties": { "name":"Berlin","rainfall": "105.0"  }, "geometry": { "type": "Point", "coordinates": [175.2240856667,-37.8216963    ] } },
      { "type": "Feature", "id":"5", "properties": { "name":"Perm","rainfall": "216.4" }, "geometry": { "type": "Point", "coordinates": [175.2196982333,-37.8188702167 ] } },
      { "type": "Feature", "id":"6", "properties": { "name":"Paris","rainfall": "33.2"  }, "geometry": { "type": "Point", "coordinates": [175.2209942   ,-37.8192782833 ] } }
    ]
  },

  actions: {
    onLoad() {
      var geoJsonLayer = L.geoJson(this.get('_geoJsonData'), {
  			onEachFeature: function (feature, layer) {
  				layer.bindPopup(feature.properties.address);
  			}
  		});

      //Обход всех слоев для получения значений из  выбранных настроек слоя
      var arrTume = [];
      var arrTume1 = [];

      let feature = Ember.get(geoJsonLayer._layers[1], 'feature');

      arrTume.push (Object.keys(feature.properties)[0]);
      arrTume1.push (Object.keys(feature.properties)[1]);

      this.set('_captionSeries', Object.keys(feature.properties)[0]);
      this.set('_valueSeries', arrTume1);

      geoJsonLayer.eachLayer(function(layer) {
          let feature = Ember.get(layer, 'feature');
        });
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
