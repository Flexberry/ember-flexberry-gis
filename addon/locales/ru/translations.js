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
      'measureCaption': 'Измерить',
      'mearkerMeasure': 'Координаты',
      'circleMeasure': 'Радиус',
      'polylineMeasure': 'Расстояние',
      'polygonMeasure': 'Площадь'
    },
    'flexberry-measuretool': {
      'marker': {
        'move': 'Кликните по карте, чтобы зафиксировать координаты',
        'drag': 'Отпустите кнопку мыши, чтобы зафиксировать координаты',
        'labelPrefix': '<b>',
        'labelPostfix': '</b>',
        'northLatitude': '&nbsp;с.ш.&nbsp;',
        'southLatitude': '&nbsp;ю.ш.&nbsp;',
        'eastLongitude': '&nbsp;в.д.',
        'westLongitude': '&nbsp;з.д.'
      },
      'circle': {
        'move': 'Зажмите кнопку мыши и перемеcтите курсор, чтобы нарисовать круг',
        'drag': 'Отпустите кнопку мыши, чтобы зафиксировать круг.',
        'labelPrefix': '<b>Радиус:&nbsp;',
        'labelPostfix': '</b>',
      },
      'polygon': {
        'move': 'Кликните по карте, чтобы добавить начальную вершину.',
        'add': 'Кликните по карте, чтобы добавить новую вершину.',
        'commit': 'Кликните на текущую вершину, чтобы зафиксировать площадь',
        'drag': 'Отпустите курсор, чтобы  зафиксировать площадь',
        'labelPrefix': '<b>Площадь:&nbsp;',
        'labelPostfix': '</b>',
      },
      'polyline': {
        'move': 'Кликните по карте, чтобы добавить начальную вершину.',
        'add': 'Кликните по карте, чтобы добавить новую вершину.',
        'commit': 'Кликните на текущую вершину, чтобы зафиксировать расстояние',
        'drag': 'Отпустите курсор, чтобы  зафиксировать расстояние',
        'distanceLabelPrefix': '<b>L',
        'distanceLabelPostfix': '</b>',
        'incLabelPrefix': '<br/><i>Δ',
        'incLabelPostfix': '</i>'
      },
      'distanceMeasureUnit': {
        'meter': '&nbsp;м',
        'kilometer': '&nbsp;км',
      }
    },
    'flexberry-export': {
      'export': 'Экспортировать',
      'download': 'Экспортировать в изображение',
      'print': 'Напечатать',
      'wrongBeginSelector': 'Селектор JQuery нечинается не с начальной круглой скобки (',
      'wrongEndSelector': 'Селектор JQuery не заканчивается круглой скобкой )',
      'jqueryNotAvailable': 'В опциях используется JQuery селектор, но JQuery не подключен. ' +
        'Подключите JQuery или используйте DOM-селекторы: .class, #id или DOM-элементы',
      'popupWindowBlocked': 'Окно печати было заблокировано браузером. Пожалуйста разрешите всплывающие окна на этой странице',
      'emptyFilename': 'Не указано имя файла для выгрузки',
      'downloadCaption': 'Задайте параметры экcпорта в изображение',
      'printCaption': 'Задайте параметры для печати',
      'caption': 'Заголовок карты',
      'nocaption': 'Без заголовка',
      'font': 'Фонт',
      'fillStyle': 'Цвет',
      'except': 'Исключить',
      'zoom': 'Зум',
      'attributes': 'Копирайт',
      'type': 'Тип',
      'fileName': 'Имя файла'
    }
  },

  'maptools': {
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
    }
  }
};
