import Ember from 'ember';

export default Ember.Service.extend({
  available: false,
  
  getAvailable() {
    try {
        return window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
  },

  init() {
    this._super(...arguments);
    
    let _this = this;
    _this.set('available', _this.getAvailable());
  },

  getFromStorage(map) {
    let bookmarks = Ember.A();
    if (this.get('available')) {
      try {
        var inStore = JSON.parse(localStorage.getItem('bookmarks' + map));
        if (inStore){
            inStore.forEach(function(element) {
                bookmarks.pushObject(element);
            });
        }
      }
      catch(e){ 
      }
    }

    return bookmarks;
  },

  setToStorage(map, bookmarks) {
    if (this.get('available')) {
      localStorage.setItem('bookmarks' + map, JSON.stringify(bookmarks));
    }
  }
});
