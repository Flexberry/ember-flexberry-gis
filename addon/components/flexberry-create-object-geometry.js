import Ember from 'ember';
import layout from '../templates/components/flexberry-create-object-geometry';
import WfsLayerComponent from 'ember-flexberry-gis/components/layers/wfs-layer';
import crsFactoryESPG3857 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-3857';
import {
  translationMacro as t
} from 'ember-i18n';

export default Ember.Component.extend({
  layout,

  /**
  Service for managing map API.
  @property mapApi
  @type MapApiService
  */
  mapApi: Ember.inject.service(),

  /**
    'draw' caption.

    @property drawCaption
    @type String
    @default t('components.flexberry-create-object-geometry.draw.caption')
  */
  drawCaption: t('components.flexberry-create-object-geometry.draw.caption'),

  /**
    'draw' icon CSS-class names.

    @property drawIconClass
    @type String
    @default 'polygon icon'
  */
  drawIconClass: 'polygon icon',

  /**
    'zoom to' caption.

    @property zoomToCaption
    @type String
    @default t('components.flexberry-create-object-geometry.zoomTo.caption')
  */
  zoomToCaption: t('components.flexberry-create-object-geometry.zoomTo.caption'),

  /**
    'zoom to' icon CSS-class names.

    @property zoomToIconClass
    @type String
    @default 'marker icon'
  */
  zoomToIconClass: 'marker icon',

  /**
    'remove' caption.

    @property removeCaption
    @type String
    @default t('components.flexberry-create-object-geometry.remove.caption')
  */
  removeCaption: t('components.flexberry-create-object-geometry.remove.caption'),

  /**
    'remove' icon CSS-class names.

    @property removeIconClass
    @type String
    @default 'trash icon'
  */
  removeIconClass: 'trash icon',

  /**
    'save'caption.

    @property saveCaption
    @type String
    @default t('components.flexberry-create-object-geometry.save.caption')
  */
  saveCaption: t('components.flexberry-create-object-geometry.save.caption'),

  /**
    'save' icon CSS-class names.

    @property saveIconClass
    @type String
    @default 'save icon'
  */
  saveIconClass: 'save icon',

  _allowCoordinatesEdit: false,

  _coordinates: null,

  _editTools: Ember.computed('leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    let editTools = Ember.get(leafletMap, 'drawTools');

    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      editTools.on('editable:vertex:dragend', this._updateCoordinates, this);
      editTools.on('editable:vertex:deleted', this._updateCoordinates, this);
      editTools.on('editable:drawing:end', this._updateCoordinates, this);

      Ember.set(this.get('leafletMap'), 'drawTools', editTools);
    }

    return editTools;
  }),

  _wfsLayer: null,

  createItem: null,

  layerModel: Ember.computed('createItem', function () {
    return this.get('createItem.layerModel');
  }),

  leafletMap: null,

  linkParameters: Ember.computed('createItem', function () {
    return this.get('createItem.linkParameters');
  }),

  geometryCreated: false,

  queryFilter: Ember.computed('createItem', function () {
    return this.get('createItem.queryFilter');
  }),

  actions: {
    onDraw() {
      this._clearCurrentGeometry();
      let editTools = this.get('_editTools');
      editTools.on('editable:drawing:end', this._finishDraw, this);
      this.get('leafletMap').fire('flexberry-map:switchToDefaultMapTool');
      editTools.startPolygon();
    },

    onZoomTo() {
      let editTools = this.get('_editTools');
      let featuresLayer = editTools.featuresLayer;
      if (featuresLayer.getLayers().length) {
        let featureGroup = L.featureGroup(featuresLayer.getLayers());
        this.get('leafletMap').fitBounds(featureGroup.getBounds());
      }
    },

    onRemove() {
      this._clearCurrentGeometry();
    },

    onSave() {
      let featuresLayer = this.get('_editTools.featuresLayer');

      // возьмём первый объект, надо обработать создание мультиполигональных
      let layer = featuresLayer.getLayers()[0];
      let properties = {};
      let queryFilter = this.get('queryFilter');

      this.get('linkParameters').forEach((parameter) => {
        properties[parameter.get('layerField')] = queryFilter[parameter.get('queryKey')];
      });

      let defaultProperties = this.get('layerModel.settingsAsObject.defaultProperties') || {};

      layer.feature = { properties: Ember.merge(defaultProperties, properties) };

      let wfsProperties = Ember.$.extend({}, this.get('layerModel.settingsAsObject'), { 'showExisting': false });
      let layerId = this.get('layerModel.id');

      this.get('_wfsLayer').createVectorLayer(wfsProperties).then((wfs) => {
        wfs.addLayer(layer);
        wfs.on('save:success', () => {
          this._clearCurrentGeometry();
          const saveObjectFunc = this.get('mapApi').getFromApi('saveObject');
          if (typeof saveObjectFunc === 'function') {
            saveObjectFunc(layerId, layer);
          }
        });

        wfs.save();
      });
    }
  },

  init() {
    this._super(...arguments);
    this.set('crs', crsFactoryESPG3857.create());

    let innerWfsLayerProperties = {
      leafletMap: this.get('leafletMap'),
      visibility: false,
      dynamicProperties: Ember.$.extend({}, this.get('layerModel.settingsAsObject'), { 'showExisting': false })
    };

    // Set creating component's owner to avoid possible lookup exceptions.
    let owner = Ember.getOwner(this);
    let ownerKey = null;
    Ember.A(Object.keys(this) || []).forEach((key) => {
      if (this[key] === owner) {
        ownerKey = key;
        return false;
      }
    });
    if (!Ember.isBlank(ownerKey)) {
      innerWfsLayerProperties[ownerKey] = owner;
    }

    this.set('_wfsLayer', WfsLayerComponent.create(innerWfsLayerProperties));
  },

  _clearCurrentGeometry() {
    let editTools = this.get('_editTools');
    editTools.featuresLayer.clearLayers();
    this.set('_coordinates', '');
    this.set('geometryCreated', false);
  },

  _finishDraw() {
    let editTools = this.get('_editTools');
    editTools.off('editable:drawing:end', this._finishDraw, this);
    editTools.stopDrawing();
    this.set('geometryCreated', true);
  },

  _updateCoordinates() {
    let editTools = this.get('_editTools');
    let layers = editTools.featuresLayer.getLayers();
    let allCoords = [];
    let crs = this.get('crs');
    layers.forEach((layer) => {
      layer._latlngs.forEach((poly) => {
        let coords = [];
        poly.forEach(function (latlng) {
          let point = crs.project(latlng);
          coords.push(point.x.toFixed(3) + ' ' + point.y.toFixed(3));
        });

        allCoords.push(coords.join('\n'));
      });
    });

    this.set('_coordinates', allCoords.join('\n\n'));
  }
});
