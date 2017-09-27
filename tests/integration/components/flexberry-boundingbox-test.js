import Ember from 'ember';

import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { initialize } from 'ember-flexberry-gis/instance-initializers/owner';
import startApp from '../../helpers/start-app';
import destroyApp from '../../helpers/destroy-app';

let App;

moduleForComponent('flexberry-boundingbox', 'Integration | Component | flexberry boundingbox', {
  integration: true,

  beforeEach: function () {
    App = startApp();
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
    });
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    // Set 'ru' as initial locale.
    this.set('i18n.locale', 'ru');
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

test('it renders', function(assert) {
  let store = App.__container__.lookup('service:store');
  initialize(this.appInstance);
  Ember.run(() => {

    // Create map model.
    let model = store.createRecord('new-platform-flexberry-g-i-s-map', {
      name: 'testmap',
      lat: 43.4012499836,
      lng: 39.8487556040693,
      zoom: 9.39874552061525,
      public: true,
      coordinateReferenceSystem: '{"code":"EPSG:4326"}'
    });

    // Create layer model & add to map model.
    let openStreetMapLayer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', {
      name: 'OSM',
      type: 'tile',
      visibility: true,
      index: 0,
      coordinateReferenceSystem: '{"code":"EPSG:3857","definition":null}',
      settings: '{"opacity": 1, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}'
    });
    model.get('mapLayer').pushObject(openStreetMapLayer);
    this.set('model', model);

    this.render(hbs`{{flexberry-boundingbox mapModel=model}}`);

    assert.equal(' ', ' ');
  });
});
