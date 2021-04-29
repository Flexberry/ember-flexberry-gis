import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from 'dummy/tests/helpers/start-app';

let app;
let geoserverFake;
let options;
let param;

moduleForComponent('layers/wfs-layer', 'Unit | Component | layers/wfs layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'component:base-vector-layer',
    'model:new-platform-flexberry-g-i-s-map'
  ],
  beforeEach: function() {
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
      continueLoading: true
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
      leafletOptions: leafletOptions
    };
    param = Ember.$.extend(param, options);

    let bounds = L.latLngBounds(L.latLng(58.4436454695997, 56.369991302490234), L.latLng(58.46793791815783, 56.53478622436524));

    let getBounds = function() {
      return bounds;
    };

    let getPane = function() {
      return undefined;
    };

    let createPane = function() {
      return {};
    };

    let hasLayer = function() {
      return true;
    };

    let removeLayer = function() {
      return {};
    };

    let leafletMap = L.map(document.createElement('div'));
    leafletMap.getBounds = getBounds;
    leafletMap.getPane = getPane;
    leafletMap.createPane = createPane;
    leafletMap.removeLayer = removeLayer;
    leafletMap.hasLayer = hasLayer;
    let editTools = new L.Editable(leafletMap);
    Ember.set(leafletMap, 'editTools', editTools);

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
        }

        if (request.requestBody.indexOf('<wfs:GetFeature') !== -1) {
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
        }

        if (request.requestBody.indexOf('<wfs:DescribeFeatureType') !== -1) {
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
  afterEach: function() {
    Ember.run(app, 'destroy');
    geoserverFake.restore();
  }
});

let realCountArr = function (arr) {
  return Object.values(arr).length;
};

test('getLayerFeatures() with options showExisting = false and continueLoading = true', function(assert) {
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

    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };
      component._leafletObject = res.target;
      component.getLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Get feature of layers with showExisting = false and continueLoading = true');
        done();
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = false');
    done();
  });
});

test('getLayerFeatures() with options showExisting = true', function(assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    param.showExisting = true;

    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getLayerFeatureIdStub = sinon.stub(mapModel, '_getLayerFeatureId');
    getLayerFeatureIdStub.returns('06350c71-ec5c-431e-a5ab-e423cf662128');

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      component._leafletObject = res.target;

      component.getLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Get feature of layers with showExisting = true');
        done();
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = true');
    done();
  });
});

test('loadLayerFeatures() with options showExisting = false', function(assert) {
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

    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };
      component._leafletObject = res.target;

      component._leafletObject.loadFeatures = () => new Ember.RSVP.resolve();
      component.loadLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Load feature of layers with showExisting = false');
        done();
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = false');
    done();
  });
});

test('loadLayerFeatures() with options showExisting = true', function(assert) {
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

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
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
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = true');
    done();
  });
});

test('loadLayerFeatures() with options showExisting = false, call 2 times', function(assert) {
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

    options.continueLoading = false;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
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
        });
      });
    });

    assert.ok(component, 'Create wfs-layer with showExisting = false');
    done();
  });
});

test('test method clearChanges() with no changes', function(assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getLayerFeatureIdStub = sinon.stub(mapModel, '_getLayerFeatureId');
    getLayerFeatureIdStub.returns('06350c71-ec5c-431e-a5ab-e423cf662128');

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      component._leafletObject = res.target;

      component.getLayerFeatures(e).then((layers) => {
        let leafletObject = component.get('_leafletObject');
        let leafletMap = component.get('leafletMap');
        leafletObject.leafletMap = leafletMap;

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);

        let layerUpdate = leafletObject.getLayers()[0];
        layerUpdate.enableEdit(leafletMap);

        assert.equal(realCountArr(leafletObject.changes), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 1);

        component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();
      });
    });
  });
});

test('test method clearChanges() with create', function(assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getLayerFeatureIdStub = sinon.stub(mapModel, '_getLayerFeatureId');
    getLayerFeatureIdStub.returns('06350c71-ec5c-431e-a5ab-e423cf662128');

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      component._leafletObject = res.target;

      component.getLayerFeatures(e).then((layers) => {
        let leafletObject = component.get('_leafletObject');
        let leafletMap = component.get('leafletMap');
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

        component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();
      });
    });
  });
});

test('test method clearChanges() with update', function(assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getLayerFeatureIdStub = sinon.stub(mapModel, '_getLayerFeatureId');
    getLayerFeatureIdStub.returns('06350c71-ec5c-431e-a5ab-e423cf662128');

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      component._leafletObject = res.target;

      component.getLayerFeatures(e).then((layers) => {
        let leafletObject = component.get('_leafletObject');
        let leafletMap = component.get('leafletMap');
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

        component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();
      });
    });
  });
});

test('test method clearChanges() with delete', function(assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let component = this.subject(param);

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getLayerFeatureIdStub = sinon.stub(mapModel, '_getLayerFeatureId');
    getLayerFeatureIdStub.returns('06350c71-ec5c-431e-a5ab-e423cf662128');

    options.showExisting = true;
    L.wfst(options, component.getFeaturesReadFormat()).once('load', (res) => {
      let e = {
        featureIds: ['06350c71-ec5c-431e-a5ab-e423cf662128'],
        layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
        results: Ember.A()
      };

      component._leafletObject = res.target;

      component.getLayerFeatures(e).then((layers) => {
        let leafletObject = component.get('_leafletObject');
        let leafletMap = component.get('leafletMap');
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

        component.clearChanges();
        assert.equal(leafletMap.editTools.editLayer.getLayers().length, 0);
        done();
      });
    });
  });
});
