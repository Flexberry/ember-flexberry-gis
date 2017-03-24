import Ember from 'ember';
import layout from '../templates/components/spatial-bookmark';
import Mixin from 'ember-validations';

let SpaceBookmarkCommandComponent = Ember.Component.extend(Mixin, {
  validations: {
    '_addBookmarkName': {
      presence: true,
      length: { minimum: 1, maximum: 200 }
    }
  },
  layout,
  mapid: null,
  bookmarks: Ember.A(),
  _addBookmarkInProcess: false,
  _addBookmarkName: '',
  init() {
    this._super(...arguments);

    let _this = this;
    _this.set('bookmarks', _this.get('storage-service').getFromStorage(_this.get('mapid')));
  },

  actions: {

    showAddBlock() {
      this.set('_addBookmarkInProcess', true);
    },

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

    resetBookmark() {
      this.set('_addBookmarkInProcess', false);
      this.set('_addBookmarkName', '');
    },

    zoomMap(bookmark) {
      let map = this.get('leafletMap');
      map.setView([bookmark.center.lat, bookmark.center.lng], bookmark.zoom);
    },

    delBookmark(bookmark) {
      let _this = this;
      _this.get('bookmarks').removeObject(bookmark);
      _this.get('storage-service').setToStorage(_this.get('mapid'), _this.get('bookmarks'));
    }
  },

  willDestroyElement() {
    this._super(...arguments);
  },

  willDestroy() {
    this._super(...arguments);
  }
}
);

SpaceBookmarkCommandComponent.reopenClass({
});

export default SpaceBookmarkCommandComponent;
