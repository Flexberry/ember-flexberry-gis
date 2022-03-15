import Ember from 'ember';
import DS from 'ember-data';
import { attr, belongsTo, hasMany } from 'ember-flexberry-data/utils/attributes';

export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  description: DS.attr('string'),
  keyWords: DS.attr('string'),
  /**
    Non-stored property.

    @property anyText
  */
  anyText: DS.attr('string'),
  /**
    Method to set non-stored property.
    Please, use code below in model class (outside of this mixin) otherwise it will be replaced during regeneration of models.
    Please, implement 'anyTextCompute' method in model class (outside of this mixin) if you want to compute value of 'anyText' property.

    @method _anyTextCompute
    @private
    @example
      ```javascript
      _anyTextChanged: Ember.on('init', Ember.observer('anyText', function() {
        Ember.run.once(this, '_anyTextCompute');
      }))
      ```
  */
  _anyTextCompute: function() {
    let result = (this.anyTextCompute && typeof this.anyTextCompute === 'function') ? this.anyTextCompute() : null;
    this.set('anyText', result);
  },
  index: DS.attr('number'),
  visibility: DS.attr('boolean', { defaultValue: true }),
  type: DS.attr('string'),
  settings: DS.attr('string'),
  scale: DS.attr('number'),
  coordinateReferenceSystem: DS.attr('string'),
  boundingBox: DS.attr('string'),
  public: DS.attr('boolean'),
  owner: DS.attr('string'),
  securityKey: DS.attr('string'),
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
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

export let defineNamespace = function (modelClass) {
  modelClass.reopenClass({
    namespace: 'NewPlatform.Flexberry.GIS',
  });
};

export let defineProjections = function (modelClass) {
  modelClass.defineProjection('BackgroundLayerE', 'new-platform-flexberry-g-i-s-background-layer', {
    
  });

  modelClass.defineProjection('BackgroundLayerL', 'new-platform-flexberry-g-i-s-background-layer', {
    name: attr('', { index: 0 }),
    description: attr('', { index: 1 }),
    keyWords: attr('', { index: 2 }),
    anyText: attr('', { index: 3 }),
    index: attr('', { index: 4 }),
    visibility: attr('', { index: 5 }),
    type: attr('', { index: 6 }),
    settings: attr('', { index: 7 }),
    scale: attr('', { index: 8 }),
    coordinateReferenceSystem: attr('', { index: 9 }),
    boundingBox: attr('', { index: 10 }),
    public: attr('', { index: 11 }),
    owner: attr('', { index: 12 }),
    securityKey: attr('', { index: 13 })
  });
};
