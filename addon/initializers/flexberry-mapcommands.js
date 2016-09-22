export function initialize(application) {
  application.registerOptionsForType('mapcommand', { instantiate: false });
}

export default {
  name: 'flexberry-mapcommands',
  initialize
};
