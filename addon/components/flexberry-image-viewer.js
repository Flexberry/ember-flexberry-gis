import Ember from 'ember';
import layout from '../templates/components/flexberry-image-viewer';

export default Ember.Component.extend({
  layout,

  tagName: '',

  galleryDialogIsRequested: false,
  galleryDialogIsVisible: false,

  activeIndex: 0,

  /**
   * { source: string, preview: string } []
   */
  images: Ember.A(),

  actions: {
    showAll() {
      this.set('galleryDialogIsRequested', true);
      this.set('galleryDialogIsVisible', true);
    },

    add() {
      let images = this.get('images');
      images.pushObject({
        source: "https://ununsplash.imgix.net/photo-1429547584745-d8bec594c82e?q=75&fm=jpg&w=1080&fit=max&s=1870a82969024ba6816b271a49ca5876",
        preview: "https://ununsplash.imgix.net/photo-1429547584745-d8bec594c82e?q=75&fm=jpg&w=1080&fit=max&s=1870a82969024ba6816b271a49ca5876"
      });

      this.set('images', images);
      this.set('activeIndex', images.length - 1);
    },

    delete(item) {
      let images = this.get('images');
      let image = images.objectAt(item.iindex - 1);
      images.removeObject(image);
      this.set('images', images);
      this.set('activeIndex', item.iindex - 1);
    }
  }
});
