import Ember from 'ember';
import LayerLabelMixin from 'ember-flexberry-gis/mixins/layer-label';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Mixin | layer label');
let LayerLabelObject = Ember.Object.extend(LayerLabelMixin);
test('it works', function(assert) {
  let subject = LayerLabelObject.create();
  assert.ok(subject);
});

test('test method _createStringLabel', function(assert) {
  assert.expect(7);
  let leafletMap = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let subject = LayerLabelObject.create({
    leafletMap: leafletMap,
    showExisting: false
  });
  let settings = {
    'options': {
      'captionFontColor': '#000000FF',
      'captionFontFamily': 'Times New Roman',
      'captionFontSize': '12',
      'captionFontStyle': 'normal',
      'captionFontWeight': 'normal',
      'captionFontDecoration': 'none'
    },
    'location': {
      'locationPoint': 'overRight',
      'lineLocationSelect': 'Over the line'
    },
    'scaleRange': {
      'minScaleRange': 1,
      'maxScaleRange': 19
    },
    'signMapObjects': true,
    'labelSettingsString': '<propertyname>atr1</propertyname>'
  };
  let labelsLayer = L.featureGroup();
  labelsLayer.minZoom = settings.scaleRange.minScaleRange;
  labelsLayer.maxZoom = settings.scaleRange.maxScaleRange;
  labelsLayer.settings = settings;
  labelsLayer.leafletMap = leafletMap;
  let labelsLayers = Ember.A();
  labelsLayers.addObject(labelsLayer);
  let layers = [L.marker([59.23, 56.27])];

  let _applyFunctionStub = sinon.stub(subject, '_applyFunction');
  _applyFunctionStub.returns('test');
  let _applyPropertyStub = sinon.stub(subject, '_applyProperty');
  _applyPropertyStub.returns('test');
  let _createLabelSpy = sinon.spy(subject, '_createLabel');

  subject._createStringLabel(layers, labelsLayers);
  assert.equal(_applyFunctionStub.callCount, 1);
  assert.equal(_applyPropertyStub.callCount, 1);
  assert.equal(_createLabelSpy.callCount, 1);
  assert.equal(_createLabelSpy.getCalls()[0].args[0], 'test');
  assert.deepEqual(_createLabelSpy.getCalls()[0].args[1], layers[0]);
  assert.deepEqual(_createLabelSpy.getCalls()[0].args[2].string,
  'font-family: Times New Roman; font-size: 12px; font-weight: normal; font-style: normal; text-decoration: none; color: #000000FF; text-align: undefined; ');
  assert.deepEqual(_createLabelSpy.getCalls()[0].args[3], labelsLayer);

  _applyFunctionStub.restore();
  _applyPropertyStub.restore();
  _createLabelSpy.restore();
});

