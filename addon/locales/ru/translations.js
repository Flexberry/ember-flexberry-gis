import NewPlatformFlexberryGISMapCswConnectionModel from './models/new-platform-flexberry-g-i-s-csw-connection';
import NewPlatformFlexberryGISLayerLinkModel from './models/new-platform-flexberry-g-i-s-layer-link';
import NewPlatformFlexberryGISLayerMetadataModel from './models/new-platform-flexberry-g-i-s-layer-metadata';
import NewPlatformFlexberryGISLinkParameterModel from './models/new-platform-flexberry-g-i-s-link-parameter';
import NewPlatformFlexberryGISMapModel from './models/new-platform-flexberry-g-i-s-map';
import NewPlatformFlexberryGISMapLayerModel from './models/new-platform-flexberry-g-i-s-map-layer';
import NewPlatformFlexberryGISMapObjectSettingModel from './models/new-platform-flexberry-g-i-s-map-object-setting';

export default {
  'models': {
    'new-platform-flexberry-g-i-s-csw-connection': NewPlatformFlexberryGISMapCswConnectionModel,
    'new-platform-flexberry-g-i-s-layer-link': NewPlatformFlexberryGISLayerLinkModel,
    'new-platform-flexberry-g-i-s-layer-metadata': NewPlatformFlexberryGISLayerMetadataModel,
    'new-platform-flexberry-g-i-s-link-parameter': NewPlatformFlexberryGISLinkParameterModel,
    'new-platform-flexberry-g-i-s-map': NewPlatformFlexberryGISMapModel,
    'new-platform-flexberry-g-i-s-map-layer': NewPlatformFlexberryGISMapLayerModel,
    'new-platform-flexberry-g-i-s-map-object-setting': NewPlatformFlexberryGISMapObjectSettingModel
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

    'flexberry-search': {
      'placeholder': 'Найти...',
      'no-results': {
        'caption': 'Нет результатов',
        'description': 'Ваш поиск не дал результатов'
      }
    },

    'flexberry-jsonarea': {
      'placeholder': '(Введите JSON-строку)',
      'parse-error': {
        'caption': 'Ошибка парсинга введенной JSON-строки'
      }
    },

    'flexberry-csw': {
      'error-message': {
        'caption': 'Ошибка'
      },
      'connection-dropdown': {
        'caption': 'Соединение с каталогом сервисов'
      },
      'search-settings': {
        'caption': 'Настройки поиска записей',
        'keywords-textbox': {
          'caption': 'Ключевые слова'
        },
        'bounding-box': {
          'caption': 'Границы поиска',
          'modes': {
            'no-bounding-box': {
              'caption': 'Без учета границ'
            },
            'map-bounding-box': {
              'caption': 'В текущих границах карты'
            }
          },
          'mode-dropdown': {
            'caption': 'Режим'
          },
          'min-x-textbox': {
            'caption': 'Mин X'
          },
          'max-x-textbox': {
            'caption': 'Mакс X'
          },
          'min-y-textbox': {
            'caption': 'Mин Y'
          },
          'max-y-textbox': {
            'caption': 'Mакс Y'
          }
        }
      },
      'records-table': {
        'caption': 'Записи',
        'headers': {
          'id': {
            'caption': 'Идентификатор'
          },
          'title': {
            'caption': 'Название'
          },
          'type': {
            'caption': 'Тип'
          },
          'crs': {
            'caption': 'Система координат'
          }
        },
        'no-records': {
          'caption': 'Нет записей'
        },
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
        'mode-dropdown': {
          'caption': 'Режим добавления',
          'modes': {
            'new-layer': 'Новый слой',
            'csw-based-layer': 'На основе существующей записи из каталога сервисов',
            'metadata-based-layer': 'На основе существующих метаданных слоя'
          }
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
        },
        'tabular-menu': {
          'main-tab': {
            'caption': 'Основное'
          },
          'crs-tab': {
            'caption': 'Система координат'
          },
          'settings-tab': {
            'caption': 'Настройки слоя'
          },
          'identify-settings-tab': {
            'caption': 'Настройки идентификации'
          },
          'search-settings-tab': {
            'caption': 'Настройки поиска'
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
        'crs': {
          'caption': 'Система координат слоя (CRS)',
          'code-textbox': {
            'caption': 'Код'
          },
          'definition-textarea': {
            'caption': 'Определение'
          }
        },
        'settings-section': {
          'caption': 'Настройки специфичные для выбранного типа слоя'
        },
        'identify-settings-section': {
          'caption': 'Настройки идентификации по слою'
        },
        'search-settings-section': {
          'caption': 'Настройки поиска по слою'
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
        },

        'geocoder-osm-ru': {
          'url-textbox': {
            'caption': 'Url'
          },
          'autocomplete-url-textbox': {
            'caption': 'Url для автокомплита'
          }
        },

        'geocoder-yandex': {
          'url-textbox': {
            'caption': 'Url'
          },
          'autocomplete-url-textbox': {
            'caption': 'Url для автокомплита'
          }
        }
      }
    },

    'map-commands-dialogs': {
      'go-to': {
        'caption': 'Перейти к заданной точке',
        'error-message': {
          'caption': 'Ошибка перехода',
          'content': 'Заданы ошибочные координаты, они не могут быть преобразованы в числа'
        },
        'approve-button': {
          'caption': 'Перейти'
        },
        'deny-button': {
          'caption': 'Отмена'
        },
        'mode-dropdown': {
          'caption': 'Режим обработки координат',
        },
        'latlng-crs-mode': {
          'caption': 'Широта и Долгота'
        },
        'map-crs-mode': {
          'caption': 'В системе коодинат карты'
        },
        'x-textbox': {
          'caption': 'X'
        },
        'y-textbox': {
          'caption': 'Y'
        },
        'lat-textbox': {
          'caption': 'Широта'
        },
        'lng-textbox': {
          'caption': 'Долгота'
        }
      },
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
      },
      'search': {
        'caption': 'Поиск по слою',
        'error-message-caption': 'Ошибка поиска по слою',
        'error-message-empty-selected-layer': 'Не выбран слой для поиска',
        'approve-button': {
          'caption': 'Найти'
        },
        'deny-button': {
          'caption': 'Отмена'
        },
        'layers-dropdown': {
          'caption': 'Слой для поиска'
        },
        'founded-features-segment': {
          'caption': 'Результаты поиска',
          'nothing-found-message': 'По вашему запросу ничего не найдено'
        }
      },
      'search-settings': {
        'geocoder-osm-ru': {
          'query-string-textbox': {
            'caption': 'Строка запроса'
          },
          'search-type-dropdown': {
            'caption': 'Тип поиска'
          },
          'max-results-count-textbox': {
            'caption': 'Максимальное количество результатов'
          }
        },
        'wfs': {
          'query-string-textbox': {
            'caption': 'Строка запроса'
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
      'go-to': {
        'caption': ''
      },
      'full-extent': {
        'caption': ''
      },
      'export': {
        'caption': 'Экспортировать',
        'export-download': {
          'caption': 'В изображение'
        },
        'export-print': {
          'caption': 'Напечатать'
        }
      },
      'search': {
        'caption': 'Найти',
        'search-attributes': {
          'caption': 'По атрибутам слоев'
        },
        'search-show': {
          'caption': 'Отобразить на карте'
        },
        'search-clear': {
          'caption': 'Очистить'
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
  },

  'map-commands': {
    'go-to': {
      'lat-caption': 'Широта',
      'lng-caption': 'Долгота',
      'x-caption': 'X',
      'y-caption': 'Y'
    }
  }
};
