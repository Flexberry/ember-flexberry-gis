/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapLayerModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  type: DS.attr('string'),
  visibility: DS.attr('boolean'),
  settings: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  index: DS.attr('number'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  parent: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),
  map: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: 'mapLayer', async: false }),
  layerLink: DS.hasMany('new-platform-flexberry-g-i-s-layer-link', { inverse: 'layer', async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      type: { presence: true },
      map: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});
export let defineProjections = function (model) {
  model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Name'),
    creator: Projection.attr('Creator'),
    createTime: Projection.attr('Create time'),
    editor: Projection.attr('Editor'),
    editTime: Projection.attr('Edit time')
  });
  model.defineProjection('MapLayer', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr(''),
    type: Projection.attr(''),
    visibility: Projection.attr(''),
    coordinateReferenceSystem: Projection.attr(''),
    settings: Projection.attr(''),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    })
  });
  model.defineProjection('MapLayerD', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    visibility: Projection.attr('Visibility'),
    index: Projection.attr('Index'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    settings: Projection.attr('Settings'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Parent', {

    }),
    map: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Map', {

    }),
    layerLink: Projection.hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
      layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
        name: Projection.attr('Слой')
      }, { hidden: true }),
      mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

      }, { hidden: true }),
      linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
        objectField: Projection.attr(''),
        layerField: Projection.attr(''),
        expression: Projection.attr(''),
        queryKey: Projection.attr(''),
        linkField: Projection.attr('')
      })
    })
  });
  model.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    visibility: Projection.attr('Visibility'),
    index: Projection.attr('Index'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    settings: Projection.attr('Settings'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Parent', {

    }, { displayMemberPath: 'name' }),
    map: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Map', {

    }),
    layerLink: Projection.hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
      layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
        name: Projection.attr('Слой')
      }, { hidden: true }),
      mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

      }, { hidden: true }),
      linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
        objectField: Projection.attr(''),
        layerField: Projection.attr(''),
        expression: Projection.attr(''),
        queryKey: Projection.attr(''),
        linkField: Projection.attr('')
      })
    })
  });
  model.defineProjection('MapLayerL', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Наименование'),
    type: Projection.attr('Тип'),
    visibility: Projection.attr('Видимость'),
    index: Projection.attr('Индекс'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    settings: Projection.attr('Настройки'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родительский слой', {
      name: Projection.attr('Родительский слой')
    })
  });
};
