/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Base map tool.

  @class BaseMaptool
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
*/
export default Ember.Object.extend({
  /**
    Reference to i18n service.

    @property i18n
    @type <a href="https://github.com/jamesarosen/ember-i18n">I18nService</a>
    @default Ember.inject.service('i18n')
  */
  i18n: Ember.inject.service('i18n'),

  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default ''
  */
  cursor: '',

  /**
    Leaflet map related to tool.

    @property map
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  map: null,

  /**
    Enables tool.

    @method enable
  */
  enable() {
    let element = this.get('map')._container;
    let cursor = this.get('cursor');
    if(element && cursor && !L.DomUtil.hasClass(element, cursor)) {
      L.DomUtil.addClass(element, cursor);
    }
  },

  /**
    Disables tool.

    @method disable
  */
  disable() {
    let element = this.get('map')._container;
    let cursor = this.get('cursor');
    if(element && cursor && L.DomUtil.hasClass(element, cursor)) {
      L.DomUtil.removeClass(element, cursor);
    }
  }
});
