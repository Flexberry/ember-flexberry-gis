/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/simple';

/**
  Component containing GUI for 'simple' layers-style

  @class SimpleLayersStyleComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Currently active tab name.

    @property _activeTab
    @type String
    @default 'path-tab'
    @private
  */
  _activeTab: 'path-tab',

  /**
    Reference to 'layers-styles-renderer' servie.

    @property _layersStylesRenderer
    @type LayersStylesRendererService
    @private
  */
  _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Reference to 'markers-styles-renderer' servie.

    @property _markersStylesRenderer
    @type MarkersStylesRendererService
    @private
  */
  _markersStylesRenderer: Ember.inject.service('markers-styles-renderer'),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['simple-layers-style']
  */
  classNames: ['simple-layers-style'],

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // TODO: Rerender on each change in styleSettings nested properties.
    let pathPreviewCanvas = this.$('.ui.tab.segment[data-tab=path-tab] canvas')[0];
    this.get('_layersStylesRenderer').renderOnCanvas({ canvas: pathPreviewCanvas, styleSettings: this.get('styleSettings') });

    let markerPreviewCanvas = this.$('.ui.tab.segment[data-tab=marker-tab] canvas')[0];
    this.get('_markersStylesRenderer').renderOnCanvas({ canvas: markerPreviewCanvas, style: this.get('styleSettings.style.marker') });
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);
  },

  actions: {
    /**
      Handles clicks on tabs.

      @method actions.onTabClick
      @param {Object} e Click event object.
    */
    onTabClick(e) {
      e = Ember.$.event.fix(e);

      let $clickedTab = Ember.$(e.currentTarget);
      let clickedTabName = $clickedTab.attr('data-tab');

      this.set('_activeTab', clickedTabName);
    }
  }
});
