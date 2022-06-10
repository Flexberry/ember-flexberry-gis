/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map layer model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapLayerModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
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
  _anyTextCompute: function() {
    let result = (this.anyTextCompute && typeof this.anyTextCompute === 'function') ? this.anyTextCompute() : null;
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

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Наименование'),
    creator: Projection.attr('Создатель'),
    createTime: Projection.attr('Время создания'),
    editor: Projection.attr('Редактор'),
    editTime: Projection.attr('Время редактирования')
  });

  modelClass.defineProjection('MapLayerD', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Наименование'),
    description: Projection.attr('Описание'),
    keyWords: Projection.attr('Ключевые слова'),
    index: Projection.attr('Индекс'),
    visibility: Projection.attr('Видимость'),
    type: Projection.attr('Тип'),
    settings: Projection.attr('Настройки'),
    scale: Projection.attr('Масштаб'),
    coordinateReferenceSystem: Projection.attr('Система координат'),
    boundingBox: Projection.attr('Граница'),
    securityKey: Projection.attr('', { hidden: true }),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {

    }, { hidden: true }),
    map: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Карта', {

    }, { hidden: true }),
    layerLink: Projection.hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
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
    })
  });

  modelClass.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Наименование'),
    description: Projection.attr('Описание'),
    keyWords: Projection.attr('Ключевые слова'),
    index: Projection.attr('Индекс'),
    visibility: Projection.attr('Видимость'),
    type: Projection.attr('Тип'),
    settings: Projection.attr('Настройки'),
    scale: Projection.attr('Масштаб'),
    coordinateReferenceSystem: Projection.attr('Система координат'),
    boundingBox: Projection.attr('Граница'),
    securityKey: Projection.attr('', { hidden: true }),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {

    }, { displayMemberPath: 'name' }),
    map: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Карта', {

    }, { displayMemberPath: 'name' }),
    layerLink: Projection.hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
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
    })
  });

  modelClass.defineProjection('MapLayerL', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Наименование'),
    description: Projection.attr('Описание'),
    type: Projection.attr('Тип'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Родитель', {
      name: Projection.attr('Родитель')
    }, { hidden: true })
  });
};
