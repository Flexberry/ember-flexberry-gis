/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/markers-styles/image';

/**
  Component containing GUI for 'image' markers-style

  @class ImageMarkersStyleComponent
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
  styleSettings: null
});
