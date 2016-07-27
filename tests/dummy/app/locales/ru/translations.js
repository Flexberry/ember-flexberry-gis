import Ember from 'ember';
import emberFlexberryTranslations from 'ember-flexberry/locales/ru/translations';
import emberFlexberryGisTranslations from 'ember-flexberry-gis/locales/ru/translations';

const translations = {};
Ember.$.extend(true, translations, emberFlexberryTranslations, emberFlexberryGisTranslations);

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
        'gis-objects': {
          'caption': 'ГИС объекты',
          'title': '',
          'new-platform-flexberry-g-i-s-map-l': {
            'caption': 'Настройки карт',
            'title': ''
          },
          'maps': {
            'caption': 'Карты',
            'title': ''
          }
        },
        'components-examples': {
          'caption': 'Примеры компонентов',
          'title': '',
          'flexberry-ddau-checkbox': {
            'caption': 'flexberry-ddau-checkbox',
            'title': '',
            'settings-example': {
              'caption': 'Пример работы с настройками',
              'title': ''
            }
          },
          'flexberry-tree': {
            'caption': 'flexberry-tree',
            'title': '',
            'settings-example': {
              'caption': 'Пример работы с настройками',
              'title': ''
            }
          },
          'flexberry-layerstree': {
            'caption': 'flexberry-layerstree',
            'title': '',
            'settings-example': {
              'caption': 'Пример работы с настройками',
              'title': ''
            }
          }
        },
        'integration-examples': {
          'caption': 'Интеграционные примеры',
          'title': ''
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
      'flexberry-ddau-checkbox': {
        'settings-example': {
          'caption': 'Components-examples/flexberry-ddau-checkbox/settings-example'
        }
      },
      'flexberry-tree': {
        'settings-example': {
          'caption': 'Components-examples/flexberry-tree/settings-example',
          'hbs-tree-tab-caption': 'Дерево явно заданное в hbs-разметке',
          'hbs-tree-latest-clicked-node-caption': 'Настройки последней кликнутой вершины дерева',
          'hbs-tree-latest-clicked-node-placeholder': 'Кликните на любую вершину дерева, чтобы отобразить её настройки',
          'json-tree-tab-caption': 'Дерево заданное JSON-объектом',
          'json-tree-latest-clicked-node-caption': 'Настройки последней кликнутой вершины дерева',
          'json-tree-latest-clicked-node-placeholder': 'Кликните на любую вершину дерева, чтобы отобразить её настройки'
        }
      },
      'flexberry-layerstree': {
        'settings-example': {
          'caption': 'Components-examples/flexberry-layerstree/settings-example',
          'hbs-tree-tab-caption': 'Дерево явно заданное в hbs-разметке',
          'hbs-tree-latest-clicked-node-caption': 'Настройки последней кликнутой вершины дерева',
          'hbs-tree-latest-clicked-node-placeholder': 'Кликните на любую вершину дерева, чтобы отобразить её настройки',
          'json-tree-tab-caption': 'Дерево заданное JSON-объектом',
          'json-tree-latest-clicked-node-caption': 'Настройки последней кликнутой вершины дерева',
          'json-tree-latest-clicked-node-placeholder': 'Кликните на любую вершину дерева, чтобы отобразить её настройки'
        }
      }
    },

    'integration-examples': {
    }
  },

  'components': {
    'settings-example': {
      'component-template-caption': 'Шаблон компонента',
      'component-settings-caption': '',
      'component-settings-placeholder': 'Настройки компонента не заданы',
      'controller-properties-caption': 'Свойства контроллера',
      'component-current-settings-caption': 'Текущие настройки компонента',
      'component-default-settings-caption': 'Настройки компонента по умолчанию',
      'component-with-applied-settings-caption': 'Компонент с примененными текущими настройками'
    }
  }
});

export default translations;
