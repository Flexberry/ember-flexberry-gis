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
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} options.latlng Center of the bounding box.
    @param {Object[]} options.excludedLayers Layers excluded from identification.
    @private
  */
  _startIdentification({ boundingBox, latlng, excludedLayers }) {
    let e = {
      boundingBox: boundingBox,
      latlng: latlng,
      excludedLayers: Ember.A(excludedLayers || []),
      layers: this._getLayersToIdentify({ excludedLayers }),
      results: Ember.A()
    };

    // Fire custom event on leaflet map (if there is layers to identify).
    if (e.layers.length > 0) {
      this.get('leafletMap').fire('flexberry-map:identify', e);
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
    @param {Object[]} excludedLayers Objects describing those layers which were excluded from identification.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @private
  */
  _finishIdentification(e) {
    let i18n = this.get('i18n');

    // Get i18n captions & properties names.
    let propertyNameColumnCaption = i18n.t('map-tools.identify.identify-popup.properties-table.property-name-column.caption');
    let propertyValueColumnCaption = i18n.t('map-tools.identify.identify-popup.properties-table.property-value-column.caption');
    let layerNameProperty = i18n.t('map-tools.identify.identify-popup.properties-table.layer-name-property.caption');
    let layersCountProperty = i18n.t('map-tools.identify.identify-popup.properties-table.layers-count-property.caption');
    let featuresCountProperty = i18n.t('map-tools.identify.identify-popup.properties-table.features-count-property.caption');
    let errorProperty = i18n.t('map-tools.identify.identify-popup.properties-table.error-property.caption');

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

    let makeListItemActive = ({ item, list, metadataContainer, metadataTable }) => {
      // Remove 'active' class from previously clicked item;
      Ember.$('.item.active', list).removeClass('active');

      // Make clicked item 'active'.
      item.addClass('active');

      // Add metadata table to it's container.
      metadataContainer.empty();
      if (!Ember.isEmpty(metadataTable)) {
        metadataContainer.append(metadataTable);
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

    let $popupContent = Ember.$('<div />').addClass('ui horizontal segments');

    let $popupContentLeft = Ember.$('<div />').addClass('ui segment left-segment');
    $popupContent.append($popupContentLeft);

    let $popupContentRight = Ember.$('<div />').addClass('ui segment right-segment');
    $popupContent.append($popupContentRight);

    let $list = createList();
    $popupContentLeft.append($list);

    let totalProperties = {};
    totalProperties[layersCountProperty] = e.results.length;
    totalProperties[featuresCountProperty] = 0;

    e.results.forEach((identificationResult) => {
      // Possible layer's identification error.
      let error = Ember.get(identificationResult, 'error');
      let features = Ember.A(Ember.get(identificationResult, 'features') || []);
      totalProperties[featuresCountProperty] += features.length;

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
      let $layerListItem = createListItem({
        icon: Ember.isNone(error) ? layerIcon : 'red dont icon',
        caption: layerName
      })
      .addClass('layer-item')
      .on('click', function(e) {
        makeListItemActive({
          item: Ember.$(this),
          list: $list,
          metadataContainer: $popupContentRight,
          metadataTable: $layerMetadataTable
        });
        e.stopPropagation();
      });
      let $layerListItemContent = Ember.$('.content', $layerListItem);
      $list.append($layerListItem);

      if (features.length === 0) {
        return;
      }

      // Add founded features to sub-list.
      let $featuresList = createList();
      $layerListItemContent.append($featuresList);
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
        .on('click', function(e) {
          makeListItemActive({
            item: Ember.$(this),
            list: $list,
            metadataContainer: $popupContentRight,
            metadataTable: $featureMetadataTable
          });
          e.stopPropagation();
        });
        $featuresList.append($featureListItem);
      });
    });
    $popupContentRight.append(createTable(totalProperties));

    let leafletMap = this.get('leafletMap');
    let mapSize = leafletMap.getSize();
    let popupMaxWidth = mapSize.x * 0.8;
    let popupMaxHeight = mapSize.y * 0.8;

    let popup = L.popup({
      className: 'identify-popup',
      maxWidth: popupMaxWidth,
      maxHeight: popupMaxHeight
    })
    .setLatLng(e.latlng)
    .setContent($popupContent[0])
    .openOn(leafletMap);

    // Prevent map 'click' on popup content 'click'.
    L.DomEvent.disableClickPropagation(popup._container);

    // Set static content size size.
    $popupContentLeft.width($popupContentLeft.width());
    $popupContentLeft.height($popupContentLeft.height());

    $popupContentRight.width($popupContentRight.width());
    $popupContentRight.height($popupContentRight.height());

    let $leafletPopupContent = Ember.$('.leaflet-popup-content', Ember.$(popup._container));
    $leafletPopupContent.width($leafletPopupContent.width());
    $leafletPopupContent.height($leafletPopupContent.height());
  },

  /**
    Handles map's 'editable:drawing:end' event.

    @method _rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
    @private
  */
  _rectangleDrawingDidEnd({ layer }) {
    // Get center before layer will be removed from map in super-method.
    let latlng = layer.getCenter();

    this._super(...arguments);

    this._startIdentification({
      boundingBox: layer.getBounds(),
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
