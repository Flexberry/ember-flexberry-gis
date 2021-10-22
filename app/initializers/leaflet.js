import { get } from '@ember/object';
import LeafletInitializer from 'ember-flexberry-gis/initializers/leaflet';
import config from '../config/environment';

// Override initializer to pass into it baseUrl from config/environment.js.
const originalInitialize = LeafletInitializer.initialize;
LeafletInitializer.initialize = function (application) {
  originalInitialize.call(this, application, get(config, 'baseURL'));
};

export default LeafletInitializer;
