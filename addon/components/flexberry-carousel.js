import Ember from 'ember';
import layout from '../templates/components/flexberry-carousel';

export default Ember.Component.extend({
  layout,

  classNames: ['flexberry-carousel'],

  activeIndex: 0,

  images: null,

  token: null,

  availableEdit: null,

  feature: null,

  total: Ember.computed('images.[]', function () {
    return this.get('images') ? this.get('images').length : 0;
  }),

  slide(activeIndex, newIndex, direction) {
    let carouselItems = this.get('images');
    let activeItem = carouselItems[activeIndex];
    let newItem = carouselItems[newIndex];

    let transitionInterval = 400;
    let transitionOffset = 50;

    Ember.run(() => {
      Ember.set(activeItem, 'from', direction);
      Ember.set(newItem, 'from', direction);
    });

    Ember.run.later(() => {
      Ember.set(activeItem, 'slidingOut', true);
      Ember.set(newItem, 'slidingIn', true);
    }, transitionOffset);

    Ember.run.later(() => {
      this.set('activeIndex', newIndex);

      Ember.set(activeItem, 'slidingOut', false);
      Ember.set(activeItem, 'from', null);

      Ember.set(newItem, 'slidingIn', false);
      Ember.set(newItem, 'from', null);
    }, (transitionInterval + transitionOffset));
  },

  actions: {
    add() {
      this.sendAction('onHideCarousel');
      this.sendAction('onAddPhoto');
    },

    delete(index) {
      this.sendAction('onShowDeletePhoto', index);
    },

    next() {
      let activeIndex = this.get('activeIndex');
      let count = this.get('images').length;

      let newIndex = activeIndex + 1;

      if (newIndex === count) {
        newIndex = 0;
      }

      this.slide(activeIndex, newIndex, 'left');
    },

    prev() {
      let activeIndex = this.get('activeIndex');
      let count = this.get('images').length;

      let newIndex = activeIndex - 1;

      if (newIndex === -1) {
        newIndex = count - 1;
      }

      this.slide(activeIndex, newIndex, 'right');
    }
  }
});
