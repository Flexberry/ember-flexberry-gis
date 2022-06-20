# Ember Flexberry GIS Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
* Nuget package ember-test-selectors
* Add `>x`, `<y`, `>=x`, `<=y` intervals support for graduated layer-style.
* Add base component for graduated and unique layers-styles.
* Add automatic set fill and stroke color from gradient range to symbols in graduated and unique layers-styles.
* Add geometry filters into `geojson` layers.
* Add layer polygons intersection check.
* Add support for point objects (markers) in vector layers legends.
* Add pane and renderer on objects in layer WFS when layer is created.
* Add utils open\close sub menu in componetns: feature-result-item and flexberry-maplayers.
* Add geometryPrecisionReducer in functions utils/layer-to-jsts
* Add constant scale on mapApi
* Add ability to set rights flexberry-maplayers component (property "access")

### Changed
* Version of ember-flexberry and ember-flexberry-data
* Name of package daterangepicker
* Change chart's library from `highcharts` to `chart.js`.
* ContinueLoad with showExisting layers (odata-vector/wfs).
* ShowAllLayerObjects doesn't clear objects on layer if showExitsting = true.
* Style icon minus on identification container.
* Change leafletLayer loading, moved from layer-styles to `layers-styles-editor` component.
* Update dependency on the `jquery-minicolors` bower package to version `2.3.4`.
* icon on indetify panel: rectangle and broken line.
* height on list of feature in identify panel.

### Fixed
* Fix !important for class hidden.
* Fix jump fitBounds when export map.
* Delete callAction.
* Fix legends for graduated layer-style.
* Fix check all objects in attributes panel.
* Fix `bboxEWKT` in `flexberry-boundingbox` component.
* Identification on `geojson` layers, when them contains multigeometries or collections.
* Fix not reseting map tool when draw new geometry from attributes table.

## [0.4.0.beta.x] - 26.10.2017
### Added
* Add base class for vector layers.
* Add vector layer class implementation for KML layers.
* Add vector layer class implementation for GeoJSON layers.
* Add markers clusterization for vector layers.
* Add `flexberry-boundingbox` component.
* Add bounding box filtration into `gis-search-form`.
* Add scale filtration into `gis-search-form`.
* Add layer links GUI into layers and metadata edit forms/dialogs.
* Add `locate` map-command for geolocation.
* Add ability to customize `flexberry-maplayer` content (layers tree nodes) with own components.
### Fixed
* Fix map export/printing in yandex browser.

## [0.3.1] - 2017-10-03
### Added
* Add Semantic UI/Flexberry themes support.
* Add `flexberry-edit-layermap` component to unify layers and layers-metadata editing.
* Add `gis-search-form` making available search through maps and layer-metadata.
* Add `edit` dialog allowing map properties editing, and add logic which opens `edit` dialog automatically for new maps.
* Add `map-info` dialog which opens automatically and displays map description for those users who haven't seen it before.

## [0.2.1] - 2017-09-04
### Removed
* Remove `isDevelopingAddon` property from release.

## [0.2.0] - 2017-08-30
### Added
* Add `full-extent` map instrument.
* Add map query parameters to URL (`lat`, `lng` and `zoom`).
* Add redirect to list and edit forms from identification results.
* Add legends export on separate page.
* Add support for various response formats of WMS layers identification.

### Changed
* CSW moved to separate addon.

## [0.1.0] - 2017-06-27
### Added
* Add `flexberry-map` and `flexberry-maplayers` components.
* Add map controls: `history-control`, `legend-control`, `minimap-control`, `scale-control`, `switch-scale-control`, `zoomslider-control`.
* Add map instruments: `drag`, `draw`, `identify`, `measure`, `zoom-in`, `zoom-out`, `go-to`, `search`, `export`.
* Add map layers: `geocoder-osm-overpass-layer`, `geocoder-osm-ru-layer`, `group-layer`, `tile-layer`, `wfs-layer`, `wms-layer`, `wms-single-tile-layer`, `wms-wfs-layer`.
