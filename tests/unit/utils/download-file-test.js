import Ember from 'ember';
import { module, test } from 'qunit';
import sinon from 'sinon';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { downloadFile } from 'ember-flexberry-gis/utils/download-file';

module('Unit | Utility | download file');

let crsFactory32640 = {
  code: 'EPSG:32640',
  definition: '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs',
  create() {
    let crs = L.extend({}, new L.Proj.CRS(this.code, this.definition), {
      scale: function (zoom) {
        return 256 * Math.pow(2, zoom);
      },
      zoom: function (scale) {
        return Math.log(scale / 256) / Math.LN2;
      }
    });
    return crs;
  }
};

test('test method downloadFile for wfs', function(assert) {
  assert.expect(6);
  let done = assert.async(1);

  let layerModelWfs = Ember.Object.create({
    type: 'wfs',
    settingsAsObject: {
      url: 'geoserverUrl',
      typeNS: 'testTypeNS',
      typeName: 'layerWfs',
      geometryField: 'geometryField'
    },
    name: 'layerWfsName',
    headers: {}
  });

  let stubAjax = sinon.stub(Ember.$, 'ajax');
  stubAjax.yieldsTo('success', 'blob');

  let result = downloadFile(layerModelWfs, ['1'], 'JSON', { crs: crsFactory32640.create() }, { crs: crsFactory4326.create() }, '/api/featureexport');

  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res) => {
    assert.equal(res.fileName, 'layerWfsName.json');
    assert.equal(res.blob, 'blob');
    assert.equal(stubAjax.callCount, 1);
    assert.equal(stubAjax.getCall(0).args[0].url, '/api/featureexport');
    let data = '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="application/json">' +
      '<wfs:Query typeName="testTypeNS:layerWfs" srsName="EPSG:32640"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><Or>' +
      '<ogc:GmlObjectId xmlns:gml="http://www.opengis.net/gml" gml:id="1"/>' +
      '</Or></ogc:Filter></wfs:Query><geoserver url="geoserverUrl"/></wfs:GetFeature>';
    assert.equal(stubAjax.getCall(0).args[0].data, data);
    done();
    stubAjax.restore();
  });
});

test('test method downloadFile for odata', function(assert) {
  assert.expect(6);
  let done = assert.async(1);

  let layerModelOdata = Ember.Object.create({
    type: 'odata-vector',
    settingsAsObject: {
      odataClass: 'modelClassName',
      odataUrl: 'odataUrl'
    },
    name: 'layerOdataName',
    headers: {}
  });

  let stubAjax = sinon.stub(Ember.$, 'ajax');
  stubAjax.yieldsTo('success', 'blob');

  let result = downloadFile(layerModelOdata, ['1', '2'], 'CSV', { crs: crsFactory4326.create() }, { crs: crsFactory32640.create() }, '/api/featureexport');

  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res) => {
    assert.equal(res.fileName, 'layerOdataName.csv');
    assert.equal(res.blob, 'blob');
    assert.equal(stubAjax.callCount, 1);
    assert.equal(stubAjax.getCall(0).args[0].url, '/api/featureexport');
    let data = '<odata outputFormat="CSV"><layer odataClass="modelClassName" odataUrl="odataUrl" srsName="EPSG:4326" ' +
      'layerName="layerOdataName" srslayer="EPSG:32640"><pkList><pk primarykey="1"/><pk primarykey="2"/></pkList></layer></odata>';
    assert.equal(stubAjax.getCall(0).args[0].data, data);
    done();
    stubAjax.restore();
  });
});
