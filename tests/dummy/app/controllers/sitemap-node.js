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
      if ($this.hasClass('hidden')) {
        $this.removeClass('hidden');
        Ember.$(e.target).parent().find('.item-minus:first').removeClass('hidden');
        Ember.$(e.target).parent().find('.item-plus:first').addClass('hidden');
      } else {
        $this.addClass('hidden');
        Ember.$(e.target).parent().find('.item-minus:first').addClass('hidden');
        Ember.$(e.target).parent().find('.item-plus:first').removeClass('hidden');
      }
    }
  }
});
