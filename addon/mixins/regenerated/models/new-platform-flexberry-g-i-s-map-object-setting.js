import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
export let Model = Ember.Mixin.create({
  typeName: DS.attr('string'),
  listForm: DS.attr('string'),
  editForm: DS.attr('string'),
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
export let defineProjections = function (model) {
  model.defineProjection('MapObjectSetting', 'new-platform-flexberry-g-i-s-map-object-setting', {
    typeName: Projection.attr('', { hidden: true }),
    listForm: Projection.attr('', { hidden: true }),
    editForm: Projection.attr('', { hidden: true })
  });
};
