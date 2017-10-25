/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing layer link model attributes, relations & projections.

  @class NewPlatformFlexberyGISLayerLinkModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  allowShow: DS.attr('boolean'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: 'layerLink', async: false }),
  parameters: DS.hasMany('new-platform-flexberry-g-i-s-link-parameter', { inverse: 'layerLink', async: false }),

  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      mapObjectSetting: { presence: true },
      layer: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },

  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});
export let defineProjections = function (modelClass) {
  modelClass.defineProjection('LayerLinkD', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Тип', {
      typeName: Projection.attr('Тип объекта', { hidden: true }),
      listForm: Projection.attr('Списковая форма', { hidden: true }),
      editForm: Projection.attr('Форма редактирования', { hidden: true })
    }),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
      name: Projection.attr('Слой', { hidden: true })
    }, { hidden: true }),
    allowShow: Projection.attr('Показывать'),
    parameters: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение', { hidden: true }),
      queryKey: Projection.attr('Ключ запроса', { hidden: true }),
      linkField: Projection.attr('Ключ связи', { hidden: true }),
      layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });

  modelClass.defineProjection('LayerLinkE', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Слой карты', {
    }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
    })
  });
  modelClass.defineProjection('LayerLinkI', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
      listForm: Projection.attr(''),
      editForm: Projection.attr('')
    }, { hidden: true }),
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    parameters: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение', { hidden: true }),
      queryKey: Projection.attr('Ключ запроса', { hidden: true }),
      linkField: Projection.attr('Ключ связи', { hidden: true }),
      layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });
  modelClass.defineProjection('LayerLinkQ', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }),
    parameters: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение', { hidden: true }),
      queryKey: Projection.attr('Ключ запроса', { hidden: true }),
      linkField: Projection.attr('Ключ связи', { hidden: true }),
      layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });
};
