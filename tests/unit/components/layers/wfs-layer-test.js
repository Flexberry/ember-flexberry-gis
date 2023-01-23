import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from 'dummy/tests/helpers/start-app';
import createLeafletMap from 'dummy/tests/helpers/common-for-layer';

let app;
let geoserverFake;
let options;
let param;
let leafletOptions;

let commonStub = function(param, that) {
  let component = that.subject(param);
  let store = app.__container__.lookup('service:store');
  let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
  let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
  getmapApiStub.returns(mapModel);
  let getLayerFeatureIdStub = sinon.stub(mapModel, '_getLayerFeatureId');
  getLayerFeatureIdStub.returns('06350c71-ec5c-431e-a5ab-e423cf662128');
  let getPkFieldLayerStub = sinon.stub(component, 'getPkField');
  getPkFieldLayerStub.returns('primarykey');

  return { component, getmapApiStub, getLayerFeatureIdStub, getPkFieldLayerStub };
};

moduleForComponent('layers/wfs-layer', 'Unit | Component | layers/wfs layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'component:base-vector-layer',
    'model:new-platform-flexberry-g-i-s-map'
  ],
  beforeEach: function () {
    app = startApp();

    options = {
      url: 'http://geoserverFake/geoserver/ows',
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      typeNSName: 'rgisperm',
      filter: null,
      version: '1.1.0',
      continueLoading: true,
      typeNS: 'les',
      typeName: 'kvartalutverzhdenopolygon32640',
      pkField: 'primarykey'
    };

    let leafletOptions = [
      'url',
      'version',
      'namespaceUri',
      'typeNS',
      'typeName',
      'typeNSName',
      'geometryField',
      'crs',
      'maxFeatures',
      'showExisting',
      'style',
      'filter',
      'forceMulti',
      'withCredentials',
      'continueLoading'
    ];

    param = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions,
      _pane: 'pane000',
      _renderer: Ember.A()
    };
    param = Ember.$.extend(param, options);

    let leafletMap = createLeafletMap();

    Ember.$.extend(param, { 'leafletMap': leafletMap });

    geoserverFake = sinon.fakeServer.create();
    geoserverFake.autoRespond = true;

    geoserverFake.respondWith('POST', 'http://geoserverFake/geoserver/ows?',
      function (request) {
        if (request.requestBody === '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="application/json">' +
          '<wfs:Query typeName="les:povorottochkipoint32640" srsName="EPSG:3857"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><Not><Or>' +
          '<ogc:PropertyIsEqualTo matchCase="false"><ogc:PropertyName>primarykey</ogc:PropertyName><ogc:Literal>475adc5b-fee4-4e8c-bed0-93746a9f00f0' +
          '</ogc:Literal></ogc:PropertyIsEqualTo></Or></Not></ogc:Filter></wfs:Query></wfs:GetFeature>') {
          request.respond(200, { 'Content-Type': 'application/json' },
            '{"type":"FeatureCollection","features":[],"totalFeatures":0,"numberMatched":0,"numberReturned":0,"timeStamp":"2020-02-27T04:44:49.909Z",' +
            '"crs":null}');
        } else if (request.requestBody.indexOf('<wfs:GetFeature') !== -1) {
          request.respond(200, { 'Content-Type': 'application/json' },
            '{"type":"FeatureCollection","features":[{"type":"Feature","id":"vydel_utverzhdeno_polygon.06350c71-ec5c-431e-a5ab-e423cf662128",' +
            '"geometry":{"type":"MultiPolygon","coordinates":[[[[6215353.89391635,8117916.10977998],[6215317.82640125,8117408.36954415],' +
            '[6215322.83577823,8116959.81224657],[6213934.34777038,8117228.98625252],[6213930.67422719,8117229.84351009],' +
            '[6214007.26203691,8117650.34021493],[6214045.44462228,8117860.38311881],[6214113.79478966,8118235.47443556],' +
            '[6214237.35942438,8118229.9015124],[6214247.82345653,8118288.63175866],[6215053.10865244,8118087.57903733],' +
            '[6215031.95794919,8118033.35145873],[6215042.3106618,8117957.47637766],[6215353.89391635,8117916.10977998]]]]},' +
            '"geometry_name":"shape","properties":' +
            '{"id":"000","lesnichestvo":"-","uchastkovoelesnichestvo":"-","nomerkvartala":"141","urochishe":null,"nomer":10,"ploshad":200,"kategoriyazemel":' +
            '"Эксплуатационные леса","preobladayushayaporoda":"Сосна","bonitet":"2","gruppavozrasta":"Молодняки I гр.","klassvozrasta":"1","klasstovarnosti":' +
            'null,"area":373798.7024302,"length":null,"primarykey":"06350c71-ec5c-431e-a5ab-e423cf662128","createtime":null,"creator":null,' +
            '"edittime":null,"editor":null}}],"totalFeatures":1,"numberMatched":1,"numberReturned":1,"timeStamp":"2020-02-27T04:44:49.909Z",' +
            '"crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::3857"}}}');
        } else if (request.requestBody.indexOf('<wfs:DescribeFeatureType xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0">' +
          '<TypeName>les:test') !== -1) {
          request.respond(404, { 'error': 'Error' }, null);
        } else if (request.requestBody.indexOf('<wfs:DescribeFeatureType') !== -1) {
          request.respond(200, { 'Content-Type': 'text/plain;charset=utf-8' },
            '<?xml version="1.0" encoding="UTF-8"?><xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml" ' +
            'xmlns:rgisperm="http://rgis.permkrai.ru" elementFormDefault="qualified" targetNamespace="http://rgis.permkrai.ru">' +
            '<xsd:import namespace="http://www.opengis.net/gml" schemaLocation="http://rgispk.wdepo.ru:80/geoserver/schemas/gml/3.1.1/base/gml.xsd"/>' +
            '<xsd:complexType name="vydel_utverzhdeno_polygonType">' +
            '<xsd:complexContent>' +
            '<xsd:extension base="gml:AbstractFeatureType">' +
            '<xsd:sequence>' +
            '<xsd:element maxOccurs="1" minOccurs="1" name="primarykey" nillable="false" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="shape" nillable="true" type="gml:MultiSurfacePropertyType"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="id" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="lesnichestvo" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="uchastkovoelesnichestvo" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="nomerkvartala" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="urochishe" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="nomer" nillable="true" type="xsd:int"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="ploshad" nillable="true" type="xsd:decimal"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="kategoriyazemel" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="preobladayushayaporoda" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="bonitet" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="gruppavozrasta" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="klassvozrasta" nillable="true" type="xsd:int"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="klasstovarnosti" nillable="true" type="xsd:int"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="area" nillable="true" type="xsd:decimal"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="length" nillable="true" type="xsd:decimal"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="createtime" nillable="true" type="xsd:dateTime"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="creator" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="edittime" nillable="true" type="xsd:dateTime"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="editor" nillable="true" type="xsd:string"/>' +
            '<xsd:element maxOccurs="1" minOccurs="0" name="kl" nillable="true" type="xsd:string"/>' +
            '</xsd:sequence>' +
            '</xsd:extension>' +
            '</xsd:complexContent>' +
            '</xsd:complexType>' +
            '<xsd:element name="vydel_utverzhdeno_polygon" substitutionGroup="gml:_Feature" type="rgisperm:vydel_utverzhdeno_polygonType"/>' +
            '</xsd:schema>');
        }
      }
    );
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
    geoserverFake.restore();
  }
});

