import GoTo from './map-commands-dialogs/go-to';
import ExportDialog from './map-commands-dialogs/export';
import Search from './map-commands-dialogs/search';

import GeocoderOsmRuSearchSettings from './map-commands-dialogs/search-settings/geocoder-osm-ru';
import WFSSearchSettings from './map-commands-dialogs/search-settings/wfs';
import GeoJSONSearchSettings from './map-commands-dialogs/search-settings/geojson';
import KMLSearchSettings from './map-commands-dialogs/search-settings/kml';
import ODataSearchSettings from './map-commands-dialogs/search-settings/odata-vector';

export default {
  'go-to': GoTo,
  'export': ExportDialog,
  'search': Search,
  'search-settings': {
    'geocoder-osm-ru': GeocoderOsmRuSearchSettings,
    'wfs': WFSSearchSettings,
    'geojson':GeoJSONSearchSettings,
    'kml': KMLSearchSettings,
    'odata-vector': ODataSearchSettings
  }
};
