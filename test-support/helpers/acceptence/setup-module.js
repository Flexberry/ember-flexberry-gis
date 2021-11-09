/* eslint-disable prefer-destructuring */
import { all } from 'rsvp';
import { typeOf } from '@ember/utils';
import { run } from '@ember/runloop';
import Ember from 'ember';
import ModalDialog from 'eais-common/services/modal-dialog-caller';
import ModalComponent from 'eais-common/components/eais-modal-dialog';
import Dexie from 'npm:dexie';
import modelAbilities from 'eais-common/abilities/model';
import security from 'eais-common/services/security';
import startApp from '../../helpers/start-app';
import {
  dexieDB
} from '../common-helpers';

const {
  Test: { QUnitAdapter, },
} = Ember;

QUnitAdapter.reopen({
  exception(error) {
    if (typeOf(error) === 'instance') return;

    this._super(...arguments);
  },
});

ModalDialog.proto().duration = 50;
ModalComponent.proto().duration = 50;

let application;
let dbName;

/**
 * Конфигурирование приложения.
 *
 * @param {Ember.App} app
 */
const configurateApp = (app) => {
  const applicationController = app.__container__.lookup('controller:application');

  applicationController.set('isInAcceptanceTestMode', true);
};


/**
 * Добавление хуков.
 *
 * @param {Ember.App} app
 * @param {QUnit.Assert} assert
 */
const addHooks = (app, assert) => {
  const applicationController = app.__container__.lookup('controller:application');

  // Вызов ошибки теста при отсутствии локали.
  applicationController.get('i18n').on('missing', function (locale, key/* , context */) {
    assert.notOk(`Потерялась локаль: ${key}`);
  });

  const errorRoute = app.__container__.lookup('route:error');

  // Вызов ошибки теста при ошибке приложения.
  errorRoute.reopen({
    setupController(controller, error) {
      assert.notOk(`Произошла ошибка: ${error.message}`);
      this._super(...arguments);
    },
  });
};

/**
 * Регистрация доп. классов.
 *
 * @param {Ember.App} app
 */
const registerClasses = (app) => {
  app.register('ability:model', modelAbilities);
  app.register('abilities:model', modelAbilities);
  app.register('service:security', security);
};
/**
 * Базовая настройка приложения перед тестом.
 *
 * @example
 * ```
  import {
  beforeEach as commonBeforeEach,
  afterEach as commonAfterEach
} from '../helpers/acceptence/setup-module';

  ...

  beforeEach(assert) {
    return commonBeforeEach(assert, config, options)
      .then(application => {
        this.application = application;
        app = application;
      });
 * ```
 * @param {*} assert
 * @param {*} config
 * @param {*} options
 */
export const beforeEach = (assert, config, options) => {
  dbName = config.APP.offline.dbName;
  return Dexie.delete(dbName).then(() => {
    application = startApp();

    configurateApp(application);
    addHooks(application, assert);
    registerClasses(application);

    application.__container__.lookup('service:notifications').set('defaultDuration', 10);
    const dexiePromise = dexieDB(application).open();

    if (options.beforeEach) {
      options.beforeEach.apply(this, assert, config, options);
    }

    return all([dexiePromise]).then(() => application);
  });
};

export const afterEach = (config, options) => {
  run(function () {
    const dexieService = application.__container__.lookup('service:dexie');
    dexieService.close(dbName);
  });

  if (options.afterEach) {
    options.afterEach.apply(this, config, options);
  }
};
