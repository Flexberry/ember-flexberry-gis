import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { merge } from '@ember/polyfills';
import { isNone } from '@ember/utils';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import crsFactoryESPG3857 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-3857';
import {
  translationMacro as t
} from 'ember-i18n';
import layout from '../templates/components/flexberry-create-object-geometry';

export default Component.extend({
  layout,

  /**
  Service for managing map API.
  @property mapApi
  @type MapApiService
  */
  mapApi: service(),

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

  _editTools: computed('leafletMap', function () {
    const leafletMap = this.get('leafletMap');
    let editTools = get(leafletMap, 'drawTools');

    if (isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      editTools.on('editable:vertex:dragend', this._updateCoordinates, this);
      editTools.on('editable:vertex:deleted', this._updateCoordinates, this);
      editTools.on('editable:drawing:end', this._updateCoordinates, this);

      set(this.get('leafletMap'), 'drawTools', editTools);
    }

    return editTools;
  }),

  createItem: null,

  layerModel: computed('createItem', function () {
    return this.get('createItem.layerModel');
  }),

  leafletMap: null,

  linkParameters: computed('createItem', function () {
    return this.get('createItem.linkParameters');
  }),

  geometryCreated: false,

  queryFilter: computed('createItem', function () {
    return this.get('createItem.queryFilter');
  }),

  actions: {
    onDraw() {
      this._clearCurrentGeometry();
      const editTools = this.get('_editTools');
      editTools.on('editable:drawing:end', this._finishDraw, this);
      this.get('leafletMap').fire('flexberry-map:switchToDefaultMapTool');
      editTools.startPolygon();
    },

    onZoomTo() {
      const editTools = this.get('_editTools');
      const { featuresLayer, } = editTools;
      if (featuresLayer.getLayers().length) {
        const featureGroup = L.featureGroup(featuresLayer.getLayers());
        this.get('leafletMap').fitBounds(featureGroup.getBounds());
      }
    },

    onRemove() {
      this._clearCurrentGeometry();
    },

    onSave() {
      const featuresLayer = this.get('_editTools.featuresLayer');

      // возьмём первый объект, надо обработать создание мультиполигональных
      const layer = featuresLayer.getLayers()[0];
      const properties = {};
      const queryFilter = this.get('queryFilter');

      this.get('linkParameters').forEach((parameter) => {
        properties[parameter.get('layerField')] = queryFilter[parameter.get('queryKey')];
      });

      const defaultProperties = this.get('layerModel.settingsAsObject.defaultProperties') || {};

      layer.feature = { properties: merge(defaultProperties, properties), };

      const wfs = this.get('layerModel');
      const leafletObject = this.get('layerModel._leafletObject');
      const e = { layers: [layer], results: A(), };
      leafletObject.fire('load', e);

      const saveObjectFunc = this.get('mapApi').getFromApi('saveObject');
      if (typeof saveObjectFunc === 'function') {
        saveObjectFunc(this, wfs.id);
      } else {
        leafletObject.on('save:success', (obj) => {
          this._clearCurrentGeometry();
        });

        leafletObject.save();
      }
    },
  },

  saveObject() {
    const leafletObject = this.get('layerModel._leafletObject');
    return new Promise((resolve, reject) => {
      const saveSuccess = (data) => {
        leafletObject.off('save:failed', saveSuccess);
        this._clearCurrentGeometry();
        const layers = Object.values(data.target._layers);
        const { feature, } = layers[layers.length - 1];
        resolve(feature);
      };

      const saveFailed = (data) => {
        leafletObject.off('save:success', saveSuccess);
        reject(data);
      };

      leafletObject.once('save:success', saveSuccess);
      leafletObject.once('save:failed', saveFailed);
      leafletObject.save();
    });
  },

  init() {
    this._super(...arguments);
    this.set('crs', crsFactoryESPG3857.create());
  },

  _clearCurrentGeometry() {
    const editTools = this.get('_editTools');
    editTools.featuresLayer.clearLayers();
    this.set('_coordinates', '');
    this.set('geometryCreated', false);
  },

  _finishDraw() {
    const editTools = this.get('_editTools');
    editTools.off('editable:drawing:end', this._finishDraw, this);
    editTools.stopDrawing();
    this.set('geometryCreated', true);
  },

  _updateCoordinates() {
    const editTools = this.get('_editTools');
    const layers = editTools.featuresLayer.getLayers();
    const allCoords = [];
    const crs = this.get('crs');
    layers.forEach((layer) => {
      layer._latlngs.forEach((poly) => {
        const coords = [];
        poly.forEach(function (latlng) {
          const point = crs.project(latlng);
          coords.push(`${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
        });

        allCoords.push(coords.join('\n'));
      });
    });

    this.set('_coordinates', allCoords.join('\n\n'));
  },
});