let realCountArr = function (arr) {
  return Object.values(arr).length;
};

test('getLayerFeatures() with options showExisting = false and continueLoading = true', function (assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getPkFieldStub = sinon.stub(mapModel, '_getPkField');
    getPkFieldStub.returns('primarykey');
    let getPkFieldLayerStub = sinon.stub(component, 'getPkField');
    getPkFieldLayerStub.returns('primarykey');

    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };
      component._leafletObject = res.target;
      component.getLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Get feature of layers with showExisting = false and continueLoading = true');
        done();

        getmapApiStub.restore();
        getPkFieldStub.restore();
        getPkFieldLayerStub.restore();
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = false');
    done();
  });
});

test('_addLayersOnMap() with options showExisting = true and continueLoading = false', function (assert) {
  assert.expect(3);
  var done = assert.async(2);
  Ember.run(() => {
    param.showExisting = true;

    let objStub = commonStub(param, this);

    options.showExisting = true;
    L.wfst(options, objStub.component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let layers = Object.values(res.target._layers);
      objStub.component._addLayersOnMap(layers);
      assert.equal(layers[0].options.pane, objStub.component.get('_pane'), 'Pane on object eqals pane on layer');
      assert.equal(layers[0].options.renderer, objStub.component.get('_renderer'), 'Renderer on object eqals renderer on layer');
      done();

      objStub.getmapApiStub.restore();
      objStub.getLayerFeatureIdStub.restore();
      objStub.getPkFieldLayerStub.restore();
    });

    assert.ok(objStub.component, 'Create wfs-layer with showExisting = true');
    done();
  });
});

test('getLayerFeatures() with options showExisting = true', function (assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    param.showExisting = true;

    let objStub = commonStub(param, this);

    options.showExisting = true;
    L.wfst(options, objStub.component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      objStub.component._leafletObject = res.target;

      objStub.component.getLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Get feature of layers with showExisting = true');
        done();

        objStub.getmapApiStub.restore();
        objStub.getLayerFeatureIdStub.restore();
        objStub.getPkFieldLayerStub.restore();
      });
    });

    assert.ok(objStub.component, 'Create wfs-layer with showExisting = true');
    done();
  });
});

