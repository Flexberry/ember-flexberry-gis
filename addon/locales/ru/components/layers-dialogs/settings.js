import WMS from './settings/wms';
import WFS from './settings/wfs';

export default {
  'group': {
  },

  'tile': {
    'url-textbox': {
      'caption': 'Url'
    }
  },

  'wms': WMS,

  'wfs': WFS,

  'wms-single-tile': WMS,

  'geocoder-osm-overpass': {
    'url-textbox': {
      'caption': 'Url'
    }
  },

  'geocoder-osm-ru': {
    'url-textbox': {
      'caption': 'Url'
    },
    'autocomplete-url-textbox': {
      'caption': 'Url для автокомплита'
    }
  }
};
