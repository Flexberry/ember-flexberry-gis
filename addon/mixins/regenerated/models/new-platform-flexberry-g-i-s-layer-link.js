import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
export let Model = Ember.Mixin.create({
  allowShow: DS.attr('boolean'),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: null, async: false }),
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: 'layerLink', async: false }),
  linkParameter: DS.hasMany('new-platform-flexberry-g-i-s-link-parameter', { inverse: 'layerLink', async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      mapObjectSetting: { presence: true },
      layer: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});
export let defineProjections = function (model) {
  model.defineProjection('LayerLinkD', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
      name: Projection.attr('Слой')
    }, { hidden: true }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }, { hidden: true }),
    linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
      objectField: Projection.attr(''),
      layerField: Projection.attr(''),
      expression: Projection.attr(''),
      queryKey: Projection.attr(''),
      linkField: Projection.attr('')
    })
  });
  model.defineProjection('LayerLinkE', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Слой карты', {

    }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }),
    linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
      objectField: Projection.attr(''),
      layerField: Projection.attr(''),
      expression: Projection.attr(''),
      queryKey: Projection.attr(''),
      linkField: Projection.attr('')
    })
  });
  model.defineProjection('LayerLinkI', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: Projection.attr('Показывать'),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
      listForm: Projection.attr(''),
      editForm: Projection.attr('')
    }, { hidden: true }),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение'),
      queryKey: Projection.attr('Параметр запроса'),
      linkField: Projection.attr('Поле связи')
    })
  });
  model.defineProjection('LayerLinkQ', 'new-platform-flexberry-g-i-s-layer-link', {
    allowShow: Projection.attr('Показывать'),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }),
    linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
      objectField: Projection.attr('Поле объекта'),
      layerField: Projection.attr('Поле слоя'),
      expression: Projection.attr('Выражение'),
      queryKey: Projection.attr('Параметр запроса'),
      linkField: Projection.attr('Поле связи')
    })
  });
};
