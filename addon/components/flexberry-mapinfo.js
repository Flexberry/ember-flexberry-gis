/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-mapinfo';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for FflexberryMapinfoComponent
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
    Flag: indicates whether map info dialog is visible or not, based on local storage saved value.
    If true, then dialog will be shown, otherwise dialog will be closed.

    @property visibleStorage
    @type Boolean
    @default false
  */
  visibleStorage: false,

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

  actions: {
    /**
      Handles info dialog's 'approve' action.
      Invokes own {{#crossLink "MapInfoComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onInfoDialogApprove
      @param {Object} e Action's event object.
    */
    onInfoDialogApprove(e) {
      // Save changes to local storage.
      let service = this.get('service');
      let className = this.get('_storageClassName');
      let mapId = this.get('mapId');

      service.setToStorage(className, mapId, { value: e.showOnOpen });
      this.set('visibleStorage', e.showOnOpen);
    },
  },

  /**
    Observes visibility changes.

    @method _visibleDidChange
    @private
  */
  _visibleDidChange: Ember.on('init', Ember.observer('visible', function () {
    if (this.get('visible')) {
      this._showInfoDialog();
    } else {
      this._hideInfoDialog();
    }
  })),

  /**
    Shows map info dialog.

    @method _showInfoDialog
    @private
  */
  _showInfoDialog() {
    let visibleStorage = this.get('visibleStorage');

    if (visibleStorage) {
      // Include dialog to markup.
      this.set('_infoDialogHasBeenRequested', true);

      // Show dialog.
      this.set('_infoDialogIsVisible', true);
    }
  },

  /**
    Hides map info dialog.

    @method _hideInfoDialog
    @private
  */
  _hideInfoDialog() {
    // Hide dialog.
    this.set('_infoDialogIsVisible', false);
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let service = this.get('service');
    let className = this.get('_storageClassName');
    let mapId = this.get('mapId');
    let storageCollection = service.getFromStorage(className, mapId);

    if (storageCollection.length > 0) {
      this.set('visibleStorage', false);
    } else {
      this.set('visibleStorage', true);
    }
  },

  /**
    Destroys DOM-related component's properties & logic.
  */
  willDestroyElement() {
    this._super(...arguments);

    this._hideInfoDialog();
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
MapInfoComponent.reopenClass({
  flexberryClassNames
});

export default MapInfoComponent;
