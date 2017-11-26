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
  styleSettings: null,

  /**
    Sends 'change' action to notify about changes in marker style settings.

    @method _sendChangeAction
    @private
  */
  _sendChangeAction() {
    this.sendAction('change', this.get('styleSettings'));
  },

  actions: {
    /**
      Handles changes in icon style settings.

      @method actions.onIconStyleSettingsChange
      @param {Object} newIconStyleSettings New icon style settings.
    */
    onIconStyleSettingsChange(newIconStyleSettings) {
      this.set('styleSettings.style.iconUrl', newIconStyleSettings.iconUrl);
      this.set('styleSettings.style.iconSize', newIconStyleSettings.iconSize);
      this.set('styleSettings.style.iconAnchor', newIconStyleSettings.iconAnchor);

      this._sendChangeAction();
    },

    /**
      Handles changes in shadow style settings.

      @method actions.onShadowStyleSettingsChange
      @param {Object} newIconStyleSettings New shadow style settings.
    */
    onShadowStyleSettingsChange(newShadowStyleSettings) {
      this.set('styleSettings.style.shadowUrl', newShadowStyleSettings.iconUrl);
      this.set('styleSettings.style.shadowSize', newShadowStyleSettings.iconSize);
      this.set('styleSettings.style.shadowAnchor', newShadowStyleSettings.iconAnchor);

      this._sendChangeAction();
    }
  }
});
