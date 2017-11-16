/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/manual';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-manual').
  @readonly
  @static

  @for FlexberryGeometryAddModeManualComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-manual';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog'
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

  _dialogHasBeenRequested: false,

  _dialogVisible: false,

  /**
    Added coordinates.
  */
  _coordinates: null,

  _coordinatesWithError: null,

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

      this.sendAction('complete', addedLayer);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny(e) {
      this.set('_coordinates', null);
      this.set('_coordinatesWithError', null);
    }
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
      this.set('_coordinatesWithError', false);
    }

    return result;
  },

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeManualComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeManualComponent;
