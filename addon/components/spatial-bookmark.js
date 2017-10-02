/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/spatial-bookmark';
import Mixin from 'ember-validations';

/**
  Flexberry component for display and add/remove spatial bookmarks

  @class SpatialBookmarkComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let SpatialBookmarkComponent = Ember.Component.extend(Mixin, {
  /**
    Validation settings
  */
  validations: {
    '_addBookmarkName': {
      presence: true,
      length: {
        minimum: 1,
        maximum: 200
      }
    }
  },

  /**
    Reference to component's template.
  */
  layout,

  /**
    Map's id (primarykey). Key for storage.

    @property storageKey
    @type string
    @default null
    @public
  */
  storageKey: null,

  /**
    Bookmarks array

    @property bookmarks
    @type array
    @private
  */
  bookmarks: Ember.A(),

  /**
    Flag: indicates whether "add bookmark" block is visible

    @property _addBookmarkInProcess
    @type boolean
    @private
  */
  _addBookmarkInProcess: false,

  /**
    New bookmark's name

    @property _addBookmarkName
    @type string
    @private
  */
  _addBookmarkName: '',

  /**
    Current instance class name for storage.

    @property storageClassName
    @type string
    @default 'bookmarks'
    @private
  */
  _storageClassName: 'bookmarks',

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let service = this.get('local-storage-service');
    let className = this.get('_storageClassName');
    let key = this.get('storageKey');

    this.set('bookmarks', service.getFromStorage(className, key));
  },

  actions: {
    /**
      Show "add bookmark" block

      @method showAddBlock
      @private
    */
    showAddBlock() {
      this.set('_addBookmarkInProcess', true);
    },

    /**
      Create and save new bookmark

      @method addBookmark
      @private
    */
    addBookmark() {
      if (!this.get('isValid')) {
        return;
      }

      let map = this.get('leafletMap');
      let service = this.get('local-storage-service');
      let className = this.get('_storageClassName');
      let key = this.get('storageKey');
      let bookmarks = this.get('bookmarks');
      let bookmark = {
        name: this.get('_addBookmarkName'),
        center: map.getCenter(),
        zoom: map.getZoom()
      };

      bookmarks.pushObject(bookmark);
      service.setToStorage(className, key, bookmarks);

      this.set('bookmarks', bookmarks);
      this.set('_addBookmarkInProcess', false);
      this.set('_addBookmarkName', '');
    },

    /**
      Hide "add bookmark" block

      @method resetBookmark
      @private
    */
    resetBookmark() {
      this.set('_addBookmarkInProcess', false);
      this.set('_addBookmarkName', '');
    },

    /**
      Go to selected bookmark

      @method zoomMap
      @private
    */
    zoomMap(bookmark) {
      let map = this.get('leafletMap');
      map.setView([bookmark.center.lat, bookmark.center.lng], bookmark.zoom);
    },

    /**
      Remove selected bookmark

      @method delBookmark
      @private
    */
    delBookmark(bookmark) {
      let bookmarks = this.get('bookmarks');
      let service = this.get('local-storage-service');
      let className = this.get('_storageClassName');
      let key = this.get('storageKey');

      bookmarks.removeObject(bookmark);
      service.setToStorage(className, key, bookmarks);

      this.set('bookmarks', bookmarks);
    }
  }
});

SpatialBookmarkComponent.reopenClass({});

export default SpatialBookmarkComponent;
