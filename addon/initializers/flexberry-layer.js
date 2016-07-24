export function initialize(application ) {
  application.registerOptionsForType('layer',  { singleton: false });
}

export default {
  name: 'flexberry-layer',
  initialize
};
