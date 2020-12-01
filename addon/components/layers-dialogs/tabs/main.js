import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../../mixins/dynamic-properties';
import FlexberryBoundingboxMapLoaderMixin from '../../../mixins/flexberry-boundingbox-map-loader';
import layout from '../../../templates/components/layers-dialogs/tabs/main';
import {
  translationMacro as t
} from 'ember-i18n';

export default Ember.Component.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin,
  FlexberryBoundingboxMapLoaderMixin, {
  /**
    Reference to component's template.
  */
  layout,

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property classNames
    @type Array
    @default ['layers-dialogs-data-tabs']
  */
  classNames: ['layers-dialogs-data-tabs'],

  /***
    Indicates that boundingBox component's map is loading.

    @property _bboxMapIsLoading
    @type Boolean
    @default false
  */
  _bboxMapIsLoading: false,

  /**
    Map model fot bounding box component.

    @property boundingBoxComponentMap
    @type Object
    @default null
  */
  boundingBoxComponentMap: null,

  /**
    Dialog's 'Bounds' segment's caption.

    @property boundsSegmentCaption
    @type String
    @default t('components.layers-dialogs.edit.bounds-segment.caption')
  */
  boundsSegmentCaption: t('components.layers-dialogs.edit.bounds-segment.caption'),

  /**
    Dialog's 'Bounds' segment's WGS84 option caption.

    @property wgs84bboxCaption
    @type String
    @default t('components.layers-dialogs.edit.bounds-segment.options.wgs84bbox.caption')
  */
  wgs84bboxCaption: t('components.layers-dialogs.edit.bounds-segment.options.wgs84bbox.caption'),

  /**
    Dialog's 'Bounds' segment's BBOX option caption.

    @property bboxCaption
    @type String
    @default t('components.layers-dialogs.edit.bounds-segment.options.bbox.caption')
  */
  bboxCaption: t('components.layers-dialogs.edit.bounds-segment.options.bbox.caption'),

  /**
    Dialog's 'Bounds' segment's mode.

    @property boundsMode
    @type String
    @default "wgs84bbox"
  */
  boundsMode: 'wgs84bbox',

  /**
    Flag: indicates whether to show bounds error message or not.

    @property _showBoundsErrorMessage
    @type Boolean
    @readOnly
  */
  _showBoundsErrorMessage: false,

  /**
    Currently active tab name.

    @property _activeTab
    @type String
    @default 'links-tab'
    @private
  */
  _activeTab: 'main-tab',

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.set('_mainGroupIsAvailableForType', this.get('mainGroupIsAvailableForType'));
    let _this = this;
    this.set('_bboxMapIsLoading', true);

    this.getBoundingBoxComponentMapModel().then(result => {
      _this.set('boundingBoxComponentMap', result);
      _this.set('_bboxMapIsLoading', false);
    });
    this.set('_activeTab', 'main-tab');
  },

  actions: {
    /**
      Handles clicks on tabs.

      @method actions.onTabClick
      @param {Object} e Click event object.
    */
    onTabClick(e) {
      e = Ember.$.event.fix(e);

      let $clickedTab = Ember.$(e.currentTarget);
      let clickedTabName = $clickedTab.attr('data-tab');

      this.set('_activeTab', clickedTabName);
    },

    /**
      Handles bounding box changes.

      @method actions.onBoundingBoxChange
    */
    onBoundingBoxChange(e) {
      this.set('_layer.boundingBox', e.bboxGeoJSON);
    },

    /**
      Handles onUploadFile.

      @method actions.onUploadFile
    */
    onUploadFile(file) {
      this.sendAction('onUploadFile', file);
    }
  }
});
