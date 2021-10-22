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
export let Model = Mixin.create({
  allowShow: DS.attr('boolean'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: 'layerLink', async: false }),
  parameters: DS.hasMany('new-platform-flexberry-g-i-s-link-parameter', { inverse: 'layerLink', async: false }),
});

export let ValidationRules = {
  mapObjectSetting: validator('presence', {
    presence: true,
    message: 'MapObjectSetting is required',
  }),
  layer: validator('presence', {
    presence: true,
    message: 'Layer is required',
  }),
};

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('LayerLinkD', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Тип', {
      typeName: attr('Тип объекта', { hidden: true }),
      listForm: attr('Списковая форма', { hidden: true }),
      editForm: attr('Форма редактирования', { hidden: true })
    }),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
      name: attr('Слой', { hidden: true })
    }, { hidden: true }),
    allowShow: attr('Показывать'),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true }),
      queryKey: attr('Ключ запроса', { hidden: true }),
      linkField: attr('Ключ связи', { hidden: true }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });

  modelClass.defineProjection('LayerLinkE', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Слой карты', {
    }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
    })
  });
  modelClass.defineProjection('LayerLinkI', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
      listForm: attr(''),
      editForm: attr('')
    }, { hidden: true }),
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true }),
      queryKey: attr('Ключ запроса', { hidden: true }),
      linkField: attr('Ключ связи', { hidden: true }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
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
      expression: attr('Выражение', { hidden: true }),
      queryKey: attr('Ключ запроса', { hidden: true }),
      linkField: attr('Ключ связи', { hidden: true }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });
};
