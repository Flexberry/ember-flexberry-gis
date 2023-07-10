import OfflineGlobals from 'ember-flexberry-gis/services/offline-globals';
export default OfflineGlobals.extend({
  init() {
    this._super(...arguments);
    this.setOnlineAvailable(false);
  }
});
