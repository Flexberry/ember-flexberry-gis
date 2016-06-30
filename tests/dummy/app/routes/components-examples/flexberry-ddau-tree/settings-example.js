import Ember from 'ember';

export default Ember.Route.extend({
  /**
    Returns model related to current route.

    @method model
  */
  model(params) {
    return this.get('store')
      .createRecord('components-examples/flexberry-ddau-tree/settings-example/base', {
      });
  }
});
