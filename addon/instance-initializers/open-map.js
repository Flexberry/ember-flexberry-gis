import Ember from 'ember';

export function initialize(appInstance) {
  let mapApi = appInstance.lookup('service:map-api');
  mapApi.addToApi('openMap', openMap.bind(appInstance));
}

/**
  Open map if there is exists.

  @method openMap
  @param {string} mapId Map id.
  @param {Object} options Parametrs of maps.
  Example:
  var options = {
        zoom: 14,
        lat: 0,
        long: 0
      };
*/
function openMap(mapId, options) {
  return new Ember.RSVP.Promise((resolve, reject) => {
    if (mapId) {
      let service = this.lookup('service:map-store');
      service.getMapById(mapId).then((mapModel)=> {
        let router = this.lookup('router:main');
        let queryParams = Object.assign({}, options);
        resolve(router.transitionTo('map', mapModel, { queryParams: queryParams }));
      }).catch(()=> {
        reject('map is not exists');
      });
    } else {
      reject('mapId is not exists');
    }
  });
}

export default {
  name: 'open-map',
  initialize
};
