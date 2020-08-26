import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-visualedit';

module('Unit | Mixin | test method cancelLayerEdit');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('return current center of point', function(assert) {
  //Arrange
  let done = assert.async();
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() {
        return L.map(document.createElement('div'), {
          center: [51.505, -0.09],
          zoom: 13
        });
      }
    }
  });

  //Act
  let result = subject.cancelLayerEdit(['1','2','3']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then(()=> {
    assert.ok(true);
    done();
  });
});