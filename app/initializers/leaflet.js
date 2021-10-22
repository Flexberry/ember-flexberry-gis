import { get } from '@ember/object';
import config from '../config/environment';
import LeafletInitializer from 'ember-flexberry-gis/initializers/leaflet';

// Override initializer to pass into it baseUrl from config/environment.js.
let originalInitialize = LeafletInitializer.initialize;
LeafletInitializer.initialize = function(application) {
  originalInitialize.call(this, application, get(config, 'baseURL'));
};

export default LeafletInitializer;
