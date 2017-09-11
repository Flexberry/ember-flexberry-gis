/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../../mixins/required-actions';
import DynamicActionsMixin from '../../mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../mixins/dynamic-properties';
import layout from '../../templates/components/map-dialogs/edit';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-map-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryEditMapDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-map-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry edit map modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryEditMapDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DynamicActionsMixin
  @uses DynamicPropertiesMixin
*/
let FlexberryEditMapDialogComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin, {
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
      @default t('components.map-dialogs.edit.caption')
    */
    caption: t('components.map-dialogs.edit.caption'),

    /**
      Dialog's 'approve' button caption.

      @property approveButtonCaption
      @type String
      @default t('components.map-dialogs.edit.approve-button.caption')
    */
    approveButtonCaption: t('components.map-dialogs.edit.approve-button.caption'),

    /**
      Dialog's 'deny' button caption.

      @property denyButtonCaption
      @type String
      @default t('components.map-dialogs.edit.deny-button.caption')
    */
    denyButtonCaption: t('components.map-dialogs.edit.deny-button.caption'),

    /**
      Dialog's 'name' textbox caption.

      @property nameTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.caption')
    */
    nameTextboxCaption: t('components.map-dialogs.edit.name-textbox.caption'),

    /**
      Dialog's 'lat' textbox caption.

      @property latTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.lat')
    */
    latTextboxCaption: t('components.map-dialogs.edit.name-textbox.lat'),

    /**
      Dialog's 'lng' textbox caption.

      @property lngTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.lng')
    */
    lngTextboxCaption: t('components.map-dialogs.edit.name-textbox.lng'),

    /**
      Dialog's 'zoom' textbox caption.

      @property zoomTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.zoom')
    */
    zoomTextboxCaption: t('components.map-dialogs.edit.name-textbox.zoom'),

    /**
      Dialog's 'public' textbox caption.

      @property publicTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.public')
    */
    publicTextboxCaption: t('components.map-dialogs.edit.name-textbox.public'),

    /**
      Dialog's 'description' textbox caption.

      @property descriptionTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.description')
    */
    descriptionTextboxCaption: t('components.map-dialogs.edit.name-textbox.description'),

    /**
      Dialog's 'keyWords' textbox caption.

      @property keyWordsTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.keyWords')
    */
    keyWordsTextboxCaption: t('components.map-dialogs.edit.name-textbox.keyWords'),

    /**
      Dialog's 'scale' textbox caption.

      @property scaleTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.scale')
    */
    scaleTextboxCaption: t('components.map-dialogs.edit.name-textbox.scale'),

    /**
      Dialog's 'coordinateReferenceSystem' textbox caption.

      @property crsTextboxCaption
      @type String
      @default t('components.map-dialogs.edit.name-textbox.crs')
    */
    crsTextboxCaption: t('components.map-dialogs.edit.name-textbox.crs'),

    /**
      Flag: indicates whether dialog is visible or not.
      If true, then dialog will be shown, otherwise dialog will be closed.

      @property visible
      @type Boolean
      @default false
    */
    visible: false,

    /**
      Map model

      @property mapModel
      @type Object
      @default null
    */
    mapModel: null,

    /**
      Inner hash containing editing map model.

      @property _mapModel
      @type Object
      @default null
    */
    _mapModel: null,

    actions: {
      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryRemoveMapDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

        @method actions.onApprove
      */
      onApprove() {
        let mapModel = this.get('_mapModel');

        this.sendAction('approve', {
          mapProperties: mapModel
        });
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditMapDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

        @method actions.onDeny
      */
      onDeny() {
        this.sendAction('deny');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditMapDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

        @method actions.onBeforeShow
      */
      onBeforeShow() {
        this.sendAction('beforeShow');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditMapDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

        @method actions.onBeforeHide
      */
      onBeforeHide() {
        this.sendAction('beforeHide');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditMapDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

        @method actions.onShow
      */
      onShow() {
        this.sendAction('show');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditMapDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

        @method actions.onHide
      */
      onHide() {
        this.sendAction('hide');
      },
    },

    /**
      Observes visibility changes & creates/destroys inner hash containing map copy.

      @method _visibleDidChange
      @private
    */
    _visibleDidChange: Ember.on('init', Ember.observer('visible', function () {
      if (this.get('visible')) {
        this._createInnerMap();
      } else {
        this._destroyInnerMap();
      }
    })),

    /**
      Creates inner hash containing map copy.

      @method _createInnerMap
      @private
    */
    _createInnerMap() {
      let name = this.get('mapModel.name');
      let lat = this.get('mapModel.lat');
      let lng = this.get('mapModel.lng');
      let zoom = this.get('mapModel.zoom');
      let isPublic = this.get('mapModel.public');
      let description = this.get('mapModel.description');
      let keyWords = this.get('mapModel.keyWords');
      let scale = this.get('mapModel.scale');
      let crs = this.get('mapModel.coordinateReferenceSystem');

      this.set('_mapModel', {
        name: name,
        lat: lat,
        lng: lng,
        zoom: zoom,
        public: isPublic,
        description: description,
        keyWords: keyWords,
        scale: scale,
        coordinateReferenceSystem: crs
      });
    },

    /**
      Destroys inner hash containing map copy.

      @method _destroyInnerMap
      @private
    */
    _destroyInnerMap() {
      this.set('_mapModel', null);
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);
    },

    /**
      Initializes component's DOM-related properties.
    */
    didInsertElement() {
      this._super(...arguments);
    },

    /**
      Deinitializes component's DOM-related properties.
    */
    willDestroyElement() {
      this._super(...arguments);
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
FlexberryEditMapDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryEditMapDialogComponent;
