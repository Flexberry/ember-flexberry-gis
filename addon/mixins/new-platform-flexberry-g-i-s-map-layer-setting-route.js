import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    renderMainTemplate(layerType, renderInto) {
      let templateName = 'new-platform-flexberry-g-i-s-map-layer-unknown';
      switch(layerType) {
        case 'tile':
          templateName = 'new-platform-flexberry-g-i-s-map-layer-tile';
          break;
        case 'wms':
          templateName = 'new-platform-flexberry-g-i-s-map-layer-wms';
          break;
      }

      this.render(templateName, {
        outlet: 'new-platform-flexberry-g-i-s-map-layer-setting-outlet',
        into: renderInto
      });
    }
  }
});
