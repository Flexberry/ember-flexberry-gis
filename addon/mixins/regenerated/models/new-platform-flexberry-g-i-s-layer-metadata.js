/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing layer metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISLayerMetadataModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Mixin.create({
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
    return $.extend(true, {}, parentValidations, thisValidations);
  },

  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: attr('Наименование'),
    creator: attr('Создатель'),
    createTime: attr('Время создания'),
    editor: attr('Редактор'),
    editTime: attr('Время редактирования'),
    linkMetadata: hasMany('new-platform-flexberry-g-i-s-link-metadata', '', {
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
        })
      })
    })
  });

  modelClass.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: attr('Наименование'),
    description: attr('Описание'),
    keyWords: attr('Ключевые слова'),
    type: attr('Тип'),
    settings: attr('Настройки'),
    scale: attr('Масштаб'),
    coordinateReferenceSystem: attr('Система координат'),
    boundingBox: attr('Граница'),
    linkMetadata: hasMany('new-platform-flexberry-g-i-s-link-metadata', '', {
      layer: belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {
        name: attr('', { hidden: true })
      }, { displayMemberPath: 'name' }),
      mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {
        typeName: attr('', { hidden: true })
      }, { displayMemberPath: 'typeName' }),
      allowShow: attr('Показывать'),
      parameters: hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
        objectField: attr('Поле объекта'),
        layerField: attr('Поле слоя'),
        expression: attr('Выражение'),
        queryKey: attr('Ключ запроса'),
        linkField: attr('Поле связи'),
        layerLink: belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
        }, { hidden: true })
      })
    })
  });

  modelClass.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: attr('Наименование'),
    description: attr('Описание'),
    type: attr('Тип')
  });
};