test('loadLayerFeatures() with options showExisting = false', function (assert) {
  assert.expect(3);
  var done = assert.async(2);
  Ember.run(() => {
    let component = this.subject(param, this);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getPkFieldStub = sinon.stub(mapModel, '_getPkField');
    getPkFieldStub.returns('primarykey');
    let addCustomFilterSpy = sinon.spy(component, 'addCustomFilter');
    let getPkFieldLayerStub = sinon.stub(component, 'getPkField');
    getPkFieldLayerStub.returns('primarykey');

    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };
      component._leafletObject = res.target;

      component._leafletObject.loadFeatures = () => new Ember.RSVP.resolve();
      component.loadLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Load feature of layers with showExisting = false');
        assert.equal(addCustomFilterSpy.callCount, 1, 'call addCustomFilter');
        done();

        addCustomFilterSpy.restore();
        getmapApiStub.restore();
        getPkFieldStub.restore();
        getPkFieldLayerStub.restore();
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = false');
    done();
  });
});

test('loadLayerFeatures() with options showExisting = true', function (assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    param.showExisting = true;

    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getPkFieldStub = sinon.stub(mapModel, '_getPkField');
    getPkFieldStub.returns('primarykey');
    let getPkFieldLayerStub = sinon.stub(component, 'getPkField');
    getPkFieldLayerStub.returns('primarykey');

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      component._leafletObject = res.target;

      component._leafletObject.loadFeatures = () => new Ember.RSVP.resolve();
      component.loadLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Load feature of layers with showExisting = true');
        done();

        getmapApiStub.restore();
        getPkFieldStub.restore();
        getPkFieldLayerStub.restore();
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = true');
    done();
  });
});

test('loadLayerFeatures() with options showExisting = false, call 2 times', function (assert) {
  assert.expect(3);
  var done = assert.async(3);
  Ember.run(() => {
    param.continueLoading = false;
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getPkFieldStub = sinon.stub(mapModel, '_getPkField');
    getPkFieldStub.returns('primarykey');
    let getPkFieldLayerStub = sinon.stub(component, 'getPkField');
    getPkFieldLayerStub.returns('primarykey');

    options.continueLoading = false;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: null,
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };
      component._leafletObject = res.target;
      component._leafletObject.loadFeatures = function (filter) {
        return new Ember.RSVP.Promise(resolve => {
          var that = this;

          L.Util.request({
            url: this.options.url,
            data: L.XmlUtil.serializeXmlDocumentString(that.getFeature(filter)),
            success: function (responseText) {
              var layers = that.readFormat.responseToLayers(responseText, {
                coordsToLatLng: that.options.coordsToLatLng,
                pointToLayer: that.options.pointToLayer
              });
              layers.forEach(function (element) {
                element.state = that.state.exist;
                that.addLayer(element);
              });
              resolve(that);
            }
          });
        });
      }.bind(component._leafletObject);

      component.loadLayerFeatures(e).then((layers) => {
        assert.equal(layers.getLayers().length, 1, 'Load feature of layers with showExisting = false, 1 times');
        done();
        component.loadLayerFeatures(e).then((layers) => {
          assert.equal(layers.getLayers().length, 1, 'Load feature of layers with showExisting = false, 2 times');
          done();

          getmapApiStub.restore();
          getPkFieldStub.restore();
          getPkFieldLayerStub.restore();
        });
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = false');
    done();
  });
});

test('test method clearChanges() with no changes', function (assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let objStub = commonStub(param, this);

    options.showExisting = true;
    L.wfst(options, objStub.component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      objStub.component._leafletObject = res.target;

      objStub.component.getLayerFeatures(e).then((layers) => {
        let leafletObject = objStub.component.get('_leafletObject');
        let leafletMap = objStub.component.get('leafletMap');
        leafletObject.leafletMap = leafletMap;

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);

        let layerUpdate = leafletObject.getLayers()[0];
        layerUpdate.enableEdit(leafletMap);

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 1);

        objStub.component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();

        objStub.getmapApiStub.restore();
        objStub.getLayerFeatureIdStub.restore();
        objStub.getPkFieldLayerStub.restore();
      });
    });
  });
});

