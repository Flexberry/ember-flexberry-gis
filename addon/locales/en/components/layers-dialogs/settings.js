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
      'display-settings': {
        'date-format-label': 'Date format',
        'display-property-is-callback-label': 'Display property is callback',
        'display-property-label': 'A property to display',
        'excluded-properties-label': 'Excluded properties'
      }
    }
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
