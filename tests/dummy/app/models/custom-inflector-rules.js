/**
  @module ember-flexberry-gis-dummy
*/

import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;

inflector.irregular('connection', 'connections');
inflector.irregular('parameter', 'parameters');
inflector.irregular('link', 'links');
inflector.irregular('metadata', 'metadatas');
inflector.irregular('layer', 'layers');
inflector.irregular('setting', 'settings');
inflector.irregular('map', 'maps');

export default {};
