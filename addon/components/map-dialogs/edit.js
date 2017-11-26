/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../mixins/dynamic-properties';
import FlexberryBoundingboxMapLoaderMixin from '../../mixins/flexberry-boundingbox-map-loader';
import layout from '../../templates/components/map-dialogs/edit';
import { getBounds } from 'ember-flexberry-gis/utils/get-bounds-from-polygon';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-map-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-edit-map').
  @readonly
  @static

  @for FlexberryEditMapDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-map-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  form: 'flexberry-edit-map'
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
  DynamicPropertiesMixin,
  FlexberryBoundingboxMapLoaderMixin, {
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
      Dialog's 'Main settings' tab caption.

      @property mainTabCaption
      @type String
      @default t('components.map-dialogs.edit.mainTab.caption')
    */
    mainTabCaption: t('components.map-dialogs.edit.mainTab.caption'),

    /**
      Dialog's 'Coordinate system' tab caption.

      @property crsTabCaption
      @type String
      @default t('components.map-dialogs.edit.crsTab.caption')
    */
    crsTabCaption: t('components.map-dialogs.edit.crsTab.caption'),

    /**
      Dialog's 'Position' tab caption.

      @property positionTabCaption
      @type String
      @default t('components.map-dialogs.edit.positionTab.caption')
    */
    positionTabCaption: t('components.map-dialogs.edit.positionTab.caption'),

    /**
      Dialog's 'Borders settings' tab caption.

      @property bordersTabCaption
      @type String
      @default t('components.map-dialogs.edit.bordersTab.caption')
    */
    bordersTabCaption: t('components.map-dialogs.edit.bordersTab.caption'),

    /**
      Array of posible scale values.

      @property scales
      @type Array
      @default [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]
    */
    scales: Ember.A([500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]),

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
      Map model fot bounding box component.

      @property boundingBoxComponentMap
      @type Object
      @default null
    */
    boundingBoxComponentMap: null,

    /**
      Inner hash containing editing map model.

      @property _mapModel
      @type Object
      @default null
    */
    _mapModel: null,

    /**
     * Active tab name.
     */
    _activeTab: 'main-tab',

    /**
      Indicates that boundingBox component's map is loading.

      @property _bboxMapIsLoading
      @type Boolean
      @default false
    */
    _bboxMapIsLoading: false,

    actions: {
      /**
        Handles scale input keyDown action.

        @method actions.scaleInputKeyDown
      */
      scaleInputKeyDown(e) {
        let key = e.which;

        // Allow only numbers, backspace, arrows, etc.
        return (key === 8 || key === 9 || key === 46 || (key >= 37 && key <= 40) ||
          (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
      },

      /**
       * Handles click on a tab.

       * @method actions.onTabClick
       * @param {Object} e Click event object.
       */
      onTabClick(e) {
        e = Ember.$.event.fix(e);

        let $clickedTab = Ember.$(e.currentTarget);
        let clickedTabName = $clickedTab.attr('data-tab');

        this.set('_activeTab', clickedTabName);
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryRemoveMapDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

        @method actions.onApprove
      */
      onApprove() {
        let mapModel = Ember.$.extend(true, {}, this.get('_mapModel'));
        let crs = Ember.get(mapModel, 'coordinateReferenceSystem');
        crs = Ember.$.isEmptyObject(crs) ? null : JSON.stringify(crs);
        Ember.set(mapModel, 'coordinateReferenceSystem', crs);

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

        this._createInnerMap();
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

      /**
        Handles bounding box changes.

        @method actions.onBoundingBoxChange
      */
      onBoundingBoxChange(e) {
        this.set('_mapModel.boundingBox', e.bboxGeoJSON);
      },
    },

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
      let boundingBox = this.get('mapModel.boundingBox');
      let bounds = getBounds(boundingBox);

      crs = Ember.isNone(crs) ? {} : JSON.parse(crs);

      this.set('_mapModel', {
        name: name,
        lat: lat,
        lng: lng,
        zoom: zoom,
        public: isPublic,
        description: description,
        keyWords: keyWords,
        scale: scale,
        coordinateReferenceSystem: crs,
        boundingBox: boundingBox,
        bboxCoords: {
          minLat: bounds.minLat,
          minLng: bounds.minLng,
          maxLat: bounds.maxLat,
          maxLng: bounds.maxLng,
        },
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
      let _this = this;
      this.set('_bboxMapIsLoading', true);

      this.getBoundingBoxComponentMapModel().then(result => {
        _this.set('boundingBoxComponentMap', result);
        _this.set('_bboxMapIsLoading', false);
      });

      this._createInnerMap();
    },

    /**
      Deinitializes component.
    */
    willDestroy() {
      this._super(...arguments);

      this.set('boundingBoxComponentMap', null);
      this._destroyInnerMap();
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
