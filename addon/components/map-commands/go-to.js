/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/go-to';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for GoToMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-go-to-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  gotoDialog: 'flexberry-go-to-map-command-dialog'
};

/**
  Flexberry go-to map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  controller/my-map-form.js
  ```javascript
  availableCRS: Ember.computed(function() {
    let availableModes = Ember.A();
    availableModes.push({ crs: this.get('model.crs'), name: t('crs.current.name'), xCaption: t('crs.current.xCaption'), yCaption: t('crs.current.yCaption'), isLatlng: false });
    availableModes.push({ crs: L.CRS.EPSG4326, name: t('crs.latlng.name'), xCaption: t('crs.latlng.xCaption'), yCaption: t('crs.latlng.yCaption'), isLatlng: true });

    return availableModes;
  }),

  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-commands/edit availableCRS=availableCRS leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```
  @class GoToMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let GoToMapCommandComponent = Ember.Component.extend({
  /**
    Options which will be passed to the map-command's 'execute' method.

    @property mapCommandExecutionOptions
    @type Object
    @private
    @readOnly
  */
  _mapCommandExecutionOptions: null,

  /**
    Flag: indicates whether go-to dialog has been already requested by user or not.

    @property _gotoDialogHasBeenRequested
    @type boolean
    @default false
    @private
  */
  _gotoDialogHasBeenRequested: false,

  /**
    Flag: indicates whether go-to dialog is visible or not.

    @property _gotoDialogIsVisible
    @type boolean
    @default false
    @private
  */
  _gotoDialogIsVisible: false,

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
    Map command's caption.

    @property caption
    @type String
    @default t('components.map-commands.go-to.caption')
  */
  caption: t('components.map-commands.go-to.caption'),

  /**
    Map command's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-commands.go-to.tooltip')
  */
  tooltip: t('components.map-commands.go-to.tooltip'),

  /**
    Map command's icon CSS-class names.

    @property iconClass
    @type String
    @default 'location arrow icon''
  */
  iconClass: 'location arrow icon',

  /**
    Available coordinate reference systems metadata.

    @property availableCRS
    @type Object[]
  */
  availableCRS: Ember.computed('i18n.locale', function () {
    let availableModes = Ember.A();
    let i18n = this.get('i18n');
    availableModes.push({
      crs: this.get('leafletMap.options.crs'),
      name: i18n.t('map-commands.go-to.available-crs.current.name').toString(),
      xCaption: i18n.t('map-commands.go-to.available-crs.current.xCaption').toString(),
      yCaption: i18n.t('map-commands.go-to.available-crs.current.yCaption').toString(),
      isLatlng: false
    });
    availableModes.push({
      crs: L.CRS.EPSG4326,
      name: i18n.t('map-commands.go-to.available-crs.latlng.name').toString(),
      xCaption: i18n.t('map-commands.go-to.available-crs.latlng.xCaption').toString(),
      yCaption: i18n.t('map-commands.go-to.available-crs.latlng.yCaption').toString(),
      isLatlng: true
    });

    return availableModes;
  }),

  actions: {
    /**
      Handles base map-command's 'click' action.

      @method actions.onMapCommandButtonClick
    */
    onMapCommandButtonClick(e) {
      this._showGoToDialog();
    },

    /**
      Handles go-to dialog's 'approve' action.

      @method actions.onGoToDialogApprove
      @param {Object} e Action's event object.
    */
    onGoToDialogApprove(e) {
      let leafletMap = this.get('leafletMap');
      let mapCommandName = 'go-to';
      let mapCommandProperties = null;
      let mapCommandExecutionOptions = Ember.get(e, 'gotoOptions');

      leafletMap.flexberryMap.commands.execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions);
    }
  },

  /**
    Destroys DOM-related component's properties & logic.
  */
  willDestroyElement() {
    this._super(...arguments);

    this._hideGoToEditDialog();
  },

  /**
    Shows dialog.

    @method _showGoToDialog
    @private
  */
  _showGoToDialog() {
    // Include dialog to markup.
    this.set('_gotoDialogHasBeenRequested', true);

    // Show dialog.
    this.set('_gotoDialogIsVisible', true);
  },

  /**
    Hides dialog.

    @method _hideGoToEditDialog
    @private
  */
  _hideGoToEditDialog() {
    // Hide dialog.
    this.set('_gotoDialogIsVisible', false);
  },

  /**
    Handles changes in current locale.

    @method _localeDidChange
    @private
  */
  _localeDidChange: Ember.observer('i18n.locale', function() {
    // Exclude dialog from markup.
    // It will force dialog's recreation next time.
    this.set('_gotoDialogHasBeenRequested', false);
  })
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
GoToMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default GoToMapCommandComponent;
