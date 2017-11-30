import Ember from 'ember';
import EmberFlexberryTranslations from 'ember-flexberry/locales/en/translations';
import EmberFlexberryGisTranslations from 'ember-flexberry-gis/locales/en/translations';

import MapFormTranslations from './forms/map';

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
          'show-menu': {
            'caption': 'Show menu'
          },
          'hide-menu': {
            'caption': 'Hide menu'
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
          },
          'map-metadata': {
            'caption': 'Мetadata',
            'title': ''
          },
          'gis-search-form': {
            'caption': 'Search',
            'title': 'Search through layer metadata and maps'
          }
        },
        'components-examples': {
          'caption': 'Components examples',
          'title': '',
          'flexberry-boundingbox': {
            'caption': 'flexberry-boundingbox',
            'title': '',
            'settings-example': {
              'caption': 'Пример работы компонента',
              'title': ''
            }
          }
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
      'flexberry-boundingbox': {
        'settings-example': {
          'caption': 'Flexberry-boundingbox testing form'
        }
      },
    },

    'maps': {
      'caption': 'Maps'
    },

    'map': MapFormTranslations,

    'crs': {
      'current': {
        'name': 'In map\'s coordinate system',
        'xCaption': 'X',
        'yCaption': 'Y'
      },
      'latlng': {
        'name': 'Latitude and Longitude',
        'xCaption': 'Latitude',
        'yCaption': 'Longitude'
      }
    }
  }
});

export default translations;
