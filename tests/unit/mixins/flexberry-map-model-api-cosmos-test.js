import Ember from 'ember';
import FlexberryMapModelApiCosmosMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-cosmos';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import FlexberryLeafletEWKT from 'ember-flexberry-gis/initializers/leaflet-ewkt';
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
      FlexberryLeafletEWKT.initialize(app);
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

test('test method findCosmos for only with parameter feature', function(assert) {
  //Arrange
  assert.expect(12);
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
  }

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326
      };
    },
    lookup() {
      return null;
    },
    resolveRegistration() {
      return {
        APP: {
          keywordForCosmos: 'cosmos'
        }
      }
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);;
      },
      _getMetadataModels() {
        return Ember.RSVP.resolve(['1']);
      }
    }
  );
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findCosmos(feature, null).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._condition, 'and');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates.length, 2);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0] instanceof Query.GeographyPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._attributePath, 'boundingBox');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._intersectsValue,
      'SRID=4326;POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._attributePath, 'keyWords');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._containsValue, 'cosmos');
    assert.equal(layers.length, 1);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore()
  });
});

test('test method findCosmos for only with parameter atributes one', function(assert) {
  //Arrange
  assert.expect(12);
  var done = assert.async(1);
  let atributes = ['test'];

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326
      };
    },
    lookup() {
      return null;
    },
    resolveRegistration() {
      return {
        APP: {
          keywordForCosmos: 'cosmos'
        }
      }
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);;
      },
      _getMetadataModels() {
        return Ember.RSVP.resolve(['1']);
      }
    }
  );
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findCosmos(null, atributes).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._condition, 'and');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates.length, 2);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._containsValue, 'test');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._attributePath, 'keyWords');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._containsValue, 'cosmos');
    assert.equal(layers.length, 1);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore()
  });
});

test('test method findCosmos for only with parameter atributes two', function(assert) {
  //Arrange
  assert.expect(18);
  var done = assert.async(1);
  let atributes = ['test1', 'test2'];

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326
      };
    },
    lookup() {
      return null;
    },
    resolveRegistration() {
      return {
        APP: {
          keywordForCosmos: 'cosmos'
        }
      }
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);;
      },
      _getMetadataModels() {
        return Ember.RSVP.resolve(['1']);
      }
    }
  );
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findCosmos(null, atributes).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._condition, 'and');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates.length, 2);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0] instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._condition, 'or');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates.length, 2);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates[0] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates[0]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates[0]._containsValue, 'test1');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates[1]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._predicates[1]._containsValue, 'test2');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._attributePath, 'keyWords');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._containsValue, 'cosmos');
    assert.equal(layers.length, 1);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore()
  });
});

test('test method findCosmos for with feature and atributes', function(assert) {
  //Arrange
  assert.expect(15);
  var done = assert.async(1);
  let feature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[-2568154.38200208,1238447.0003685],[-954618.679368619,4568735.95227168],[-2683586.25264709,5143088.31265003],
        [-4878104.10393015,3114937.3173714],[-2568154.38200208,1238447.0003685]]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:32640'
      }
    }
  };
  let atributes = ['test'];

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg32640': crsFactory32640
      };
    },
    lookup() {
      return null;
    },
    resolveRegistration() {
      return {
        APP: {
          keywordForCosmos: 'cosmos'
        }
      }
    }
  });

  let subject = mapApiMixinObject.create({
    _getQueryBuilderLayerMetadata() {
      return new Query.Builder(store, metadataModelName)
      .from(metadataModelName)
      .selectByProjection(metadataProjection);;
      },
      _getMetadataModels() {
        return Ember.RSVP.resolve(['1']);
      }
    }
  );
  let spyGetMetadataModels = sinon.spy(subject, '_getMetadataModels');
  let spyGetQueryBuilderLayerMetadata = sinon.spy(subject, '_getQueryBuilderLayerMetadata');

  //Act
  subject.findCosmos(feature, atributes).then((layers) => {
    //Assert
    assert.ok(spyGetQueryBuilderLayerMetadata.called);
    assert.ok(spyGetMetadataModels.called);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate instanceof Query.ComplexPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._condition, 'and');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates.length, 3);
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0] instanceof Query.GeographyPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._attributePath, 'boundingBox');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[0]._intersectsValue,
      'SRID=4326;POLYGON((29.999999999999964 9.999999999999961, 40 39.999999999999964, 19.999999999999964 39.99999999999997, ' +
      '10.000000000000059 19.999999999999943, 29.999999999999964 9.999999999999961))');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._attributePath, 'anyText');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[1]._containsValue, 'test');
    assert.ok(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[2] instanceof Query.StringPredicate);
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[2]._attributePath, 'keyWords');
    assert.equal(spyGetMetadataModels.getCall(0).args[0]._predicate._predicates[2]._containsValue, 'cosmos');
    assert.equal(layers.length, 1);
    done();
    ownerStub.restore();
    spyGetMetadataModels.restore();
    spyGetQueryBuilderLayerMetadata.restore()
  });
});
