/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';

import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import layout from '../templates/components/spatial-bookmark';

/**
  Validation rules
*/
const Validations = buildValidations({
  _addBookmarkName: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200,
    })
  ],
});

/**
  Flexberry component for display and add/remove spatial bookmarks

  @class SpatialBookmarkComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
const SpatialBookmarkComponent = Component.extend(Validations, {
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
  bookmarks: A(),

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

    const service = this.get('local-storage-service');
    const className = this.get('_storageClassName');
    const key = this.get('storageKey');

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
      if (!this.get('validations.isValid')) {
        return;
      }

      const map = this.get('leafletMap');
      const service = this.get('local-storage-service');
      const className = this.get('_storageClassName');
      const key = this.get('storageKey');
      const bookmarks = this.get('bookmarks');
      const bookmark = {
        name: this.get('_addBookmarkName'),
        center: map.getCenter(),
        zoom: map.getZoom(),
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
      const map = this.get('leafletMap');
      map.setView([bookmark.center.lat, bookmark.center.lng], bookmark.zoom);
    },

    /**
      Remove selected bookmark

      @method delBookmark
      @private
    */
    delBookmark(bookmark) {
      const bookmarks = this.get('bookmarks');
      const service = this.get('local-storage-service');
      const className = this.get('_storageClassName');
      const key = this.get('storageKey');

      bookmarks.removeObject(bookmark);
      service.setToStorage(className, key, bookmarks);

      this.set('bookmarks', bookmarks);
    },
  },
});

SpatialBookmarkComponent.reopenClass({});

export default SpatialBookmarkComponent;
