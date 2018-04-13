import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.modelName = 'new-platform-flexberry-g-i-s-map';
    this.modelProjName = 'MapE';
  },

  getMapPromiseById(mapId) {
    let findRecordParameters = { reload: false, projection: this.modelProjName };
    let store = this.get('store');
    let ret = store.peekRecord(this.modelName, mapId);
//     if (!ret) {
      ret = store.findRecord(this.modelName, mapId, findRecordParameters);
//     }

    return ret;
  }

});
