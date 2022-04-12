/**
  @module ember-flexberry-gis
*/

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { validator } from 'ember-cp-validations';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing map model attributes, relations & projections.
  @class NewPlatformFlexberyGISMapModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const Model = Mixin.create({
  name: DS.attr('string', { defaultValue: '', }),
  description: DS.attr('string'),
  keyWords: DS.attr('string'),

  /**
    Non-stored property for full text search combining 'name', 'description', and 'keywords'.
    See computaton logic in related model's 'anyTextCompute' method.
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

  lat: DS.attr('number', { defaultValue: 0, }),
  lng: DS.attr('number', { defaultValue: 0, }),
  zoom: DS.attr('number', { defaultValue: 0, }),
  public: DS.attr('boolean', { defaultValue: false, }),
  scale: DS.attr('number', { defaultValue: 0, }),
  coordinateReferenceSystem: DS.attr('string', { defaultValue: '{"code":"EPSG:3857"}', }),
  boundingBox: DS.attr('json'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  picture: DS.attr('string'),
  mapLayer: DS.hasMany('new-platform-flexberry-g-i-s-map-layer', { inverse: 'map', async: false }),
});

export const ValidationRules = {
  name: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-map.validations.name.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  },
  public: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-map.validations.public.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  }
};

export const defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map', {
    name: attr('Наименование'),
    creator: attr('Создатель'),
    createTime: attr('Время создания'),
    editor: attr('Редактор'),
    editTime: attr('Время редактирования'),
    picture: attr('Изображение'),
  });

  modelClass.defineProjection('Map', 'new-platform-flexberry-g-i-s-map', {
    name: attr('Наименование'),
    lat: attr('Широта', { hidden: true, }),
    lng: attr('Долгота', { hidden: true, }),
    zoom: attr('Зум', { hidden: true, }),
    public: attr('Общая', { hidden: true, }),
    coordinateReferenceSystem: attr('Система координат', { hidden: true, }),
  });

  modelClass.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
    name: attr('Наименование'),
    description: attr('Описание'),
    keyWords: attr('Ключевые слова'),
    lat: attr('Широта'),
    lng: attr('Долгота'),
    zoom: attr('Зум'),
    public: attr('Общая'),
    scale: attr('Масштаб'),
    picture: attr('Изображение'),
    coordinateReferenceSystem: attr('Система координат'),
    boundingBox: attr('Граница'),
    mapLayer: hasMany('new-platform-flexberry-g-i-s-map-layer', '', {
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
      parent: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {
      }, { hidden: true }),
      map: belongsTo('new-platform-flexberry-g-i-s-map', 'Карта', {
      }, { hidden: true }),
      layerLink: hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
        mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Тип', {
          typeName: attr('Тип объекта', { hidden: true }),
          listForm: attr('Списковая форма', { hidden: true }),
          editForm: attr('Форма редактирования', { hidden: true })
        }),
      }),
    }),
  });

  modelClass.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
    name: attr('Наименование'),
    lat: attr('Широта'),
    lng: attr('Долгота'),
    zoom: attr('Зум'),
    public: attr('Общая'),
    picture: attr('Изображение'),
  });

  modelClass.defineProjection('MapGisSearchFormL', 'new-platform-flexberry-g-i-s-map', {
    name: attr('Наименование'),
  });
};
