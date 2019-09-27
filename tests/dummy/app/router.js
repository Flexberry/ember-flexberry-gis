import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  // Maps routes (list, edit, create).
  this.route('maps');
  this.route('map', { path: 'maps/:id' });
  this.route('map.new', { path: 'maps/new' });

  // Map test routes.
  this.route('api-test-map', { path: 'api-test-map/:id' });

  // Layer metadata routes (list, edit, create).
  this.route('new-platform-flexberry-g-i-s-layer-metadata-l', { path: 'layer-metadata' });
  this.route('new-platform-flexberry-g-i-s-layer-metadata-e', { path: 'layer-metadata/:id' });
  this.route('new-platform-flexberry-g-i-s-layer-metadata-e.new', { path: 'layer-metadata/new' });

  //Map object settings routes (list, edit, create).
  this.route('new-platform-flexberry-g-i-s-map-object-setting-l', { path: 'map-object-setting' });
  this.route('new-platform-flexberry-g-i-s-map-object-setting-e', { path: 'map-object-setting/:id' });
  this.route('new-platform-flexberry-g-i-s-map-object-setting-e.new', { path: 'map-object-setting/new' });

  // Maps and metadata search form's route.
  this.route('gis-search-form', { path: 'search' });

  // Components examples routes (sorted by component's names).
  this.route('components-examples/flexberry-maplayers/settings-example');

  this.route('components-examples/flexberry-boundingbox/settings-example');
  this.route('geojson-map');
  this.route('kml-map');
});

export default Router;
