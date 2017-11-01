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

  // Layer metadata routes (list, edit, create).
  this.route('new-platform-flexberry-g-i-s-layer-metadata-l', { path: 'layer-metadata' });
  this.route('new-platform-flexberry-g-i-s-layer-metadata-e', { path: 'layer-metadata/:id' });
  this.route('new-platform-flexberry-g-i-s-layer-metadata-e.new', { path: 'layer-metadata/new' });

  // Maps and metadata search form's route.
  this.route('gis-search-form', { path: 'search' });

  // Components examples routes (sorted by component's names).
  this.route('components-examples/flexberry-maplayers/settings-example');

  this.route('components-examples/flexberry-boundingbox/settings-example');
  this.route('geojson-map');
  this.route('kml-map');
});

export default Router;
