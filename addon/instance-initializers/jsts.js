import jsts from 'npm:jsts';

export function initialize(appInstance) {
  const mapApi = appInstance.lookup('service:mapApi');

  mapApi.addToApi('jsts', jsts);
}

export default {
  name: 'jsts',
  initialize,
};
