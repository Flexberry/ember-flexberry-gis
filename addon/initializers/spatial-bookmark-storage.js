export function initialize(application) {
  application.inject('component:spatial-bookmark', 'storage-service', 'service:spatial-bookmark-local-storage');
}

export default {
  name: 'spatial-bookmark-storage',
  initialize
};
