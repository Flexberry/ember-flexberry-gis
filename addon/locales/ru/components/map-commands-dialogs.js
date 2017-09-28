import GoTo from './map-commands-dialogs/go-to';
import ExportDialog from './map-commands-dialogs/export';
import Search from './map-commands-dialogs/search';

import GeocoderOsmRuSearchSettings from './map-commands-dialogs/search-settings/geocoder-osm-ru';
import WFSSearchSettings from './map-commands-dialogs/search-settings/wfs';
import KMLSearchSettings from './map-commands-dialogs/search-settings/kml';

export default {
  'go-to': GoTo,
  'export': ExportDialog,
  'search': Search,
  'search-settings': {
    'geocoder-osm-ru': GeocoderOsmRuSearchSettings,
    'wfs': WFSSearchSettings,
    'kml': KMLSearchSettings
  }
};
