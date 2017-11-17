/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/geoprovider';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-geoprovider').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-geoprovider').
  @property {String} flexberryClassNames.dialog Component's inner dialog CSS-class name ('flexberry-geometry-add-mode-geoprovider').
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-geometry-add-mode-geoprovider').
  @readonly
  @static

  @for FlexberryGeometryAddModeGeoProviderComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-geoprovider';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog',
  form: flexberryClassNamesPrefix + '-form'
};

let FlexberryGeometryAddModeGeoProviderComponent = Ember.Component.extend({
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

  _loading: false,

  address: null,

  provider: null,

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
      Invokes {{#crossLink "FlexberryGeometryAddModeGeoProviderComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {

    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny() {
      this.set('address', null);
      this.set('provider', null);
    }
  }

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
  */
});

FlexberryGeometryAddModeGeoProviderComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeGeoProviderComponent;
