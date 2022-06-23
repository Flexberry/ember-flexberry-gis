/**
  @module ember-flexberry-gis
*/

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { validator } from 'ember-cp-validations';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing map layer model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapLayerModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const Model = Mixin.create({
  name: DS.attr('string'),
  description: DS.attr('string'),
  keyWords: DS.attr('string'),

  /**
    Non-stored property for full text search combining 'name', 'description', and 'keywords'.
    See computaton logic in related model's 'anyTextCompute' method).
    Also see OpenGIS Catalogue Services Specification (ISO19115/ISO19119).

    @property anyText
  */
  anyText: DS.attr('string'),

  /**
    Method to set non-stored property.
    Please, use code below in model class (outside of this mixin) otherwise it will be replaced during regeneration of models.
    Please, implement 'anyTextCompute' method in model class (outside of this mixin) if you want to compute value of 'anyText' property.

    @method _anyTextCompute
    @private
    @example
      ```javascript
      _anyTextChanged: Ember.on('init', Ember.observer('anyText', function() {
        Ember.run.once(this, '_anyTextCompute');
      }))
      ```
  */
  _anyTextCompute() {
    const result = (this.anyTextCompute && typeof this.anyTextCompute === 'function') ? this.anyTextCompute() : null;
    this.set('anyText', result);
  },

  index: DS.attr('number'),
  visibility: DS.attr('boolean'),
  type: DS.attr('string'),
  settings: DS.attr('string'),
  scale: DS.attr('number'),
  coordinateReferenceSystem: DS.attr('string'),
  boundingBox: DS.attr('json'),
  public: DS.attr('boolean'),
  owner: DS.attr('string'),
  securityKey: DS.attr('string'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  parent: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false, }),
  map: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: 'mapLayer', async: false, }),
  layerLink: DS.hasMany('new-platform-flexberry-g-i-s-layer-link', { inverse: 'layer', async: false, }),
});

export const ValidationRules = {
  map: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-map-layer.validations.map.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  },
  type: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-map-layer.validations.type.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  },
};

export const defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map-layer', {
    name: attr('Наименование'),
    creator: attr('Создатель'),
    createTime: attr('Время создания'),
    editor: attr('Редактор'),
    editTime: attr('Время редактирования'),
  });

  modelClass.defineProjection('MapLayerD', 'new-platform-flexberry-g-i-s-map-layer', {
    name: attr('Наименование'),
    description: attr('Описание'),
    keyWords: attr('Ключевые слова'),
    index: attr('Индекс'),
    visibility: attr('Видимость'),
    type: attr('Тип'),
    settings: attr('Настройки'),
    scale: attr('Масштаб'),
    coordinateReferenceSystem: attr('Система координат'),
    boundingBox: attr('Граница'),
    securityKey: attr('', { hidden: true, }),
    parent: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {

    }, { hidden: true, }),
    map: belongsTo('new-platform-flexberry-g-i-s-map', 'Карта', {

    }, { hidden: true, }),
    layerLink: hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
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
    }),
  });

  modelClass.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
    name: attr('Наименование'),
    description: attr('Описание'),
    keyWords: attr('Ключевые слова'),
    index: attr('Индекс'),
    visibility: attr('Видимость'),
    type: attr('Тип'),
    settings: attr('Настройки'),
    scale: attr('Масштаб'),
    coordinateReferenceSystem: attr('Система координат'),
    boundingBox: attr('Граница'),
    securityKey: attr('', { hidden: true, }),
    parent: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {

    }, { displayMemberPath: 'name', }),
    map: belongsTo('new-platform-flexberry-g-i-s-map', 'Карта', {

    }, { displayMemberPath: 'name', }),
    layerLink: hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
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
    }),
  });

  modelClass.defineProjection('MapLayerL', 'new-platform-flexberry-g-i-s-map-layer', {
    name: attr('Наименование'),
    description: attr('Описание'),
    type: attr('Тип'),
    parent: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {
      name: attr('Родитель'),
    }, { hidden: true, }),
  });
};
