import Ember from 'ember';
import EmberFlexberryTranslations from 'ember-flexberry/locales/ru/translations';
import EmberFlexberryGisTranslations from 'ember-flexberry-gis/locales/ru/translations';

import MapFormTranslations from './forms/map';

const translations = {};
Ember.$.extend(true, translations, EmberFlexberryTranslations, EmberFlexberryGisTranslations);

Ember.$.extend(true, translations, {
  'application-name': 'Тестовый стенд ember-flexberry-gis',

  'forms': {
    'loading': {
      'spinner-caption': 'Данные загружаются, пожалуйста подождите...'
    },
    'index': {
      'greeting': 'Добро пожаловать на тестовый стенд ember-flexberry-gis!'
    },

    'application': {
      'header': {
        'menu': {
          'sitemap-button': {
            'caption': '',
            'title': 'Меню'
          },
          'user-settings-service-checkbox': {
            'caption': 'Использовать сервис пользовательских настроек'
          },
          'show-menu': {
            'caption': 'Показать меню'
          },
          'hide-menu': {
            'caption': 'Скрыть меню'
          },
          'language-dropdown': {
            'caption': 'Язык приложения',
            'placeholder': 'Выберете язык'
          }
        }
      },

      'footer': {
        'application-name': 'Тестовый стенд ember-flexberry-gis',
        'application-version': {
          'caption': 'Версия аддона {{version}}',
          'title': 'Это версия аддона ember-flexberry-gis, которая сейчас используется в этом тестовом приложении ' +
            '(версия npm-пакета + хэш коммита). ' +
            'Кликните, чтобы перейти на GitHub.'
        }
      },

      'sitemap': {
        'application-name': {
          'caption': 'Тестовый стенд ember-flexberry-gis',
          'title': ''
        },
        'application-version': {
          'caption': 'Версия аддона {{version}}',
          'title': 'Это версия аддона ember-flexberry-gis, которая сейчас используется в этом тестовом приложении ' +
            '(версия npm-пакета + хэш коммита). ' +
            'Кликните, чтобы перейти на GitHub.'
        },
        'index': {
          'caption': 'Главная',
          'title': ''
        },
        'gis': {
          'caption': 'ГИС',
          'title': '',
          'maps': {
            'caption': 'Карты',
            'title': ''
          },
          'csw-connections': {
            'caption': 'CSW соединения',
            'title': ''
          },
          'map-metadata': {
            'caption': 'Метаданные',
            'title': ''
          },
          'gis-search-form': {
            'caption': 'Поиск',
            'title': 'Поиск по метаданным слоёв и проектам карт'
          }
        },
        'components-examples': {
          'caption': 'Примеры компонентов',
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
      'save-success-message-caption': 'Сохранение завершилось успешно',
      'save-success-message': 'Объект сохранен',
      'save-error-message-caption': 'Ошибка сохранения',
      'delete-success-message-caption': 'Удаление завершилось успешно',
      'delete-success-message': 'Объект удален',
      'delete-error-message-caption': 'Ошибка удаления'
    },

    'components-examples': {
      'flexberry-boundingbox': {
        'settings-example': {
          'caption': 'Тестовая форма flexberry-boundingbox'
        }
      },
    },

    'maps': {
      'caption': 'Карты'
    },

    'map': MapFormTranslations,

    'csw': {
      'caption': 'CSW соединения'
    },

    'crs': {
      'current': {
        'name': 'В системе коодинат карты',
        'xCaption': 'X',
        'yCaption': 'Y'
      },
      'latlng': {
        'name': 'Широта и Долгота',
        'xCaption': 'Широта',
        'yCaption': 'Долгота'
      }
    }
  }
});

export default translations;
