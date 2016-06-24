import Ember from 'ember';

export default Ember.Controller.extend({
  sitemap: {
    nodes: [
      {
        link: 'index',
        caption: 'Home',
        children: null
      },
      {
        link: null,
        caption: 'Objects',
        children: [
          {
            link: 'new-platform-flexberry-g-i-s-map-l',
            caption: 'map metadata editor',
            children: null
          },
          {
            link: 'maps',
            caption: 'maps view',
            children: null
          }
        ]
      }
    ]
  },
  actions: {
    toggleSidebar: function () {
      Ember.$('.ui.sidebar').sidebar('toggle');
    }
  }
});
