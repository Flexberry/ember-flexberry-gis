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
        'apply-button-label': 'Применить',
        'en-translation-label': 'Локализованная строка (англ.)',
        'ru-translation-label': 'Локализованная строка (рус.)',
        'en-translation-ph': 'Локализованная строка (англ.)',
        'ru-translation-ph': 'Локализованная строка (рус.)',
        'list-heading-label': 'Доступные свойства',
        'no-items-label': 'Нет доступных свойств'
      },
      'display-settings': {
        'date-format-label': 'Формат даты',
        'display-property-is-callback-label': 'Отображаемое свойство – callback',
        'display-property-label': 'Отображаемое свойство',
        'excluded-properties-label': 'Исключаемые свойства'
      },

      'identification-settings': 'Может быть идентифицирован',

      'context-search-fields-selector': 'Поля для контекстного поиска',

      'legend-settings': {
        'legend-can-be-displayed': 'Отображать легенду',
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
