/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/rhumb';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.dialog Component's inner dialog CSS-class name ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-geometry-add-mode-manual').
  @readonly
  @static

  @for FlexberryGeometryAddModeManualComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-manual';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog',
  form: flexberryClassNamesPrefix + '-form'
};

let FlexberryGeometryAddModeManualComponent = Ember.Component.extend({
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
    Flag indicates whether manual geometry adding dialog has been already requested by user or not.

    @property _dialogHasBeenRequested
    @type Boolean
    @default false
    @private
  */
  _dialogHasBeenRequested: false,

  /**
    Flag indicates whether to show manual geometry adding dialog.

    @property _dialogVisible
    @type Boolean
    @default false
    @private
  */
  _dialogVisible: false,

  /**
    Added coordinates.

    @property _coordinates
    @type String
    @default null
    @private
  */
  _coordinates: null,

  /**
    Flag indicates that entered coordinates has invalid format or is emty.

    @property _coordinatesWithError
    @type Boolean
    @default false
    @private
  */
  _coordinatesWithError: false,

  /**
    Flag for editing dialog rhumb.

    @property _dialogRhumbVisible
    @type Boolean
    @default false
    @private
  */
 _dialogRhumbVisible: false,

   /**
    Flag indicates whether manual geometry adding dialog rhumb has been already requested by user or not.

    @property _dialogRhumbHasBeenRequested
    @type Boolean
    @default false
    @private
  */
 _dialogRhumbHasBeenRequested: false,

  menuButtonTooltip: t('components.geometry-add-modes.manual.menu-button-tooltip'),

  menuRhumbButtonTooltip: t('components.geometry-add-modes.manual.menu-button-rhumb-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.manual.dialog-approve-button-caption'),

  dialogRhumbApproveButtonCaption: t('components.geometry-add-modes.manual.dialog-approve-rhumb-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.manual.dialog-deny-rhumb-button-caption'),

  dialogRhumbDenyButtonCaption: t('components.geometry-add-modes.manual.dialog-deny-button-caption'),

  crsFieldLabel: t('components.geometry-add-modes.manual.crs-field-label'),

  geometryFieldLabel: t('components.geometry-add-modes.manual.geometry-field-label'),

  coordinatesFieldLabel: t('components.geometry-add-modes.manual.coordinates-field-label'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.manual.coordinates-field-placeholder'),

  actions: {
    /**
      Handles button click.
    */
    onButtonClick() {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeManualComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      let parsedCoordinates = this.parseCoordinates();
      if (Ember.isNone(parsedCoordinates)) {
        // Prevent dialog from being closed.
        e.closeDialog = false;

        return;
      }

      // create a polygon with provided coordinates
      let addedLayer = L.polygon(parsedCoordinates);
      this.set('_coordinates', null);
      this.set('_coordinatesWithError', null);

      this.sendAction('complete', addedLayer, { panToAddedObject: true });
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny(e) {
      this.set('_coordinates', null);
      this.set('_coordinatesWithError', null);
    },


    /**
      Open dialogue edit rumba.

      @method onOpenDialogRhumb
    */
    onOpenDialogRhumb() {
      this.set('_dialogRhumbHasBeenRequested', true);
      this.set('_dialogRhumbVisible', true);
    },

    onRhumbApprove(e) {

    },

    onRhumbDeny(e) {

    },

  },

  /**
    Parses coordinates.

    @method parseCoordinates
    @return {Object} Parsed coordinates if it is valid or null.
  */
  parseCoordinates() {
    let coordinates = this.get('_coordinates');
    let result = null;

    if (Ember.isNone(coordinates)) {
      this.set('_coordinatesWithError', true);
    } else {
      let lines = coordinates.split('\n');
      lines.forEach((line) => {
        let check = line.match(/(.*) (.*)/);
        if (!check) {
          this.set('_coordinatesWithError', true);
          return null;
        }

        result = result || [];
        result.push([check[1], check[2]]);
      });
    }

    if (!Ember.isNone(result)) {
      this.set('_dialogRhumbVisible', true);
    }

    return result;
  },

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
    @param {Object} options Actions options.
    @param {Boolean} options.panToAddedObject Flag indicating wheter to pan to added object.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeManualComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeManualComponent;
