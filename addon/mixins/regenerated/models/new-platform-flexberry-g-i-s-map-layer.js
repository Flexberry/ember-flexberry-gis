import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  type: DS.attr('string'),
  visibility: DS.attr('boolean'),
  settings: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  index: DS.attr('number'),
  parent: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
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
  model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    visibility: Projection.attr('Visibility'),
    settings: Projection.attr('Settings'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    index: Projection.attr('Index'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    })
  });
  model.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    visibility: Projection.attr('Visibility'),
    settings: Projection.attr('Settings'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    index: Projection.attr('Index'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    })
  });
};
