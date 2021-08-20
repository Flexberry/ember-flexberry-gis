import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import startApp from 'dummy/tests/helpers/start-app';
import wfsComponentLayer from 'ember-flexberry-gis/components/layers/wfs-layer';
import wmsComponentLayer from 'ember-flexberry-gis/components/layers/wms-layer';
import wfsLayer from 'ember-flexberry-gis/components/layers/wms-layer';
import sinon from 'sinon';

let options;
let leafletMap;
let app;
let geoserverFake;
moduleForComponent('layers/combine-layer', 'Unit | Component | layers/combine layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'component:base-vector-layer',
    'model:new-platform-flexberry-g-i-s-map'
  ],
  beforeEach: function () {
    app = startApp();

    this.register('component:layers/wfs-layer', wfsComponentLayer);
    this.register('component:layers/wms-layer', wmsComponentLayer);
    this.register('layer:wfs', wfsLayer);
    app.register('component:layers/wfs-layer', wfsComponentLayer);
    app.register('component:layers/wms-layer', wmsComponentLayer);
    app.register('layer:wfs', wfsLayer);

    let settingsAsObject = {
      'type': 'wfs',
      'url': 'http://geoserverFake/geoserver/ows',
      'style': { 'color': 'red', 'weight': '4' },
      'filter': null,
      'format': 'GeoJSON',
      'typeNS': 'les',
      'maxZoom': '13',
      'minZoom': '11',
      'opacity': null,
      'pkField': 'primarykey',
      'version': '1.1.0',
      'typeName': 'test',
      'clusterize': false,
      'forceMulti': true,
      'typeNSName': '',
      'showExisting': false,
      'continueLoading': false,
      'typeGeometry': 'polygon',
      'geometryField': 'shape',
      'innerLayers': [
        {
          'type': 'wms',
          'info_format': 'application/json',
          'url': 'http://geoserverFake/geoserver/ows',
          'version': '1.3.0',
          'layers': 'test:test',
          'format': 'image/png',
          'transparent': true,
          'maxZoom':12,
          'minZoom':1,
        }
      ]
    };

    leafletMap = L.map(document.createElement('div'), { center: [51.505, -0.09], zoom: 13 });
    let layerModel = Ember.Object.create({
      type: 'combine',
      visibility: false,
      settingsAsObject:settingsAsObject
    });

    options = {
      'layerModel': layerModel,
      'leafletMap': leafletMap,
      'visibility': false
    };

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
  afterEach: function () {
    Ember.run(app, 'destroy');
    geoserverFake.restore();
  }
});
test('Create combine component and check visibility', function(assert) {
  assert.expect(15);
  var done = assert.async(4);
  let component = this.subject(options);
  let getmapApiStub;
  Ember.run(() => {
    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);
  });

  let _checkAndSetVisibilitySpy = sinon.spy(component, '_checkAndSetVisibility');
  let _visibilityOfLayerByZoomSpy = sinon.spy(component, '_visibilityOfLayerByZoom');
  let _setLayerVisibilitySpy = sinon.spy(component, '_setLayerVisibility');

  component.get('_leafletLayerPromise').then((leafletObject) => {
    assert.ok(leafletObject instanceof L.FeatureGroup);
    assert.ok(leafletObject.mainLayer.innerLayers[0]._leafletObject instanceof L.TileLayer.WMS);
    assert.ok(component);
    done(1);

    Ember.set(leafletMap, '_zoom', 10);
    component.set('visibility', true);
    assert.equal(_checkAndSetVisibilitySpy.callCount, 2);
    assert.equal(_visibilityOfLayerByZoomSpy.callCount, 1);
    assert.equal(_setLayerVisibilitySpy.callCount, 1);
    assert.equal(component.get('layerVisibility.layerId'), component.get('mainLayer.innerLayers')[0].layerId);
    done(1);

    Ember.set(leafletMap, '_zoom', 11);
    component._setLayerVisibility();
    assert.equal(_checkAndSetVisibilitySpy.callCount, 3);
    assert.equal(_visibilityOfLayerByZoomSpy.callCount, 2);
    assert.equal(_setLayerVisibilitySpy.callCount, 2);
    assert.equal(component.get('layerVisibility.layerId'), component.get('mainLayer.layerId'));
    done(1);

    component.set('visibility', false);
    assert.equal(_checkAndSetVisibilitySpy.callCount, 3);
    assert.equal(_visibilityOfLayerByZoomSpy.callCount, 2);
    assert.equal(_setLayerVisibilitySpy.callCount, 3);
    assert.notOk(component.get('layerVisibility'));

    getmapApiStub.restore();
    _checkAndSetVisibilitySpy.restore();
    _visibilityOfLayerByZoomSpy.restore();
    _setLayerVisibilitySpy.restore();
    done(1);
  });
});

test('test method createLayer()', function(assert) {
  assert.expect(4);
  var done = assert.async(1);
  Ember.run(() => {
    let component = this.subject(options);
    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let createAllLayerSpy = sinon.spy(component, 'createAllLayer');
    let createLayerSpy = sinon.spy(component, 'createLayer');

    component.createLayer(0).then((leafletObject) => {
      assert.ok(leafletObject instanceof L.FeatureGroup);
      assert.ok(leafletObject.mainLayer.innerLayers[0]._leafletObject instanceof L.TileLayer.WMS);
      assert.equal(createAllLayerSpy.callCount, 1);
      assert.equal(createLayerSpy.callCount, 1);
      getmapApiStub.restore();
      createAllLayerSpy.restore();
      createLayerSpy.restore();
      done(1);
    });
  });
});

