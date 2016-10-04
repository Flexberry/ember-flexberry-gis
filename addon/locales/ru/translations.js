import NewPlatformFlexberryGISMapModel from './models/new-platform-flexberry-g-i-s-map';
import NewPlatformFlexberryGISMapLayerModel from './models/new-platform-flexberry-g-i-s-map-layer';
import NewPlatformFlexberryGISLayerMetadataModel from './models/new-platform-flexberry-g-i-s-layer-metadata';

export default {
  'models': {
    'new-platform-flexberry-g-i-s-map': NewPlatformFlexberryGISMapModel,
    'new-platform-flexberry-g-i-s-map-layer': NewPlatformFlexberryGISMapLayerModel,
    'new-platform-flexberry-g-i-s-layer-metadata': NewPlatformFlexberryGISLayerMetadataModel
  },

  'forms': {
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
        },

        'geocoder-osm-overpass': {
          'url-textbox': {
            'caption': 'Url'
          }
        }
      }
    },

    'map-commands-dialogs': {
      'export': {
        'caption': 'Экспорт карты',
        'print-caption': 'Печать карты',
        'error-message-caption': 'Ошибка экспорта карты',
        'approve-button': {
          'caption': 'Ок'
        },
        'deny-button': {
          'caption': 'Отмена'
        },
        'caption-segment': {
          'caption': 'Настройки заголовка карты',
          'caption-textbox': {
            'caption': 'Заголовок карты'
          },
          'font-name-textbox': {
            'caption': 'Имя шрифта'
          },
          'font-size-textbox': {
            'caption': 'Размер шрифта (в пикселях)'
          },
          'font-color-textbox': {
            'caption': 'Цвет шрифта'
          },
          'x-coordinate-textbox': {
            'caption': 'X-Координата (от левого верхнего края карты)'
          },
          'y-coordinate-textbox': {
            'caption': 'Y-Координата (от левого верхнего края карты)'
          }
        },
        'exclude-segment': {
          'caption': 'Исключить с экспортированной карты',
          'exclude-zoom-checkbox': {
            'caption': 'Зум-контрол'
          },
          'exclude-contributing-checkbox': {
            'caption': 'Копирайт'
          }
        },
        'download-segment': {
          'caption': 'Настройки скачиваемого файла',
          'file-name-textbox': {
            'caption': 'Имя файла'
          },
          'file-type-dropdown': {
            'caption': 'Тип файла'
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
    },

    'flexberry-maptoolbar': {
    },

    'map-tools': {
      'drag': {
        'caption': ''
      },
      'zoom-in': {
        'caption': ''
      },
      'zoom-out': {
        'caption': ''
      },
      'identify': {
        'caption': 'Идентифицировать',
        'identify-all': {
          'caption': 'Все слои'
        },
        'identify-all-visible': {
          'caption': 'Все видимые слои'
        },
        'identify-top-visible': {
          'caption': 'Верхний видимый слой'
        }
      },
      'measure': {
        'caption': 'Измерить',
        'measure-coordinates': {
          'caption': 'Координаты'
        },
        'measure-radius': {
          'caption': 'Радиус'
        },
        'measure-distance': {
          'caption': 'Расстояние'
        },
        'measure-area': {
          'caption': 'Площадь'
        },
        'measure-clear': {
          'caption': 'Очистить'
        }
      },
      'draw': {
        'caption': 'Нарисовать',
        'draw-marker': {
          'caption': 'Маркер'
        },
        'draw-polyline': {
          'caption': 'Ломаную'
        },
        'draw-circle': {
          'caption': 'Круг'
        },
        'draw-rectangle': {
          'caption': 'Прямоугольник'
        },
        'draw-polygon': {
          'caption': 'Полигон'
        },
        'draw-clear': {
          'caption': 'Очистить'
        }
      }
    },

    'map-commands': {
      'full-extent': {
        'caption': ''
      },
      'export': {
        'caption': 'Экспортировать',
        'export-download': {
          'caption': 'Скачать'
        },
        'export-print': {
          'caption': 'Напечатать'
        }
      }
    }
  },

  'map-tools': {
    'identify': {
      'caption': 'Идентифицировать',
      'modes': {
        'all': {
          'caption': 'Все слои'
        },
        'all-visible': {
          'caption': 'Все видимые слои'
        },
        'top-visible': {
          'caption': 'Верхний видимый слой'
        }
      },
      'loader-message': 'Идентификация...',
      'error-message': 'Идентификация по слою \'{{layerName}}\' завершилась ошибкой: ',
      'identify-popup': {
        'properties-table': {
          'property-name-column': {
            'caption': 'Имя свойства'
          },
          'property-value-column': {
            'caption': 'Значение'
          },
          'layer-name-property': {
            'caption': 'Название слоя'
          },
          'layers-count-property': {
            'caption': 'Количество слоев'
          },
          'features-count-property': {
            'caption': 'Количество объектов'
          },
          'error-property': {
            'caption': 'Ошибка'
          }
        }
      }
    },

    'measure': {
      'measure-coordinates': {
        'move': 'Кликните по карте, чтобы зафиксировать координаты',
        'drag': 'Отпустите кнопку мыши, чтобы зафиксировать координаты',
        'labelPrefix': '<b>',
        'labelPostfix': '</b>',
        'northLatitude': '&nbsp;с.ш.&nbsp;',
        'southLatitude': '&nbsp;ю.ш.&nbsp;',
        'eastLongitude': '&nbsp;в.д.',
        'westLongitude': '&nbsp;з.д.'
      },
      'measure-radius': {
        'move': 'Зажмите кнопку мыши и перемеcтите курсор, чтобы нарисовать круг',
        'drag': 'Отпустите кнопку мыши, чтобы зафиксировать круг.',
        'labelPrefix': '<b>Радиус:&nbsp;',
        'labelPostfix': '</b>',
      },
      'measure-area': {
        'move': 'Кликните по карте, чтобы добавить начальную вершину.',
        'add': 'Кликните по карте, чтобы добавить новую вершину.',
        'commit': 'Кликните на текущую вершину, чтобы зафиксировать площадь',
        'drag': 'Отпустите курсор, чтобы  зафиксировать площадь',
        'labelPrefix': '<b>Площадь:&nbsp;',
        'labelPostfix': '</b>',
      },
      'measure-distance': {
        'move': 'Кликните по карте, чтобы добавить начальную вершину.',
        'add': 'Кликните по карте, чтобы добавить новую вершину.',
        'commit': 'Кликните на текущую вершину, чтобы зафиксировать расстояние',
        'drag': 'Отпустите курсор, чтобы  зафиксировать расстояние',
        'distanceLabelPrefix': '<b>L',
        'distanceLabelPostfix': '</b>',
        'incLabelPrefix': '<br/><i>Δ',
        'incLabelPostfix': '</i>'
      },
      'measure-units': {
        'meter': '&nbsp;м',
        'kilometer': '&nbsp;км'
      }
    }
  }
};
