import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';
import Ember from 'ember';
import sinon from 'sinon';

moduleForComponent('flexberry-maplayers', 'Integration | Component | flexberry maplayers', {
  integration: true,
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    this.inject.service('compare', { as: 'compare' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n'),
    });

    this.set('i18n.locale', 'en');
  }
});

test('rights', function (assert) {
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    isKnownNameForType() {
      return false;
    },
    knownForType(type, val) {
      switch (val) {
        case 'type1':
          return { 'operations': ['editFeatures', 'attributes'] };
        case 'type2':
          return { 'operations': ['attributes'] };
        case 'type3':
          return { 'operations': ['editFeatures'] };
        case 'type4':
          return { 'operations': ['add', 'editFeatures', 'attributes'] };
        case 'group':
          return { 'operations': ['add', 'edit', 'remove', 'editFeatures'] };
      }
    },
    lookup(val) {
      return null;
    },
    _lookupFactory() {
      return null;
    }
  });

  this.set('layers', Ember.A([
    Ember.Object.create({
      name: 'test layer1',
      type: 'type1',
      id: 'testId1',
      layerInitialized: true
    }),
    Ember.Object.create({
      name: 'test layer2',
      type: 'type2',
      id: 'testId2',
      layerInitialized: true
    }),
    Ember.Object.create({
      name: 'test layer3',
      type: 'type3',
      id: 'testId3',
      layerInitialized: true
    }),
    Ember.Object.create({
      name: 'test layer4',
      type: 'type4',
      id: 'testId4',
      layerInitialized: true
    }),
    Ember.Object.create({
      name: 'group',
      type: 'group',
      id: 'testId5',
      layerInitialized: true
    })
  ]));

  this.set('sideBySide', { addTo: () => true });

  let access = {
    accessibleModel: ['testId2', 'testId4', 'testId5'],
    accessibleData: ['testId1', 'testId2', 'testId4', 'testId5'],
    createAccess: true
  };

  this.set('access', access);
  this.set('mapLayerExtraButtons', [{
    class: 'extra-button',
    action: 'extraAction'
  }]);

  this.render(hbs`
  {{#flexberry-maplayers
    class="styled"
    readonly=false
    access=access
    showHeader=false
    sideBySide=sideBySide
    dynamicButtons=mapLayerExtraButtons
    layers=layers
  }}
  {{/flexberry-maplayers}}
  `);

  assert.equal(this.$('i.icon-guideline-resize-plus').length, 4, 'Fit layer bounds buttons for all layer, except groups');
  assert.equal(this.$('i.icon-guideline-plus-r').length, 4, 'Plus button for allowed layers, layer types and groups');
  assert.equal(this.$('i.icon-guideline-table').length, 3, 'Attributes buttons for allowed layer types');
  assert.equal(this.$('label.flexberry-maplayer-add-button').length, 2, 'Add layer button for allowed layer types and layers');
  assert.equal(this.$('label.flexberry-maplayer-edit-button').length, 3, 'Edit layer button for allowed layer types and layers');
  assert.equal(this.$('label.flexberry-maplayer-copy-button').length, 5, 'Copy layer button for allowed layer types and layers');
  assert.equal(this.$('label.flexberry-maplayer-remove-button').length, 3, 'Remove layer button for allowed layer types and layers');
  assert.equal(this.$('label.extra-button').length, 3, 'Extra buttons for allowed layers');

  this.set('compare.compareLayersEnabled', true);

  assert.equal(this.$('.group.secondary.menu').length, 1, 'Tabs in compare mode are active');
  assert.equal(this.$('.group.secondary.menu a:first-child').hasClass('active'), true, 'Left tab is active');
  assert.equal(this.$('.group.secondary.menu a:last-child').hasClass('active'), false, 'Right tab is inactive');

  this.$('.group.secondary.menu a:last-child').click();
  assert.equal(this.$('.group.secondary.menu a:first-child').hasClass('active'), false, 'Left tab is inactive');
  assert.equal(this.$('.group.secondary.menu a:last-child').hasClass('active'), true, 'Right tab is active');
  ownerStub.restore();
});
