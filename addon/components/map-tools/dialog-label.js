/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/dialog-label';
import { translationMacro as t } from 'ember-i18n';

/**
  Constants representing default label options.
*/
const defaultLabel = {
  labelText: null,
  labelFontSize: '12',
  labelColor: '#000000',
  labelFontWeight: 'normal',
  labelFontStyle: 'normal',
  labelFontDecoration: 'none',
  style: ''
};

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Hash containing label text and options.

    @property label
    @type Object
    @default null
    @private
  */
  label: null,

  /**
    Hash containing temporary label. Need, when first time click checkbox, because label becomes underfined.

    @property label
    @type Object
    @default null
    @private
  */
  _tempLabel: null,

  /**
    Available font sizes.

    @property _availableFontSizes
    @type String[]
    @default null
    @private
  */
  _availableFontSizes: null,

  /**
    Flag: indicates whether to sign with coordinates

    @property signWithCoord
    @type Boolean
    @default false
    @private
  */
  signWithCoord: true,

  /**
    Flag: indicates whether to show to sign with coordinates

    @property forMarkerIsVisible
    @type Boolean
    @default false
    @private
  */
  forMarkerIsVisible: false,

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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Same situation with available font sizes.
    this.set('_availableFontSizes', Ember.A(['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72']));
    this.set('label', Ember.$.extend(true, {}, defaultLabel));
    this.set('signWithCoord', false);
  },

  didUpdateAttrs(){
    //Need, when first time click checkbox, because label becomes underfined.
    if (Ember.isNone(this.get('label'))) {
      this.set('label', this.get('_tempLabel'));
    }
  },

  actions: {
    showCheckboxDidChange(e){
      //Need, when first time click checkbox, because label becomes underfined.
      this.set('_tempLabel', this.get('label'));
    },
    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onColorChange
    */
    onColorChange(e) {
      this.set('label.labelColor', e.newValue);
    },

    /**
      Handler for bold font button's 'click' action.

      @method actions.onBoldFontButtonClick
    */
    onBoldFontButtonClick() {
      let previousFontWeight = this.get('label.labelFontWeight');
      this.set('label.labelFontWeight', previousFontWeight !== 'bold' ? 'bold' : 'normal');
    },

    /**
      Handler for italic font button's 'click' action.

      @method actions.onItalicFontButtonClick
    */
    onItalicFontButtonClick() {
      let previousFontWeight = this.get('label.labelFontStyle');
      this.set('label.labelFontStyle', previousFontWeight !== 'italic' ? 'italic' : 'normal');
    },

    /**
      Handler for underline font button's 'click' action.

      @method actions.onUnderlineFontButtonClick
    */
    onUnderlineFontButtonClick() {
      let previousFontWeight = this.get('label.labelFontDecoration');
      this.set('label.labelFontDecoration', previousFontWeight !== 'underline' ? 'underline' : 'none');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

      @method actions.onBeforeShow
    */
    onBeforeShow() {
      this.sendAction('beforeShow');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

      @method actions.onShow
    */
    onShow() {
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
      this.set('label', Ember.$.extend(true, {}, defaultLabel));
      this.set('signWithCoord', false);
      this.sendAction('hide');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      if (Ember.isNone(this.get('label.labelText')) &&
          this.get('signWithCoord') === false) {
        // Prevent dialog from being closed.
        e.closeDialog = false;
        return;
      }

      let style = Ember.String.htmlSafe(
        `font-size: ${this.get('label.labelFontSize')}px; ` +
        `font-weight: ${this.get('label.labelFontWeight')}; ` +
        `font-style: ${this.get('label.labelFontStyle')}; ` +
        `text-decoration: ${this.get('label.labelFontDecoration')}; ` +
        `color: ${this.get('label.labelColor')}; `);

      this.set('label.style', style);
      this.sendAction('approve', this.get('label'), this.get('signWithCoord'));
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny() {
      this.sendAction('deny', this.get('label'), this.get('signWithCoord'));
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
});
