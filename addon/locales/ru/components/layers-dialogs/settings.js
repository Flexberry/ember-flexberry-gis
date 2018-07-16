import Wms from './settings/wms';
import Wfs from './settings/wfs';
import WmsWfs from './settings/wms-wfs';
import GeoJson from './settings/geojson';
import Kml from './settings/kml';

export default {
  'group': {
    'tab': {
      'search-settings': {
        'can-be-context-searched-label': 'Может быть найдено в контексте',
        'can-be-searched-label': 'Может быть найдено',
        'search-fields-selector': 'Поля для поиска',
        'context-search-fields-selector': 'Поля для контекстного поиска',
      },
      'display-settings': {
        'date-format-label': 'Формат даты',
        'date-format-ph': 'DD.MM.YYYY',
        'display-property-is-callback-label': 'Отображаемое свойство – callback',
        'display-property-label': 'Отображаемое свойство',
        'display-property-ph': 'Отображаемое свойство',
        'excluded-properties-label': 'Исключаемые свойства',
        'apply-button-label': 'Применить',
        'translation-label': 'Локализованная строка',
        'translation-ph': 'Локализованная строка',
        'properties-list-heading': 'Доступные свойства',
        'show-prop-heading': 'Показывать?',
        'locales-list-heading': 'Доступные локали',
        'no-items-label': 'Нечего показать'
      },

      'identification-settings': 'Может быть идентифицирован',

      'context-search-fields-selector': 'Поля для контекстного поиска',

      'legend-settings': {
        'legend-can-be-displayed': 'Отображать легенду',
        'geometries-can-be-displayed': 'Отображать на легенде линейные и полигональные объекты',
        'markers-can-be-displayed': 'Отображать на легенде точечные объекты',
        'url': 'URL',
        'version': 'Версия',
        'format': 'Формат',
        'layers': 'Слои'
      },
    },
  },

  'tile': {
    'url-textbox': {
      'caption': 'Url'
    },
    'no-wrap-checkbox': {
      'caption': 'Свойство слоя noWrap'
    }
  },

  'wms': Wms,

  'wfs': Wfs,

  'wms-single-tile': Wms,

  'wms-wfs': WmsWfs,

  'geojson': GeoJson,

  'kml': Kml,

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
  }
};
