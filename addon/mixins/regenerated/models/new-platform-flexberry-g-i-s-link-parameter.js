/**
  @module ember-flexberry-gis
*/

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { validator } from 'ember-cp-validations';
import { attr, belongsTo } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing link parameter model attributes, relations & projections.

  @class NewPlatformFlexberyGISLinkParameterModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const Model = Mixin.create({
  objectField: DS.attr('string'),
  layerField: DS.attr('string'),
  expression: DS.attr('string'),
  queryKey: DS.attr('string'),
  linkField: DS.attr('boolean'),
  layerLink: DS.belongsTo('new-platform-flexberry-g-i-s-layer-link', { inverse: 'parameters', async: false, }),
});

export const ValidationRules = {
  layerLink: {
    descriptionKey: 'models.new-platform-flexberry-g-i-s-link-parameter.validations.layerLink.__caption__',
    validators: [
      validator('ds-error'),
      validator('presence', true)
    ],
  },
};

export const defineProjections = function (modelClass) {
  modelClass.defineProjection('LinkParameterD', 'new-platform-flexberry-g-i-s-link-parameter', {
    objectField: attr('Поле объекта'),
    layerField: attr('Поле слоя'),
    expression: attr('Выражение', { hidden: true, }),
    queryKey: attr('Параметр запроса'),
    linkField: attr('Поле связи', { hidden: true, }),
    layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {
    }, { hidden: true, }),
  });
};
