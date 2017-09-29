/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map object setting model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapObjectSettingModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  typeName: DS.attr('string'),
  listForm: DS.attr('string'),
  editForm: DS.attr('string'),
  title: DS.attr('string'),
  defaultMap: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: null, async: false }),

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

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('MapObjectSetting', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: Projection.attr('TypeName', { hidden: true }),
    listForm: Projection.attr('ListForm', { hidden: true }),
    editForm: Projection.attr('EditForm', { hidden: true }),
    title: Projection.attr('Title', { hidden: true }),
    defaultMap: Projection.belongsTo('new-platform-flexberry-g-i-s-map', '', {

    })
  });

  modelClass.defineProjection('MapObjectSettingE', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: Projection.attr('Тип'),
    title: Projection.attr('Отображаемое имя'),
    listForm: Projection.attr('Списковая форма'),
    editForm: Projection.attr('Форма редактирования'),
    defaultMap: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Карта по умолчанию', {
      name: Projection.attr('', { hidden: true })
    }, { displayMemberPath: 'name' })
  });

  modelClass.defineProjection('MapObjectSettingL', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: Projection.attr('Тип'),
    listForm: Projection.attr('Списковая форма'),
    editForm: Projection.attr('Форма редактирования')
  });
};
