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
      },

      'labels-settings':{
        'sign-map-objects-label': 'Sign map objects',
        'field-caption': 'Layer\'s attributes',
        'no-fields': 'Fields isn\'t loaded',
        'label': 'Label',
        'font-caption': 'Font',
        'location-caption': 'Location',
        'scale-range-caption': 'Visibility within scale',
        'availableLineLocation': {
          'over': 'Over the line',
          'along': 'Along the line',
          'under': 'Under the line'
        },
        'error': 'The layer must be added to the map'
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

  'tile-vector': {
    'url-textbox': {
      'caption': 'Url'
    },
    'layerName-textbox': {
      'caption': 'Name layer'
    }
  },

  'wms': Wms,

  'wms-single-tile': Wms,

  'wfs': Wfs,

  'wms-wfs': WmsWfs,

  'geojson': GeoJson,

  'kml': Kml,

  'odata-vector': {
    'model-name-textbox': {
      'caption': 'ModelName'
    },
    'projection-name-textbox': {
      'caption': 'Projection'
    },
    'geometry-field-textbox': {
      'caption': 'Geometry field'
    },
    'geometry-type-textbox': {
      'caption': 'Geometry type'
    },
    'min-zoom': {
      'caption': 'Min zoom'
    },
    'max-zoom': {
      'caption': 'Max zoom'
    }
  },

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
  },

  'combine': {
    'main-settings-caption': 'Main layer settings ',
    'inner-settings-caption': 'Settings ',
    'type-dropdown': 'Layer type',
    'add-button-caption': 'Add'
  }
};
