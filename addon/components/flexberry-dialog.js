/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../mixins/required-actions';
import DomActionsMixin from '../mixins/dom-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import DynamicProxyActionsMixin from '../mixins/dynamic-proxy-actions';
import DynamicComponentsMixin from '../mixins/dynamic-components';
import layout from '../templates/components/flexberry-dialog';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-dialog').
  @property {String} flexberryClassNames.header Component's header block CSS-class name ('flexberry-dialog-header').
  @property {String} flexberryClassNames.content Component's content block CSS-class name ('flexberry-dialog-content').
  @property {String} flexberryClassNames.toolbar Component's toolbar block CSS-class name ('flexberry-dialog-toolbar').
  @property {String} flexberryClassNames.approveButton Component's approve button CSS-class name ('flexberry-dialog-approve-button').
  @property {String} flexberryClassNames.cancelButton Component's cancel button CSS-class name ('flexberry-dialog-cancel-button').
  @property {String} flexberryClassNames.closeButton Component's close button CSS-class name ('flexberry-dialog-close-button').
  @readonly
  @static

  @for FlexberryDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  header: flexberryClassNamesPrefix + '-header',
  content: flexberryClassNamesPrefix + '-content',
  toolbar: flexberryClassNamesPrefix + '-toolbar',
  approveButton: flexberryClassNamesPrefix + '-approve-button',
  cancelButton: flexberryClassNamesPrefix + '-cancel-button',
  closeButton: flexberryClassNamesPrefix + '-close-button'
};

/**
  Flexberry dialog component with [Semantic UI modal style](http://semantic-ui.com/modules/modal.html).

  @class FlexberryDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DomActionsMixin
  @uses DynamicPropertiesMixin
  @uses DynamicActionsMixin
  @uses DynamicProxyActionsMixin
  @uses DynamicComponentsMixin
*/
let FlexberryDialogComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DomActionsMixin,
  DynamicPropertiesMixin,
  DynamicActionsMixin,
  DynamicProxyActionsMixin,
  DynamicComponentsMixin, {

  /**
    Component's required actions names.
    For actions enumerated in this array an assertion exceptions will be thrown,
    if actions handlers are not defined for them.

    @property _requiredActions
    @type String[]
    @default ['approve', 'cancel']
  */
  _requiredActionNames: ['approve', 'cancel'],

  _dialog: null,

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
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-ddau-checkbox class="toggle" value=model.flag change=(action "onModelFlagChange")}}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-checkbox', 'ui', 'checkbox']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'modal'],

  /**
    Component's caption.

    @property caption
    @type String
    @default null
  */
  caption: null,

  /**
    Component's content.

    @property content
    @type String
    @default null
  */
  content: null,

  /**
    Component's approve button caption.

    @property approveButtonCaption
    @type String
    @default t('components.flexberry-dialog.approve-button-caption')
  */
  approveButtonCaption: t('components.flexberry-dialog.approve-button-caption'),

  /**
    Component's deny button caption.

    @property denyButtonCaption
    @type String
    @default t('components.flexberry-dialog.deny-button-caption')
  */
  denyButtonCaption: t('components.flexberry-dialog.deny-button-caption'),

  /**
    Component's vertical offset to allow for content outside of dialog, for example a close button, to be centered.

    @property offset
    @type Number
    @default 0
  */
  offset: 0,

  /**
    Flag: indicates whether component is detachable.
    If set to false, it will prevent the component from being moved to inside the dimmer.

    @property detachable
    @type Boolean
    @default true
  */
  detachable: true,

  /**
    Flag: indicates whether component should observer changes.
    Whether any change in component's DOM should automatically refresh cached positions.

    @property observeChanges
    @type Boolean
    @default true
  */
  observeChanges: true,

  /**
    Flag: indicates whether multiple dialogs are allowed at the same time.

    @property allowMultiple
    @type Boolean
    @default false
  */
  allowMultiple: false,

  /**
    Flag: indicates whether dialog is closable (can be closed on it's dimmer click).

    @property allowMultiple
    @type Boolean
    @default false
  */
  closable: false,

  /**
    Component's transition animation name.

    @property duration
    @type String
    @default 'scale'
  */
  transition:'scale',

  /**
    Component's animation duration (in milliseconds).

    @property duration
    @type Number
    @default 400
  */
  duration: 400,

  /**
    Flag: indicates whether dialog is visible or not.
    If true, then dialog will be shown, otherwise dialog will be closed.

    @property visible
    @type Boolean
    @default false
  */
  visible: false,

  /**
    Observes {{#crossLink "FlexberryDialogComponent/visible:property"}}'visible' property{{/crossLink}}.
    Shows dialog if property is true, otherwise hides dialog.

    @method _visibleDidChange
    @private
  */
  _visibleDidChange: Ember.observer('visible', function() {
    let $dialog = this.get('_dialog');
    if (Ember.isNone($dialog)) {
      return;
    }

    if (this.get('visible')) {
      $dialog.modal('show');
    } else {
      $dialog.modal('hide');
    }
  }),

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI modal.
    let $dialog = this.$().modal({
      offset: this.get('offset'),
      detachable: this.get('detachable'),
      observeChanges: this.get('observeChanges'),
      allowMultiple: this.get('allowMultiple'),
      closable: this.get('closable'),
      transition: this.get('transition'),
      duration: this.get('duration'),
      onVisible: () => {
        return this.sendAction('show');
      },
      onHidden: () => {
        return this.sendAction('hide');
      },
      onApprove: () => {
        return this.sendAction('approve');
      },
      onDeny: () => {
        return this.send('deny');
      }
    });

    this.set('_dialog', $dialog);
    this._visibleDidChange();
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    let $dialog = this.get('_dialog');
    if (Ember.isNone($dialog)) {
      return;
    }

    // Destroys Semantic UI modal.
    $dialog.modal('destroy');
  },

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
FlexberryDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryDialogComponent;
