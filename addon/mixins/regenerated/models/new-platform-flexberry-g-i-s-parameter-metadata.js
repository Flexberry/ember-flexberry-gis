/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { attr, belongsTo } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing parameter metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISParameterMetadataModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Mixin.create({
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
    return $.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-parameter-metadata', {
    objectField: attr('Поле объекта'),
    layerField: attr('Поле слоя'),
    expression: attr('Выражение'),
    queryKey: attr('Ключ запроса'),
    linkField: attr('Поле связи'),
    layerLink: belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
    })
  });

  modelClass.defineProjection('ParameterMetadataD', 'new-platform-flexberry-g-i-s-parameter-metadata', {
    objectField: attr('Поле объекта'),
    layerField: attr('Поле слоя'),
    expression: attr('Выражение', { hidden: true }),
    queryKey: attr('Ключ запроса'),
    linkField: attr('Поле связи', { hidden: true }),
    layerLink: belongsTo('new-platform-flexberry-g-i-s-link-metadata', 'Связь', {
    }, { hidden: true })
  });
};
