import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('maps');
  this.route('map', { path: 'maps/:id' });

  this.route('new-platform-flexberry-g-i-s-map-l');
  this.route('new-platform-flexberry-g-i-s-map-e', { path: 'new-platform-flexberry-g-i-s-map-e/:id' });
  this.route('new-platform-flexberry-g-i-s-map-e.new', { path: 'new-platform-flexberry-g-i-s-map-e/new' });

  this.route('new-platform-flexberry-g-i-s-map-layer-edit', { path: 'new-platform-flexberry-g-i-s-map-layer-edit/:id' });
  this.route('new-platform-flexberry-g-i-s-map-layer-edit.new', { path: 'new-platform-flexberry-g-i-s-map-layer-edit/new' });

  // Components examples routes (sorted by component's names).
  this.route('components-examples/flexberry-button/settings-example');
  this.route('components-examples/flexberry-ddau-checkbox/settings-example');
  this.route('components-examples/flexberry-maplayers/settings-example');
  this.route('components-examples/flexberry-tree/settings-example');
});

export default Router;
