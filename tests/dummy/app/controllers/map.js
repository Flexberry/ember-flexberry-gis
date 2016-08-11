import EditFormController from 'ember-flexberry/controllers/edit-form';
import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayer-actions-handler';

export default EditFormController.extend(FlexberryMaplayerActionsHandlerMixin, {
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
