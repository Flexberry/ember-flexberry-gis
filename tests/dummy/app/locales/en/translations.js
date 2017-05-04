import Ember from 'ember';
import EmberFlexberryTranslations from 'ember-flexberry/locales/en/translations';
import EmberFlexberryGisTranslations from 'ember-flexberry-gis/locales/en/translations';

import NewPlatformFlexberryGISLayerMetadataLForm from './forms/new-platform-flexberry-g-i-s-layer-metadata-l';
import NewPlatformFlexberryGISCswConnectionLForm from './forms/new-platform-flexberry-g-i-s-csw-connection-l';
import NewPlatformFlexberryGISMapLForm from './forms/new-platform-flexberry-g-i-s-map-l';
import NewPlatformFlexberryGISLayerMetadataEForm from './forms/new-platform-flexberry-g-i-s-layer-metadata-e';
import NewPlatformFlexberryGISCswConnectionEForm from './forms/new-platform-flexberry-g-i-s-csw-connection-e';
import NewPlatformFlexberryGISMapEForm from './forms/new-platform-flexberry-g-i-s-map-e';

const translations = {};
Ember.$.extend(true, translations, EmberFlexberryTranslations, EmberFlexberryGisTranslations);

Ember.$.extend(true, translations, {
  'application-name': 'Test stand for ember-flexberry-gis',

  'forms': {
    'loading': {
      'spinner-caption': 'Loading data, please wait...'
    },
    'index': {
      'greeting': 'Welcome to ember-flexberry-gis test stand!'
    },

    'application': {
      'header': {
        'menu': {
          'sitemap-button': {
            'caption': '',
            'title': 'Menu'
          },
          'user-settings-service-checkbox': {
            'caption': 'Use user settings service'
          },
          'language-dropdown': {
            'caption': 'Application language',
            'placeholder': 'Choose language'
          }
        }
      },

      'footer': {
        'application-name': 'Test stand for ember-flexberry-gis',
        'application-version': {
          'caption': 'Addon version {{version}}',
          'title': 'It is version of ember-flexberry-gis addon, which uses in this dummy application ' +
            '(npm version + commit sha). ' +
            'Click to open commit on GitHub.'
        }
      },

      'sitemap': {
        'application-name': {
          'caption': 'Test stand for ember-flexberry-gis',
          'title': ''
        },
        'application-version': {
          'caption': 'Addon version {{version}}',
          'title': 'It is version of ember-flexberry-gis addon, which uses in this dummy application ' +
            '(npm version + commit sha). ' +
            'Click to open commit on GitHub.'
        },
        'index': {
          'caption': 'Home',
          'title': ''
        },
        'gis': {
          'caption': 'GIS',
          'title': '',
          'maps': {
            'caption': 'Maps',
            'title': ''
          },
          'csw-connections': {
            'caption': 'CSW connections',
            'title': ''
          }
        },
        'components-examples': {
          'caption': 'Components examples',
          'title': '',
          'flexberry-button': {
            'caption': 'flexberry-button',
            'title': '',
            'settings-example': {
              'caption': 'Settings example',
              'title': ''
            }
          },
          'flexberry-ddau-checkbox': {
            'caption': 'flexberry-ddau-checkbox',
            'title': '',
            'settings-example': {
              'caption': 'Settings example',
              'title': ''
            }
          },
          'flexberry-maplayers': {
            'caption': 'flexberry-maplayers',
            'title': '',
            'settings-example': {
              'caption': 'Settings example',
              'title': ''
            }
          },
          'flexberry-tree': {
            'caption': 'flexberry-tree',
            'title': '',
            'settings-example': {
              'caption': 'Settings example',
              'title': ''
            }
          }
        },
        'integration-examples': {
          'caption': 'Integration examples',
          'title': ''
        }
      }
    },

    'edit-form': {
      'save-success-message-caption': 'Save operation succeed',
      'save-success-message': 'Object saved',
      'save-error-message-caption': 'Save operation failed',
      'delete-success-message-caption': 'Delete operation succeed',
      'delete-success-message': 'Object deleted',
      'delete-error-message-caption': 'Delete operation failed'
    },

    'components-examples': {
      'flexberry-button': {
        'settings-example': {
          'caption': 'Settings example for flexberry-button'
        }
      },
      'flexberry-ddau-checkbox': {
        'settings-example': {
          'caption': 'Settings example for flexberry-ddau-checkbox'
        }
      },
      'flexberry-maplayers': {
        'settings-example': {
          'caption': 'Settings example for flexberry-maplayers',
          'json-layers-tab-caption': 'JSON-object-defined layers tree',
          'json-layers-latest-clicked-layer-caption': 'Latest clicked layer settings',
          'json-layers-latest-clicked-layer-placeholder': 'Click on any layer to display it\'s settings'
        }
      },
      'flexberry-tree': {
        'settings-example': {
          'caption': 'Settings example for flexberry-tree',
          'json-tree-tab-caption': 'JSON-object-defined tree',
          'json-tree-latest-clicked-node-caption': 'Latest clicked tree node settings',
          'json-tree-latest-clicked-node-placeholder': 'Click on any tree node to display it\'s settings'
        }
      }
    },

    'integration-examples': {
    },
    'new-platform-flexberry-g-i-s-layer-metadata-l': NewPlatformFlexberryGISLayerMetadataLForm,
    'new-platform-flexberry-g-i-s-csw-connection-l': NewPlatformFlexberryGISCswConnectionLForm,
    'new-platform-flexberry-g-i-s-map-l': NewPlatformFlexberryGISMapLForm,
    'new-platform-flexberry-g-i-s-layer-metadata-e': NewPlatformFlexberryGISLayerMetadataEForm,
    'new-platform-flexberry-g-i-s-csw-connection-e': NewPlatformFlexberryGISCswConnectionEForm,
    'new-platform-flexberry-g-i-s-map-e': NewPlatformFlexberryGISMapEForm,
    'map': {
      'caption': 'Map',
      'treeviewbuttontooltip': 'Show tree view',
      'searchbuttontooltip': 'Show search',
      'bookmarksbuttontooltip': 'Spatial bookmarks',
      'identifybuttontooltip': 'Show identification'
    },
    'crs': {
      'current': {
        'name': 'Current CRS',
        'xCaption': 'X',
        'yCaption': 'Y'
      },
      'latlng': {
        'name': 'LatLng',
        'xCaption': 'lat',
        'yCaption': 'lng'
      }
    }
  },

  'components': {
    'settings-example': {
      'component-template-caption': 'Component template',
      'component-settings-caption': '',
      'component-settings-placeholder': 'Component settings are not defined',
      'controller-properties-caption': 'Controller properties',
      'component-current-settings-caption': 'Component current settings values',
      'component-default-settings-caption': 'Component default settings values',
      'component-with-applied-settings-caption': 'Component with it\'s current settings applied'
    }
  }
});

export default translations;
