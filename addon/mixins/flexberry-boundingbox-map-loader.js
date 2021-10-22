/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import { Promise } from 'rsvp';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

/**
  Mixin containing method for loading flexberry-boundingbox component's map.

  @class FlexberryBoundingboxMapLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  /**
   Service for Map loading from store
  */
  mapStore: service(),

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
    const config = getOwner(this).factoryFor('config:environment').class;
    const mapId = this.get('boundingBoxComponentMapId') || get(config, 'APP.components.flexberryBoundingbox.mapId');
    return new Promise((resolve, reject) => {
      const osmmap = this.get('mapStore.osmmap');
      if (isBlank(mapId)) {
        resolve(osmmap);
      } else {
        this.get('mapStore').getMapById(mapId).then((record) => {
          resolve(record);
        }).catch(() => {
          resolve(osmmap);
        });
      }
    });
  },
});
