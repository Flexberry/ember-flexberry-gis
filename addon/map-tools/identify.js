/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RectangleMapTool from './rectangle';

/**
  Identify map-tool.

  @class IdentifyMapTool
  @extends RectangleMapTool
*/
export default RectangleMapTool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'help'
  */
  cursor: 'help',

  /**
    Flag: indicates whether to hide rectangle on drawing end or not.

    @property hideRectangleOnDrawingEnd
    @type Boolean
    @default true
  */
  hideRectangleOnDrawingEnd: false,

  /**
    Checks whether given layer can be identified.

    @method _layerCanBeIdentified
    @returns {Boolean} Flag: indicates whether given layer can be identified.
    @private
  */
  _layerCanBeIdentified(layer) {
    let layerClassFactory = Ember.getOwner(this).knownForType('layer', Ember.get(layer, 'type'));

    return Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('identify');
  },

  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @param {Object} options Method options.
    @param {Object[]} options.excludedLayers Layers that must be excluded from identification.
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify({ excludedLayers }) {
    Ember.assert('Method \'_getLayersToIdentify\' must be overridden in some extended identify map-tool.', false);
  },

  /**
    Starts identification by array of satisfying layers inside given bounding box.

    @method _startIdentification
    @param {Object} options Method options.
    @param {<a href="http://leafletjs.com/reference.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng</a>} options.latlng Center of the bounding box.
    @param {<a href="http://leafletjs.com/reference.html#rectangle">L.Rectangle</a>} options.boundingBoxLayer Rectangle layer related to bounding box.
    @param {Object[]} options.excludedLayers Layers excluded from identification.
    @private
  */
  _startIdentification({ boundingBox, latlng, boundingBoxLayer, excludedLayers }) {
    let i18n = this.get('i18n');
    let leafletMap = this.get('leafletMap');

    // Show map loader.
    leafletMap.setLoaderContent(i18n.t('map-tools.identify.loader-message'));
    leafletMap.showLoader();

    let e = {
      boundingBox: boundingBox,
      latlng: latlng,
      boundingBoxLayer: boundingBoxLayer,
      excludedLayers: Ember.A(excludedLayers || []),
      layers: this._getLayersToIdentify({ excludedLayers }),
      results: Ember.A()
    };

    // Fire custom event on leaflet map (if there is layers to identify).
    if (e.layers.length > 0) {
      leafletMap.fire('flexberry-map:identify', e);
    }

    // Promises array could be totally changed in 'flexberry-map:identify' event handlers, we should prevent possible errors.
    e.results = Ember.isArray(e.results) ? e.results : Ember.A();
    let results = Ember.A();
    let promises = Ember.A();

    // Handle each result.
    // Detach promises from already received features.
    e.results.forEach((result) => {
      if (Ember.isNone(result)) {
        return;
      }

      results.pushObject(result);
      let layer = Ember.get(result, 'layer');
      let features = Ember.get(result, 'features');

      if (!(features instanceof Ember.RSVP.Promise)) {
        return;
      }

      promises.pushObject(features);
      features.then((receivedFeatures) => {
        Ember.set(result, 'features', receivedFeatures);
      }).catch((reason) => {
        Ember.set(result, 'features', null);
        Ember.set(result, 'error', reason || new Error('Unknown error'));

        // Log error.
        let i18n = this.get('i18n');
        let errorMessage = i18n.t('map-tools.identify.error-message', {
          layerName: Ember.get(layer, 'name')
        });
        Ember.Logger.error(`${errorMessage}: `, reason);
      });
    });

    // Wait for all promises to be settled & call '_finishIdentification' hook.
    Ember.RSVP.allSettled(promises).then(() => {
      e.results = results;
      this._finishIdentification(e);

      // Hide map loader.
      leafletMap.setLoaderContent('');
      leafletMap.hideLoader();
    });
  },

  /**
    Finishes identification.

    @method _finishIdentification
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} e.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {<a href="http://leafletjs.com/reference.html#rectangle">L.Rectangle</a>} options.boundingBoxLayer Rectangle layer related to bounding box.
    @param {Object[]} excludedLayers Objects describing those layers which were excluded from identification.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @return {<a href="http://leafletjs.com/reference.html#popup">L.Popup</a>} Popup containing identification results.
    @private
  */
  _finishIdentification(e) {
    let leafletMap = this.get('leafletMap');
    let featuresLayer = L.layerGroup().addTo(leafletMap);
    let boundingBoxLayer = Ember.get(e, 'boundingBoxLayer');

    let i18n = this.get('i18n');

    // Get i18n captions & properties names.
    let propertyNameColumnCaption = i18n.t('map-tools.identify.identify-popup.properties-table.property-name-column.caption');
    let propertyValueColumnCaption = i18n.t('map-tools.identify.identify-popup.properties-table.property-value-column.caption');
    let layerNameProperty = i18n.t('map-tools.identify.identify-popup.properties-table.layer-name-property.caption');
    let layersCountProperty = i18n.t('map-tools.identify.identify-popup.properties-table.layers-count-property.caption');
    let featuresCountProperty = i18n.t('map-tools.identify.identify-popup.properties-table.features-count-property.caption');
    let errorProperty = i18n.t('map-tools.identify.identify-popup.properties-table.error-property.caption');

    let createLayersAccordion = () => {
      return Ember.$('<div />').addClass('ui accordion').accordion({
        exclusive: false
      });
    };

    let createLayersAccordionItem = ({ icon, caption }) => {
      let $item = Ember.$('<div />');

      let $itemTitle = Ember.$('<div />').addClass('title');

      let $dropdownIcon = Ember.$('<i />').addClass('dropdown icon');
      $itemTitle.append($dropdownIcon);

      let $itemIcon = null;
      if (Ember.isArray(icon)) {
        $itemIcon = Ember.$('<i />');
        $itemIcon.addClass('icons');

        Ember.A(icon).forEach((i) => {
          let $itemIconPart = Ember.$('<i />');
          $itemIconPart.addClass(i);

          $itemIcon.append($itemIconPart);
        });
      } else {
        $itemIcon = Ember.$('<i />');
        $itemIcon.addClass(icon);
      }

      if (!Ember.isNone($itemIcon)) {
        $itemTitle.append($itemIcon);
      }

      $itemTitle.append(caption);

      let $itemContent = Ember.$('<div />').addClass('content');

      $item.append($itemTitle);
      $item.append($itemContent);

      return $item;
    };

    let createList = () => {
      return Ember.$('<div />').addClass('ui list');
    };

    let createListItem = ({ icon, caption }) => {
      let $item = Ember.$('<div />').addClass('item');

      let $itemIcon = null;
      if (Ember.isArray(icon)) {
        $itemIcon = Ember.$('<i />');
        $itemIcon.addClass('icons');

        Ember.A(icon).forEach((i) => {
          let $itemIconPart = Ember.$('<i />');
          $itemIconPart.addClass(i);

          $itemIcon.append($itemIconPart);
        });
      } else {
        $itemIcon = Ember.$('<i />');
        $itemIcon.addClass(icon);
      }

      if (!Ember.isNone($itemIcon)) {
        $item.append($itemIcon);
      }

      let $itemContent = Ember.$('<div />').addClass('content');
      $item.append($itemContent);

      let $itemCaption = Ember.$('<div />').addClass('header').text(caption);
      $itemContent.append($itemCaption);

      return $item;
    };

    let makeListItemActive = ({ item, parent, metadataContainer, metadataTable, callback }) => {
      // Remove 'active' class from previously clicked item;
      Ember.$('.item.active', parent).removeClass('active');

      // Make clicked item 'active'.
      item.addClass('active');

      // Add metadata table to it's container.
      metadataContainer.empty();
      if (!Ember.isEmpty(metadataTable)) {
        metadataContainer.append(metadataTable);
      }

      if (Ember.typeOf(callback) === 'function') {
        callback();
      }
    };

    let createTable = (properties) => {
      properties = properties || {};

      let $table = Ember.$('<table />').addClass('ui compact celled table');

      let $tableHead = Ember.$('<thead />');
      $table.append($tableHead);

      let $tableHeadRow = Ember.$('<tr />');
      $tableHead.append($tableHeadRow);

      let $tableHeaderPropertyNameCell = Ember.$('<th />').text(propertyNameColumnCaption);
      $tableHeadRow.append($tableHeaderPropertyNameCell);

      let $tableHeaderPropertyValueCell = Ember.$('<th />').text(propertyValueColumnCaption);
      $tableHeadRow.append($tableHeaderPropertyValueCell);

      let $tableBody = Ember.$('<tbody />');
      $table.append($tableBody);

      let propertiesNames = Ember.A(Object.keys(properties) || []);
      propertiesNames.forEach((propertyName) => {
        let propertyValue = properties[propertyName];

        let $tableRow = Ember.$('<tr />');
        $tableBody.append($tableRow);

        let $tablePropertyNameCell = Ember.$('<td />').text(propertyName);
        $tableRow.append($tablePropertyNameCell);

        let $tablePropertyValueCell = Ember.$('<td />').text(propertyValue);
        $tableRow.append($tablePropertyValueCell);
      });

      return $table;
    };

    let showFeaturesOnMap = function({ features }) {
      // Clear previous features.
      featuresLayer.clearLayers();

      // Show new features.
      L.geoJSON(features, {
        style: function (feature) {
          return { color: 'salmon' };
        }
      }).addTo(featuresLayer);

      //leafletMap.fitBounds(featuresGeoJsonLayer.getBounds());
    };

    let $popupContentLeft = Ember.$('<div />').addClass('column');
    let $popupContentRight = Ember.$('<div />').addClass('column');

    let $layersAccordion = createLayersAccordion();
    $popupContentLeft.append($layersAccordion);

    let totalProperties = {};
    totalProperties[layersCountProperty] = 0;
    totalProperties[featuresCountProperty] = 0;

    e.results.forEach((identificationResult) => {
      // Possible layer's identification error.
      let error = Ember.get(identificationResult, 'error');
      let features = Ember.A(Ember.get(identificationResult, 'features') || []);
      let featuresCount = Ember.get(features, 'length');
      if (featuresCount === 0) {
        return;
      }

      totalProperties[layersCountProperty] += 1;
      totalProperties[featuresCountProperty] += featuresCount;

      // Add layer to list.
      let layer = Ember.get(identificationResult, 'layer');
      let layerFactory = Ember.getOwner(this).knownForType('layer', Ember.get(layer, 'type'));
      let layerIcon = Ember.get(layerFactory, 'iconClass');
      let layerName = Ember.get(layer, 'name');

      let layerProperties = {};
      layerProperties[layerNameProperty] = layerName;
      layerProperties[featuresCountProperty] = features.length;
      if (!Ember.isNone(error)) {
        layerProperties[errorProperty] = error.message || error;
      }

      let $layerMetadataTable = createTable(layerProperties);
      let $layersAccordionItem = createLayersAccordionItem({
        icon: Ember.isNone(error) ? layerIcon : 'red dont icon',
        caption: layerName
      })
      .addClass('item layer-item');

      Ember.$('.title', $layersAccordionItem)
      .on('click', () => {
        makeListItemActive({
          item: $layersAccordionItem,
          parent: $layersAccordion,
          metadataContainer: $popupContentRight,
          metadataTable: $layerMetadataTable,
          callback: () => {
            showFeaturesOnMap({ features: features });
          }
        });
      });

      let $layersAccordionItemContent = Ember.$('.content', $layersAccordionItem);
      $layersAccordion.append($layersAccordionItem);

      if (features.length === 0) {
        return;
      }

      // Add founded features to sub-list.
      let $featuresList = createList();
      $layersAccordionItemContent.append($featuresList);
      features.forEach((feature) => {
        let featureIcon = null;
        switch (Ember.get(feature, 'geometry.type')) {
          case 'LineString':
          case 'MultiLineString':
            featureIcon = 'fork icon';
            break;
          case 'Polygon':
          case 'MultiPolygon':
            featureIcon = 'object ungroup icon';
            break;
          default:
            featureIcon = 'marker icon';
        }
        let featureProperties = Ember.get(feature, 'properties');
        let featureCaptionProperty = Object.keys(featureProperties)[0];
        let featureCaption = Ember.isBlank(featureCaptionProperty) ? '' : featureProperties[featureCaptionProperty];
        let $featureMetadataTable = createTable(featureProperties);
        let $featureListItem = createListItem({
          icon: featureIcon,
          caption: featureCaption
        })
        .addClass('feature-item')
        .on('click', () => {
          makeListItemActive({
            item: $featureListItem,
            parent: $layersAccordion,
            metadataContainer: $popupContentRight,
            metadataTable: $featureMetadataTable,
            callback: () => {
              showFeaturesOnMap({ features: Ember.A([feature]) });
            }
          });
        });
        $featuresList.append($featureListItem);
      });
    });
    $popupContentRight.append(createTable(totalProperties));

    let mapSize = leafletMap.getSize();
    let popupLatLng = L.latLng(e.boundingBox.getNorthEast().lat, e.boundingBox.getCenter().lng);
    let popupMaxWidth = mapSize.x * 0.8;
    let popupMinWidth = popupMaxWidth;
    let popupMaxHeight = mapSize.y * 0.5;

    let popup = L.popup({
      className: 'identify-popup',
      maxWidth: popupMaxWidth,
      minWidth: popupMinWidth,
      maxHeight: popupMaxHeight,
      autoPan: false
    })
    .setLatLng(popupLatLng)
    .openOn(leafletMap);

    // Prevent map 'click' on popup content 'click'.
    L.DomEvent.disableClickPropagation(popup._container);

    let $leafletPopupContent = Ember.$('.leaflet-popup-content', Ember.$(popup._container));
    $leafletPopupContent.addClass('ui two column celled grid');

    // Add content to popup & update.
    $leafletPopupContent.append($popupContentLeft);
    $leafletPopupContent.append($popupContentRight);
    popup.update();

    // Popup hasn't minHeight property, so we need to fix it manually.
    $leafletPopupContent.height(popupMaxHeight);

    // Auto pan executes in opening moment (before we manually fix height).
    // So we need to pan popup manually.
    popup.options.autoPan = true;
    popup._adjustPan();

    leafletMap.once('popupclose', (e) => {
      if (e.popup !== popup) {
        return;
      }

      featuresLayer.clearLayers();
      featuresLayer.remove();

      boundingBoxLayer.remove();
    });

    return popup;
  },

  /**
    Handles map's 'editable:drawing:end' event.

    @method _rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
    @private
  */
  _rectangleDrawingDidEnd({ layer }) {
    // Get center & bbox before layer will be removed from map in super-method.
    let latlng = layer.getCenter();
    let boundingBox = layer.getBounds();
    if (boundingBox.getSouthWest().equals(boundingBox.getNorthEast())) {
      // Bounding box is point.
      // Identification can be incorrect or even failed in such situation,
      // so extend bounding box a little (around specified point).
      let leafletMap = this.get('leafletMap');
      let y = leafletMap.getSize().y / 2;
      let a = leafletMap.containerPointToLatLng([0, y]);
      let b = leafletMap.containerPointToLatLng([100, y]);

      // Current scale (related to current zoom level).
      let maxMeters = leafletMap.distance(a, b);

      // Bounding box around south west point with radius of current scale * 0.05.
      boundingBox = boundingBox.getSouthWest().toBounds(maxMeters * 0.05);
    }

    // Call super method to remove drawn rectangle & start a new one.
    this._super(...arguments);

    // Start identification.
    this._startIdentification({
      boundingBoxLayer: layer,
      boundingBox: boundingBox,
      latlng: latlng
    });
  },

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._super(...arguments);
  }
});
