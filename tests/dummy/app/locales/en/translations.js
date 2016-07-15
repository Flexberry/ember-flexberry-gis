import Ember from 'ember';
import emberFlexberryTranslations from 'ember-flexberry/locales/en/translations';
import emberFlexberryGisTranslations from 'ember-flexberry-gis/locales/en/translations';

const translations = {};
Ember.$.extend(true, translations, emberFlexberryTranslations, emberFlexberryGisTranslations);

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
        'gis-objects': {
          'caption': 'GIS objects',
          'title': '',
          'new-platform-flexberry-g-i-s-map-l': {
            'caption': 'Maps settings',
            'title': ''
          },
          'maps': {
            'caption': 'Maps',
            'title': ''
          }
        },
        'components-examples': {
          'caption': 'Components examples',
          'title': '',
          'flexberry-ddau-checkbox': {
            'caption': 'flexberry-ddau-checkbox',
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
      'flexberry-ddau-checkbox': {
        'settings-example': {
          'caption': 'Components-examples/flexberry-ddau-checkbox/settings-example'
        }
      },
      'flexberry-tree': {
        'settings-example': {
          'caption': 'Components-examples/flexberry-tree/settings-example',
          'hbs-tree-tab-caption': 'Explicitly hbs-markup defined tree',
          'hbs-tree-latest-clicked-node-caption': 'Latest clicked tree node settings',
          'hbs-tree-latest-clicked-node-placeholder': 'Click on any tree node to display it\'s settings',
          'json-tree-tab-caption': 'Dynamically JSON-object-defined tree',
          'json-tree-latest-clicked-node-caption': 'Latest clicked tree node settings',
          'json-tree-latest-clicked-node-placeholder': 'Click on any tree node to display it\'s settings',
        }
      }
    },

    'integration-examples': {
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
