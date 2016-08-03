import EditFormRoute from 'ember-flexberry/routes/edit-form';
import FlexberryMapLoadLayersMixin from 'ember-flexberry-gis/mixins/flexberry-map-load-layers';

export default EditFormRoute.extend(FlexberryMapLoadLayersMixin, {
  modelProjection: 'MapE',
  modelName: 'new-platform-flexberry-g-i-s-map',

  model() {
    return this.loadMapLayers(this._super(...arguments));
  }
});
