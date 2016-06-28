import WMSTileLayer from 'ember-leaflet/components/wms-tile-layer';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';

export default WMSTileLayer.extend(DynamicPropertiesMixin, {
  init() {
    this._super(...arguments);
    this.initDynamicProperties();
  }
});
