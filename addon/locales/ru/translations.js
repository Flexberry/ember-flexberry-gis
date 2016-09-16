export default {
  'forms': {
    'new-platform-flexberry-g-i-s-map-layer-tile': {
      'url': 'Url',
      'minZoom': 'Минимальное увеличение',
      'maxZoom': 'Максимальное увеличение',
      'maxNativeZoom': 'Max native zoom',
      'tileSize': 'Размер тайла',
      'subdomains': 'Поддомены',
      'errorTileUrl': 'Url тайла с ошибкой',
      'attribution': 'Атрибуция',
      'tms': 'Tms',
      'continuousWorld': 'Continuous world',
      'noWrap': 'No wrap',
      'zoomOffset': 'Смещение увеличения',
      'zoomReverse': 'Реверсирование увеличения',
      'opacity': 'Замутнение',
      'zIndex': 'ZIndex',
      'unloadInvisibleTiles': 'Выгрузка невидимых тайлов',
      'updateWhenIdle': 'Обновление при простое',
      'detectRetina': 'Detect retina',
      'reuseTiles': 'Переиспользование тайлов',
      'bounds': 'Границы'
    },

    'new-platform-flexberry-g-i-s-map-layer-wms': {
      'url': 'Url',
      'layers': 'Слои',
      'styles': 'Стили',
      'format': 'Формат',
      'transparent': 'Прозрачность',
      'version': 'Версия',
      'crs': 'Crs'
    },

    'new-platform-flexberry-g-i-s-map-layer-unknown': {
      'unknown-layer': 'Неизвестный тип слоя'
    }
  },

  'components': {
    'flexberry-dialog': {
      'approve-button': {
        'caption': 'Ок'
      },
      'deny-button': {
        'caption': 'Отмена'
      }
    },

    'layers-dialogs': {
      'remove': {
        'caption': 'Удаление слоя',
        'content': 'Вы действительно хотите удалить слой \'{{layerName}}\'?',
        'approve-button': {
          'caption': 'Да'
        },
        'deny-button': {
          'caption': 'Нет'
        }
      },

      'edit': {
        'caption': 'Редактирование слоя',
        'approve-button': {
          'caption': 'Ok'
        },
        'deny-button': {
          'caption': 'Отмена'
        },
        'type-dropdown': {
          'caption': 'Тип слоя'
        },
        'name-textbox': {
          'caption': 'Имя слоя'
        },
        'crs': {
          'caption': 'Система координат слоя (CRS)',
          'code-textbox': {
            'caption': 'Код'
          },
          'definition-textarea': {
            'caption': 'Определение'
          }
        }
      },

      'add': {
        'caption': 'Добавление нового слоя',
        'approve-button': {
          'caption': 'Ok'
        },
        'deny-button': {
          'caption': 'Отмена'
        },
        'type-dropdown': {
          'caption': 'Тип слоя'
        },
        'name-textbox': {
          'caption': 'Имя слоя'
        },
        'crs-textarea': {
          'caption': 'Система координат слоя (CRS)'
        }
      },

      'settings': {
        'group': {
        },

        'tile': {
          'url-textbox': {
            'caption': 'Url'
          }
        },

        'wms': {
          'info-format-dropdown': {
            'caption': 'Формат ответов GetFeatureInfo'
          },
          'url-textbox': {
            'caption': 'Url'
          },
          'version-textbox': {
            'caption': 'Версия WMS'
          },
          'layers-textbox': {
            'caption': 'Слои'
          },
          'format-textbox': {
            'caption': 'Формат изображений'
          },
          'transparent-checkbox': {
            'caption': 'Разрешить прозрачность на изображениях'
          }
        },

        'wfs': {
          'format-dropdown': {
            'caption': 'Формат'
          },
          'url-textbox': {
            'caption': 'Url'
          },
          'version-textbox': {
            'caption': 'Версия WFS'
          },
          'namespace-uri-textbox': {
            'caption': 'URI пространства имен'
          },
          'type-ns-name-textbox': {
            'caption': 'Имя пространства имен типа'
          },
          'type-ns-textbox': {
            'caption': 'Пространство имен типа'
          },
          'type-name-textbox': {
            'caption': 'Имя типа'
          },
          'geometry-field-textbox': {
            'caption': 'Поле геометрии'
          },
          'max-features-textbox': {
            'caption': 'Максимальное количество объектов'
          },
          'show-existing-checkbox': {
            'caption': 'Отображать существующие объекты'
          },
          'style': {
            'caption': 'Стиль отображения',
            'color-textbox': {
              'caption': 'Цвет заливки'
            },
            'weight-textbox': {
              'caption': 'Толщина обводки'
            }
          }
        }
      }
    },

    'flexberry-tree': {
      'placeholder': 'Вершины дерева не заданы'
    },

    'flexberry-maplayers': {
      'placeholder': 'Слои не заданы'
    },

    'flexberry-maplayer': {
    }
  },

  'maptools': {
    'identify': {
      'error-message': 'Идентификация по слою \'{{layerName}}\' завершилась ошибкой: '
    }
  }
};
