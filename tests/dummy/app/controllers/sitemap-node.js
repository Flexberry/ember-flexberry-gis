import Ember from 'ember';

/**
  Controller for 'site-map-node' view from 'ember-flexberry' addon.

  @class SitemapNodeController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Ember.Controller.extend({
  actions: {
    /**
       Hides application sitemap's side bar.

       @method actions.hideSidebar
     */
    hideSidebar: function() {
      Ember.$('.ui.sidebar').sidebar('hide');
    }
  }
});
