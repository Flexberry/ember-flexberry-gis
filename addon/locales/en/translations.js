import NewPlatformFlexberryGISLayerLinkModel from './models/new-platform-flexberry-g-i-s-layer-link';
import NewPlatformFlexberryGISLayerMetadataModel from './models/new-platform-flexberry-g-i-s-layer-metadata';
import NewPlatformFlexberryGISLinkMetadataModel from './models/new-platform-flexberry-g-i-s-link-metadata';
import NewPlatformFlexberryGISLinkParameterModel from './models/new-platform-flexberry-g-i-s-link-parameter';
import NewPlatformFlexberryGISMapLayerModel from './models/new-platform-flexberry-g-i-s-map-layer';
import NewPlatformFlexberryGISMapObjectSettingModel from './models/new-platform-flexberry-g-i-s-map-object-setting';
import NewPlatformFlexberryGISMapModel from './models/new-platform-flexberry-g-i-s-map';
import NewPlatformFlexberryGISParameterMetadataModel from './models/new-platform-flexberry-g-i-s-parameter-metadata';

import FeatureResultItemComponent from './components/feature-result-item';
import LayersDialogsComponents from './components/layers-dialogs';
import LayerResultListComponent from './components/layer-result-list';
import MapCommandsDialogsComponents from './components/map-commands-dialogs';
import MapToolsComponents from './components/map-tools';
import MapCommandsComponents from './components/map-commands';
import FlexberryLinksEditorComponent from './components/flexberry-links-editor';

export default {
  'models': {
    'new-platform-flexberry-g-i-s-layer-link': NewPlatformFlexberryGISLayerLinkModel,
    'new-platform-flexberry-g-i-s-layer-metadata': NewPlatformFlexberryGISLayerMetadataModel,
    'new-platform-flexberry-g-i-s-link-metadata': NewPlatformFlexberryGISLinkMetadataModel,
    'new-platform-flexberry-g-i-s-link-parameter': NewPlatformFlexberryGISLinkParameterModel,
    'new-platform-flexberry-g-i-s-map-layer': NewPlatformFlexberryGISMapLayerModel,
    'new-platform-flexberry-g-i-s-map-object-setting': NewPlatformFlexberryGISMapObjectSettingModel,
    'new-platform-flexberry-g-i-s-map': NewPlatformFlexberryGISMapModel,
    'new-platform-flexberry-g-i-s-parameter-metadata': NewPlatformFlexberryGISParameterMetadataModel
  },

  'components': {
    'feature-result-item': FeatureResultItemComponent,
    'flexberry-links-editor': FlexberryLinksEditorComponent,

    'spatial-bookmarks': {
      'add-bookmark': 'Add new bookmark`',
      'create-bookmark': 'Add',
      'cancel': 'Cancel',
      'go-to-bookmark': 'Go to bookmark',
      'remove-bookmark': 'Remove',
    },

    'flexberry-dialog': {
      'approve-button': {
        'caption': 'Ok'
      },
      'deny-button': {
        'caption': 'Cancel'
      }
    },

    'flexberry-search': {
      'placeholder': 'Search...',
      'no-results': {
        'caption': 'No results',
        'description': 'Your search returned no results'
      }
    },

    'flexberry-jsonarea': {
      'placeholder': '(Enter JSON-string)',
      'parse-error': {
        'caption': 'Error while parsing entered JSON-string'
      }
    },

    'layers-dialogs': LayersDialogsComponents,

    'layer-result-list': LayerResultListComponent,

    'map-commands-dialogs': MapCommandsDialogsComponents,

    'flexberry-tree': {
      'placeholder': 'Tree nodes are not defined'
    },

    'flexberry-map': {
      'queryText': 'Search objects'
    },

    'flexberry-maplayers': {
      'placeholder': 'Layers are not defined'
    },

    'flexberry-maplayer': {
      'opacity': 'Visibility'
    },

    'flexberry-maptoolbar': {},

    'map-tools': MapToolsComponents,

    'map-commands': MapCommandsComponents
  },

  'map-tools': {
    'identify': {
      'caption': 'Identify',
      'modes': {
        'all': {
          'caption': 'All layers'
        },
        'all-visible': {
          'caption': 'All visible layers'
        },
        'top-visible': {
          'caption': 'Top visible layer'
        },
        'rectangle': {
          'caption': 'Rectangle'
        },
        'polygon': {
          'caption': 'Polygon'
        }
      },
      'loader-message': 'Identification...',
      'error-message': 'Identification by \'{{layerName}}\' layer finished with error',
      'identify-popup': {
        'properties-table': {
          'property-name-column': {
            'caption': 'Property name'
          },
          'property-value-column': {
            'caption': 'Value'
          },
          'layer-name-property': {
            'caption': 'Layer name'
          },
          'layers-count-property': {
            'caption': 'Layers count'
          },
          'features-count-property': {
            'caption': 'Features count'
          },
          'error-property': {
            'caption': 'Error'
          }
        }
      }
    },

    'measure': {
      'measure-coordinates': {
        'move': 'Click on the map to fix coordinates',
        'drag': 'Release the mouse to fix coordinates',
        'labelPrefix': '<b>',
        'labelPostfix': '</b>',
        'northLatitude': 'N&nbsp;',
        'southLatitude': 'S&nbsp;',
        'eastLongitude': 'E',
        'westLongitude': 'W'
      },
      'measure-radius': {
        'move': 'Press and hold the mouse button, drag the cursor to draw a circle',
        'drag': 'Release the mouse button to fix the circle.',
        'labelPrefix': '<b>Radius:&nbsp;',
        'labelPostfix': '</b>',
      },
      'measure-area': {
        'move': 'Click on the map to add the initial vertex.',
        'add': 'Click on the map to add a new vertex.',
        'commit': 'Click on the current vertex to fix area',
        'drag': 'Release the mouse to fix the area',
        'labelPrefix': '<b> Area:&nbsp;',
        'labelPostfix': '</ b>',
      },
      'measure-distance': {
        'move': 'Click on the map to add the initial vertex.',
        'add': 'Click on the map to add a new vertex.',
        'commit': 'Click on the current vertex to fix distance',
        'drag': 'Release the mouse to fix the distance',
        'distanceLabelPrefix': '<b>L',
        'distanceLabelPostfix': '</b>',
        'incLabelPrefix': '<br/><i>Δ',
        'incLabelPostfix': '</i>'
      },
      'measure-units': {
        'meter': '&nbsp;m',
        'kilometer': '&nbsp;km'
      }
    }
  },

  'map-commands': {
    'go-to': {
      'lat-caption': 'Latitude',
      'lng-caption': 'Longitude',
      'x-caption': 'X',
      'y-caption': 'Y'
    }
  }
};
