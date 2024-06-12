import Ember from 'ember';
import DS from 'ember-data';
import { attr } from 'ember-flexberry-data/utils/attributes';

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
  index: DS.attr('number'),
  visibility: DS.attr('boolean', { defaultValue: true }),
  type: DS.attr('string'),
  settings: DS.attr('string'),
  scale: DS.attr('number'),
  coordinateReferenceSystem: DS.attr('string'),
  boundingBox: DS.attr('string'),
  public: DS.attr('boolean'),
  owner: DS.attr('string'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineNamespace = function (modelClass) {
  modelClass.reopenClass({
    namespace: 'NewPlatform.Flexberry.GIS',
  });
};

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-background-layer', {
    name: attr('Наименование', { index: 0 }),
    creator: attr('Создатель', { index: 1 }),
    createTime: attr('Время создания', { index: 2 }),
    editor: attr('Редактор', { index: 3 }),
    editTime: attr('Время редактирования', { index: 4 })
  });

  modelClass.defineProjection('BackgroundLayerD', 'new-platform-flexberry-g-i-s-background-layer', {
    name: attr('Наименование', { index: 0 }),
    description: attr('Описание', { index: 1 }),
    keyWords: attr('Ключевые слова', { index: 2 }),
    anyText: attr('', { index: 3 }),
    index: attr('Индекс', { index: 4 }),
    visibility: attr('Видимость', { index: 5 }),
    type: attr('Тип', { index: 6 }),
    settings: attr('Настройки', { index: 7 }),
    scale: attr('Масштаб', { index: 8 }),
    coordinateReferenceSystem: attr('Система координат', { index: 9 }),
    boundingBox: attr('Граница', { index: 10 }),
    public: attr('', { index: 11 }),
    owner: attr('', { index: 12 })
  });

  modelClass.defineProjection('BackgroundLayerE', 'new-platform-flexberry-g-i-s-background-layer', {
    name: attr('Наименование', { index: 0 }),
    description: attr('Описание', { index: 1 }),
    keyWords: attr('Ключевые слова', { index: 2 }),
    index: attr('Индекс', { index: 3 }),
    visibility: attr('Видимость', { index: 4 }),
    type: attr('Тип', { index: 5 }),
    settings: attr('Настройки', { index: 6 }),
    scale: attr('Масштаб', { index: 7 }),
    coordinateReferenceSystem: attr('Система координат', { index: 8 }),
    boundingBox: attr('Граница', { index: 9 })
  });

  modelClass.defineProjection('BackgroundLayerL', 'new-platform-flexberry-g-i-s-background-layer', {
    name: attr('Наименование', { index: 0 }),
    description: attr('Описание', { index: 1 }),
    type: attr('Тип', { index: 2 })
  });
};
