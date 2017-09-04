# Ember Flexberry GIS Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

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
