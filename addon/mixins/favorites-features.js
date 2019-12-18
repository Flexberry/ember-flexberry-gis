/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    toggleFavIcon() {
      if (Ember.$('.fvicon').hasClass('filled')) {
        Ember.$('.fvicon').removeClass('filled');
      } else {
        Ember.$('.fvicon').addClass('filled');
      }
    }
  }
});