test('test method clearChanges() with create', function (assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let objStub = commonStub(param, this);

    options.showExisting = true;
    L.wfst(options, objStub.component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      objStub.component._leafletObject = res.target;

      objStub.component.getLayerFeatures(e).then((layers) => {
        let leafletObject = objStub.component.get('_leafletObject');
        let leafletMap = objStub.component.get('leafletMap');
        leafletObject.leafletMap = leafletMap;

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);

        let feature = {
          type: 'Polygon',
          coordinates: [
            [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
          ]
        };
        let layerAdd = L.geoJSON(feature).getLayers()[0];
        layerAdd._label = {
          _leaflet_id: 1000
        };
        leafletObject.addLayer(layerAdd);
        leafletObject._labelsLayer = {
          1000: {}
        };
        layerAdd.enableEdit(leafletMap);

        assert.equal(realCountArr(leafletObject.changes), 1);
        assert.equal(leafletObject.getLayers().length, 2);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 1);

        objStub.component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();

        objStub.getmapApiStub.restore();
        objStub.getLayerFeatureIdStub.restore();
        objStub.getPkFieldLayerStub.restore();
      });
    });
  });
});

test('test method clearChanges() with update', function (assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let objStub = commonStub(param, this);

    options.showExisting = true;
    L.wfst(options, objStub.component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      objStub.component._leafletObject = res.target;

      objStub.component.getLayerFeatures(e).then((layers) => {
        let leafletObject = objStub.component.get('_leafletObject');
        let leafletMap = objStub.component.get('leafletMap');
        leafletObject.leafletMap = leafletMap;

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);

        let layerUpdate = leafletObject.getLayers()[0];
        layerUpdate.feature.properties.name = 'test';

        layerUpdate.enableEdit(leafletMap);
        leafletObject.editLayer(layerUpdate);

        assert.equal(realCountArr(leafletObject.changes), 1);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 1);

        objStub.component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();

        objStub.getmapApiStub.restore();
        objStub.getLayerFeatureIdStub.restore();
        objStub.getPkFieldLayerStub.restore();
      });
    });
  });
});

test('test method clearChanges() with delete', function (assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let objStub = commonStub(param, this);

    options.showExisting = true;
    L.wfst(options, objStub.component.getFeaturesReadFormat()).once('load', (res) => {
      res.target.readFormat.excludedProperties = ['primarykey'];
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      objStub.component._leafletObject = res.target;

      objStub.component.getLayerFeatures(e).then((layers) => {
        let leafletObject = objStub.component.get('_leafletObject');
        let leafletMap = objStub.component.get('leafletMap');
        leafletObject.leafletMap = leafletMap;

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);

        let layerRemove = leafletObject.getLayers()[0];
        layerRemove.enableEdit(leafletMap);
        leafletObject.removeLayer(layerRemove);

        assert.equal(realCountArr(leafletObject.changes), 1);
        assert.equal(leafletObject.getLayers().length, 0);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 1);

        objStub.component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();

        objStub.getmapApiStub.restore();
        objStub.getLayerFeatureIdStub.restore();
        objStub.getPkFieldLayerStub.restore();
      });
    });
  });
});
test('test getPkField without pkField', function (assert) {
  assert.expect(1);
  var done = assert.async(1);
  Ember.run(() => {
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let fieldName = leafletObject.getPkField(component.get('layerModel'));
      assert.equal(fieldName, 'primarykey');
      done(1);
    });
  });
});
test('test getPkField with pkField', function (assert) {
  assert.expect(1);
  var done = assert.async(1);
  Ember.run(() => {
    options = Ember.$.extend(options, { pkField: 'pk' });
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let fieldName = leafletObject.getPkField(component.get('layerModel'));
      assert.equal(fieldName, 'pk');
      done(1);
    });
  });
});
test('test editLayer', function (assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    param = Ember.$.extend(param, { showExisting: true });
    let objStub = commonStub(param, this);

    options.showExisting = true;

    objStub.component.get('_leafletLayerPromise').then((leafletObject) => {
      objStub.component.set('_leafletObject', leafletObject);
      let leafletMap = objStub.component.get('leafletMap');
      leafletObject.leafletMap = leafletMap;

      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      done();

      objStub.component.getLayerFeatures(e).then((layers) => {
        let layerUpdate = leafletObject.getLayers()[0];
        layerUpdate.feature.properties.name = 'test';

        layerUpdate.enableEdit(leafletMap);

        let newFeature = L.geoJSON({
          type: 'Polygon',
          coordinates: [[[56.432487, 58.14725], [56.432133, 58.146749], [56.434, 58.146737]]]
        }).getLayers()[0];

        layerUpdate.setLatLngs(newFeature.getLatLngs());

        leafletObject.editLayer(layerUpdate);

        assert.equal(layerUpdate.feature.geometry.coordinates[0].length, 4);
        let coordinates = '6282035.717038031,7998313.982057768,6281996.30993829,' +
          '7998208.303352221,6282204.143427601,7998205.77214398,6282035.717038031,7998313.982057768';
        assert.equal(layerUpdate.feature.geometry.coordinates.toString(), coordinates);

        done();

        objStub.getmapApiStub.restore();
        objStub.getLayerFeatureIdStub.restore();
        objStub.getPkFieldLayerStub.restore();
      });
    });
  });
});
test('test getNearObject with wpsUrl', function (assert) {
  assert.expect(9);
  var done = assert.async(2);
  Ember.run(() => {
    options = Ember.$.extend(options, { pkField: 'primarykey', wpsUrl: 'http://localhost:8080/geoserver/wps' });
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);
    let stubAjax = sinon.stub(Ember.$, 'ajax');
    let responseText = '{' +
      '"type": "FeatureCollection",' +
      '"crs": {' +
        '"type": "name",' +
        '"properties": {' +
          '"name": "EPSG:32640"' +
        '}' +
      '},' +
      '"features": [' +
        '{' +
          '"type": "Feature",' +
          '"geometry": {' +
            '"type": "MultiPolygon",' +
            '"coordinates": [' +
              '[[[465991.9001, 6445952.6774], [466300.6857, 6446025.6799],' +
                '[466192.0721, 6445729.0941], [465991.9001, 6445952.6774]]]' +
            ']' +
          '},' +
          '"properties": {' +
            '"nearest_distance": 123,' +
            '"nearest_bearing": 73.58555983346304' +
          '},' +
          '"id": "kvartalutverzhdenopolygon32640.84b823eb-00f2-48eb-9fdf-a1b47dbe185d"' +
        '}' +
      ']' +
    '}';
    stubAjax.yieldsTo('success', responseText);
    let getLayerFeaturesStub = sinon.stub(component, 'getLayerFeatures');
    getLayerFeaturesStub.returns(Ember.RSVP.resolve([{
      'feature': {
        'properties': {
          'primarykey': '84b823eb-00f2-48eb-9fdf-a1b47dbe185d'
        }
      }
    }]));
    let getWPSgsNearestSpy = sinon.spy(component, 'getWPSgsNearest');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result.distance, 12168517.065042155);
        assert.ok(result.layer);
        assert.equal(result.object.feature.properties.primarykey, '84b823eb-00f2-48eb-9fdf-a1b47dbe185d');
        assert.equal(getWPSgsNearestSpy.callCount, 1);
        assert.equal(getObjectCenterSpy.callCount, 3);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 1);
        assert.equal(_getLayerFeatureIdSpy.callCount, 1);
        assert.equal(getLayerFeaturesStub.callCount, 1);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        stubAjax.restore();
        getLayerFeaturesStub.restore();
        getWPSgsNearestSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});
