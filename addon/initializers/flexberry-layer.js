export function initialize(application ) {
  application.registerOptionsForType('layer', { instantiate: false });
}

export default {
  name: 'flexberry-layer',
  initialize
};
