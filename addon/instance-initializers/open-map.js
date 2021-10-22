import { Promise } from 'rsvp';

export function initialize(appInstance) {
  const mapApi = appInstance.lookup('service:map-api');
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
  return new Promise((resolve, reject) => {
    if (mapId) {
      const service = this.lookup('service:map-store');
      service.getMapById(mapId).then((mapModel) => {
        const router = this.lookup('router:main');
        const queryParams = Object.assign({}, options);
        resolve(router.transitionTo('map', mapModel, { queryParams, }));
      }).catch(() => {
        reject('map is not exists');
      });
    } else {
      reject('mapId is not exists');
    }
  });
}

export default {
  name: 'open-map',
  initialize,
};