test('test getNearObject with wpsUrl, Nearest object not found', function (assert) {
  assert.expect(7);
  var done = assert.async(2);
  Ember.run(() => {
    options = Ember.$.extend(options, { pkField: 'primarykey', wpsUrl: 'http://localhost:8080/geoserver/wps' });
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);
    let stubAjax = sinon.stub(Ember.$, 'ajax');
    let responseText = '{' +
      '"type": "FeatureCollection",' +
      '"crs": {' +
        '"type": "name",' +
        '"properties": {' +
          '"name": "EPSG:32640"' +
        '}' +
      '},' +
      '"features": []' +
    '}';
    stubAjax.yieldsTo('success', responseText);
    let getLayerFeaturesStub = sinon.stub(component, 'getLayerFeatures');
    getLayerFeaturesStub.returns(Ember.RSVP.resolve([]));
    let getWPSgsNearestSpy = sinon.spy(component, 'getWPSgsNearest');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result, 'Nearest object not found');
        assert.equal(getWPSgsNearestSpy.callCount, 1);
        assert.equal(getObjectCenterSpy.callCount, 1);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 0);
        assert.equal(_getLayerFeatureIdSpy.callCount, 0);
        assert.equal(getLayerFeaturesStub.callCount, 0);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        stubAjax.restore();
        getLayerFeaturesStub.restore();
        getWPSgsNearestSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});

