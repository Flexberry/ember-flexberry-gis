/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/empty';

/**
  Component containing GUI for 'empty' layers-style

  @class EmptyLayersStyleComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Hash containing layer display settings.

    @property displaySettings
    @type Object
    @default null
  */
  displaySettings: null,

  /**
    Related layer's type.

    @property layerType
    @type String
    @default null
  */
  layerType: null,

  /**
    Method returning related leaflet layer.

    @property leafletLayer
    @type Function
    @default null
  */
  getLeafletLayer: null
});
