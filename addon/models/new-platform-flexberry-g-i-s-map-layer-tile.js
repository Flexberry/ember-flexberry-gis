import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';
let Model = BaseModel.extend({
  url: DS.attr('string'),
  validations: {
    url: { presence: true }
  }
});

export default Model;
