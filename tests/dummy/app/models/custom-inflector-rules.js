import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;

inflector.irregular('metadata', 'metadatas');
inflector.irregular('layer', 'layers');
inflector.irregular('settings', 'settingss');
inflector.irregular('map', 'maps');

export default {};
