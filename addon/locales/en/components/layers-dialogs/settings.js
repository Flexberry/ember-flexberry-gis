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
        'date-format-label': 'Data format',
        'date-format-ph': 'DD.MM.YYYY',
        'display-property-is-callback-label': 'Display property is callback',
        'display-property-label': 'Display property',
        'display-property-ph': 'Display property',
        'excluded-properties-label': 'Excluded properties',
        'apply-button-label': 'Apply',
        'translation-label': 'Localized string',
        'translation-ph': 'Localized string',
        'properties-list-heading': 'Avaliable properties',
        'show-prop-heading': 'Show?',
        'locales-list-heading': 'Avaliable locales',
        'no-items-label': 'Nothing to show'
      },

      'identification-settings': 'Can be identified',

      'legend-settings': {
        'legend-can-be-displayed': 'Display legend',
        'geometries-can-be-displayed': 'Display linear & polygonal objects on legend',
        'markers-can-be-displayed': 'Display point objects on legend',
        'url': 'URL',
        'version': 'Version',
        'format': 'Format',
        'layers': 'Layers'
      }
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
