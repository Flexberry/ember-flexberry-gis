export function initialize(application) {
  application.inject('component:spatial-bookmark', 'local-storage-service', 'service:local-storage');
}

export default {
  name: 'local-storage',
  initialize
};
