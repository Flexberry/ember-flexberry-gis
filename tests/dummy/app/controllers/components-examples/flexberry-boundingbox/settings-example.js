import Ember from 'ember';

export default Ember.Controller.extend({
  /**
    Minimal latitude value.

    @property minLat
    @type number
    @default -90
  */
  minLat: -90,

  /**
    Maximal latitude value.

    @property maxLat
    @type number
    @default 90
  */
  maxLat: 90,

  /**
    Minimal longitude value.

    @property minLng
    @type number
    @default -180
  */
  minLng: -180,

  /**
    Maximal longitude value.

    @property maxLng
    @type number
    @default 180
  */
  maxLng: 180,

  actions: {
    onBoundingBoxChange(e) {
      console.log('boundingBoxChange: ', e);
    }
  }
});
