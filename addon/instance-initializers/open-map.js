export function initialize(appInstance) {
  let mapApi = appInstance.lookup('service:map-api');
  mapApi.addToApi('open-map', openMap.bind(appInstance));
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
  let service = this.lookup('service:map-store');
  if (mapId) {
    service.getMapById(mapId).then(()=> {
      let router = this.lookup('route:index');
      if (options) {
        router.transitionTo('map', mapId, {
          queryParams: options
        });
      } else {
        router.transitionTo('map', mapId);
      }
    }).catch(()=> {
      console.error('map is not exists');
    });
  } else {
    console.error('mapId is not exists');
  }
}

export default {
  name: 'open-map',
  initialize
};
