/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing method for loading flexberry-boundingbox component's map.

  @class FlexberryBoundingboxMapLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  store: Ember.inject.service(),

  /**
   Service for Map loading from store
  */
  mapStore: Ember.inject.service(),

  /**
    Map model name.
    @property mapModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  mapModelName: 'new-platform-flexberry-g-i-s-map',

  /**
    Map id for boundingbox component.
    @property boundingBoxComponentMapId
    @type String
    @default undefined
  */
  boundingBoxComponentMapId: undefined,

  /**
    Gets map model to be displayed in `flexberry-boundingbox` component.

    @method getBoundingBoxComponentMapModel
    @return {Promise} Promise, that returning map model.
  */
  getBoundingBoxComponentMapModel() {
    let config = Ember.getOwner(this).factoryFor('config:environment').class;
    let mapId = this.get('boundingBoxComponentMapId') || Ember.get(config, 'APP.components.flexberryBoundingbox.mapId');
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (Ember.isBlank(mapId)) {
        resolve(this.get('mapStore').get('defaultOSMMap'));
      } else {
        this.get('mapStore').getMapById(mapId).then(record => {
          resolve(Ember.isNone(record) ? this.get('mapStore').get('defaultOSMMap') : record);
        }).catch(() => {
          resolve(this.get('mapStore').get('defaultOSMMap'));
        });
      }
    });
  }

});
