import Ember from 'ember';
import config from './config/environment';
import gisRouterSetup from 'ember-flexberry-gis/utils/route-setup';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  gisRouterSetup(this);
  
  this.route('new-platform-flexberry-g-i-s-map-l');
  this.route('new-platform-flexberry-g-i-s-map-e', { path: 'new-platform-flexberry-g-i-s-map-e/:id' });
  this.route('new-platform-flexberry-g-i-s-map-e.new', { path: 'new-platform-flexberry-g-i-s-map-e/new' });
});

export default Router;
