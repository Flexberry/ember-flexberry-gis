/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

/**
  Mixin containing layer link model attributes, relations & projections.

  @class NewPlatformFlexberyGISLayerLinkModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Mixin.create({
  allowShow: DS.attr('boolean'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: 'layerLink', async: false }),
  parameters: DS.hasMany('new-platform-flexberry-g-i-s-link-parameter', { inverse: 'layerLink', async: false }),

  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      mapObjectSetting: { presence: true },
      layer: { presence: true }
    };
    return $.extend(true, {}, parentValidations, thisValidations);
  },

  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});
export let defineProjections = function (modelClass) {
  modelClass.defineProjection('LayerLinkD', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', 'Тип', {
      typeName: attr('Тип объекта', { hidden: true }),
      listForm: attr('Списковая форма', { hidden: true }),
      editForm: attr('Форма редактирования', { hidden: true })
    }),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
      name: attr('Слой', { hidden: true })
    }, { hidden: true }),
    allowShow: attr('Показывать'),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true }),
      queryKey: attr('Ключ запроса', { hidden: true }),
      linkField: attr('Ключ связи', { hidden: true }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });

  modelClass.defineProjection('LayerLinkE', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Слой карты', {
    }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
    })
  });
  modelClass.defineProjection('LayerLinkI', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
      listForm: attr(''),
      editForm: attr('')
    }, { hidden: true }),
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true }),
      queryKey: attr('Ключ запроса', { hidden: true }),
      linkField: attr('Ключ связи', { hidden: true }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });
  modelClass.defineProjection('LayerLinkQ', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: attr('Показывать'),
    layer: belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    mapObjectSetting: belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }),
    parameters: hasMany('new-platform-flexberry-g-i-s-link-parameter', 'Параметры связи', {
      objectField: attr('Поле объекта'),
      layerField: attr('Поле слоя'),
      expression: attr('Выражение', { hidden: true }),
      queryKey: attr('Ключ запроса', { hidden: true }),
      linkField: attr('Ключ связи', { hidden: true }),
      layerLink: belongsTo('new-platform-flexberry-g-i-s-layer-link', 'Связь', {

      })
    })
  });
};
