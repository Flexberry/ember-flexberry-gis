import { get } from '@ember/object';
import LeafletEditableMeasuresInitializer from 'ember-flexberry-gis/initializers/leaflet-editable-measures';
import config from '../config/environment';

// Override initializer to pass into it baseUrl from config/environment.js.
const originalInitialize = LeafletEditableMeasuresInitializer.initialize;
LeafletEditableMeasuresInitializer.initialize = function (application) {
  originalInitialize.call(this, application, get(config, 'baseURL'));
};

export default LeafletEditableMeasuresInitializer;
