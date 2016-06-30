import Ember from 'ember';
import emberFlexberryTranslations from 'ember-flexberry/locales/en/translations';

const translations = {};
Ember.$.extend(true, translations, emberFlexberryTranslations);

Ember.$.extend(true, translations, {
  'forms': {
    'new-platform-flexberry-g-i-s-map-layer-tile': {
      'url': 'Url',
      'minZoom': 'Min zoom',
      'maxZoom': 'Max zoom',
      'maxNativeZoom': 'Max native zoom',
      'tileSize': 'Tile size',
      'subdomains': 'Subdomains',
      'errorTileUrl': 'Error tile url',
      'attribution': 'Attribution',
      'tms': 'Tms',
      'continuousWorld': 'Continuous world',
      'noWrap': 'No wrap',
      'zoomOffset': 'Zoom offset',
      'zoomReverse': 'Zoom reverse',
      'opacity': 'Opacity',
      'zIndex': 'ZIndex',
      'unloadInvisibleTiles': 'Unload invisible tiles',
      'updateWhenIdle': 'Update when idle',
      'detectRetina': 'Detect retina',
      'reuseTiles': 'Reuse tiles',
      'bounds': 'Bounds'
    },

    'new-platform-flexberry-g-i-s-map-layer-wms': {
      'url': 'Url',
      'layers': 'Layers',
      'styles': 'Styles',
      'format': 'Format',
      'transparent': 'Transparent',
      'version': 'Version',
      'crs': 'Crs'
    },

    'new-platform-flexberry-g-i-s-map-layer-unknown': {
      'unknown-layer': 'Unknown layer type'
    }
  }
});

export default translations;
