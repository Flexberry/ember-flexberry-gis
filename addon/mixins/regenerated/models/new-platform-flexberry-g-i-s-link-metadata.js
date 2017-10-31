/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing link metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISLinkMetadataModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  allowShow: DS.attr('boolean'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-layer-metadata', { inverse: 'linkMetadata', async: false }),
  parameters: DS.hasMany('new-platform-flexberry-g-i-s-parameter-metadata', { inverse: 'layerLink', async: false }),

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
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-link-metadata', {
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {
    }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {
    }),
    parameters: Projection.hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение'),
      queryKey: Projection.attr('Ключ запроса'),
      linkField: Projection.attr('Поле связи'),
      layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
      })
    })
  });
  modelClass.defineProjection('LinkMetadataD', 'new-platform-flexberry-g-i-s-link-metadata', {
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {
      name: Projection.attr('', { hidden: true })
    }, { displayMemberPath: 'name' }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {
      typeName: Projection.attr('', { hidden: true })
    }, { displayMemberPath: 'typeName' }),
    allowShow: Projection.attr('Показывать'),
    parameters: Projection.hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение'),
      queryKey: Projection.attr('Ключ запроса'),
      linkField: Projection.attr('Поле связи'),
      layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
      }, { hidden: true })
    })
  });
};
