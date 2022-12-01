import LayersStylesEditorComponent from './components/layers-styles-editor';
import LayersStylesComponents from './components/layers-styles';
import MarkersStylesEditorComponent from './components/markers-styles-editor';
import MarkersStylesComponents from './components/markers-styles';
import MapToolsComponents from './components/map-tools';
import MapCommandsComponents from './components/map-commands';
import SpatialBookmarksComponent from './components/spatial-bookmarks';
import MapDialogsComponents from './components/map-dialogs';
import LayersDialogsComponents from './components/layers-dialogs';
import MapCommandsDialogsComponents from './components/map-commands-dialogs';
import LegendsComponents from './components/legends';

import FlexberryMapInfoComponent from './components/flexberry-mapinfo';
import FlexberryMultipleSelectComponent from './components/flexberry-multiple-select';
import FlexberryMapToolbarComponent from './components/flexberry-maptoolbar';
import FlexberryMapComponent from './components/flexberry-map';
import FlexberryMapLayersComponent from './components/flexberry-maplayers';
import FlexberryMapLayerComponent from './components/flexberry-maplayer';
import FlexberrySearchComponent from './components/flexberry-search';
import FlexberryTableComponent from './components/flexberry-table';
import FlexberryLinksEditorComponent from './components/flexberry-links-editor';
import FlexberryWfsFilterComponent from './components/flexberry-wfs-filter';
import FlexberryBoundingboxComponent from './components/flexberry-boundingbox';
import FlexberryEditCrsComponent from './components/flexberry-edit-crs';
import FlexberryIdentifyPanel from './components/flexberry-identify-panel';
import FlexberryLayersAttributesPanel from './components/flexberry-layers-attributes-panel';
import FlexberryLayersIntersectionPanel from './components/flexberry-layers-intersections-panel';
import GeometryAddModesComponents from './components/geometry-add-modes';
import ChartsComponents from './components/charts';
import LayerResultListComponent from './components/layer-result-list';
import FeatureResultItemComponent from './components/feature-result-item';
import HistoryControlComponent from './components/history-control';
import FlexberryCreateObjectGeometry from './components/flexberry-create-object-geometry';
import CompareObjectGeometries from './components/compare-object-geometries-panel';
import MinimapComponent from './components/minimap';
import EditLayerFeatureComponent from './components/flexberry-edit-layer-feature';

export default {
  'layers-styles-editor': LayersStylesEditorComponent,
  'layers-styles': LayersStylesComponents,

  'markers-styles-editor': MarkersStylesEditorComponent,
  'markers-styles': MarkersStylesComponents,

  'map-tools': MapToolsComponents,
  'map-commands': MapCommandsComponents,
  'spatial-bookmarks': SpatialBookmarksComponent,

  'map-dialogs': MapDialogsComponents,
  'layers-dialogs': LayersDialogsComponents,
  'map-commands-dialogs': MapCommandsDialogsComponents,

  'legends': LegendsComponents,

  'flexberry-mapinfo': FlexberryMapInfoComponent,
  'flexberry-maptoolbar': FlexberryMapToolbarComponent,
  'flexberry-map': FlexberryMapComponent,
  'flexberry-maplayers': FlexberryMapLayersComponent,
  'flexberry-maplayer': FlexberryMapLayerComponent,
  'flexberry-search': FlexberrySearchComponent,
  'flexberry-table': FlexberryTableComponent,
  'flexberry-links-editor': FlexberryLinksEditorComponent,
  'flexberry-wfs-filter': FlexberryWfsFilterComponent,
  'flexberry-boundingbox': FlexberryBoundingboxComponent,
  'flexberry-edit-crs': FlexberryEditCrsComponent,
  'flexberry-identify-panel': FlexberryIdentifyPanel,
  'flexberry-layers-attributes-panel': FlexberryLayersAttributesPanel,
  'flexberry-layers-intersections-panel': FlexberryLayersIntersectionPanel,
  'flexberry-multiple-select': FlexberryMultipleSelectComponent,
  'geometry-add-modes': GeometryAddModesComponents,
  'charts': ChartsComponents,
  'layer-result-list': LayerResultListComponent,
  'feature-result-item': FeatureResultItemComponent,
  'history-control': HistoryControlComponent,
  'flexberry-create-object-geometry': FlexberryCreateObjectGeometry,
  'compare-object-geometries': CompareObjectGeometries,
  'minimap': MinimapComponent,
  'flexberry-edit-layer-feature': EditLayerFeatureComponent,
  'favourites-list': {
    'clear': {
      'tooltip': 'Clear selection'
    }
  }
};
