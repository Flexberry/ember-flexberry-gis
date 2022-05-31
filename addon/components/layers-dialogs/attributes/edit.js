/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import { isNone, isBlank } from '@ember/utils';
import { observer, get, set } from '@ember/object';
import Component from '@ember/component';
import {
  translationMacro as t
} from 'ember-i18n';
import layout from '../../../templates/components/layers-dialogs/attributes/edit';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-layer-attributes-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-edit-layer-attributes').
  @readonly
  @static

  @for FlexberryEditLayerAttributesDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-layer-attributes-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  form: 'flexberry-edit-layer-attributes',
};

const FlexberryEditLayerAttributesDialogComponent = Component.extend({
  /**
    If user apply or deny data his made decision.

    @property  _isDecisionMade
    @type Boolean
    @default false
    @private
  */
  _isDecisionMade: false,

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

    @property class
    @type String
    @default t('components.layers-dialogs.edit.caption')
  */
  caption: t('components.layers-dialogs.edit.caption'),

  /**
    Dialog's 'approve' button caption.

    @property approveButtonCaption
    @type String
    @default t('components.layers-dialogs.edit.approve-button.caption')
  */
  approveButtonCaption: t('components.layers-dialogs.edit.approve-button.caption'),

  /**
    Dialog's 'deny' button caption.

    @property denyButtonCaption
    @type String
    @default t('components.layers-dialogs.edit.deny-button.caption')
  */
  denyButtonCaption: t('components.layers-dialogs.edit.deny-button.caption'),

  /**
    Hash containing field names.

    @property fieldNames
    @type Object
    @default null
  */
  fieldNames: null,

  /**
    Hash containing type names related to field names.

    @property fieldTypes
    @type Object
    @default null
  */
  fieldTypes: null,

  /**
    Placeholder for dataPicker.

    @property placeholderDataPicker
    @type String
    @default null
  */
  placeholderDataPicker: null,

  /**
    Hash containing type parsers related to field names.

    @property fieldParsers
    @type Object
    @default null
  */
  fieldParsers: null,

  /**
    Hash containing type validators related to field names.

    @property fieldValidators
    @type Object
    @default null
  */
  fieldValidators: null,

  /**
    Editing object.

    @property data
    @type Object
    @default null
  */
  data: null,

  /**
    Hash containing parsing errors related to field names.

    @property parsingErrors
    @type Object
    @default null
  */
  parsingErrors: null,

  /**
    Flag: indicates whether to display dropdown with choice value.

    @property choiceValueMode
    @type Boolean
    @default false
  */
  choiceValueMode: false,

  /**
    Name of the selected group value.

    @property choiceValue
    @type Boolean
    @default null
  */
  choiceValue: null,

  /**
    List of groups value.

    @property choiceItems
    @type Object[]
    @default null
  */
  choiceItems: null,

  /**
    Array editing objects value.

    @property choiceValueData
    @type Object[]
    @default null
  */
  choiceValueData: null,

  /**
    Observes and handles changes in choiceValue.
    Сomputes editing object.

    @method choiceValueObserver
    @private
  */
  choiceValueObserver: observer('choiceValue', function () {
    const choiceValueData = this.get('choiceValueData');
    const choiceValue = this.get('choiceValue');
    if (!isNone(choiceValue) && !isBlank(choiceValue)) {
      this.set('data', choiceValueData[`${choiceValue}` - 1]);
    } else {
      this.set('data', choiceValueData[`${choiceValueData.length}` - 1]);
    }
  }),

  /**
    Observes and handles changes in choiceValueData.
    Сomputes list 'choiceItems' name editing objects.

    @method choiceValueDataObserver
    @private
  */
  choiceValueDataObserver: observer('choiceValueData', function () {
    const choiceValueData = this.get('choiceValueData');
    if (!isNone(choiceValueData)) {
      const choice = Object.keys(choiceValueData).map((index) => Number(index) + 1);

      // adds empty template
      choice.push('');
      choiceValueData.push(this.get('data'));
      this.set('choiceItems', choice);
    }
  }),

  /**
    Parses data.

    @method parseData
    @return {Object} Parsed data if it is valid or null.
  */
  parseData() {
    const fieldNames = this.get('fieldNames');
    const fieldParsers = this.get('fieldParsers');
    const fieldValidators = this.get('fieldValidators');

    const data = $.extend(true, {}, this.get('data'));
    const parsingErrors = {};
    let dataIsValid = true;

    Array.from(fieldNames).forEach((fieldName) => {
      if (fieldNames.prototype.hasOwnProperty.call(fieldName)) {
        const text = get(data, fieldName);
        const value = fieldParsers[fieldName](text);
        const valueIsValid = fieldValidators[fieldName](value);

        if (valueIsValid) {
          set(data, fieldName, value);
        }

        dataIsValid = dataIsValid && valueIsValid;
        set(parsingErrors, fieldName, !valueIsValid);
      }
    });

    this.set('parsingErrors', parsingErrors);

    return dataIsValid ? data : null;
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    if (this.get('choiceValueMode')) {
      this.choiceValueDataObserver();
    }

    this.set('parsingErrors', {});
  },

  actions: {
    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

      @method actions.onBeforeShow
    */
    onBeforeShow() {
      this.parseData();
      this.set('choiceValue', null);

      this.sendAction('beforeShow');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

      @method actions.onShow
    */
    onShow() {
      this.set('_isDecisionMade', false);
      this.sendAction('show');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

      @method actions.onBeforeHide
    */
    onBeforeHide() {
      this.sendAction('beforeHide');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

      @method actions.onHide
    */
    onHide() {
      const isDecisionMade = this.get('_isDecisionMade');

      this.sendAction('hide');

      if (!isDecisionMade) {
        this.sendAction('deny');
      }
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      const parsedData = this.parseData();
      if (isNone(parsedData)) {
        // Prevent dialog from being closed.
        e.closeDialog = false;

        return;
      }

      this.set('_isDecisionMade', true);
      this.sendAction('approve', parsedData);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny() {
      this.set('_isDecisionMade', true);
      this.sendAction('deny');
    },
  },

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
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryEditLayerAttributesDialogComponent.reopenClass({
  flexberryClassNames,
});

export default FlexberryEditLayerAttributesDialogComponent;
