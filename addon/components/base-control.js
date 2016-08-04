/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

/**
  BaseControl component for leaflet map controls
  @class BaseControlComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend(LeafletOptionsMixin, {
  /**
    Overload wrapper tag name for disabling wrapper.
  */
  tagName: '',

  /**
    Leaflet map for this control
    @property map
    @type L.Map
    @default null
   */
  map: null,

  /**
    Creates control instance, should be overridden in child classes
    @method createControl
    @return {L.Control} Returns new created control
   */
  createControl() {
  },

  /**
    Adds created control to map if it's present or change
   */
  initControl: Ember.observer('map', function () {
    let leafletMap = this.get('map');
    if (!Ember.isNone(leafletMap)) {
      let control = this.createControl();
      this.set('control', control);
      leafletMap.addControl(control);
    }
  }),

  didInsertElement() {
    this._super(...arguments);
    this.initControl();
  }
});
