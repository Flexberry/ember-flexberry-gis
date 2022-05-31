/**
  @module ember-flexberry-gis
*/

import { getOwner } from '@ember/application';

import { A } from '@ember/array';
import { isNone } from '@ember/utils';
import { set, get } from '@ember/object';
import $ from 'jquery';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';
import { GeometryPredicate, NotPredicate } from 'ember-flexberry-data/query/predicate';
import OdataFilterParserMixin from '../mixins/odata-filter-parser';

/**
  Class describing odata vector layer metadata.

  @class ODataVectorlayer
  @extends BaseLayer
*/
export default VectorLayer.extend(OdataFilterParserMixin, {
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'image icon'
  */
  iconClass: 'image icon',

  /**
    Crs.

    @property crs
    @type Object
    @default null
  */
  crs: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.operations = this.operations || ['edit', 'remove', 'identify', 'search', 'attributes', 'legend', 'filter'];
  },

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    $.extend(true, settings, {
      readonly: false,
      modelName: undefined,
      projectionName: undefined,
      geometryField: 'geometry',
      geometryType: 'PolygonPropertyType',
    });
    set(settings, 'searchSettings', this.createSearchSettings());
    return settings;
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (isNone(leafletObject)) {
      return A();
    }

    const store = getOwner(this).lookup('service:store');
    const modelConstructor = store.modelFor(leafletObject.modelName);
    const projection = get(modelConstructor, `projections.${leafletObject.projectionName}`);
    const props = Object.keys(projection.attributes);
    const fields = A();
    this.set('crs', leafletObject.options.crs);

    props.forEach((key) => {
      const prop = projection.attributes[key];
      const { geometryField, } = leafletObject;
      if (!prop.options.hidden && key !== geometryField) {
        fields.addObject(key);
      }
    });

    return fields;
  },

  /**
    Get property values from leaflet layer object.

    @method getLayerPropertyValues
    @param {Object} leafletObject Leaflet layer object
    @param {String} selectedField Selected field name
    @param {Integer} count Amount of values to return (for all values must be 0)
    @returns {Array} Array with selected property values
  */
  getLayerPropertyValues(leafletObject, selectedField, count) {
    if (isNone(leafletObject)) {
      return A();
    }

    const geojson = leafletObject.toGeoJSON() || {};
    const features = geojson.features || [];

    const values = A();

    for (let i = 0; i < features.length; i++) {
      const value = get(features, `${i}.properties.${selectedField}`);
      values.addObject(value);

      if (values.length === count) {
        break;
      }
    }

    return values;
  },

  /**
    Parse filter geometry expression.
    ('IN', 'NOT IN').

    @method parseFilterGeometryExpression
    @param {String} condition Filter condition
    @param {Object} geoJSON Geometry
    @param {String} geometryField Layer's geometry field
    @param {Object} crs Crs
    @returns {Object} Filter object
  */
  parseFilterGeometryExpression(condition, geoJSON, geometryField) {
    switch (condition) {
      case 'in':
      case 'not in': {
        const geomPredicate = new GeometryPredicate(geometryField);
        const geom = L.geoJSON(geoJSON).getLayers()[0].toEWKT(this.get('crs'));
        const filter = geomPredicate.intersects(geom);

        return condition === 'in' ? filter : new NotPredicate(filter);
      }
      default:
    }
  },
});
