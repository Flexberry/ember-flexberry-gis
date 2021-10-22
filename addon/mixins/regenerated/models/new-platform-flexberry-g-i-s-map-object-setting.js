/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { attr, belongsTo } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing map object setting model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapObjectSettingModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Mixin.create({
  typeName: DS.attr('string'),
  listForm: DS.attr('string'),
  editForm: DS.attr('string'),
  title: DS.attr('string'),
  defaultMap: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: null, async: false }),

  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
    };
    return $.extend(true, {}, parentValidations, thisValidations);
  },

  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('MapObjectSetting', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: attr('TypeName', { hidden: true }),
    listForm: attr('ListForm', { hidden: true }),
    editForm: attr('EditForm', { hidden: true }),
    title: attr('Title', { hidden: true }),
    defaultMap: belongsTo('new-platform-flexberry-g-i-s-map', '', {

    })
  });

  modelClass.defineProjection('MapObjectSettingE', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: attr('Тип'),
    title: attr('Отображаемое имя'),
    listForm: attr('Списковая форма'),
    editForm: attr('Форма редактирования'),
    defaultMap: belongsTo('new-platform-flexberry-g-i-s-map', 'Карта по умолчанию', {
      name: attr('', { hidden: true })
    }, { displayMemberPath: 'name' })
  });

  modelClass.defineProjection('MapObjectSettingL', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: attr('Тип'),
    listForm: attr('Списковая форма'),
    editForm: attr('Форма редактирования')
  });
};
