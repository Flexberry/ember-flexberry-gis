/**
  @module ember-flexberry-gis
*/

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { validator } from 'ember-cp-validations';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing layer link model attributes, relations & projections.

  @class NewPlatformFlexberyGISLayerLinkModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const Model = Mixin.create({
  allowShow: DS.attr('boolean'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false, }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: 'layerLink', async: false, }),
  parameters: DS.hasMany('new-platform-flexberry-g-i-s-link-parameter', { inverse: 'layerLink', async: false, }),
});

export const ValidationRules = {
  mapObjectSetting: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-layer-link.validations.mapObjectSetting.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  },
  layer: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-layer-link.validations.layer.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  }
};

export const defineProjections = function (modelClass) {
  modelClass.defineProjection('LayerLinkD', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Тип', {
      typeName: attr('Тип объекта', { hidden: true, }),
      listForm: attr('Списковая форма', { hidden: true, }),
      editForm: attr('Форма редактирования', { hidden: true, }),
    }),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
      name: attr('Слой', { hidden: true, }),
    }, { hidden: true, }),
    allowShow: attr('Показывать'),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true, }),
      queryKey: attr('Ключ запроса', { hidden: true, }),
      linkField: attr('Ключ связи', { hidden: true, }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      }),
    }),
  });

  modelClass.defineProjection('LayerLinkE', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Слой карты', {
    }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
    }),
  });
  modelClass.defineProjection('LayerLinkI', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
      listForm: attr(''),
      editForm: attr(''),
    }, { hidden: true, }),
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true, }),
      queryKey: attr('Ключ запроса', { hidden: true, }),
      linkField: attr('Ключ связи', { hidden: true, }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      }),
    }),
  });
  modelClass.defineProjection('LayerLinkQ', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true, }),
      queryKey: attr('Ключ запроса', { hidden: true, }),
      linkField: attr('Ключ связи', { hidden: true, }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      }),
    }),
  });
};
