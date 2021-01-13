/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands-dialogs/go-to';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-export-map-command-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryGoToMapCommandDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-go-to-map-command-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry 'go-to' map-command modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryGoToMapCommandDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryGoToMapCommandDialogComponent = Ember.Component.extend({
    /**
      Available command modes.

      @property _availableModes
      @type Object[]
      @default null
      @private
    */
    _availableModes: null,

    /**
      Available command captions.

      @property _availableCaptions
      @type String[]
      @private
    */
    _availableCaptions: Ember.computed('_availableModes.[]', function() {
      let availableModes = this.get('_availableModes');
      let captions = Ember.A();
      availableModes.forEach(function(item) {
        captions.push(item.name);
      });

      return captions;
    }),

    /**
      Selected command mode.

      @property _selectedMode
      @type String
      @default null
      @private
    */
    _selectedMode: null,

    /**
      Current CRS

      @property _selectedCrs
      @type object
      @private
    */
    _selectedCrs: Ember.computed('_selectedMode', function() {
      let selectedMode = this.get('_selectedMode');
      let availableModes = this.get('_availableModes');
      let current = null;

      availableModes.forEach(function(item) {
        if (item.name === selectedMode) {
          current = item;
        }
      });

      return current;
    }),

    /**
      Hash containing go-to options.

      @property _options
      @type Object
      @default null
      @private
    */
    _options: null,

    /**
      Flag: indicates whether to show error message or not.

      @property _showErrorMessage
      @type Boolean
      @readOnly
    */
    _showErrorMessage: false,

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
      is empty to disable component's wrapping <div>.

      @property tagName
      @type String
      @default ''
    */
    tagName: '',

    /**
      Component's additional CSS-class names.

      @property class
      @type String
      @default null
    */
    class: null,

    /**
      Component's caption.

      @property caption
      @type String
      @default t('components.map-commands-dialogs.go-to.caption')
    */
    caption: t('components.map-commands-dialogs.go-to.caption'),

    /**
      Component's error message caption.

      @property errorMessageCaption
      @type String
      @default t('components.map-commands-dialogs.go-to.error-message.caption')
    */
    errorMessageCaption: t('components.map-commands-dialogs.go-to.error-message.caption'),

    /**
      Component's error message content.

      @property errorMessageContent
      @type String
      @default t('components.map-commands-dialogs.go-to.error-message.content')
    */
    errorMessageContent: t('components.map-commands-dialogs.go-to.error-message.content'),

    /**
      Dialog's 'approve' button caption.

      @property approveButtonCaption
      @type String
      @default t('components.map-commands-dialogs.go-to.approve-button.caption')
    */
    approveButtonCaption: t('components.map-commands-dialogs.go-to.approve-button.caption'),

    /**
      Dialog's 'deny' button caption.

      @property denyButtonCaption
      @type String
      @default t('components.map-commands-dialogs.go-to.deny-button.caption')
    */
    denyButtonCaption: t('components.map-commands-dialogs.go-to.deny-button.caption'),

    /**
      Dialog's mode dropdown caption.

      @property modeDropdownCaption
      @type String
      @default t('components.map-commands-dialogs.mode-dropdown.caption')
    */
    modeDropdownCaption: t('components.map-commands-dialogs.go-to.mode-dropdown.caption'),

    /**
      Flag: indicates whether dialog is visible or not.
      If true, then dialog will be shown, otherwise dialog will be closed.

      @property visible
      @type Boolean
      @default false
    */
    visible: false,

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="">L.Map</a>
      @default null
    */
    leafletMap: null,

    actions: {
      /**
        Handler for error 'ui-message' component 'onShow' action.

        @method actions.onErrorMessageShow
      */
      onErrorMessageShow() {
      },

      /**
        Handler for error 'ui-message' component 'onHide' action.

        @method actions.onErrorMessageHide
      */
      onErrorMessageHide() {
        this.set('_showErrorMessage', false);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryGoToMapCommandDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

        @method actions.onBeforeShow
      */
      onBeforeShow(e) {
        this.sendAction('beforeShow', e);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryGoToMapCommandDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

        @method actions.onBeforeHide
      */
      onBeforeHide(e) {
        this.sendAction('beforeHide', e);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryGoToMapCommandDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

        @method actions.onShow
      */
      onShow(e) {
        this.sendAction('show', e);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryGoToMapCommandDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

        @method actions.onHide
      */
      onHide(e) {
        this.sendAction('hide', e);
        this.set('_options', {
          x: '',
          y: ''
        });
        this.set('_showErrorMessage', false);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryGoToMapCommandDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

        @method actions.onApprove
      */
      onApprove(e) {
        let gotoOptions = this._getGoToOptions();
        if (Ember.isNone(gotoOptions)) {
          // Prevent dialog from being closed.
          e.closeDialog = false;

          // Show error message.
          this.set('_showErrorMessage', true);

          return;
        }

        // Hide possibly shown error message.
        this.set('_showErrorMessage', false);

        Ember.set(e, 'gotoOptions', gotoOptions);
        this.sendAction('approve', e);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryGoToMapCommandDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

        @method actions.onDeny
      */
      onDeny(e) {
        this.sendAction('deny', e);
      },

      /**
        Switch X and Y options

        @method actions.switchXY
      */
      switchXY() {
        let x = this.get('_options.y');
        let y = this.get('_options.x');

        this.set('_options.x', x);
        this.set('_options.y', y);
      },

      /**
        Handles coordinate input textboxes keyPress events.

        @method actions.coordsInputKeyPress
      */
      coordsInputKeyPress(e) {
        if (e.which !== 45 && e.which !== 44 && e.which !== 46 && (e.which < 48 || e.which > 57)) {
          return false;
        }
      }
    },

    /**
      Returns inner options transformed into 'go-to' map-command options.

      @method _getGoToOptions
      @return {Object} Hash containing inner options transformed into 'go-to' map-command options.
    */
    _getGoToOptions() {
      let gotoOptions = {};
      let innerOptions = this.get('_options');
      let crs = this.get('_selectedCrs');

      let x = Ember.get(innerOptions, 'x').replace(',', '.');
      let y = Ember.get(innerOptions, 'y').replace(',', '.');
      let regEx = /^(\-|\+)?([0-9]+(\.[0-9]+)?)$/;
      if (!(regEx.test(x) && regEx.test(y))) {
        this.set('errorMessageContent', t('components.map-commands-dialogs.go-to.error-message.content'));
        return null;
      }

      x = parseFloat(x);
      y = parseFloat(y);

      let isLatlng = Ember.get(crs, 'isLatlng');
      let usedCrs = Ember.get(crs, 'crs');
      let leafletMap = this.get('leafletMap');
      let maxBounds = Ember.get(leafletMap, 'options.maxBounds');
      if (Ember.isBlank(maxBounds)) {
        let maxPixelBounds = leafletMap.getPixelWorldBounds(0);
        maxBounds = L.latLngBounds(leafletMap.unproject(maxPixelBounds.min, 0), leafletMap.unproject(maxPixelBounds.max, 0));
      }

      let latLng = isLatlng ? new L.LatLng(x, y) : usedCrs.unproject(new L.Point(x, y));
      if (!maxBounds.contains(latLng)) {
        this.set('errorMessageContent', t('components.map-commands-dialogs.go-to.error-message.large-coords'));
        return null;
      }

      Ember.set(gotoOptions, 'point', new L.Point(x, y));
      Ember.set(gotoOptions, 'crs', usedCrs);
      Ember.set(gotoOptions, 'xCaption', Ember.get(crs, 'xCaption'));
      Ember.set(gotoOptions, 'yCaption', Ember.get(crs, 'yCaption'));
      Ember.set(gotoOptions, 'isLatlng', isLatlng);
      return gotoOptions;
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this.set('_options', {
        x: '',
        y: ''
      });

      let availableModes = this.get('_availableModes');
      if (!Ember.isNone(availableModes) && availableModes.length > 0) {
        this.set('_selectedMode', availableModes[0].name);
      }
    }

    /**
      Component's action invoking when dialog starts to show.

      @method sendingActions.beforeShow
    */

    /**
      Component's action invoking when dialog starts to hide.

      @method sendingActions.beforeHide
    */

    /**
      Component's action invoking when dialog is shown.

      @method sendingActions.show
    */

    /**
      Component's action invoking when dialog is hidden.

      @method sendingActions.hide
    */

    /**
      Component's action invoking when dialog is approved.

      @method sendingActions.approve
    */

    /**
      Component's action invoking when dialog is denied.

      @method sendingActions.deny
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGoToMapCommandDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGoToMapCommandDialogComponent;
