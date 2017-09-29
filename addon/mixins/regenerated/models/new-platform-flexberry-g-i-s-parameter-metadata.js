/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing parameter metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISParameterMetadataModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  objectField: DS.attr('string'),
  layerField: DS.attr('string'),
  expression: DS.attr('string'),
  queryKey: DS.attr('string'),
  linkField: DS.attr('boolean'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  layerLink: DS.belongsTo('new-platform-flexberry-g-i-s-link-metadata', { inverse: 'parameters', async: false }),

  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      layerLink: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-parameter-metadata', {
    objectField: Projection.attr('Поле объекта'),
    layerField: Projection.attr('Поле слоя'),
    expression: Projection.attr('Выражение'),
    queryKey: Projection.attr('Ключ запроса'),
    linkField: Projection.attr('Поле связи'),
    layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
    })
  });

  modelClass.defineProjection('ParameterMetadataD', 'new-platform-flexberry-g-i-s-parameter-metadata', {
    objectField: Projection.attr('Поле объекта'),
    layerField: Projection.attr('Поле слоя'),
    expression: Projection.attr('Выражение', { hidden: true }),
    queryKey: Projection.attr('Ключ запроса'),
    linkField: Projection.attr('Поле связи', { hidden: true }),
    layerLink: Projection.belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
    }, { hidden: true })
  });
};
