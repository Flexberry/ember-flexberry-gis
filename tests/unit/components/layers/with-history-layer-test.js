import Ember from 'ember';

import DS from 'ember-data';
import { moduleForComponent, test } from 'ember-qunit';
import startApp from 'dummy/tests/helpers/start-app';
import { Query, Projection } from 'ember-flexberry-data';
import sinon from 'sinon';
import { Serializer } from 'ember-flexberry-data';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';

let app;
let geoserverFake;
let optionsWFS;
let paramWFS;
let optionsOdata;
let paramOdata;
let odataServerFake;
let bounds;
let store;
let responseBatchUpdate;
moduleForComponent('layers/with-history-layer', 'Unit | Component | layers/with history layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'component:base-vector-layer',
    'service:layers-styles-renderer',
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'adapter:application',
    'layer:odata-vector',
    'component:layers/odata-vector-layer',
    'component:layers/wfs-layer'
  ],
  beforeEach: function () {
    app = startApp();
    store = app.__container__.lookup('service:store');

    let testModelMixin = Ember.Mixin.create({
      name: DS.attr('string', { defaultValue: '' }),
      shape: DS.attr('json')
    });

    let testModel = Projection.Model.extend(testModelMixin);
    testModel.defineProjection('TestModelL', 'test-model', {
      name: Projection.attr(''),
      shape: Projection.attr('')
    });

    let timetestModel = Projection.Model.extend(testModelMixin);
    timetestModel.defineProjection('TimeTestModelL', 'time-test-model', {
      name: Projection.attr(''),
      shape: Projection.attr('')
    });

    let testSerializer = Serializer.Odata.extend({
      primaryKey: '__PrimaryKey'
    });

    this.register('model:test-model', testModel);
    this.register('model:time-test-model', timetestModel);
    this.register('mixin:test-model', testModelMixin);
    this.register('mixin:time-test-model', testModelMixin);
    this.register('serializer:test-model', testSerializer);
    this.register('serializer:time-test-model', testSerializer);

    app.register('model:test-model', testModel);
    app.register('model:time-test-model', timetestModel);
    app.register('mixin:test-model', testModelMixin);
    app.register('mixin:time-test-model', testModelMixin);
    app.register('serializer:test-model', testSerializer);
    app.register('serializer:time-test-model', testSerializer);
    let layerModelWfs = store.createRecord('test-model');
    layerModelWfs.type = 'wfs';
    optionsWFS = {
      type: 'wfs',
      format: 'GeoJSON',
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
      "historyLayer": {
        "hasTime": true,
        "url": "http://geoserverFake/geoserver/les_history/ows",
        "typeNS": "les_history",
        "typeName": "timekvartalutverzhdenopolygon32640",
        "forceMulti": true,

        "styleSettings": {
          "type": "simple",
          "style": {
            "path": {
              "fill": false,
              "color": "#FF0000",
              "stroke": true,
              "weight": 2,
              "lineCap": "round",
              "lineJoin": "round",
              "dashArray": "",
              "fillColor": "#3388ff",
              "dashOffset": 0,
              "fillGradientEnable": false,
              "strokeGradientEnable": false
            }
          }
        },
        "labelSettings": {
          "options": {
            "captionFontSize": "18",
            "captionFontAlign": "left",
            "captionFontColor": "#FF0000",
            "captionFontStyle": "normal",
            "captionFontFamily": "Liberation Sans Bold",
            "captionFontWeight": "bold",
            "captionFontDecoration": "none"
          },
          "location": {
            "locationPoint": "overRight",
            "lineLocationSelect": null
          },
          "scaleRange": {
            "maxScaleRange": 25,
            "minScaleRange": 10
          },
          "signMapObjects": true,
          "labelSettingsString": "<propertyname>nomer</propertyname>"
        }
      }
    };
    layerModelWfs.settingsAsObject = optionsWFS;
    let leafletOptions = [
      'url',
      'version',
      'namespaceUri',
      'typeNS',
      'geometryField',
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

    paramWFS = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions,
      _pane: 'pane000',
      _renderer: Ember.A()
    };

    paramWFS = Ember.$.extend(paramWFS, optionsWFS);

    let bounds = L.latLngBounds(L.latLng(58.4436454695997, 56.369991302490234), L.latLng(58.46793791815783, 56.53478622436524));

    let getBounds = function () {
      return bounds;
    };

    let getPane = function () {
      return undefined;
    };

    let createPane = function () {
      return {};
    };

    let hasLayer = function () {
      return true;
    };

    let removeLayer = function () {
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

    Ember.$.extend(paramWFS, { 'layerModel': layerModelWfs });
    Ember.$.extend(paramWFS, { 'leafletMap': leafletMap });

    geoserverFake = sinon.fakeServer.create();
    geoserverFake.autoRespond = true;

    geoserverFake.respondWith('POST', 'http://geoserverFake/geoserver/les_history/ows?',
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

    optionsOdata = {
      type: 'odata-vector',
      format: 'GeoJSON',
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      'geometryType': 'MultiPolygonPropertyType',
      'modelName': 'test-model',
      'projectionName':'TestModelL',
      'geometryField': 'shape',
      'typeName': 'test-model',
      'odataClass': 'TestModel',
      'continueLoading': true,
      "historyLayer": {
        "hasTime": true,
        "typeName": "time-test-model",
        "modelName": "time-test-model",
        "forceMulti": true,
        "odataClass": "TimeTestModel",
        "projectionName": "TimeTestModelL"
      }
    };
    paramOdata = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions
    };
    paramOdata = Ember.$.extend(paramOdata, optionsOdata);
    let layerModelOdata = store.createRecord('test-model');
    layerModelOdata.type = 'odata-vector';
    layerModelOdata.settingsAsObject = optionsOdata;
    Ember.$.extend(paramOdata, {
      'geometryType': 'MultiPolygonPropertyType',
      'modelName': 'test-model',
      'projectionName':'TestModelL',
      'geometryField': 'shape',
      'typeName': 'test-model',
      'odataClass': 'TestModel',
      'continueLoading': true,
      'store': store,
      'layerModel': layerModelOdata,
      'leafletMap': leafletMap,
      'visibility': true,

    });

    const responseText = `--batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f
    Content-Type: application/http
    Content-Transfer-Encoding: binary

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel(__PrimaryKey,ID,Name,Shape)","value":[
        {
          "__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a79b", "Name":null,"Shape":{
            "type":"MultiPolygon","coordinates":[
              [
                [
                  [468709.463318981,6478884.81118851],
            [468578.508624007,6478880.73565037],
            [468541.567377907,6478925.23599015],
            [468533.564191116,6478946.2331571],
            [468614.492922407,6478979.21144234],
            [468657.52589005,6478981.2057549],
            [468672.503518996,6478963.71619159],
            [468717.482394432,6478946.21010284],
            [468709.463318981,6478884.81118851]
                ]
              ]
            ],"crs":{
              "type":"name","properties":{
                "name":"EPSG:32640"
              }
            }
          }
      },

      {
          "__PrimaryKey":"5b969764-acc2-4b48-8d6a-33b395c811ce", "Name":null,"Shape":{
            "type":"MultiPolygon","coordinates":[
              [
                [
                  [468709.463318981,6478884.81118851],
            [468578.508624007,6478880.73565037],
            [468541.567377907,6478925.23599015],
            [468533.564191116,6478946.2331571],
            [468614.492922407,6478979.21144234],
            [468657.52589005,6478981.2057549],
            [468672.503518996,6478963.71619159],
            [468717.482394432,6478946.21010284],
            [468709.463318981,6478884.81118851]
                ]
              ]
            ],"crs":{
              "type":"name","properties":{
                "name":"EPSG:32640"
              }
            }
          }
      }
      ]
    }
    --batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f--`;

    responseBatchUpdate = `--batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197
    Content-Type: multipart/mixed; boundary=changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0

    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    Content-ID: 1

    HTTP/1.1 204 No Content


    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    Content-ID: 2

    HTTP/1.1 200 OK
    Preference-Applied: return=representation
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                436033.67676677159,6495840.3180785989
              ],[
                436363.34399267368,6496168.5915842094
              ],[
                436698.1414727,6495894.2219982184
              ],[
                436423.43417282181,6495569.9820099371
              ],[
                436033.67676677159,6495840.3180785989
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":"test","__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a79b"
    }
    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    Content-ID: 3

    HTTP/1.1 201 Created
    Preference-Applied: return=representation
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                437417.96742371243,6495668.4535367191
              ],[
                437838.01481024339,6495726.4829143463
              ],[
                437685.16544237174,6495215.9105252894
              ],[
                437417.96742371243,6495668.4535367191
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":null,"__PrimaryKey":"a5532858-dbdc-4d3c-9eaf-3d71d097ceb0"
    }
    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0--
    --batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197
    Content-Type: application/http
    Content-Transfer-Encoding: binary

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                436033.676766772,6495840.3180786
              ],[
                436363.343992674,6496168.59158421
              ],[
                436698.1414727,6495894.22199822
              ],[
                436423.434172822,6495569.98200994
              ],[
                436033.676766772,6495840.3180786
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":"test","__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a79b"
    }
    --batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197
    Content-Type: application/http
    Content-Transfer-Encoding: binary

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                437417.967423712,6495668.45353672
              ],[
                437838.014810243,6495726.48291435
              ],[
                437685.165442372,6495215.91052529
              ],[
                437417.967423712,6495668.45353672
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":null,"__PrimaryKey":"a5532858-dbdc-4d3c-9eaf-3d71d097ceb0"
    }
    --batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197--`;

    geoserverFake.respondWith('POST', 'http://134.209.30.115:1818/odata/$batch',
      function (request) {
        if (request.requestBody.indexOf('POST') !== -1) {
          request.respond(200, { 'content-type': 'multipart/mixed; boundary=batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197' },
          responseBatchUpdate);
        } else {
          request.respond(200, { 'content-type': 'multipart/mixed; boundary=batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f' },
          responseText);
        }
      }
    );
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
    geoserverFake.restore();
  }
});

test('it return L.WFS on createLayer', function(assert) {
  let component = this.subject(paramWFS);
  var done = assert.async(1);

  component.get('_leafletLayerPromise').then(()=> {
    assert.ok(component.get('mainLayer._leafletObject') instanceof L.WFS, 'Expected L.WFS instance in mainLayer');
    assert.ok(component.get('historyLayer._leafletObject') instanceof L.WFS, 'Expected L.WFS instance in historyLayer');
    done();
  });
});

test('it return Odata on createLayer', function(assert) {
  let component = this.subject(paramOdata);
  var done = assert.async(1);

  component.get('_leafletLayerPromise').then(()=> {
    assert.ok(component.get('mainLayer._leafletObject') instanceof L.FeatureGroup, 'Expected L.FeatureGroup instance in mainLayer');
    assert.ok(component.get('historyLayer._leafletObject') instanceof L.FeatureGroup, 'Expected L.FeatureGroup instance in historyLayer');
    done();
  });
});
