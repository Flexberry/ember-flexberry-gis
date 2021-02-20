/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../mixins/dynamic-properties';
import FlexberryLinksEditorActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-links-editor-actions-handler';
import FlexberryBaseComponent from 'ember-flexberry/components/flexberry-base-component';
import layout from '../../templates/components/layers-dialogs/edit';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-layer-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryEditLayerDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-layer-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry edit layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryEditLayerDialogComponent
  @extends FlexberryBaseComponent
  @uses RequiredActionsMixin
  @uses DynamicActionsMixin
  @uses DynamicPropertiesMixin
  @uses FlexberryLinksEditorActionsHandlerMixin
*/
let FlexberryEditLayerDialogComponent = FlexberryBaseComponent.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin,
  FlexberryLinksEditorActionsHandlerMixin, {
    /**
      Leaflet layer related to layer model.

      @property _leafletObject
      @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
      @private
    */
    _leafletObject: null,

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
      Layer's links' property path.

      @property linksPropertyPath
      @type String
      @default 'layer.layerLink'
    */
    linksPropertyPath: 'layer.layerLink',

    /**
      Layer's links' model name.

      @property linksModelName
      @type String
      @default 'new-platform-flexberry-g-i-s-layer-link'
    */
    linksModelName: 'new-platform-flexberry-g-i-s-layer-link',

    /**
      Layer's links' parameters model name.

      @property linksParametersModelName
      @type String
      @default 'new-platform-flexberry-g-i-s-link-parameter'
    */
    linksParametersModelName: 'new-platform-flexberry-g-i-s-link-parameter',

    /**
      Layer's links' parameters model projection.

      @property linksParametersModelProjection
      @type String
      @default 'LinkParameterD'
    */
    linksParametersModelProjection: 'LinkParameterD',

    /**
      Kind of injected storage (from component's controller).
      Brokes DDAU, but does not brake your mind.

      @property store
      @type Object
      @readonly
    */
    store: Ember.computed('currentController', function () {
      let controller = this.get('currentController');
      return controller.get('store');
    }),

    actions: {
      /**
        Handles {{#crossLink "FlexberryEditLayerComponent/sendingActions.onInit:method"}}'flexberry-edit-layer' component's 'onInit' action{{/crossLink}}.

        @method actions.initLayerProperties
      */
      initLayerProperties(getLayerProperties) {
        this.set('getLayerProperties', getLayerProperties);
      },

      /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApproveError
      */
      onApproveError() {
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

        @method actions.onApprove
      */
      onApprove() {
        this.sendAction('approve', {
          layerProperties: this.get('getLayerProperties')()
        });
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

        @method actions.onDeny
      */
      onDeny() {
        this.sendAction('deny');
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
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

        @method actions.onBeforeHide
      */
      onBeforeHide() {
        this.sendAction('beforeHide');
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
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

        @method actions.onHide
      */
      onHide() {
        this.sendAction('hide');
      },

      /**
        Handles onUploadFile.

        @method actions.onUploadFile
      */
      onUploadFile(file) {
        this.sendAction('onUploadFile', file);
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
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Hash containing layer properties.
    */

    /**
      Component's action invoking when dialog is denied.

      @method sendingActions.deny
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryEditLayerDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryEditLayerDialogComponent;
