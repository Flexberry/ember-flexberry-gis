import Wms from './settings/wms';
import Wfs from './settings/wfs';
import WmsWfs from './settings/wms-wfs';
import GeoJson from './settings/geojson';
import Kml from './settings/kml';

export default {
  'group': {
  },

  'tile': {
    'url-textbox': {
      'caption': 'Url'
    }
  },

  'wms': Wms,

  'wfs': Wfs,

  'wms-single-tile': Wms,

  'wms-wfs': WmsWfs,

  'geojson': GeoJson,

  'kml': Kml,

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