test('test getNearObject without wpsUrl, same layer', function (assert) {
  assert.expect(10);
  var done = assert.async(2);
  Ember.run(() => {
    options = Ember.$.extend(options, { pkField: 'primarykey' });
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options,
      id: '123'
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);
    let dwithinStub = sinon.stub(component, 'dwithin');
    dwithinStub.onCall(0).returns(Ember.RSVP.resolve(null));
    dwithinStub.onCall(1).returns(Ember.RSVP.resolve(null));

    // feature1
    let feature1 = {
      'type': 'Feature',
      'id': 'kvartalutverzhdenopolygon32640.df5178d8-aa47-4b92-ba08-2404ea26fdb6',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[[56.43419266, 58.15478571], [56.44148827, 58.155465], [56.44148827, 58.15274775], [56.43419266, 58.15478571]]]]
      },
      'geometry_name': 'shape',
      'properties': {
        'primarykey': 'df5178d8-aa47-4b92-ba08-2404ea26fdb6',
        'nomer': null,
        'lesnichestvo': null,
        'uchastkovoelesnichestvo': null,
        'urochishe': null,
        'area': null,
        'length': null,
        'id': null,
        'createtime': null,
        'creator': null,
        'edittime': null,
        'editor': null
      },
    };
    let polygon1 = L.polygon([[[[56.43419266, 58.15478571], [56.44148827, 58.155465], [56.44148827, 58.15274775], [56.43419266, 58.15478571]]]]);
    polygon1.feature = feature1;
    feature1.leafletLayer = polygon1;

    // feature 2
    let feature2 =  {
      'type': 'Feature',
      'id': 'kvartalutverzhdenopolygon32640.df5178d8-aa47-4b92-ba08-2404ea26fdb7',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[[56.43419266, 59.15478571], [56.44148827, 59.155465], [56.44148827, 59.15274775], [56.43419266, 59.15478571]]]]
      },
      'geometry_name': 'shape',
      'properties': {
        'primarykey': 'df5178d8-aa47-4b92-ba08-2404ea26fdb7',
        'nomer': null,
        'lesnichestvo': null,
        'uchastkovoelesnichestvo': null,
        'urochishe': null,
        'area': null,
        'length': null,
        'id': null,
        'createtime': null,
        'creator': null,
        'edittime': null,
        'editor': null
      },
    };
    let polygon2 = L.polygon([[[[56.43419266, 59.15478571], [56.44148827, 59.155465], [56.44148827, 59.15274775], [56.43419266, 59.15478571]]]]);
    polygon2.feature = feature2;
    feature2.leafletLayer = polygon2;

    // feature3 - same object
    let feature3 =  {
      'type': 'Feature',
      'id': 'kvartalutverzhdenopolygon32640.234',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]]
      },
      'geometry_name': 'shape',
      'properties': {
        'primarykey': '234',
        'nomer': null,
        'lesnichestvo': null,
        'uchastkovoelesnichestvo': null,
        'urochishe': null,
        'area': null,
        'length': null,
        'id': null,
        'createtime': null,
        'creator': null,
        'edittime': null,
        'editor': null
      },
    };
    let polygon3 = L.polygon([[[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]]);
    polygon3.feature = feature3;
    feature3.leafletLayer = polygon3;

    dwithinStub.onCall(2).returns(Ember.RSVP.resolve([feature1, feature2, feature3]));

    let upDistanceSpy = sinon.spy(component, 'upDistance');
    let _calcNearestObjectSpy = sinon.spy(component, '_calcNearestObject');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
        featureId: '234',
        layerObjectId: '123'
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result.distance, 18060435.745686203);
        assert.ok(result.layer);
        assert.equal(result.object.feature.properties.primarykey, 'df5178d8-aa47-4b92-ba08-2404ea26fdb6');
        assert.equal(getObjectCenterSpy.callCount, 4);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 2);
        assert.equal(_getLayerFeatureIdSpy.callCount, 3);
        assert.equal(upDistanceSpy.callCount, 3);
        assert.equal(_calcNearestObjectSpy.callCount, 1);
        assert.equal(dwithinStub.callCount, 3);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        _calcNearestObjectSpy.restore();
        upDistanceSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
        dwithinStub.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});
