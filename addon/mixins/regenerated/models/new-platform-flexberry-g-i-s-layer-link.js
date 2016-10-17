import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
export let Model = Ember.Mixin.create({
  layer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),
  mapObjectSetting: DS.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', { inverse: 'layerLink', async: false }),
  linkParameter: DS.hasMany('new-platform-flexberry-g-i-s-link-parameter', { inverse: 'layerLink', async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      layer: { presence: true },
      mapObjectSetting: { presence: true }
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
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

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
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {
      listForm: Projection.attr(''),
      editForm: Projection.attr('')
    }, { hidden: true }),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
      objectField: Projection.attr(''),
      layerField: Projection.attr(''),
      expression: Projection.attr(''),
      queryKey: Projection.attr(''),
      linkField: Projection.attr('')
    })
  });
  model.defineProjection('LayerLinkQ', 'new-platform-flexberry-g-i-s-layer-link', {
    mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

    }),
    layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    }),
    linkParameter: Projection.hasMany('new-platform-flexberry-g-i-s-link-parameter', '', {
      objectField: Projection.attr(''),
      layerField: Projection.attr(''),
      expression: Projection.attr(''),
      queryKey: Projection.attr(''),
      linkField: Projection.attr('')
    })
  });
};
