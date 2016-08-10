/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../../mixins/required-actions';
import DynamicPropertiesMixin from '../../mixins/dynamic-properties';
import DynamicActionsMixin from '../../mixins/dynamic-actions';
import DynamicProxyActionsMixin from '../../mixins/dynamic-proxy-actions';
import DynamicComponentsMixin from '../../mixins/dynamic-components';
import layout from '../../templates/components/layers-dialogs/remove-layer';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-remove-layer-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for Layers.Dialogs.RemoveLayerComponent
*/
const flexberryClassNamesPrefix = 'flexberry-remove-layer-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry remove layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class Layers.Dialogs.RemoveLayerComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DynamicPropertiesMixin
  @uses DynamicActionsMixin
  @uses DynamicProxyActionsMixin
  @uses DynamicComponentsMixin
*/
let RemoveLayerComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DynamicPropertiesMixin,
  DynamicActionsMixin,
  DynamicProxyActionsMixin,
  DynamicComponentsMixin, {

  /**
    Flag: indicating whether last user action was "approve" or not.

    @property _isApproved
    @type Boolean
    @default false
    @private
  */
  _isApproved: false,

  /**
    Flag: indicating whether last user action was "deny" or not.

    @property _isDenied
    @type Boolean
    @default false
    @private
  */
  _isDenied: false,

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
    Removing layer name.
    Will be displayed in dialog's content.

    @property name
    @type String
    @default null
  */
  name: null,

  /**
    Flag: indicates whether dialog is visible or not.
    If true, then dialog will be shown, otherwise dialog will be closed.

    @property visible
    @type Boolean
    @default false
  */
  visible: false,

  actions: {
    onApprove() {
      this.set('_isApproved', true);
    },

    onDeny() {
      this.set('_isDenied', false);
    },

    onShow() {
      this.sendAction('show');
    },

    onHide() {
      // Send approve/deny actions.
      // They must be sent after dialog's 'hide' animation complete,
      // otherwise layer (with dialog attached to layer) will be removed earlier then dialog's 'hide' operation complete,
      // which will cause Semantic UI exception.
      if (this.get('_isApproved')) {
        this.sendAction('approve');
      } else if (this.get('_isDenied')) {
        this.sendAction('deny');
      }

      // Clean up flags.
      this.set('_isApproved', false);
      this.set('_isDenied', false);

      // Finally send 'hide' action.
      this.sendAction('hide');
    }
  }

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
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
RemoveLayerComponent.reopenClass({
  flexberryClassNames
});

export default RemoveLayerComponent;
