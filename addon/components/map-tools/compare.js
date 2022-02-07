/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
import layout from '../../templates/components/map-tools/compare';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-zoom-out-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-zoom-out-map-tool').
  @readonly
  @static

  @for ZoomOutMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-compare-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

let ComapreToolComponent =  Ember.Component.extend({
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    to disable a component's wrapping element.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Map tool's additional CSS-class.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Map tool's caption.

    @property caption
    @type String
    @default t('components.map-tools.comapre-layers.caption')
  */
  caption: t('components.map-tools.comapre-layers.caption'),

  /**
     Map tool's tooltip text.
     Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-tools.comapre-layers.tooltip')
  */
  tooltip: t('components.map-tools.comapre-layers.tooltip'),

  /**
    Map tool's icon CSS-class names.

    @property iconClass
    @type String
    @default 'compare icon'
  */
  iconClass: 'icon-guideline-compare',

  actions: {
    /**
      Handles {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
      Invokes own {{#crossLink "DragMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

      @method actions.onMapToolActivate
      @param {Object} e Base map-tool's 'activate' action event-object.
    */
    showCompareSideBar(e) {
      this.sendAction('showCompareSideBar', e);
    }
  },
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
ComapreToolComponent.reopenClass({
  flexberryClassNames
});

export default ComapreToolComponent;
