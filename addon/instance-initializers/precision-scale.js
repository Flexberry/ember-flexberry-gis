export function initialize(appInstance) {
  let mapApi = appInstance.lookup('service:mapApi');

  mapApi.addToApi('precisionScale', 10000);
}

export default {
  name: 'precision-scale',
  initialize
};
