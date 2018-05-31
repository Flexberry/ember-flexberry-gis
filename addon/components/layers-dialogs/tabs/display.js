import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../../mixins/dynamic-properties';
import FlexberryBoundingboxMapLoaderMixin from '../../../mixins/flexberry-boundingbox-map-loader';
import layout from '../../../templates/components/layers-dialogs/tabs/display';
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

  /**
    Currently active tab name.

    @property _activeTab
    @type String
    @default 'links-tab'
    @private
  */
  _activeTab: 'display-tab',

  /**
    Map model fot bounding box component.

    @property boundingBoxComponentMap
    @type Object
    @default null
  */
  boundingBoxComponentMap: null,

  /**
    Indicates that boundingBox component's map is loading.

    @property _bboxMapIsLoading
    @type Boolean
    @default false
  */
  _bboxMapIsLoading: false,

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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let _this = this;
    this.getBoundingBoxComponentMapModel().then(result => {
      _this.set('boundingBoxComponentMap', result);
    });

    this.set('_activeTab', 'display-tab');
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
      Handles coordinate input textboxes keyPress events.

      @method actions.coordsInputKeyPress
    */
    coordsInputKeyPress(e) {
      // Allow only numeric (with dot) and Delete, Insert, Print screen buttons.
      if (e.which !== 45 && e.which !== 44 && e.which !== 46 && (e.which < 48 || e.which > 57)) {
        return false;
      }
    }
  }
});
