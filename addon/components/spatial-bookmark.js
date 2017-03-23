import Ember from 'ember';
import layout from '../templates/components/spatial-bookmark';
import { translationMacro as t } from 'ember-i18n';

let SpaceBookmarkCommandComponent = Ember.Component.extend({
    
    layout,

    bookmarks: Ember.A(),
    
    _addBookmarkInProcess: false,
    _addBookmarkName: '',

    didUpdateAttrs() {
        this._super(...arguments);

        let _this = this;
        //_this.set('bookmarks', _this.get('storage-service').get(_this.get('model.id')));
    },

    actions: {

      showAddBlock() {
        this.set('_addBookmarkInProcess', true);
      },

      addBookmark() {
        let _this = this;
        let bookmark = {
          name: _this.get('_addBookmarkName'),
          bounds: _this.get('leafletMap').getBounds()
        };
        _this.get('bookmarks').pushObject(bookmark);
        //_this.get('storage-service').add(_this.get('model.id'), bookmark);
      },

      resetBookmark() {
        this.set('_addBookmarkInProcess', false);
      },

      zoomMap(bookmark) {
        let _this = this;
        let map = _this.get('leafletMap');
        map.fitBounds(Ember.get(bookmark, 'bounds'));
      },

      delBookmark(bookmark) {
        let _this = this;
        _this.get('bookmarks').removeObject(bookmark);
        //_this.get('storage-service').remove(_this.get('model.id'), bookmark);
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
