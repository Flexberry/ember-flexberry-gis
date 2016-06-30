import Ember from 'ember';

/**
  Controller for 'site-map-node' view from 'ember-flexberry' addon.

  @class SitemapNodeController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Ember.Controller.extend({
  actions: {
    hideSidebar: function() {
      Ember.$('.ui.sidebar').sidebar('hide');
    }
  }
});
