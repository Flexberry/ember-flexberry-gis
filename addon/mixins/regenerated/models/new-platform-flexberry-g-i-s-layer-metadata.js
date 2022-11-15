import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  description: DS.attr('string'),
  keyWords: DS.attr('string'),
  /**
    Non-stored property.

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
  additionaldata: DS.attr('string'),
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
    name: Projection.attr('Наименование', { index: 0 }),
    creator: Projection.attr('Создатель', { index: 1 }),
    createTime: Projection.attr('Время создания', { index: 2 }),
    editor: Projection.attr('Редактор', { index: 3 }),
    editTime: Projection.attr('Время редактирования', { index: 4 }),
    linkMetadata: Projection.hasMany('new-platform-flexberry-g-i-s-link-metadata', '', {
      allowShow: Projection.attr('Показывать', { index: 0 }),
      layer: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {

      }, { index: 1 }),
      mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {

      }, { index: 2 }),
      parameters: Projection.hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
        objectField: Projection.attr('Поле объекта', { index: 0 }),
        layerField: Projection.attr('Поле слоя', { index: 1 }),
        expression: Projection.attr('Выражение', { index: 2 }),
        queryKey: Projection.attr('Ключ запроса', { index: 3 }),
        linkField: Projection.attr('Поле связи', { index: 4 }),
        layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {

        }, { index: 5 })
      })
    })
  });

  modelClass.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Наименование', { index: 0 }),
    description: Projection.attr('Описание', { index: 1 }),
    keyWords: Projection.attr('Ключевые слова', { index: 2 }),
    type: Projection.attr('Тип', { index: 3 }),
    settings: Projection.attr('Настройки', { index: 4 }),
    scale: Projection.attr('Масштаб', { index: 5 }),
    coordinateReferenceSystem: Projection.attr('Система координат', { index: 6 }),
    boundingBox: Projection.attr('Граница', { index: 7 }),
    additionaldata: Projection.attr('Дополнительные данные', { index: 8 }),
    linkMetadata:Projection. hasMany('new-platform-flexberry-g-i-s-link-metadata', '', {
      layer: Projection.belongsTo('new-platform-flexberry-g-i-s-layer-metadata', 'Слой', {
        name: Projection.attr('', { index: 1, hidden: true })
      }, { index: 0, displayMemberPath: 'name' }),
      mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Настройка', {
        typeName: Projection.attr('', { index: 3, hidden: true })
      }, { index: 2, displayMemberPath: 'typeName' }),
      allowShow: Projection.attr('Показывать', { index: 4 }),
      parameters: Projection.hasMany('new-platform-flexberry-g-i-s-parameter-metadata', 'Параметры связи', {
        objectField: Projection.attr('Поле объекта', { index: 0 }),
        layerField: Projection.attr('Поле слоя', { index: 1 }),
        expression: Projection.attr('Выражение', { index: 2 }),
        queryKey: Projection.attr('Ключ запроса', { index: 3 }),
        linkField: Projection.attr('Поле связи', { index: 4 }),
        layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {

        }, { index: 5, hidden: true })
      })
    })
  });

  modelClass.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Наименование', { index: 0 }),
    description: Projection.attr('Описание', { index: 1 }),
    type: Projection.attr('Тип', { index: 2 }),
    additionaldata: Projection.attr('Дополнительные данные', { index: 3 }),
  });
};
