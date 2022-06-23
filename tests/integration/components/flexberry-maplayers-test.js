import Ember from 'ember';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';
import sinon from 'sinon';

module('Integration | Component | flexberry maplayers', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n'),
    });

    this.set('i18n.locale', 'en');
  });

  test('rights', async function (assert) {
    const ownerStub = sinon.stub(Ember, 'getOwner');
    ownerStub.returns({
      isKnownNameForType() {
        return false;
      },
      knownForType(type, val) {
        switch (val) {
          case 'type1':
            return { operations: ['editFeatures', 'attributes'], };
          case 'type2':
            return { operations: ['attributes'], };
          case 'type3':
            return { operations: ['editFeatures'], };
          case 'type4':
            return { operations: ['add', 'editFeatures', 'attributes'], };
          case 'group':
            return { operations: ['add', 'edit', 'remove', 'editFeatures'], };
          default:
        }
      },
      lookup() {
        return null;
      },
    });

    this.set('layers', A([
      EmberObject.create({
        name: 'test layer1',
        type: 'type1',
        id: 'testId1',
        layerInitialized: true,
      }),
      EmberObject.create({
        name: 'test layer2',
        type: 'type2',
        id: 'testId2',
        layerInitialized: true,
      }),
      EmberObject.create({
        name: 'test layer3',
        type: 'type3',
        id: 'testId3',
        layerInitialized: true,
      }),
      EmberObject.create({
        name: 'test layer4',
        type: 'type4',
        id: 'testId4',
        layerInitialized: true,
      }),
      EmberObject.create({
        name: 'group',
        type: 'group',
        id: 'testId5',
        layerInitialized: true,
      })
    ]));

    const access = {
      accessibleModel: ['testId2', 'testId4', 'testId5'],
      accessibleData: ['testId1', 'testId2', 'testId4', 'testId5'],
      createAccess: true,
    };

    this.set('access', access);
    this.set('mapLayerExtraButtons', [{
      class: 'extra-button',
      action: 'extraAction',
    }]);

    await render(hbs`
    {{#flexberry-maplayers
      class="styled"
      readonly=false
      access=access
      showHeader=false
      compareLayersEnabled=false
      sideBySide=false
      dynamicButtons=mapLayerExtraButtons
      layers=layers
    }}
    {{/flexberry-maplayers}}
    `);

    assert.equal(findAll('i.icon-guideline-resize-plus').length, 4, 'Fit layer bounds buttons for all layer, except groups');
    assert.equal(findAll('i.icon-guideline-plus-r').length, 4, 'Plus button for allowed layers, layer types and groups');
    assert.equal(findAll('i.icon-guideline-table').length, 3, 'Attributes buttons for allowed layer types');
    assert.equal(findAll('label.flexberry-maplayer-add-button').length, 2, 'Add layer button for allowed layer types and layers');
    assert.equal(findAll('label.flexberry-maplayer-edit-button').length, 3, 'Edit layer button for allowed layer types and layers');
    assert.equal(findAll('label.flexberry-maplayer-copy-button').length, 5, 'Copy layer button for allowed layer types and layers');
    assert.equal(findAll('label.flexberry-maplayer-remove-button').length, 3, 'Remove layer button for allowed layer types and layers');
    assert.equal(findAll('label.extra-button').length, 3, 'Extra buttons for allowed layers');

    ownerStub.restore();
  });
});
