/**
  @module ember-flexberry-gis
*/

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { validator } from 'ember-cp-validations';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing link metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISLinkMetadataModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const Model = Mixin.create({
  allowShow: DS.attr('boolean'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false, }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-layer-metadata', { inverse: 'linkMetadata', async: false, }),
  parameters: DS.hasMany('new-platform-flexberry-g-i-s-parameter-metadata', { inverse: 'layerLink', async: false, }),
});

export const ValidationRules = {
  mapObjectSetting: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-link-metadata.validations.mapObjectSetting.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  },
  layer: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-link-metadata.validations.layer.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  }
};

export const defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-link-metadata', {
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {
    }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {
    }),
    parameters: hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение'),
      queryKey: attr('Ключ запроса'),
      linkField: attr('Поле связи'),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
      }),
    }),
  });
  modelClass.defineProjection('LinkMetadataD', 'new-platform-flexberry-g-i-s-link-metadata', {
    layer: belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {
      name: attr('', { hidden: true, }),
    }, { displayMemberPath: 'name', }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {
      typeName: attr('', { hidden: true, }),
    }, { displayMemberPath: 'typeName', }),
    allowShow: attr('Показывать'),
    parameters: hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение'),
      queryKey: attr('Ключ запроса'),
      linkField: attr('Поле связи'),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
      }, { hidden: true, }),
    }),
  });
};
