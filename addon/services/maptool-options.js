import Ember from 'ember';

export default Ember.Service.extend({
    
  /**
    Flag: indicates whether identification is performed when right-clicking on map.

    @property identifyOnRightClick
    @type Bool
    @default false
  */
  identifyOnRightClick: false,
});
