import Ember from 'ember';
import FlexberryMapModelApiCosmosMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-cosmos';
import { createLayerFromMetadata } from 'ember-flexberry-gis/utils/create-layer-from-metadata';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import startApp from 'dummy/tests/helpers/start-app';
import { Query } from 'ember-flexberry-data';
import { module, test } from 'qunit';
import sinon from 'sinon';

let app;
let store;

module('Unit | Mixin | flexberry map model api cosmos', {
  unit: true,
  needs: [
    'config:environment',
    'model:new-platform-flexberry-g-i-s-layer-metadata'
  ],
  beforeEach: function () {
    Ember.run(function() {
      app = startApp();
      app.deferReadiness();
      store = app.__container__.lookup('service:store');
    });
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
  }
});

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiCosmosMixin);
let metadataProjection = 'LayerMetadataE';
let metadataModelName = 'new-platform-flexberry-g-i-s-layer-metadata';
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
let bbox = {
  type: 'Polygon',
  coordinates: [
    [[30, 20], [30, 30], [20, 30], [20, 20], [30, 20]]
  ],
  crs: {
    type: 'name',
    properties: {
      name: 'EPSG:4326'
    }
  }
};
let testModel = Ember.Object.create({
  anyText: 'test',
  boundingBox: bbox,
  id: '123',
  type: 'wms',
  settings: '{}',
  linkMetadata: [
    Ember.A({
      allowShow: true,
      mapObjectSetting: null,
      parameters: [
        Ember.A({
          objectField: 'testObjectField'
        })
      ]
    })
  ]
});

test('test method findCosmos for only with parameter feature', function(assert) {
  //Arrange
  assert.expect(7);
  var done = assert.async(1);
  let feature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates:[
        [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326
      };
    },
    lookup() {
      return null;
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);
    },
    _getMetadataModels() {
      return Ember.RSVP.resolve([testModel]);
    }
  });
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findLayerMetadata(feature, null).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.GeographyPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._attributePath, 'boundingBox');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._intersectsValue,
      'SRID=4326;POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))');
    assert.equal(layers.length, 1);
    assert.equal(layers[0].areaIntersections, 100);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore();
  });
});

test('test method findCosmos for only with parameter attributes one', function(assert) {
  //Arrange
  assert.expect(7);
  var done = assert.async(1);
  let attributes = ['test'];

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326
      };
    },
    lookup() {
      return null;
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);
    },
    _getMetadataModels() {
      return Ember.RSVP.resolve([testModel]);
    }
  });
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findLayerMetadata(null, attributes).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._containsValue, 'test');
    assert.equal(layers.length, 1);
    assert.ok(!layers[0].hasOwnProperty('areaIntersections'));
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore();
  });
});

test('test method findCosmos for only with parameter attributes two', function(assert) {
  //Arrange
  assert.expect(12);
  var done = assert.async(1);
  let attributes = ['test1', 'test2'];

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326
      };
    },
    lookup() {
      return null;
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);
    },
    _getMetadataModels() {
      return Ember.RSVP.resolve([testModel]);
    }
  });
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findLayerMetadata(null, attributes).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._condition, 'or');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates.length, 2);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._containsValue, 'test1');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._containsValue, 'test2');
    assert.equal(layers.length, 1);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore();
  });
});

test('test method findCosmos for with feature and attributes', function(assert) {
  //Arrange
  assert.expect(13);
  var done = assert.async(1);
  let feature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[-2568154.38200208, 1238447.0003685], [-954618.679368619, 4568735.95227168], [-2683586.25264709, 5143088.31265003],
        [-4878104.10393015, 3114937.3173714], [-2568154.38200208, 1238447.0003685]]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:32640'
      }
    }
  };
  let attributes = ['test'];

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg32640': crsFactory32640
      };
    },
    lookup() {
      return null;
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);
    },
    _getMetadataModels() {
      return Ember.RSVP.resolve([testModel]);
    }
  });
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findLayerMetadata(feature, attributes).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._condition, 'and');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates.length, 2);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0] instanceof Query.GeographyPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._attributePath, 'boundingBox');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._intersectsValue,
      'SRID=4326;POLYGON((29.999999999999964 9.999999999999961, 40 39.999999999999964, 19.999999999999964 39.99999999999997, ' +
      '10.000000000000059 19.999999999999943, 29.999999999999964 9.999999999999961))');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._containsValue, 'test');
    assert.equal(layers.length, 1);
    assert.equal(layers[0].areaIntersections, 1452646131646.9414);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore();
  });
});

test('test method addLayerFromLayerMetadata', function(assert) {
  //Arrange
  assert.expect(9);
  let done = assert.async(1);
  let hierarchy = Ember.A();
  let mapLayer = Ember.A();
  let subject = mapApiMixinObject.create({
    mapLayer: mapLayer,
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);
    },
    _getMetadataModels() {
      return Ember.RSVP.resolve({ content: [testModel] });
    },
    store: store,
    hierarchy: hierarchy
  });
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.addLayerFromLayerMetadata('123', 10).then((layer) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._id, '123');
    assert.ok(layer);
    assert.equal(layer.get('index'), '10');
    assert.ok(!Ember.isNone(layer.get('id')));
    assert.equal(hierarchy.length, 1);
    assert.equal(mapLayer.length, 1);
    assert.equal(layer.get('type'), 'wms');
    done();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore();
  });
});

test('test method addLayerFromLayerMetadata not found layer', function(assert) {
  //Arrange
  assert.expect(4);
  let done = assert.async(1);
  let hierarchy = Ember.A();
  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);
    },
    _getMetadataModels() {
      return Ember.RSVP.resolve({ content: [] });
    },
    store: store,
    hierarchy: hierarchy
  });
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.addLayerFromLayerMetadata('123', 10).catch((error) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._id, '123');
    assert.equal(error, 'LayerMetadata 123 not found.');
    done();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore();
  });
});

test('test method createLayerFromMetadata', function(assert) {
  //Arrange
  assert.expect(5);
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    store: store
  });

  //Act
  Ember.run(() => {
    let layerModel = createLayerFromMetadata(testModel, subject.get('store'));

    //Assert
    assert.ok(layerModel);
    assert.ok(!Ember.isNone(layerModel.get('id')));
    assert.equal(layerModel.get('type'), 'wms');
    assert.equal(layerModel.get('layerLink').length, 1);
    assert.equal(layerModel.get('layerLink.firstObject.parameters.firstObject.objectField'), 'testObjectField');
    done();
  });
});
