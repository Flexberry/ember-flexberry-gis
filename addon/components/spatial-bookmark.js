/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/spatial-bookmark';
import Mixin from 'ember-validations';

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

    let _this = this;
    _this.set('bookmarks', _this.get('storage-service').getFromStorage(_this.get('mapid')));
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
      let _this = this;
      if (!_this.get('isValid')) {
        return;
      }

      let map = _this.get('leafletMap');
      let bookmark = {
        name: _this.get('_addBookmarkName'),
        center: map.getCenter(),
        zoom: map.getZoom()
      };
      _this.get('bookmarks').pushObject(bookmark);
      _this.get('storage-service').setToStorage(_this.get('mapid'), _this.get('bookmarks'));

      _this.set('_addBookmarkInProcess', false);
      _this.set('_addBookmarkName', '');
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
      let _this = this;
      _this.get('bookmarks').removeObject(bookmark);
      _this.get('storage-service').setToStorage(_this.get('mapid'), _this.get('bookmarks'));
    }
  }
});

SpaceBookmarkCommandComponent.reopenClass({
});

export default SpaceBookmarkCommandComponent;
