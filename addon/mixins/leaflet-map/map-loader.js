/**
  @module ember-flexberry-gis
*/

import { isNone, typeOf } from '@ember/utils';

import $ from 'jquery';
import Mixin from '@ember/object/mixin';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {String} flexberryClassNames.loaderDimmer Component's loader's dimmer CSS-class name ('flexberry-map-loader-dimmer').
  @property {String} flexberryClassNames.loader Component's loader CSS-class name ('flexberry-map-loader').
  @readonly
  @static

  @for FlexberryMapComponent
*/
const flexberryClassNamesPrefix = 'flexberry-map';
const flexberryClassNames = {
  loaderDimmer: `${flexberryClassNamesPrefix}-loader-dimmer`,
  loader: `${flexberryClassNamesPrefix}-loader`,
};

/**
  Mixin which injects loader's methods & properties into leaflet map.

  @class LeafletMapLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  /**
    Performs some initialization before leaflet map will be initialized.

    @param {Object} leafletMap Leaflet map.
  */
  willInitLeafletMap(leafletMap) {
    this._super(...arguments);

    // Flag: indicates whether loader is shown at the moment or not.
    let loaderIsShown = false;

    // Inject DOM-elements for loader & it's dimmer into map's container markup.
    const $leafletMapContainer = this.get('_$leafletContainer');
    const $dimmer = $('<div />')
      .addClass(flexberryClassNames.loaderDimmer)
      .addClass('ui dimmer')
      .appendTo($leafletMapContainer);
    const $loader = $('<div />')
      .addClass(flexberryClassNames.loader)
      .addClass('ui text loader')
      .appendTo($leafletMapContainer);

    // Reference to flexberryMap.interaction namespace.
    const mapInteraction = leafletMap.flexberryMap.interaction;

    // Define flexberryMap.loader namespace & related methods & properties.
    const loader = {

      // Loader's markup element.
      $loader,

      // Loader dimmer's markup element.
      $dimmer,

      // Returns flag indicating whether loader is shown at the moment or not.
      isShown() {
        return loaderIsShown;
      },

      // Sets loader's content.
      setContent(content) {
        content = isNone(content) ? '' : content;
        content = typeOf(content) === 'string' ? content : `${content}`;

        $loader.html(content);
      },

      // Shows loader.
      show(options) {
        // Set possibly defined loader's content.
        options = options || {};
        if (!isNone(options.content)) {
          loader.setContent(options.content);
        }

        if (loaderIsShown) {
          return;
        }

        // Disable map interaction.
        mapInteraction.disable();

        // Show loader & it's dimmer.
        $dimmer.addClass('active');
        $loader.addClass('active');

        loaderIsShown = true;
      },

      // Hides loader.
      hide(options) {
        // Set possibly defined loader's content.
        options = options || {};
        if (!isNone(options.content)) {
          loader.setContent(options.content);
        }

        if (!loaderIsShown) {
          return;
        }

        // Restore map interaction.
        mapInteraction.enable();

        // Hide loader & it's dimmer.
        $dimmer.removeClass('active');
        $loader.removeClass('active');

        loaderIsShown = false;
      },

      // Destroys flexberryMap.loader.
      _destroy() {
        // Hide already shown loader first.
        if (loaderIsShown) {
          loader.hide();
        }

        // Now remove DOM-markup related to map loader.
        $dimmer.remove();
        $loader.remove();

        // Remove flexberryMap.loader namespace & related methods & properties.
        delete leafletMap.flexberryMap.loader;
      },
    };

    leafletMap.flexberryMap.loader = loader;
  },

  /**
    Performs some clean up before leaflet map will be destroyed.

    @param {Object} leafletMap Leaflet map.
  */
  willDestroyLeafletMap(leafletMap) {
    this._super(...arguments);

    leafletMap.flexberryMap.loader._destroy();
  },
});
