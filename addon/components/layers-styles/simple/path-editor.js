/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-styles/simple/path-editor';

/**
  Component containing GUI for 'simple' layers-style 'path' style settings.

  @class SimpleLayersStylePathEditorComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['simple-layers-style-path-editor']
  */
  classNames: ['simple-layers-style-path-editor'],

  /**
    Hash containing path style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  actions: {
    /**
      Handles changes in style settings.

      @method actions.onStyleSettingsChange
    */
    onStyleSettingsChange() {
      this.sendAction('change', this.get('styleSettings'));
    }
  }
});
