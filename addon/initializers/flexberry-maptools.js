export function initialize( application ) {
  application.registerOptionsForType('maptool', { singleton: false });
}

export default {
  name: 'flexberry-maptools',
  initialize
};