test('test getNearObject without wpsUrl, other layer', function (assert) {
  assert.expect(10);
  var done = assert.async(2);
  Ember.run(() => {
    options = Ember.$.extend(options, { pkField: 'primarykey' });
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options,
      id: '123'
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);
    let dwithinStub = sinon.stub(component, 'dwithin');
    dwithinStub.onCall(0).returns(Ember.RSVP.resolve(null));
    dwithinStub.onCall(1).returns(Ember.RSVP.resolve(null));

    // feature1
    let feature1 =  {
      'type': 'Feature',
      'id': 'kvartalutverzhdenopolygon32640.df5178d8-aa47-4b92-ba08-2404ea26fdb6',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[[56.43419266, 58.15478571], [56.44148827, 58.155465], [56.44148827, 58.15274775], [56.43419266, 58.15478571]]]]
      },
      'geometry_name': 'shape',
      'properties': {
        'primarykey': 'df5178d8-aa47-4b92-ba08-2404ea26fdb6',
        'nomer': null,
        'lesnichestvo': null,
        'uchastkovoelesnichestvo': null,
        'urochishe': null,
        'area': null,
        'length': null,
        'id': null,
        'createtime': null,
        'creator': null,
        'edittime': null,
        'editor': null
      },
    };
    let polygon1 = L.polygon([[[[56.43419266, 58.15478571], [56.44148827, 58.155465], [56.44148827, 58.15274775], [56.43419266, 58.15478571]]]]);
    polygon1.feature = feature1;
    feature1.leafletLayer = polygon1;

    // feature 2
    let feature2 =  {
      'type': 'Feature',
      'id': 'kvartalutverzhdenopolygon32640.df5178d8-aa47-4b92-ba08-2404ea26fdb7',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[[56.43419266, 59.15478571], [56.44148827, 59.155465], [56.44148827, 59.15274775], [56.43419266, 59.15478571]]]]
      },
      'geometry_name': 'shape',
      'properties': {
        'primarykey': 'df5178d8-aa47-4b92-ba08-2404ea26fdb7',
        'nomer': null,
        'lesnichestvo': null,
        'uchastkovoelesnichestvo': null,
        'urochishe': null,
        'area': null,
        'length': null,
        'id': null,
        'createtime': null,
        'creator': null,
        'edittime': null,
        'editor': null
      },
    };
    let polygon2 = L.polygon([[[[56.43419266, 59.15478571], [56.44148827, 59.155465], [56.44148827, 59.15274775], [56.43419266, 59.15478571]]]]);
    polygon2.feature = feature2;
    feature2.leafletLayer = polygon2;

    // feature3 - same object
    let feature3 =  {
      'type': 'Feature',
      'id': 'kvartalutverzhdenopolygon32640.234',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]]
      },
      'geometry_name': 'shape',
      'properties': {
        'primarykey': '234',
        'nomer': null,
        'lesnichestvo': null,
        'uchastkovoelesnichestvo': null,
        'urochishe': null,
        'area': null,
        'length': null,
        'id': null,
        'createtime': null,
        'creator': null,
        'edittime': null,
        'editor': null
      },
    };
    let polygon3 = L.polygon([[[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]]);
    polygon3.feature = feature3;
    feature3.leafletLayer = polygon3;

    dwithinStub.onCall(2).returns(Ember.RSVP.resolve([feature1, feature2, feature3]));

    let upDistanceSpy = sinon.spy(component, 'upDistance');
    let _calcNearestObjectSpy = sinon.spy(component, '_calcNearestObject');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
        featureId: '234',
        layerObjectId: '234'
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result.distance, 0);
        assert.ok(result.layer);
        assert.equal(result.object.feature.properties.primarykey, '234');
        assert.equal(getObjectCenterSpy.callCount, 6);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 3);
        assert.equal(_getLayerFeatureIdSpy.callCount, 3);
        assert.equal(upDistanceSpy.callCount, 3);
        assert.equal(_calcNearestObjectSpy.callCount, 1);
        assert.equal(dwithinStub.callCount, 3);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        _calcNearestObjectSpy.restore();
        upDistanceSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
        dwithinStub.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});
test('test getNearObject without wpsUrl, Nearest object not found', function (assert) {
  assert.expect(8);
  var done = assert.async(2);
  Ember.run(() => {
    options = Ember.$.extend(options, { pkField: 'primarykey' });
    let layerModel = Ember.Object.create({
      type: 'wfs',
      visibility: false,
      settingsAsObject:options,
      id: '123'
    });
    param = Ember.$.extend(param, { layerModel: layerModel });
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);
    let dwithinStub = sinon.stub(component, 'dwithin');
    dwithinStub.returns(Ember.RSVP.resolve(null));

    let upDistanceSpy = sinon.spy(component, 'upDistance');
    let _calcNearestObjectSpy = sinon.spy(component, '_calcNearestObject');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
        featureId: '234',
        layerObjectId: '234'
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result, 'Nearest object not found');
        assert.equal(getObjectCenterSpy.callCount, 0);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 0);
        assert.equal(_getLayerFeatureIdSpy.callCount, 0);
        assert.equal(upDistanceSpy.callCount, 8);
        assert.equal(_calcNearestObjectSpy.callCount, 0);
        assert.equal(dwithinStub.callCount, 8);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        _calcNearestObjectSpy.restore();
        upDistanceSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
        dwithinStub.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});

test('test _createVectorLayer with error', function (assert) {
  assert.expect(5);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      url: 'http://geoserverFake/geoserver/ows',
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      typeNSName: 'rgisperm',
      filter: null,
      version: '1.1.0',
      continueLoading: true,
      typeNS: 'les',
      typeName: 'test',
      pkField: 'primarykey'
    };

    let param = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions,
      _pane: 'pane000',
      _renderer: Ember.A()
    };
    param = Ember.$.extend(param, options);

    let objStub = commonStub(param, this);
    let wfstSpy = sinon.spy(L, 'wfst');

    objStub.component.get('_leafletLayerPromise').then(() => {
      let wfsLayer = objStub.component._createVectorLayer(null, options);
      assert.ok(wfsLayer, 'Create layer');
      assert.ok(wfsLayer instanceof L.WFS, 'Create WFS layer');
      assert.ok(wfsLayer.error, 'Create layer with error');
      assert.equal(wfsLayer.getLayers().length, 0, 'Layer with 0 feature');
      assert.equal(wfstSpy.callCount, 2, 'Create layer');

      done();

      wfstSpy.restore();
    });
  });
});

