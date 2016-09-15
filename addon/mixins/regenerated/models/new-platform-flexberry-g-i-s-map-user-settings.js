import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
export let Model = Ember.Mixin.create({
  center: DS.attr('string'),
  zoom: DS.attr('number'),
  layerVisibility: DS.attr('string'),
  user: DS.attr('string'),
  map: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: null, async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      user: { presence: true },
      map: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});
export let defineProjections = function (model) {
  model.defineProjection('MapUserSettingsE', 'new-platform-flexberry-g-i-s-map-user-settings', {
    center: Projection.attr('Center'),
    zoom: Projection.attr('Zoom'),
    layerVisibility: Projection.attr('Layer visibility'),
    user: Projection.attr('User'),
    map: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Map', {
      name: Projection.attr('Name')
    })
  });
  model.defineProjection('MapUserSettingsL', 'new-platform-flexberry-g-i-s-map-user-settings', {
    center: Projection.attr('Center'),
    zoom: Projection.attr('Zoom'),
    layerVisibility: Projection.attr('Layer visibility'),
    user: Projection.attr('User'),
    map: Projection.belongsTo('new-platform-flexberry-g-i-s-map', 'Name', {
      name: Projection.attr('Name')
    }, { hidden: true })
  });
};
