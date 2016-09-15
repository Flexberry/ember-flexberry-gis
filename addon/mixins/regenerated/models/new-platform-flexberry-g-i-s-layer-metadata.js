import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  type: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  settings: DS.attr('string'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
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
export let defineProjections = function (model) {
  model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    settings: Projection.attr('Settings')
  });
  model.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    settings: Projection.attr('Settings')
  });
  model.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    settings: Projection.attr('Settings'),
    createTime: Projection.attr('Создание'),
    creator: Projection.attr('Создатель'),
    editTime: Projection.attr('Редактирование'),
    editor: Projection.attr('Редактор')
  });
};
