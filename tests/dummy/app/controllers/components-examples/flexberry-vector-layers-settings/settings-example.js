import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    sendSettings(settings) {
      console.log('settings: ', settings);
    }
  }
});
