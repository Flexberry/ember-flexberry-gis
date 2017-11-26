/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-styles/simple/stroke-editor';

/**
  Component containing GUI for 'simple' layers-style 'path' stroke style settings.

  @class SimpleLayersStyleStrokeEditorComponent
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
    @default ['simple-layers-style-stroke-editor']
  */
  classNames: ['simple-layers-style-stroke-editor'],

  /**
    Hash containing path style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Observer changes in fill style.

    @method _styleSettingsDidChange
    @private
  */
  _styleSettingsDidChange: Ember.observer(
    'styleSettings',
    'styleSettings.stroke',
    'styleSettings.color',
    'styleSettings.weight',
    'styleSettings.lineCap',
    'styleSettings.lineJoin',
    'styleSettings.dashArray',
    'styleSettings.dashOffset',
    function() {
      Ember.run.once(this, '_sendChangeAction');
    }
  ),

  /**
    Sends 'change' action to notify about changes in fill style.

    @method _sendChangeAction
    @private
  */
  _sendChangeAction() {
    this.sendAction('change', this.get('styleSettings'));
  },

  actions: {
    /**
      Handles flexberry-colorpicker's 'change' action.
      Changes stroke color with respect to the specified property path.

      @method actions.onStrokeColorChange
      @param {String} strokeColorPath Stroke color property path.
      @param {Object} e Action's event object.
      @param {String} e.newValue New color in it's HEX representation.
    */
    onStrokeColorChange(strokeColorPath, e) {
      this.set(strokeColorPath, e.newValue);
    }
  }
});
