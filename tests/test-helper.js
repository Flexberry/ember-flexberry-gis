import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import Application from '../app';
import config from '../config/environment';

QUnit.config.maxDepth = 7;

setApplication(Application.create(config.APP));

start();
