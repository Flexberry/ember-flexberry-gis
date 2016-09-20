export function initialize( application ) {
  application.registerOptionsForType('maptool', { singleton: true });
}

export default {
  name: 'flexberry-maptools',
  initialize
};
