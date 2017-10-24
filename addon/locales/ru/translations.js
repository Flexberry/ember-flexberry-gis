import NewPlatformFlexberryGISLayerLinkModel from './models/new-platform-flexberry-g-i-s-layer-link';
import NewPlatformFlexberryGISLayerMetadataModel from './models/new-platform-flexberry-g-i-s-layer-metadata';
import NewPlatformFlexberryGISLinkMetadataModel from './models/new-platform-flexberry-g-i-s-link-metadata';
import NewPlatformFlexberryGISLinkParameterModel from './models/new-platform-flexberry-g-i-s-link-parameter';
import NewPlatformFlexberryGISMapLayerModel from './models/new-platform-flexberry-g-i-s-map-layer';
import NewPlatformFlexberryGISMapObjectSettingModel from './models/new-platform-flexberry-g-i-s-map-object-setting';
import NewPlatformFlexberryGISMapModel from './models/new-platform-flexberry-g-i-s-map';
import NewPlatformFlexberryGISParameterMetadataModel from './models/new-platform-flexberry-g-i-s-parameter-metadata';

import FeatureResultItemComponent from './components/feature-result-item';
import MapDialogsComponents from './components/map-dialogs';
import LayersDialogsComponents from './components/layers-dialogs';
import LayerResultListComponent from './components/layer-result-list';
import MapCommandsDialogsComponents from './components/map-commands-dialogs';
import MapToolsComponents from './components/map-tools';
import MapCommandsComponents from './components/map-commands';
import FlexberryTableComponents from './components/flexberry-table';
import FlexberryMapInfoComponent from './components/flexberry-mapinfo';
import FlexberryBoundingboxComponent from './components/flexberry-boundingbox';

import NewPlatformFlexberryGISLayerMetadataLForm from './forms/new-platform-flexberry-g-i-s-layer-metadata-l';
import NewPlatformFlexberryGISLayerMetadataEForm from './forms/new-platform-flexberry-g-i-s-layer-metadata-e';
import GISSearchForm from './forms/gis-search-form';

export default {
  'models': {
    'new-platform-flexberry-g-i-s-layer-link': NewPlatformFlexberryGISLayerLinkModel,
    'new-platform-flexberry-g-i-s-layer-metadata': NewPlatformFlexberryGISLayerMetadataModel,
    'new-platform-flexberry-g-i-s-link-metadata': NewPlatformFlexberryGISLinkMetadataModel,
    'new-platform-flexberry-g-i-s-link-parameter': NewPlatformFlexberryGISLinkParameterModel,
    'new-platform-flexberry-g-i-s-map-layer': NewPlatformFlexberryGISMapLayerModel,
    'new-platform-flexberry-g-i-s-map-object-setting': NewPlatformFlexberryGISMapObjectSettingModel,
    'new-platform-flexberry-g-i-s-map': NewPlatformFlexberryGISMapModel,
    'new-platform-flexberry-g-i-s-parameter-metadata': NewPlatformFlexberryGISParameterMetadataModel
  },

  'forms': {
    'new-platform-flexberry-g-i-s-layer-metadata-l': NewPlatformFlexberryGISLayerMetadataLForm,
    'new-platform-flexberry-g-i-s-layer-metadata-e': NewPlatformFlexberryGISLayerMetadataEForm,
    'gis-search-form': GISSearchForm
  },

  'components': {
    'flexberry-table': FlexberryTableComponents,

    'feature-result-item': FeatureResultItemComponent,

    'spatial-bookmarks': {
      'add-bookmark': 'Добавить в закладки',
      'create-bookmark': 'Добавить',
      'cancel': 'Отмена',
      'go-to-bookmark': 'Перейти к закладке',
      'remove-bookmark': 'Удалить закладку',
    },

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

    'map-dialogs': MapDialogsComponents,

    'layers-dialogs': LayersDialogsComponents,

    'layer-result-list': LayerResultListComponent,

    'map-commands-dialogs': MapCommandsDialogsComponents,

    'flexberry-tree': {
      'placeholder': 'Вершины дерева не заданы'
    },

    'flexberry-map': {
      'queryText': 'Поиск объектов'
    },

    'flexberry-maplayers': {
      'placeholder': 'Слои не заданы'
    },

    'flexberry-maplayer': {
      'opacity': 'Видимость'
    },

    'flexberry-maptoolbar': {
    },

    'map-tools': MapToolsComponents,
    'map-commands': MapCommandsComponents,

    'flexberry-mapinfo': FlexberryMapInfoComponent,

    'flexberry-wfs-filter': {
      'caption': 'Фильтры WFS-слоя',
      'settings-not-set': 'Настройки не заданы',
      'fields': 'Поля',
      'values': 'Значения',
      'operators': 'Операторы',
      'buttons': {
        'in': 'В',
        'not-in': 'НЕ В',
        'and': 'И',
        'or': 'ИЛИ',
        'not': 'НЕ',
        'example': 'Образец',
        'all': 'Все'
      },
    },

    'flexberry-boundingbox': FlexberryBoundingboxComponent
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
        },
        'rectangle': {
          'caption': 'Прямоугольник'
        },
        'polygon': {
          'caption': 'Многоугольник'
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
