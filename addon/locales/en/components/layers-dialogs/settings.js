import Wms from './settings/wms';
import Wfs from './settings/wfs';
import WmsWfs from './settings/wms-wfs';
import GeoJson from './settings/geojson';
import Kml from './settings/kml';

export default {
  'group': {
    'tab': {
      'search-settings': {
        'can-be-context-searched-label': 'Can be context-searched',
        'can-be-searched-label': 'Can be searched',
        'search-fields-selector': 'Fields to search within',
        'context-search-fields-selector': 'Fields to context-search within'
      },

      'legend-settings':{
        'legend-can-be-displayed': 'Legend can be displayed',
        'url': 'URL',
        'version': 'Version',
        'format': 'Format',
        'layers': 'Layers'
      },

      'identification-settings': 'Can be identified'
    }
  },

  'tile': {
    'url-textbox': {
      'caption': 'Url'
    },
    'no-wrap-checkbox': {
      'caption': 'Layer\'s noWrap property'
    }
  },

  'wms': Wms,

  'wms-single-tile': Wms,

  'wfs': Wfs,

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
      'caption': 'Autocomplete Url'
    }
  }
};