test('test method showAllLayerObjects() and hideAllLayerObjects()', function(assert) {
  assert.expect(16);
  var done = assert.async(2);
  Ember.run(() => {
    let settingsAsObject = {
      'type': 'wfs',
      'url': 'http://geoserverFake/geoserver/ows',
      'style': { 'color': 'red', 'weight': '4' },
      'filter': null,
      'format': 'GeoJSON',
      'typeNS': 'les',
      'maxZoom': '13',
      'minZoom': '11',
      'opacity': null,
      'pkField': 'primarykey',
      'version': '1.1.0',
      'typeName': 'test',
      'clusterize': false,
      'forceMulti': true,
      'typeNSName': '',
      'showExisting': false,
      'continueLoading': false,
      'typeGeometry': 'polygon',
      'geometryField': 'shape',
      'innerLayers': [
        {
          'type': 'wfs',
          'url': 'http://geoserverFake/geoserver/ows',
          'style': { 'color': 'red', 'weight': '4' },
          'filter': null,
          'format': 'GeoJSON',
          'typeNS': 'les',
          'maxZoom': '10',
          'minZoom': '7',
          'opacity': null,
          'pkField': 'primarykey',
          'version': '1.1.0',
          'typeName': 'test',
          'clusterize': false,
          'forceMulti': true,
          'typeNSName': '',
          'showExisting': false,
          'continueLoading': false,
          'typeGeometry': 'polygon',
          'geometryField': 'shape',
        }
      ]
    };

    let layerModel = Ember.Object.create({
      type: 'combine',
      visibility: false,
      settingsAsObject:settingsAsObject
    });

    let options = {
      'layerModel': layerModel,
      'leafletMap': leafletMap,
      'visibility': false
    };

    let component = this.subject(options);
    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    component.get('_leafletLayerPromise').then((leafletObject) => {
      assert.ok(leafletObject instanceof L.FeatureGroup);
      let innerLeafletObject = leafletObject.mainLayer.innerLayers[0]._leafletObject;
      assert.ok(innerLeafletObject instanceof L.FeatureGroup);

      // spy for mainLeafletObject
      let baseShowAllLayerObjectsSpy = sinon.spy(leafletObject, 'baseShowAllLayerObjects');
      let showAllLayerObjectsSpy = sinon.spy(leafletObject, 'showAllLayerObjects');
      let clearLayersSpy = sinon.spy(leafletObject, 'clearLayers');
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let baseHideAllLayerObjectsSpy = sinon.spy(leafletObject, 'baseHideAllLayerObjects');
      let hideAllLayerObjectsSpy = sinon.spy(leafletObject, 'hideAllLayerObjects');

      // spy for innerLeafletObject
      let showAllLayerObjectsInnerSpy = sinon.spy(innerLeafletObject, 'showAllLayerObjects');
      let clearLayersInnerSpy = sinon.spy(innerLeafletObject, 'clearLayers');
      let loadLayerFeaturesInnerSpy = sinon.spy(innerLeafletObject, 'loadLayerFeatures');
      let hideAllLayerObjectsInnerSpy = sinon.spy(innerLeafletObject, 'hideAllLayerObjects');

      // spy for map
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');

      component.showAllLayerObjects().then(result => {
        assert.equal(result, 'success');

        assert.equal(baseShowAllLayerObjectsSpy.callCount, 1);
        assert.equal(showAllLayerObjectsSpy.callCount, 0);
        assert.equal(clearLayersSpy.callCount, 1);
        assert.equal(loadLayerFeaturesSpy.callCount, 1);

        assert.equal(showAllLayerObjectsInnerSpy.callCount, 1);
        assert.equal(clearLayersInnerSpy.callCount, 1);
        assert.equal(loadLayerFeaturesInnerSpy.callCount, 1);

        assert.equal(removeLayerSpy.callCount, 0);
        assert.equal(addLayerSpy.callCount, 4);

        component.hideAllLayerObjects();

        assert.equal(baseHideAllLayerObjectsSpy.callCount, 1);
        assert.equal(hideAllLayerObjectsSpy.callCount, 0);

        assert.equal(hideAllLayerObjectsInnerSpy.callCount, 1);
        assert.equal(removeLayerSpy.callCount, 2);

        baseShowAllLayerObjectsSpy.restore();
        showAllLayerObjectsSpy.restore();
        clearLayersSpy.restore();
        loadLayerFeaturesSpy.restore();
        baseHideAllLayerObjectsSpy.restore();
        hideAllLayerObjectsSpy.restore();

        showAllLayerObjectsInnerSpy.restore();
        clearLayersInnerSpy.restore();
        loadLayerFeaturesInnerSpy.restore();
        hideAllLayerObjectsInnerSpy.restore();

        removeLayerSpy.restore();
        addLayerSpy.restore();
        done(1);
      });

      getmapApiStub.restore();
      done(1);
    });
  });
});
