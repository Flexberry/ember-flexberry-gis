import Ember from 'ember';
import config from './config/environment';
import gisRouterSetup from 'ember-flexberry-gis/utils/route-setup';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  gisRouterSetup(this);
});

export default Router;
