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
        'crs-textarea': {
          'caption': 'Система координат слоя (CRS)'
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
        'meter':'&nbsp;м',
        'kilometer':'&nbsp;км',
      }
    }
  }
};
