/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing layer metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISLayerMetadataModelMixin
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

  type: DS.attr('string'),
  settings: DS.attr('string'),
  scale: DS.attr('number'),
  coordinateReferenceSystem: DS.attr('string'),
  boundingBox: DS.attr('json'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  linkMetadata: DS.hasMany('new-platform-flexberry-g-i-s-link-metadata', { inverse: 'layer', async: false }),

  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      name: { presence: true },
      type: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },

  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Наименование'),
    creator: Projection.attr('Создатель'),
    createTime: Projection.attr('Время создания'),
    editor: Projection.attr('Редактор'),
    editTime: Projection.attr('Время редактирования'),
    linkMetadata: Projection.hasMany('new-platform-flexberry-g-i-s-link-metadata', '', {
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
    })
  });

  modelClass.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Наименование'),
    description: Projection.attr('Описание'),
    keyWords: Projection.attr('Ключевые слова'),
    type: Projection.attr('Тип'),
    settings: Projection.attr('Настройки'),
    scale: Projection.attr('Масштаб'),
    coordinateReferenceSystem: Projection.attr('Система координат'),
    boundingBox: Projection.attr('Граница'),
    linkMetadata: Projection.hasMany('new-platform-flexberry-g-i-s-link-metadata', '', {
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
    })
  });

  modelClass.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Наименование'),
    description: Projection.attr('Описание'),
    type: Projection.attr('Тип')
  });
};
