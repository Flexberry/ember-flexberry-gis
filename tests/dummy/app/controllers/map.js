import EditFormController from 'ember-flexberry/controllers/edit-form';
import draggingTool from 'ember-flexberry-gis/maptools/dragging';
const { getOwner } = Ember;

export default EditFormController.extend({
  actions: {
    updateCenter(e) {
      let center = e.target.getCenter();
      this.set('model.lat', center.lat);
      this.set('model.lng', center.lng);
    },

    leafletMapDidInit(leafletMap) {
      this.set('leafletMap', leafletMap);
    }
  }
});
