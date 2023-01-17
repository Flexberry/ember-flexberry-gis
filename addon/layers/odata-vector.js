/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';
import OdataFilterParserMixin from '../mixins/odata-filter-parser';
import { Query } from 'ember-flexberry-data';

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
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'attributes', 'editFeatures', 'legend', 'filter'],

  /**
    Crs.

    @property crs
    @type Object
    @default null
  */
  crs: null,

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      readonly: false,
      modelName: undefined,
      projectionName: undefined,
      geometryField: 'geometry',
      geometryType: 'PolygonPropertyType'
    });
    Ember.set(settings, 'searchSettings', this.createSearchSettings());
    return settings;
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (Ember.isNone(leafletObject)) {
      return Ember.A();
    }

    let store = Ember.getOwner(this).lookup('service:store');
    let modelConstructor = store.modelFor(leafletObject.modelName);
    let projection = Ember.get(modelConstructor, `projections.${leafletObject.projectionName}`);
    let props = Object.keys(projection.attributes);
    let fields = Ember.A();
    this.set('crs', leafletObject.options.crs);

    const geometryField = leafletObject.geometryField;

    props.forEach((key) => {
      let prop = projection.attributes[key];
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
    if (Ember.isNone(leafletObject)) {
      return Ember.A();
    }

    let geojson = leafletObject.toGeoJSON() || {};
    let features = geojson.features || [];

    let values = Ember.A();

    for (let i = 0; i < features.length; i++) {
      let value = Ember.get(features, `${i}.properties.${selectedField}`);
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
      case 'not in':
        let geomPredicate = new Query.GeometryPredicate(geometryField);
        let geom = L.geoJSON(geoJSON).getLayers()[0].toEWKT(this.get('crs'));
        let filter = geomPredicate.intersects(geom);

        return condition === 'in' ? filter : new Query.NotPredicate(filter);
    }
  }
});
