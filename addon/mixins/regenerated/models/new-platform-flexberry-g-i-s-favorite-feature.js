import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

export let Model = Ember.Mixin.create({
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  objectKey: DS.attr('guid'),
  objectLayerKey: DS.attr('guid'),
  userKey: DS.attr('string'),

  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      objectKey: { presence: true },
      objectLayerKey: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },

  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-favorite-feature', {
    createTime: Projection.attr('Время создания объекта', { index: 0 }),
    creator: Projection.attr('Создатель объекта', { index: 1 }),
    editTime: Projection.attr('Время последнего редактирования объекта', { index: 2 }),
    editor: Projection.attr('Последний редактор объекта', { index: 3 }),
    objectKey: Projection.attr('Ключ объекта', { index: 4 }),
    objectLayerKey: Projection.attr('Ключ слоя', { index: 5 }),
    userKey: Projection.attr('Ключ пользователя', { index: 6 })
  });
};
