/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-mapinfo';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for FlexberryMapinfoComponent
*/
const flexberryClassNamesPrefix = 'flexberry-mapinfo';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  infoDialog: 'flexberry-mapinfo-dialog',
};

/**
  Flexberry map-info component.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{flexberry-mapinfo
    name=model.name
    description=model.description
    visible=map.visible
  }}
  ```

  @class MapInfoComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let MapInfoComponent = Ember.Component.extend({
  /**
    Injected local-storage-service.

    @property service
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:local-storage
  */
  service: Ember.inject.service('local-storage'),

  /**
    Flag: indicates whether info dialog has been already requested by user or not.

    @property _infoDialogHasBeenRequested
    @type boolean
    @default false
    @private
  */
  _infoDialogHasBeenRequested: false,

  /**
    Flag: indicates whether info dialog is visible or not.

    @property _infoDialogIsVisible
    @type boolean
    @default false
    @private
  */
  _infoDialogIsVisible: false,

  /**
    Current instance class name for storage.

    @property storageClassName
    @type string
    @default 'mapinfo'
    @private
  */
  _storageClassName: 'mapinfo',

  /**
    Reference to component's template.
  */
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
    Map command's additional CSS-class.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Flag: indicates whether map info dialog is visible or not.
    If true, then dialog will be shown, otherwise dialog will be closed.

    @property visible
    @type Boolean
    @default false
  */
  visible: false,

  /**
    Map id.

    @property mapId
    @type String
    @default null
  */
  mapId: null,

  /**
    Map name.

    @property name
    @type String
    @default null
  */
  name: null,

  /**
    Map description.

    @property description
    @type String
    @default null
  */
  description: null,

  /**
    Flag: indicates whether dialog is show on opening or not.

    @property showOnOpen
    @type Boolean
    @default true
  */
  showOnOpen: true,

  /**
    Dialog's 'name' textbox caption.

    @property nameTextboxCaption
    @type String
    @default t('components.flexberry-mapinfo.name-caption')
  */
  nameTextboxCaption: t('components.flexberry-mapinfo.name-caption'),

  /**
    Dialog's 'description' textbox caption.

    @property descriptionTextboxCaption
    @type String
    @default t('components.flexberry-mapinfo.description-caption')
  */
  descriptionTextboxCaption: t('components.flexberry-mapinfo.description-caption'),

  /**
    Dialog's 'show-on-open' textbox caption.
     @property showOnOpenTextboxCaption
    @type String
    @default t('components.flexberry-mapinfo.show-on-open-caption')
  */
  showOnOpenTextboxCaption: t('components.flexberry-mapinfo.show-on-open-caption'),

  /**
    Component's caption.

    @property class
    @type String
    @default t('components.map-dialogs.info.caption')
  */
  caption: t('components.flexberry-mapinfo.caption'),

  actions: {
    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryInfoMapDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove() {
      var showOnOpen = this.get('showOnOpen');

      let service = this.get('service');
      let storageClass = this.get('_storageClassName');
      let mapId = this.get('mapId');
      service.setToStorage(storageClass, mapId, showOnOpen);
    }
  },

  init() {
    this._super(...arguments);
    let service = this.get('service');
    let storageClass = this.get('_storageClassName');
    let mapId = this.get('mapId');
    let dialogVisibility = !Ember.isNone(mapId) && service.getFromStorageSingle(storageClass, mapId) !== false;

    this.set('visible', dialogVisibility);
    this.set('showOnOpen', dialogVisibility);
  },

  /**
    Observes visibility changes.

    @method _visibleDidChange
    @private
  */
  _visibleDidChange: Ember.on('init', Ember.observer('visible', function () {
    if (this.get('visible')) {
      // Include dialog to markup.
      this.set('_infoDialogHasBeenRequested', true);
    }
  }))
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
MapInfoComponent.reopenClass({
  flexberryClassNames
});

export default MapInfoComponent;
