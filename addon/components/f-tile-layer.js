import TileLayer from 'ember-leaflet/components/tile-layer';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';

export default TileLayer.extend(DynamicPropertiesMixin, {
  init() {
    this._super(...arguments);
    this.initDynamicProperties();
  }
});
