/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/spatial-bookmark';
import Mixin from 'ember-validations';

/**
  Flexberry component for display and add/remove spatial bookmarks

  @class SpaceBookmarkCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let SpaceBookmarkCommandComponent = Ember.Component.extend(Mixin, {
  /**
    Validation settings
  */
  validations: {
    '_addBookmarkName': {
      presence: true,
      length: { minimum: 1, maximum: 200 }
    }
  },

  /**
    Reference to component's template.
  */
  layout,

  /**
    Map's id (primarykey). Key for store bookmarks

    @property mapid
    @type string
    @public
  */
  mapid: null,

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

  init() {
    this._super(...arguments);

    this.set('bookmarks', this.get('storage-service').getFromStorage(this.get('mapid')));
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
      let bookmark = {
        name: this.get('_addBookmarkName'),
        center: map.getCenter(),
        zoom: map.getZoom()
      };
      this.get('bookmarks').pushObject(bookmark);
      this.get('storage-service').setToStorage(this.get('mapid'), this.get('bookmarks'));

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
      this.get('bookmarks').removeObject(bookmark);
      this.get('storage-service').setToStorage(this.get('mapid'), this.get('bookmarks'));
    }
  }
});

SpaceBookmarkCommandComponent.reopenClass({
});

export default SpaceBookmarkCommandComponent;
