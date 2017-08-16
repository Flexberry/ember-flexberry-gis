import Ember from 'ember';

/**
  Controller for 'site-map-node' view from 'ember-flexberry' addon.

  @class SitemapNodeController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Ember.Controller.extend({
  actions: {
    /**
      Expands or callapses submenu node.

      @method actions.onSubmenuButtonClick
    */
    onSubmenuButtonClick(e) {
      let $this =  Ember.$(e.currentTarget).parent().find('.subMenu:first');
      if ($this.hasClass('hidden-menu')) {
        $this.removeClass('hidden-menu');
        Ember.$(e.target).parent().find('.item-minus:first').removeClass('hidden-menu');
        Ember.$(e.target).parent().find('.item-plus:first').addClass('hidden-menu');
      } else {
        $this.addClass('hidden-menu');
        Ember.$(e.target).parent().find('.item-minus:first').addClass('hidden-menu');
        Ember.$(e.target).parent().find('.item-plus:first').removeClass('hidden-menu');
      }
    }
  }
});