test('test _createVectorLayer without error', function (assert) {
  assert.expect(5);
  var done = assert.async(1);
  Ember.run(() => {
    param.typeName = 'kvartalutverzhdenopolygon32640';
    options.typeName = 'kvartalutverzhdenopolygon32640';
    let objStub = commonStub(param, this);
    let featuresReadFormat = objStub.component.getFeaturesReadFormat();
    let layer = L.wfst(options, featuresReadFormat);

    let wfstSpy = sinon.spy(L, 'wfst');

    objStub.component.get('_leafletLayerPromise').then(() => {
      let wfsLayer = objStub.component._createVectorLayer(layer, options, featuresReadFormat);
      assert.ok(wfsLayer, 'Create layer');
      assert.ok(wfsLayer instanceof L.WFS, 'Create WFS layer');
      assert.notOk(wfsLayer.error, 'Create layer without error');
      assert.equal(wfsLayer.getLayers().length, 0, 'Layer with 0 feature');
      assert.equal(wfstSpy.callCount, 0, 'Layer already create');

      done();

      wfstSpy.restore();
    });
  });
});

test('test createVectorLayer without error', function (assert) {
  assert.expect(8);
  var done = assert.async(1);
  Ember.run(() => {
    param.typeName = 'kvartalutverzhdenopolygon32640';
    options.typeName = 'kvartalutverzhdenopolygon32640';
    let objStub = commonStub(param, this);

    let wfstSpy = sinon.spy(L, 'wfst');
    let createVectorLayerSpy = sinon.spy(objStub.component, 'createVectorLayer');
    let _createVectorLayerSpy = sinon.spy(objStub.component, '_createVectorLayer');

    objStub.component.createVectorLayer(options).then((wfsLayer) => {
      assert.ok(wfsLayer, 'Create layer');
      assert.ok(wfsLayer instanceof L.WFS, 'Create WFS layer');
      assert.notOk(wfsLayer.error, 'Create layer without error');
      assert.equal(wfsLayer.getLayers().length, 0, 'Layer with 0 feature');
      assert.equal(wfstSpy.callCount, 1, 'Create layer');
      assert.equal(createVectorLayerSpy.callCount, 1, 'Call createVectorLayer');
      assert.equal(_createVectorLayerSpy.callCount, 2, 'Call _createVectorLayer');
      assert.ok(_createVectorLayerSpy.getCall(0).args[0], 'Call _createVectorLayer');

      done();

      wfstSpy.restore();
      createVectorLayerSpy.restore();
      _createVectorLayerSpy.restore();
    });
  });
});

test('test createVectorLayer with error', function (assert) {
  assert.expect(8);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      url: 'http://geoserverFake/geoserver/ows',
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      typeNSName: 'rgisperm',
      filter: null,
      version: '1.1.0',
      continueLoading: true,
      typeNS: 'les',
      typeName: 'test',
      pkField: 'primarykey'
    };

    let param = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions,
      _pane: 'pane000',
      _renderer: Ember.A()
    };
    param = Ember.$.extend(param, options);
    let objStub = commonStub(param, this);

    let wfstSpy = sinon.spy(L, 'wfst');
    let createVectorLayerSpy = sinon.spy(objStub.component, 'createVectorLayer');
    let _createVectorLayerSpy = sinon.spy(objStub.component, '_createVectorLayer');

    objStub.component.createVectorLayer(options).then((wfsLayer) => {
      assert.ok(wfsLayer, 'Create layer');
      assert.ok(wfsLayer instanceof L.WFS, 'Create WFS layer');
      assert.ok(wfsLayer.error, 'Create layer without error');
      assert.equal(wfsLayer.getLayers().length, 0, 'Layer with 0 feature');
      assert.equal(wfstSpy.callCount, 3, 'Create layer');
      assert.equal(createVectorLayerSpy.callCount, 1, 'Call createVectorLayer');
      assert.equal(_createVectorLayerSpy.callCount, 2, 'Call _createVectorLayer');
      assert.notOk(_createVectorLayerSpy.getCall(0).args[0], 'Call _createVectorLayer');

      done();

      wfstSpy.restore();
      createVectorLayerSpy.restore();
      _createVectorLayerSpy.restore();
    });
  });
});
