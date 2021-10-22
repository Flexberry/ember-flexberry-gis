import $ from 'jquery';
import Controller from '@ember/controller';

/**
  Controller for 'site-map-node' view from 'ember-flexberry' addon.

  @class SitemapNodeController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Controller.extend({
  actions: {
    /**
      Hide Sidebar by clicking submenu item.

      @method actions.subMenuEl
    */
    hideSidebar() {
      $('.ui.sidebar').sidebar('hide');
    },

    /**
      Expand menu items by click.

      @method actions.subMenuEl
    */
    subMenuEl(e) {
      let $this = $(e.currentTarget).parent().find('.subMenu:first');
      if ($this.hasClass('hidden')) {
        $this.removeClass('hidden');
        $(e.target).parent().find('.item-minus:first').removeClass('hidden');
        $(e.target).parent().find('.item-plus:first').addClass('hidden');
      } else {
        $this.addClass('hidden');
        $(e.target).parent().find('.item-minus:first').addClass('hidden');
        $(e.target).parent().find('.item-plus:first').removeClass('hidden');
      }
    }
  }
});
