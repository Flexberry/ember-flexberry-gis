/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/graduated';

/**
  Component containing GUI for 'graduated' layers-style

  @class GraduatedLayersStyleComponent
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
