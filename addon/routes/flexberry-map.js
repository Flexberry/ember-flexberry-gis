/**
  @module ember-flexberry-gis
 */

import EditFormRoute from 'ember-flexberry/routes/edit-form';
import FlexberryMapLoadLayersMixin from 'ember-flexberry-gis/mixins/flexberry-map-load-layers';

/**
  Route for show map page, in addition to model also load layers hierarhy
  @class FlexberryMapRoute
  @extends EditFormRoute
  @uses FlexberryMapLoadLayersMixin
 */
export default EditFormRoute.extend(FlexberryMapLoadLayersMixin, {
  modelProjection: 'MapE',
  modelName: 'new-platform-flexberry-g-i-s-map',

  model() {
    return this.loadMapLayers(this._super(...arguments));
  }
});
