import Wms from './settings/wms';
import Wfs from './settings/wfs';
import WmsWfs from './settings/wms-wfs';
import GeoJson from './settings/geojson';

export default {
  'group': {
  },

  'tile': {
    'url-textbox': {
      'caption': 'Url'
    }
  },

  'wms': Wms,

  'wms-single-tile': Wms,

  'wfs': Wfs,

  'wms-wfs': WmsWfs,

  'geojson': GeoJson,

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
      'caption': 'Autocomplete Url'
    }
  }
};
