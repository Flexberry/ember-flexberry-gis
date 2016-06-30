import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';

let Model = BaseModel.extend({
  url: DS.attr('string'),
  validations: {
    url: { presence: true }
  }
});

export default Model;
