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
    Method to prepare identify result if need

    @method prepareIdentifyResult
    @default null
  */
  prepareIdentifyResult: null,

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
    let leafletMap = this.get('leafletMap');

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
    let featuresLayer = L.featureGroup().addTo(leafletMap);
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

    let activeListItem = null;
    let makeListItemActive = ({ item, parent, metadataContainer, metadataTable, callback }) => {
      if (activeListItem === item) {
        return;
      }

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

      activeListItem = item;
    };

    let createTable = (properties, excludedPropertiesNames, localizedProperties) => {
      properties = properties || {};
      excludedPropertiesNames = Ember.A(excludedPropertiesNames || []);
      localizedProperties = localizedProperties || {};

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
        if (excludedPropertiesNames.contains(propertyName)) {
          return;
        }

        let propertyValue = properties[propertyName];
        let localizedPropertyName = localizedProperties[propertyName] || propertyName;

        let $tableRow = Ember.$('<tr />');
        $tableBody.append($tableRow);

        let $tablePropertyNameCell = Ember.$('<td />').text(localizedPropertyName);
        $tableRow.append($tablePropertyNameCell);

        let $tablePropertyValueCell = Ember.$('<td />').text(propertyValue);
        $tableRow.append($tablePropertyValueCell);
      });

      return $table;
    };

    let createWrapper = function(element) {
      let wrapper = Ember.$('<div>');
      wrapper.append(element);
      return wrapper;
    };

    let showFeaturesOnMap = function({ features }) {
      if (!Ember.isArray(features) && Ember.get(features, 'length') === 0) {
        return;
      }

      // Clear previous features & add new.
      // Leaflet clear's layers with some delay, add if we add again some cleared layer (immediately after clear),
      // it will be removed after delay (by layer's id),
      // so we will use timeout until better solution will be found.
      Ember.run(() => {
        featuresLayer.clearLayers();
        setTimeout(() => {
          // Show new features.
          features.forEach((feature) => {
            let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
            if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
              leafletLayer.setStyle({ color: 'salmon' });
            }

            leafletLayer.addTo(featuresLayer);
          });
        }, 10);
      });
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
      if (featuresCount === 0 && Ember.isNone(error)) {
        return;
      }

      totalProperties[layersCountProperty] += 1;
      totalProperties[featuresCountProperty] += featuresCount;

      // Add layer to list.
      let layer = Ember.get(identificationResult, 'layer');
      let layerFactory = Ember.getOwner(this).knownForType('layer', Ember.get(layer, 'type'));
      let layerIcon = Ember.get(layerFactory, 'iconClass');
      let layerName = Ember.get(layer, 'name');

      let layerIdentifySettings = Ember.get(layer, 'settingsAsObject.identifySettings') || {};
      let featuresPropertiesSettings = Ember.get(layerIdentifySettings, 'featuresPropertiesSettings') || {};
      let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback');
      let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');
      let excludedProperties = Ember.A(Ember.get(featuresPropertiesSettings, 'excludedProperties') || []);
      let localizedProperties = Ember.A(Ember.get(featuresPropertiesSettings, 'localizedProperties') || {});
      localizedProperties = Ember.get(localizedProperties, i18n.get('locale')) || {};

      let getFeatureFirstAvailableProperty = function(feature) {
        let featureProperties = Ember.get(feature, 'properties') || {};
        let displayPropertyName = Object.keys(featureProperties)[0];
        return featureProperties[displayPropertyName] || '';
      };

      let getFeatureCaption = function(feature) {
        if (Ember.typeOf(displayProperty) !== 'string') {
          // Retrieve first available property.
          return getFeatureFirstAvailableProperty(feature);
        }

        if (!displayPropertyIsCallback) {
          // Return defined property (or first available if defined property doesn't exist).
          let featureProperties = Ember.get(feature, 'properties') || {};
          return featureProperties.hasOwnProperty(displayProperty) ?
            featureProperties[displayProperty] :
            getFeatureFirstAvailableProperty(feature);
        }

        // Defined displayProperty is a serialized java script function, which can calculate display property.
        let calculateDisplayProperty = eval(`(${displayProperty})`);
        Ember.assert(
          'Property \'settings.identifySettings.featuresPropertiesSettings.displayProperty\' ' +
          'in layer \'' + layerName + '\' is not a valid java script function',
          Ember.typeOf(calculateDisplayProperty) === 'function');

        return calculateDisplayProperty(feature);
      };

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
      .on('click', (clickEventObject) => {
        makeListItemActive({
          item: $layersAccordionItem,
          parent: $layersAccordion,
          metadataContainer: $popupContentRight,
          metadataTable: $layerMetadataTable,
          callback: () => {
            showFeaturesOnMap({ features: features });
          }
        });

        if (featuresCount === 0) {
          // Prevent empty item from being expanded on click.
          clickEventObject.stopPropagation();
        }
      });

      let $layersAccordionItemContent = Ember.$('.content', $layersAccordionItem);
      $layersAccordion.append($layersAccordionItem);

      // Call hook giving ability to add some additional markup.
      this._popupLayerElementCreated({
        element: $layersAccordionItem,
        propertiesElement: $layerMetadataTable,
        identificationResult: identificationResult,
        layer: layer
      });

      if (features.length === 0) {
        return;
      }

      // Add founded features to sub-list.
      let $featuresList = createList();
      $layersAccordionItemContent.append($featuresList);
      features.forEach((feature) => {

        let prepareIdentifyResult = this.get('prepareIdentifyResult');
        feature = typeof (prepareIdentifyResult) === 'function' ? prepareIdentifyResult(feature) : feature;

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

        let featureCaption = getFeatureCaption(feature);
        let $featureMetadataTable = createWrapper(createTable(Ember.get(feature, 'properties'), excludedProperties, localizedProperties));
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

        // Call hook giving ability to add some additional markup.
        this._popupFeatureElementCreated({
          element: $featureListItem,
          propertiesElement: $featureMetadataTable,
          identificationResult: identificationResult,
          feature: feature
        });
      });
    });
    $popupContentRight.append(createTable(totalProperties));

    let mapSize = leafletMap.getSize();
    let popupLatLng = L.latLng(e.boundingBox.getNorthEast().lat, e.boundingBox.getCenter().lng);
    let popupMaxWidth = mapSize.x * 0.8;
    let popupMinWidth = popupMaxWidth;
    let popupMaxHeight = mapSize.y * 0.5;

    // Hide map loader.
    leafletMap.setLoaderContent('');
    leafletMap.hideLoader();

    // Finally show popup.
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
    Handles identification popup layer element creation.

    @method _popupLayerElementCreated
    @param {Object} options method options.
    @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} options.element Created jQuery element.
    @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} options.propertiesElement Created jQuery properties element.
    @param {Object[]} options.identificationResults Identification results related to layer.
    @param {Object} options.layer Layer itself.
    @private
  */
  _popupLayerElementCreated(options) {
  },

  /**
    Handles identification popup feature element creation.

    @method _popupLayerTreeItemElementCreated
    @param {Object} options method options.
    @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} options.element Created jQuery element.
    @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} options.propertiesElement Created jQuery properties element.
    @param {Object[]} options.identificationResults Identification results related to feature's layer.
    @param {Object} options.feature Feature itself.
    @private
  */
  _popupFeatureElementCreated(options) {
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

    // Show map loader.
    let i18n = this.get('i18n');
    let leafletMap = this.get('leafletMap');
    leafletMap.setLoaderContent(i18n.t('map-tools.identify.loader-message'));
    leafletMap.showLoader();

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
