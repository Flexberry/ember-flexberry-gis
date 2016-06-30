import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';

let Model = BaseModel.extend({
  flag: DS.attr('boolean')
});

// Edit form projection.
Model.defineProjection('BaseE', 'components-examples/flexberry-ddau-tree/settings-example/base', {
  flag: Proj.attr('Flag')
});

export default Model;